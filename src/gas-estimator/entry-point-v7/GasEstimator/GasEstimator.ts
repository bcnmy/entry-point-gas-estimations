import {
  decodeAbiParameters,
  decodeErrorResult,
  encodeFunctionData,
  Hex,
  slice,
  toBytes,
  toFunctionSelector,
  toHex,
} from "viem";
import { DEFAULT_ENTRY_POINT_ADDRESS, defaultGasOverheads } from "../constants";
import { IGasEstimator, IRPCClient } from "../interface";
import {
  Address,
  CalculatePreVerificationGas,
  CalculatePreVerificationGasParams,
  EstimateUserOperationGas,
  EstimateUserOperationGasParams,
  EstimateVerificationGasAndCallGasLimitsParams,
  EstimateVerificationGasAndCallGasLimitsResponse,
  GasEstimatorParams,
  SimulateHandleOpParams,
  SimulateHandleOpResult,
  StateOverrideSet,
  VALIDATION_ERRORS,
} from "../types";
import {
  getSimulateHandleOpResult,
  getUserOperationHash,
  packUserOp,
  RpcError,
  toPackedUserOperation,
  validateTargetCallDataResult,
} from "../utils";
import {
  ENTRY_POINT_ABI,
  ENTRY_POINT_SIMULATIONS_ABI_ONE,
  ENTRY_POINT_SIMULATIONS_ABI_TWO,
  EXECUTE_USER_OP_ABI,
} from "../abis";

/**
 * @remarks
 * GasEstimator class exposes methods to calculate gas limits for EntryPoint v0.6 compatible userOps
 */
export class GasEstimator implements IGasEstimator {
  /**
   * The publicClient created using viem
   */
  protected publicClient: IRPCClient;

  /**
   * v0.7 entry point address
   * @defaultValue 0x0000000071727De22E5E9d8BAf0edAc6f37da032
   */
  protected entryPointAddress: Address;

  protected chainId: number;

  /**
   * Creates a new instance of GasEstimator
   * @param {GasEstimatorParams} params - Configuration options for the gas estimator.
   */
  constructor(params: GasEstimatorParams) {
    this.entryPointAddress = params.entryPointAddress
      ? params.entryPointAddress
      : DEFAULT_ENTRY_POINT_ADDRESS;
    this.publicClient = params.publicClient;
    this.chainId = params.chainId;
  }

  /**
   * Public method to allow overriding the current entry point address
   * @param {`0x${string}`} entryPointAddress
   */
  public setEntryPointAddress(entryPointAddress: `0x${string}`): void {
    this.entryPointAddress = entryPointAddress;
  }

  /**
   * Estimates gas for a user operation.
   *
   * @param {EstimateUserOperationGasArgs} params - Configuration options for gas estimation.
   * @returns {Promise<EstimateUserOperationGas>} A promise that resolves to the estimated gas limits.
   *
   * @throws {Error | RpcError} If there is an issue during gas estimation.
   */
  async estimateUserOperationGas(
    params: EstimateUserOperationGasParams,
  ): Promise<EstimateUserOperationGas> {
    const {
      userOperation,
      supportsEthCallStateOverride = true,
      supportsEthCallByteCodeOverride = true,
      stateOverrideSet,
      baseFeePerGas,
    } = params;

    const result = await this.simulateHandleOp({
      userOperation,
      supportsEthCallStateOverride,
      supportsEthCallByteCodeOverride,
      stateOverrideSet,
    });

    if (
      result.result === "failed" ||
      typeof result.data === "string" ||
      result.data.callDataResult === undefined
    ) {
      throw new RpcError(
        `UserOperation reverted during simulation with reason: ${result.data}`,
        VALIDATION_ERRORS.SIMULATE_VALIDATION_FAILED,
      );
    }

    let { verificationGasLimit, callGasLimit } =
      this.estimateVerificationGasAndCallGasLimits({
        userOperation,
        executionResult: result.data.executionResult,
        callDataResult: result.data.callDataResult,
      });

    const { preVerificationGas } = await this.calculatePreVerificationGas({
      userOperation,
      baseFeePerGas,
    });

    return {
      verificationGasLimit,
      callGasLimit,
      preVerificationGas,
      paymasterVerificationGasLimit: verificationGasLimit,
      paymasterPostOpGasLimit: verificationGasLimit,
    };
  }

  private async simulateHandleOp(
    params: SimulateHandleOpParams,
  ): Promise<SimulateHandleOpResult> {
    const { userOperation, stateOverrideSet } = params;

    const packedUserOperation = toPackedUserOperation(userOperation);

    const entryPointSimulationsSimulateHandleOpCallData = encodeFunctionData({
      abi: ENTRY_POINT_SIMULATIONS_ABI_ONE,
      functionName: "simulateHandleOpLast",
      args: [[packedUserOperation]],
    });

    let packedUserOperationCallData;

    const executeUserOpMethodSig = toFunctionSelector(EXECUTE_USER_OP_ABI[0]);

    const callDataMethodSig = toHex(
      slice(toBytes(packedUserOperation.callData), 0, 4),
    );

    if (executeUserOpMethodSig === callDataMethodSig) {
      packedUserOperationCallData = encodeFunctionData({
        abi: EXECUTE_USER_OP_ABI,
        functionName: "executeUserOp",
        args: [
          packedUserOperation,
          getUserOperationHash(
            packedUserOperation,
            this.entryPointAddress,
            this.chainId,
          ),
        ],
      });
    } else {
      packedUserOperationCallData = packedUserOperation.callData;
    }

    const entryPointSimulationsSimulateTargetCallData = encodeFunctionData({
      abi: ENTRY_POINT_SIMULATIONS_ABI_ONE,
      functionName: "simulateCallDataLast",
      args: [
        [packedUserOperation],
        [packedUserOperation.sender],
        [packedUserOperationCallData],
      ],
    });

    const cause = await this.callEntryPointSimulations(
      [
        entryPointSimulationsSimulateHandleOpCallData,
        entryPointSimulationsSimulateTargetCallData,
      ],
      stateOverrideSet,
    );

    try {
      const executionResult = getSimulateHandleOpResult(cause[0]);

      if (executionResult.result === "failed") {
        return executionResult;
      }

      const targetCallValidationResult = validateTargetCallDataResult(cause[1]);

      if (targetCallValidationResult.result === "failed") {
        return targetCallValidationResult;
      }

      return {
        result: "execution",
        data: {
          callDataResult: targetCallValidationResult.data,
          executionResult: (
            executionResult as SimulateHandleOpResult<"execution">
          ).data.executionResult,
        },
      };
    } catch (e) {
      return {
        result: "failed",
        data: "Unknown error, could not parse simulate handle op result.",
        code: VALIDATION_ERRORS.SIMULATE_VALIDATION_FAILED,
      };
    }
  }

  private async callEntryPointSimulations(
    entryPointSimulationsCallData: Hex[],
    stateOverride?: StateOverrideSet,
  ) {
    const callData = encodeFunctionData({
      abi: ENTRY_POINT_SIMULATIONS_ABI_TWO,
      functionName: "simulateEntryPoint",
      args: [this.entryPointAddress, entryPointSimulationsCallData],
    });

    console.log("Before eth_call");

    const result = (await this.publicClient.request({
      method: "eth_call",
      // @ts-ignore
      params: [
        {
          to: this.entryPointAddress,
          data: callData,
        },
        // @ts-ignore
        ...(stateOverride ? [stateOverride] : []),
      ],
    })) as unknown as Hex;

    console.log("After eth_call");

    const returnBytes = decodeAbiParameters(
      [{ name: "ret", type: "bytes[]" }],
      result,
    );

    return returnBytes[0].map((data: Hex) => {
      const decodedDelegateAndError = decodeErrorResult({
        abi: ENTRY_POINT_ABI,
        data: data,
      });

      if (!decodedDelegateAndError?.args?.[1]) {
        throw new Error("Unexpected error");
      }
      return decodedDelegateAndError.args[1] as Hex;
    });
  }

  /**
   * Estimates verificationGasLimit and callGasLimit
   *
   * @param {EstimateVerificationGasAndCallGasLimitsParams} params - Configuration options for gas estimation for verificationGasLimit and callGasLimit.
   * @returns {Promise<EstimateUserOperationGas>} A promise that resolves to the estimated verificationGasLimit and callGasLimit.
   *
   * @throws {Error | RpcError} If there is an issue during gas estimation.
   */
  private estimateVerificationGasAndCallGasLimits(
    params: EstimateVerificationGasAndCallGasLimitsParams,
  ): EstimateVerificationGasAndCallGasLimitsResponse {
    const { userOperation, executionResult, callDataResult } = params;
    // EntryPoint returns a preOpGas that is the pre-operation gas
    // It has both the validation gas and the preVerificationGas
    // So we need to subtract the preVerificationGas from this to get the valdiation step gas
    // which is the verificationGasLimit
    const verificationGasLimit =
      executionResult.preOpGas - userOperation.preVerificationGas;

    // gas price for calculation is assumed to be the maxFeePerGas
    let gasPrice = userOperation.maxFeePerGas;

    // paid field stores the fee paid for full op
    // dividing by gas gives us the gas used for the full up
    // subtracting by the pre-operation gas gives us the call data execution step gas
    const callGasLimit =
      callDataResult?.gasUsed ??
      executionResult.paid / gasPrice - executionResult.preOpGas;

    return {
      verificationGasLimit,
      callGasLimit,
    };
  }

  /**
   * Calculates preVerificationGas
   * @param {CalculatePreVerificationGas} params - Configuration options for preVerificationGas
   * @returns {Promise<CalculatePreVerificationGas>} A promise that resolves to an object having the preVerificationGas
   *
   * @throws {Error} If there is an issue during calculating preVerificationGas
   */
  async calculatePreVerificationGas(
    params: CalculatePreVerificationGasParams,
  ): Promise<CalculatePreVerificationGas> {
    const { userOperation } = params;
    const packed = toBytes(packUserOp(toPackedUserOperation(userOperation)));
    // we calculate the user operation's call data cost by the 0s and non 0s
    const callDataCost = packed
      .map((x: number) =>
        x === 0
          ? defaultGasOverheads.zeroByte
          : defaultGasOverheads.nonZeroByte,
      )
      .reduce((sum: any, x: any) => sum + x);
    // Using the default overheads of the chain we calculate the static preVerificationGas
    let preVerificationGas = BigInt(
      Math.round(
        callDataCost +
          defaultGasOverheads.fixed / defaultGasOverheads.bundleSize +
          defaultGasOverheads.perUserOp +
          defaultGasOverheads.perUserOpWord * packed.length,
      ),
    );
    return {
      preVerificationGas,
    };
  }
}
