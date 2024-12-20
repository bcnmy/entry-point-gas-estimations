import {
  Address,
  decodeErrorResult,
  encodeFunctionData,
  Hex,
  RpcError,
  RpcStateOverride,
} from "viem";
import { EntryPointV6 } from "./EntryPointV6";
import { ExecutionResultV6 } from "./types";
import {
  CALL_DATA_EXECUTION_AT_MAX_GAS,
  CGL_ROUNDING,
  ENTRYPOINT_V6_ADDRESS,
  INITIAL_CGL_LOWER_BOUND,
  INITIAL_CGL_UPPER_BOUND,
  INITIAL_VGL_LOWER_BOUND,
  INITIAL_VGL_UPPER_BOUND,
  VALIDATION_ERRORS,
  VERIFICATION_EXECUTION_AT_MAX_GAS,
  VGL_ROUNDING,
} from "./constants";
import {
  CALL_GAS_LIMIT_BINARY_SEARCH_BYTECODE,
  VERIFICATION_GAS_LIMIT_BINARY_SEARCH_BYTECODE,
} from "./bytecode";
import {
  CALL_GAS_ESTIMATION_SIMULATOR,
  VERIFICATION_GAS_ESTIMATION_SIMULATOR,
} from "./abi";
import { UserOperationV6, userOperationV6Schema } from "./UserOperationV6";
import { EntryPointRpcClient } from "../shared/types";
import { cleanUpRevertReason, mergeStateOverrides } from "../shared/utils";
import { StateOverrideSet } from "../../shared/types";

export class EntryPointV6Simulations extends EntryPointV6 {
  constructor(
    client: EntryPointRpcClient,
    public address: Address = ENTRYPOINT_V6_ADDRESS,
    /**
     * the bytecode of the contract that extends the Entry Point contract and
     * implements the binary search logic for Verification Gas Limit estimation
     * @defaultValue is stored in bytecode.ts
     */
    private verificationGasEstimationSimulatorByteCode: Hex = VERIFICATION_GAS_LIMIT_BINARY_SEARCH_BYTECODE,
    /**
     * the bytecode of the contract that extends the Entry Point contract and
     * implements the binary search logic for Call Gas Limit estimation
     * @defaultValue is stored in bytecode.ts
     */
    private callGasEstimationSimulatorByteCode: Hex = CALL_GAS_LIMIT_BINARY_SEARCH_BYTECODE
  ) {
    super(client, address);
  }

  async estimateVerificationGasLimit({
    userOperation,
    stateOverrides,
    entryPointAddress,
  }: EstimateVerificationGasLimitParams): Promise<EstimateVerificationGasLimitResult> {
    if (userOperation.initCode !== "0x") {
      throw new Error(
        "binary search is not supported when initCode is not 0x, because it will throw AA20 account not deployed"
      );
    }
    // check if userOperation is valid
    userOperation = userOperationV6Schema.parse(userOperation);

    // Allow custom entry point address passed by the client
    const targetEntryPointAddress = entryPointAddress || this.address;

    // first iteration should run at max vgl
    userOperation.verificationGasLimit = INITIAL_VGL_UPPER_BOUND;

    // encode the function data for eth_call of our custom verification gas limit (VGL) binary search contract
    const data = encodeFunctionData({
      abi: VERIFICATION_GAS_ESTIMATION_SIMULATOR,
      functionName: "estimateVerificationGas",
      args: [
        {
          op: userOperation,
          minGas: INITIAL_VGL_LOWER_BOUND,
          maxGas: INITIAL_VGL_UPPER_BOUND,
          rounding: VGL_ROUNDING,
          isContinuation: VERIFICATION_EXECUTION_AT_MAX_GAS,
        },
      ],
    });

    // Allow custom state overrides passed by the client
    const finalStateOverrideSet = mergeStateOverrides(
      // Override the entry point code with the VGL simulator code
      {
        [targetEntryPointAddress]: {
          code: this.verificationGasEstimationSimulatorByteCode,
        },
      },
      stateOverrides
    );

    try {
      await this.client.request({
        method: "eth_call",
        params: [
          { to: targetEntryPointAddress, data },
          "latest",
          finalStateOverrideSet as RpcStateOverride,
        ],
      });

      throw new Error("EstimateVerificationGasLimit should always revert");
    } catch (err) {
      const data = this.parseRpcRequestErrorData(err);
      return this.parseEstimateVerificationGasLimitResult(data);
    }
  }

  async estimateCallGasLimit({
    userOperation,
    stateOverrides,
    entryPointAddress,
  }: EstimateVerificationGasLimitParams): Promise<bigint> {
    if (userOperation.initCode !== "0x") {
      throw new Error(
        "binary search is not supported for non-deployed smart accounts"
      );
    }

    // Allow custom entry point address passed by the client
    const targetEntryPointAddress = entryPointAddress || this.address;

    // Setting callGasLimit to 0 to make sure call data is not executed by the Entry Point code and only
    // done inside the CallGasSimulationExecutor contract
    userOperation.callGasLimit = BigInt(0);

    // encode the function data for eth_call of our custom call gas limit (CGL) binary search contract
    const estimateCallGasLimitCallData = encodeFunctionData({
      abi: CALL_GAS_ESTIMATION_SIMULATOR,
      functionName: "estimateCallGas",
      args: [
        {
          sender: userOperation.sender,
          callData: userOperation.callData,
          minGas: INITIAL_CGL_LOWER_BOUND,
          maxGas: INITIAL_CGL_UPPER_BOUND,
          rounding: CGL_ROUNDING,
          isContinuation: CALL_DATA_EXECUTION_AT_MAX_GAS,
        },
      ],
    });

    // Allow custom state overrides passed by the client
    const finalStateOverrideSet = mergeStateOverrides(
      // Override the entry point code with the CGL simulator code
      {
        [targetEntryPointAddress]: {
          code: this.callGasEstimationSimulatorByteCode,
        },
      },
      stateOverrides
    );

    const executionResult = await this.simulateHandleOp({
      userOperation,
      targetAddress: targetEntryPointAddress,
      targetCallData: estimateCallGasLimitCallData,
      stateOverrides: finalStateOverrideSet,
    });

    return this.parseEstimateCallGasLimitResult(executionResult);
  }

  parseEstimateCallGasLimitResult(data: ExecutionResultV6) {
    const result = decodeErrorResult({
      abi: CALL_GAS_ESTIMATION_SIMULATOR,
      data: data.targetResult,
    });

    if (result.errorName === "EstimateCallGasRevertAtMax") {
      throw new RpcError(
        new Error("UserOperation reverted during execution phase"),
        {
          code: VALIDATION_ERRORS.SIMULATE_VALIDATION_FAILED,
          shortMessage: "UserOperation reverted during execution phase",
        }
      );
    }

    if (result.errorName === "EstimateCallGasContinuation") {
      return (result.args[0] + result.args[1]) / 2n;
    }

    if (result.errorName === "EstimateCallGasResult") {
      return result.args[0];
    }

    throw new RpcError(new Error("Unknown estimateCallGas error"), {
      code: VALIDATION_ERRORS.SIMULATE_VALIDATION_FAILED,
      shortMessage: result.errorName,
    });
  }

  parseEstimateVerificationGasLimitResult(
    data: Hex
  ): EstimateVerificationGasLimitResult {
    const decodedError = decodeErrorResult({
      abi: VERIFICATION_GAS_ESTIMATION_SIMULATOR,
      data,
    });

    if (
      decodedError.errorName === "FailedOp" ||
      decodedError.errorName === "FailedOpError"
    ) {
      const data =
        typeof decodedError.args[0] === "string"
          ? (decodedError.args[0] as Hex)
          : (decodedError.args[0].toString(16) as Hex);

      const secondDecode = decodeErrorResult({
        abi: VERIFICATION_GAS_ESTIMATION_SIMULATOR,
        data,
      });

      this.handleFailedOp(secondDecode.args[1] as string);
    }

    if (decodedError.errorName === "EstimateVerificationGasResult") {
      return {
        verificationGasLimit: decodedError.args[0],
        validAfter: decodedError.args[1],
        validUntil: decodedError.args[2],
      };
    }

    if (decodedError.errorName === "EstimateVerificationGasContinuation") {
      return {
        verificationGasLimit:
          (decodedError.args[0] + decodedError.args[1]) / 2n,
        validAfter: decodedError.args[2],
        validUntil: decodedError.args[3],
      };
    }

    throw new UnknownError(
      decodedError.errorName,
      decodedError.args?.toString()
    );
  }

  private handleFailedOp(revertReason: string) {
    revertReason = cleanUpRevertReason(revertReason);
    if (revertReason.includes("AA1") || revertReason.includes("AA2")) {
      throw new RpcError(new Error(revertReason), {
        code: VALIDATION_ERRORS.SIMULATE_VALIDATION_FAILED,
        shortMessage: revertReason,
      });
    } else if (revertReason.includes("AA3")) {
      throw new RpcError(new Error(revertReason), {
        code: VALIDATION_ERRORS.SIMULATE_PAYMASTER_VALIDATION_FAILED,
        shortMessage: revertReason,
      });
    } else if (revertReason.includes("AA9")) {
      throw new RpcError(new Error(revertReason), {
        code: VALIDATION_ERRORS.WALLET_TRANSACTION_REVERTED,
        shortMessage: revertReason,
      });
    } else if (revertReason.includes("AA4")) {
      throw new RpcError(new Error(revertReason), {
        code: VALIDATION_ERRORS.SIMULATE_VALIDATION_FAILED,
        shortMessage: revertReason,
      });
    } else if (revertReason.includes("AA")) {
      throw new RpcError(new Error(revertReason), {
        code: VALIDATION_ERRORS.SIMULATE_VALIDATION_FAILED,
        shortMessage: revertReason,
      });
    }
    throw new RpcError(new Error(revertReason), {
      code: VALIDATION_ERRORS.SIMULATE_VALIDATION_FAILED,
      shortMessage: revertReason,
    });
  }
}

class UnknownError extends Error {
  constructor(public errorName: string, public errorReason: string) {
    super(`Unknown error: ${errorName} - ${errorReason}`);
  }
}

interface EstimateVerificationGasLimitParams {
  userOperation: UserOperationV6;
  stateOverrides?: StateOverrideSet;
  entryPointAddress?: Address;
}

interface EstimateVerificationGasLimitResult {
  verificationGasLimit: bigint;
  validAfter: number;
  validUntil: number;
}
