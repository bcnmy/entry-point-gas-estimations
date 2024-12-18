import {
  Address,
  decodeErrorResult,
  encodeFunctionData,
  Hex,
  RpcError,
  toHex,
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
import { removeSpecialCharacters } from "./utils";
import {
  CALL_GAS_ESTIMATION_SIMULATOR,
  VERIFICATION_GAS_ESTIMATION_SIMULATOR,
} from "./abi";
import { UserOperationV6 } from "./UserOperationV6";
import { EntryPointRpcClient } from "../shared/types";

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

  // TODO: Add support for passing custom state overrides
  async estimateVerificationGasLimit({
    userOperation,
  }: EstimateVerificationGasLimitParams): Promise<EstimateVerificationGasLimitResult> {
    if (userOperation.initCode !== "0x") {
      throw new Error(
        "binary search is not supported for non-deployed smart accounts"
      );
    }

    // first iteration should run at max vgl
    userOperation.verificationGasLimit = INITIAL_VGL_UPPER_BOUND;

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

    try {
      await this.client.request({
        method: "eth_call",
        params: [
          { to: this.address, data },
          "latest",
          {
            [userOperation.sender]: {
              balance: toHex(100000_000000000000000000n),
            },
            [this.address]: {
              code: this.verificationGasEstimationSimulatorByteCode,
            },
          },
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
  }: EstimateVerificationGasLimitParams): Promise<bigint> {
    if (userOperation.initCode !== "0x") {
      throw new Error(
        "binary search is not supported for non-deployed smart accounts"
      );
    }

    // Setting callGasLimit to 0 to make sure call data is not executed by the Entry Point code and only
    // done inside the CallGasSimulationExecutor contract
    userOperation.callGasLimit = BigInt(0);

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

    const executionResult = await this.simulateHandleOp({
      userOperation,
      targetAddress: this.address,
      targetCallData: estimateCallGasLimitCallData,
      stateOverrides: {
        [userOperation.sender]: {
          balance: toHex(100000_000000000000000000n),
        },
        [this.address]: {
          code: this.callGasEstimationSimulatorByteCode,
        },
      },
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
    revertReason = removeSpecialCharacters(revertReason);
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
}

interface EstimateVerificationGasLimitResult {
  verificationGasLimit: bigint;
  validAfter: number;
  validUntil: number;
}
