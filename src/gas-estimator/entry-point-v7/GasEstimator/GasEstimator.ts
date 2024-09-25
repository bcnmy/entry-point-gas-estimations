import {
  decodeFunctionResult,
  encodeFunctionData,
  Hex,
  toBytes,
  toHex,
} from "viem";
import { DEFAULT_ENTRY_POINT_ADDRESS, defaultGasOverheads, EntryPointSimulationsDeployBytecode } from "../constants";
import { IGasEstimator, IRPCClient } from "../interface";
import {
  Address,
  BlockNumberTag,
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
} from "../types";
import {
  packUserOp,
  toPackedUserOperation,
} from "../utils";
import {
  ENTRY_POINT_SIMULATIONS_ABI,
} from "../abis";

/**
 * @remarks
 * GasEstimator class exposes methods to calculate gas limits for EntryPoint v0.7 compatible userOps
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

    // Setting maxPriorityFeePerGas to maxFeePerGas as we don't want the estimations
    // to depend on the variable baseFeePerGas
    // baseFeePerGas is only going to be used for Optimism Based Networks while calculating
    // their preVerificationGas

    const simulateHandleOpResult = await this.simulateHandleOp({
      userOperation,
      supportsEthCallStateOverride,
      supportsEthCallByteCodeOverride,
      stateOverrideSet,
    });

    let { verificationGasLimit, callGasLimit } =
      this.estimateVerificationGasAndCallGasLimits({
        userOperation,
        simulateHandleOpResult,
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

  /**
   * Method calls the EntryPointSimulations contract's simulateHandleOp
   * @param {SimulateHandleOpParams} params - userOperation and the stateOverrideSet
   * @returns {Promise<>} 
   */
  private async simulateHandleOp(
    params: SimulateHandleOpParams,
  ): Promise<SimulateHandleOpResult> {
    const { userOperation, stateOverrideSet } = params;

    const packedUserOperation = toPackedUserOperation(userOperation);

    const simulateHandleOpCallData = encodeFunctionData({
      abi: ENTRY_POINT_SIMULATIONS_ABI,
      functionName: "simulateHandleOp",
      args: [packedUserOperation, "0x0000000000000000000000000000000000000000", "0x"],
    });

    const ethCallFinalParam: StateOverrideSet = {
      [userOperation.sender]: {
        balance: toHex(100000_000000000000000000n),
      },
      [this.entryPointAddress]: {
        code: EntryPointSimulationsDeployBytecode,
      },
    };

    for (const stateOverrideKey in stateOverrideSet) {
      if (
        stateOverrideKey.toLowerCase() === this.entryPointAddress.toLowerCase()
      ) {
        const { balance, state, stateDiff, nonce } =
          stateOverrideSet[stateOverrideKey];
        ethCallFinalParam[this.entryPointAddress] = {
          code: EntryPointSimulationsDeployBytecode,
          balance,
          nonce,
          state,
          stateDiff,
        };
      } else {
        ethCallFinalParam[stateOverrideKey] =
          stateOverrideSet[stateOverrideKey];
      }
    }

    const ethCallResult = await this.publicClient.request({
      method: "eth_call",
      params: [
        {
          to: this.entryPointAddress,
          data: simulateHandleOpCallData
        },
        BlockNumberTag.LATEST,
        // @ts-ignore
        ethCallFinalParam,
      ],
    }); 

    // console.log("ethCallResult", ethCallResult);


    const decodedResult = decodeFunctionResult({
      abi: ENTRY_POINT_SIMULATIONS_ABI,
      functionName: "simulateHandleOp",
      data: ethCallResult as unknown as `0x${string}`,
    });
    
    return decodedResult;
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
    const { userOperation, simulateHandleOpResult } = params;
    // EntryPoint returns a preOpGas that is the pre-operation gas
    // It has both the validation gas and the preVerificationGas
    // So we need to subtract the preVerificationGas from this to get the valdiation step gas
    // which is the verificationGasLimit
    const verificationGasLimit =
    simulateHandleOpResult.preOpGas - userOperation.preVerificationGas;

    // gas price for calculation is assumed to be the maxFeePerGas
    let gasPrice = userOperation.maxFeePerGas;

    // paid field stores the fee paid for full op
    // dividing by gas gives us the gas used for the full up
    // subtracting by the pre-operation gas gives us the call data execution step gas
    const callGasLimit =
      simulateHandleOpResult.paid / gasPrice - simulateHandleOpResult.preOpGas;

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
