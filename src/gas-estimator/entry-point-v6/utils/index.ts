/* eslint-disable @typescript-eslint/no-shadow */
import {
  BaseError,
  ContractFunctionExecutionError,
  decodeErrorResult,
  encodeAbiParameters,
  keccak256,
  parseAbiParameters,
} from "viem";
import {
  CALL_GAS_ESTIMATION_SIMULATOR,
  ENTRY_POINT_ABI,
  VERIFICATION_GAS_ESTIMATION_SIMULATOR,
} from "../abis";
import {
  ExecutionResult,
  UserOperation,
  VALIDATION_ERRORS,
  entryPointExecutionErrorSchema,
} from "../types";
import { fromZodError } from "zod-validation-error";

export class RpcError extends Error {
  code?: number;

  data?: any;

  // error codes from: https://eips.ethereum.org/EIPS/eip-1474
  constructor(msg: string, code?: number, data: any = undefined) {
    super(msg);

    this.code = code;
    this.data = data;
  }
}

export function tooLow(error: string) {
  return (
    error === "AA40 over verificationGasLimit" ||
    error === "AA41 too little verificationGas" ||
    error === "AA51 prefund below actualGasCost" ||
    error === "AA13 initCode failed or OOG" ||
    error === "AA21 didn't pay prefund" ||
    error === "AA23 reverted (or OOG)" ||
    error === "AA33 reverted (or OOG)" ||
    error === "return data out of bounds" ||
    error === "validation OOG"
  );
}

export function getCallGasEstimationSimulatorResult(data: ExecutionResult) {
  const result = decodeErrorResult({
    abi: CALL_GAS_ESTIMATION_SIMULATOR,
    data: data.targetResult,
  });

  if (result.errorName === "EstimateCallGasRevertAtMax") {
    throw new RpcError(
      "UserOperation reverted during execution phase",
      VALIDATION_ERRORS.SIMULATE_VALIDATION_FAILED,
    );
  }

  if (result.errorName === "EstimateCallGasContinuation") {
    return (result.args[0] + result.args[1]) / 2n;
  }

  if (result.errorName === "EstimateCallGasResult") {
    return result.args[0];
  }

  return null;
}

export function getVerificationGasEstimationSimulatorResult(
  data: `0x${string}`,
) {
  const result = decodeErrorResult({
    abi: VERIFICATION_GAS_ESTIMATION_SIMULATOR,
    data,
  });


  if (result.errorName === "FailedOp") {
    handleFailedOp(result.args)
  }

  if(result.errorName === "FailedOpError") {
    const { args } = result;
    const errorResult = decodeErrorResult({
      abi: ENTRY_POINT_ABI,
      data: args[0],
    });
    if(errorResult.errorName === "FailedOp") {
      handleFailedOp(errorResult.args)
    }
  }

  if (result.errorName === "EstimateVerificationGasResult") {
    return {
      verificationGasLimit: result.args[0],
      validAfter: result.args[1],
      validUntil: result.args[2],
    };
  }

  if (result.errorName === "EstimateVerificationGasContinuation") {
    return {
      verificationGasLimit: (result.args[0] + result.args[1]) / 2n,
      validAfter: result.args[2],
      validUntil: result.args[3],
    };
  }

  return null;
}

export function handleFailedOp(args: readonly [bigint, string]) {
  const revertReason = args[1];
  if (revertReason.includes("AA1") || revertReason.includes("AA2")) {
    throw new RpcError(
      revertReason,
      VALIDATION_ERRORS.SIMULATE_VALIDATION_FAILED,
    );
  } else if (revertReason.includes("AA3")) {
    throw new RpcError(
      revertReason,
      VALIDATION_ERRORS.SIMULATE_PAYMASTER_VALIDATION_FAILED,
    );
  } else if (revertReason.includes("AA9")) {
    throw new RpcError(
      revertReason,
      VALIDATION_ERRORS.WALLET_TRANSACTION_REVERTED,
    );
  } else if (revertReason.includes("AA4")) {
    throw new RpcError(
      revertReason,
      VALIDATION_ERRORS.SIMULATE_VALIDATION_FAILED,
    );
  } else if (revertReason.includes("AA")) {
    throw new RpcError(
      revertReason,
      VALIDATION_ERRORS.SIMULATE_VALIDATION_FAILED,
    );
  }
  throw new RpcError(
    "UserOperation reverted during execution phase",
    VALIDATION_ERRORS.SIMULATE_VALIDATION_FAILED,
  );
}

export function getSimulationResult(
  errorResult: unknown,
  simulationType: "validation" | "execution",
) {
  const entryPointErrorSchemaParsing =
    entryPointExecutionErrorSchema.safeParse(errorResult);

  if (!entryPointErrorSchemaParsing.success) {
    try {
      const err = fromZodError(entryPointErrorSchemaParsing.error);
      err.message = `User Operation simulation returned unexpected invalid response: ${err.message}`;
      throw err;
    } catch {
      if (errorResult instanceof BaseError) {
        const revertError = errorResult.walk(
          (err: any) => err instanceof ContractFunctionExecutionError,
        );
        throw new RpcError(
          // @ts-ignore
          `UserOperation reverted during simulation with reason: ${(revertError?.cause as any)?.reason}`,
          VALIDATION_ERRORS.SIMULATE_VALIDATION_FAILED,
        );
      }
      throw new Error(
        `User Operation simulation returned unexpected invalid response: ${errorResult}`,
      );
    }
  }

  const errorData = entryPointErrorSchemaParsing.data;

  if (errorData.errorName === "FailedOp") {
    const { reason } = errorData.args;
    throw new RpcError(
      `UserOperation reverted during simulation with reason: ${reason}`,
      VALIDATION_ERRORS.SIMULATE_VALIDATION_FAILED,
    );
  }

  if (simulationType === "validation") {
    if (
      errorData.errorName !== "ValidationResult" &&
      errorData.errorName !== "ValidationResultWithAggregation"
    ) {
      throw new Error(
        "Unexpected error - errorName is not ValidationResult or ValidationResultWithAggregation",
      );
    }
  } else if (errorData.errorName !== "ExecutionResult") {
    throw new Error("Unexpected error - errorName is not ExecutionResult");
  }

  const simulationResult = errorData.args;

  return simulationResult;
}

function encode(
  typevalues: Array<{ type: string; val: any }>,
  forSignature: boolean,
): string {
  const types = parseAbiParameters(
    typevalues
      .map((typevalue) =>
        typevalue.type === "bytes" && forSignature ? "bytes32" : typevalue.type,
      )
      .toString(),
  );
  const values = typevalues.map((typevalue: any) =>
    typevalue.type === "bytes" && forSignature
      ? keccak256(typevalue.val)
      : typevalue.val,
  );
  return encodeAbiParameters(types, values);
}

export function packUserOp(userOp: UserOperation, forSignature = true): string {
  const userOpType = {
    components: [
      {
        type: "address",
        name: "sender",
      },
      {
        type: "uint256",
        name: "nonce",
      },
      {
        type: "bytes",
        name: "initCode",
      },
      {
        type: "bytes",
        name: "callData",
      },
      {
        type: "uint256",
        name: "callGasLimit",
      },
      {
        type: "uint256",
        name: "verificationGasLimit",
      },
      {
        type: "uint256",
        name: "preVerificationGas",
      },
      {
        type: "uint256",
        name: "maxFeePerGas",
      },
      {
        type: "uint256",
        name: "maxPriorityFeePerGas",
      },
      {
        type: "bytes",
        name: "paymasterAndData",
      },
      {
        type: "bytes",
        name: "signature",
      },
    ],
    name: "userOp",
    type: "tuple",
  };

  if (forSignature) {
    // lighter signature scheme (must match UserOperation#pack):
    // do encode a zero-length signature, but strip afterwards the appended zero-length value
    let encoded = encodeAbiParameters(
      [userOpType as any],
      [
        {
          ...userOp,
          signature: "0x",
        },
      ],
    );

    encoded = `0x${encoded.slice(66, encoded.length - 64)}`;
    return encoded;
  }

  const typevalues = (userOpType as any).components.map(
    (c: { name: keyof typeof userOp; type: string }) => ({
      type: c.type,
      val: userOp[c.name],
    }),
  );

  return encode(typevalues, forSignature);
}
