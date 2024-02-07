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
    const { args } = result;
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
