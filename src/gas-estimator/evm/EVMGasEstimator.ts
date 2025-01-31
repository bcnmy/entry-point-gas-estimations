import { type ByteArray, parseEther, toBytes } from "viem"
import {
  type UserOperationV6,
  packUserOpV6
} from "../../entrypoint/v0.6.0/UserOperationV6"
import { isExecutionResultV6 } from "../../entrypoint/v0.6.0/types"

import type { SupportedChain } from "../../chains/types"
import { StateOverrideBuilder } from "../../entrypoint/shared/stateOverrides"
import { EntryPointVersion } from "../../entrypoint/shared/types"
import {
  type UserOperationV7,
  packUserOpV7,
  toPackedUserOperation
} from "../../entrypoint/v0.7.0/UserOperationV7"
import { INNER_GAS_OVERHEAD } from "../../entrypoint/v0.7.0/constants"
import { getPaymasterAddressFromPaymasterAndData } from "../../paymaster/utils"
import type { StateOverrideSet } from "../../shared/types"
import { bumpBigIntPercent } from "../../shared/utils"
import type {
  EstimateUserOperationGasOptions,
  EstimateUserOperationGasParams,
  GasEstimator,
  GasEstimatorRpcClient,
  SimulationLimits,
  UnEstimatedUserOperation
} from "../GasEstimator"
import {
  type UserOperation,
  isUserOperationV6,
  validateUserOperation
} from "../UserOperation"
import type {
  EntryPoints,
  EstimateUserOperationGasResult,
  ExecutionResult
} from "../types"
import {
  SIMULATION_CALL_GAS_LIMIT,
  SIMULATION_PRE_VERIFICATION_GAS,
  SIMULATION_VERIFICATION_GAS_LIMIT,
  defaultGasOverheads
} from "./constants"

/**
 * Base implementation of gas estimation for EVM-compatible chains.
 * Provides methods for estimating gas costs for user operations including verification,
 * execution, and pre-verification gas.
 *
 * @implements {@link GasEstimator}
 *
 * @example
 * ```typescript
 * const estimator = new EVMGasEstimator(
 *   chain,
 *   rpcClient,
 *   {
 *     [EntryPointVersion.v060]: entryPointV6,
 *     [EntryPointVersion.v070]: entryPointV7
 *   }
 * );
 *
 * const gasEstimate = await estimator.estimateUserOperationGas({
 *   unEstimatedUserOperation,
 *   baseFeePerGas: 1000000000n
 * });
 * ```
 */
export class EVMGasEstimator implements GasEstimator {
  /**
   * Creates a new EVMGasEstimator instance
   *
   * @param chain - The {@link SupportedChain} to estimate gas for
   * @param rpcClient - The RPC client for making blockchain requests
   * @param entryPoints - Map of {@link EntryPointVersion} to their contract instances
   * @param simulationLimits - Optional gas limits for simulation, defaults to predefined constants
   */
  constructor(
    public chain: SupportedChain,
    protected rpcClient: GasEstimatorRpcClient,
    public entryPoints: EntryPoints,
    public simulationLimits: SimulationLimits = {
      callGasLimit: SIMULATION_CALL_GAS_LIMIT,
      preVerificationGas: SIMULATION_PRE_VERIFICATION_GAS,
      verificationGasLimit: SIMULATION_VERIFICATION_GAS_LIMIT
    }
  ) {}

  /**
   * Estimates all gas parameters for a user operation.
   *
   * @param params - The estimation parameters
   * @param params.unEstimatedUserOperation - The user operation to estimate gas for
   * @param params.baseFeePerGas - Current base fee per gas
   * @param params.stateOverrides - Optional state overrides for simulation
   * @param params.options - Additional estimation options
   *
   * @returns Gas estimation results including all required gas limits
   * @throws Error if simulation or estimation fails
   *
   * @example
   * ```typescript
   * const estimate = await estimator.estimateUserOperationGas({
   *   unEstimatedUserOperation: {
   *     sender: "0x123...",
   *     nonce: 1n,
   *     // ... other fields
   *   },
   *   baseFeePerGas: 1000000000n,
   *   stateOverrides: {
   *     // Optional state modifications
   *   }
   * });
   * ```
   */
  async estimateUserOperationGas({
    unEstimatedUserOperation,
    baseFeePerGas,
    stateOverrides,
    options
  }: EstimateUserOperationGasParams): Promise<EstimateUserOperationGasResult> {
    // Override the user operation with the simulation options
    const unsafeUserOperation = this.overrideUserOperationForSimulation(
      unEstimatedUserOperation
    )

    // Then check if it's valid
    const userOperation = validateUserOperation(unsafeUserOperation)

    // Determine the EP version based on the user operation
    const entryPointVersion = this.determineEntryPointVersion(userOperation)

    // Merge the default options with the partial options provided by the user
    const fullOptions = this.mergeEstimateUserOperationGasOptions(
      entryPointVersion,
      options
    )

    // if the target chain supports state overrides,
    // override the sender balance so simulation doesn't throw balance errors
    if (!fullOptions.simulation && this.chain.stateOverrideSupport.balance) {
      stateOverrides = new StateOverrideBuilder(stateOverrides)
        .overrideBalance(userOperation.sender, parseEther("100000000"))
        .build()
    }

    // Estimate the gas based on the EP version
    if (isUserOperationV6(userOperation)) {
      return this.estimateUserOperationGasV6(
        userOperation,
        stateOverrides,
        baseFeePerGas,
        fullOptions
      )
    }

    return this.estimateUserOperationGasV7(
      userOperation,
      stateOverrides,
      baseFeePerGas,
      fullOptions
    )
  }

  /**
   * Determines the EntryPoint version based on the user operation format.
   *
   * @param userOperation - The {@link UserOperation} to check
   * @returns The corresponding {@link EntryPointVersion}
   *
   * @internal
   */
  private determineEntryPointVersion(
    userOperation: UserOperation
  ): EntryPointVersion {
    return isUserOperationV6(userOperation)
      ? EntryPointVersion.v060
      : EntryPointVersion.v070
  }

  /**
   * Overrides user operation gas limits for simulation purposes.
   *
   * @param unEstimatedUserOperation - The original user operation
   * @returns A new user operation with simulation gas limits
   *
   * @internal
   */
  private overrideUserOperationForSimulation(
    unEstimatedUserOperation: UnEstimatedUserOperation
  ): UserOperation {
    const userOperation: UserOperation = {
      ...unEstimatedUserOperation,
      preVerificationGas: this.simulationLimits.preVerificationGas,
      verificationGasLimit: this.simulationLimits.verificationGasLimit,
      callGasLimit: this.simulationLimits.callGasLimit
    }

    return userOperation
  }

  /**
   * Estimates gas parameters for v0.7.0 user operations.
   *
   * @param userOperation - The {@link UserOperationV7} to estimate for
   * @param stateOverrides - Optional state overrides for simulation
   * @param baseFeePerGas - Current base fee per gas
   * @param options - Additional estimation options
   *
   * @returns Gas estimation results
   * @throws Error if simulation fails
   *
   * @internal
   */
  protected async estimateUserOperationGasV7(
    userOperation: UserOperationV7,
    stateOverrides: StateOverrideSet | undefined,
    baseFeePerGas: bigint,
    options: EstimateUserOperationGasOptions
  ) {
    const entryPoint = this.entryPoints[EntryPointVersion.v070].contract

    if (
      !options.simulation &&
      userOperation.paymaster &&
      this.chain.stateOverrideSupport.stateDiff
    ) {
      stateOverrides = new StateOverrideBuilder(stateOverrides)
        .overridePaymasterDeposit(entryPoint.address, userOperation.paymaster)
        .build()
    }

    // To avoid problems with variable fees per gas
    const constantGasFeeUserOperation = {
      ...userOperation,
      maxFeePerGas: 1n,
      maxPriorityFeePerGas: 1n
    }

    const [executionResult, preVerificationGas, executionGas] =
      await Promise.all([
        entryPoint.simulateHandleOp({
          userOperation: constantGasFeeUserOperation,
          // userOperation,
          targetAddress: options.entryPointAddress,
          targetCallData: "0x",
          stateOverrides
        }),
        // use the actual user operation to estimate the preVerificationGas, because it depends on maxFeePerGas
        this.estimatePreVerificationGas(userOperation, baseFeePerGas),
        this.rpcClient.estimateGas({
          // for monad testnet, we don't set the sender address so it doesn't throw 'sender must be an eoa'
          account: [10143].includes(this.chain.chainId)
            ? undefined
            : entryPoint.address,
          to: userOperation.sender,
          data: userOperation.callData
        })
      ])

    const { verificationGasLimit } = this.estimateVerificationAndCallGasLimits(
      constantGasFeeUserOperation,
      executionResult
    )

    const paymasterVerificationGasLimit = userOperation.paymaster
      ? verificationGasLimit
      : 0n

    const paymasterPostOpGasLimit = userOperation.paymaster
      ? this.chain.paymasters?.v070?.[userOperation.paymaster]
          ?.postOpGasLimit || verificationGasLimit
      : 0n

    let callGasLimit = executionGas

    callGasLimit -= 21000n // 21000 is the gas cost of the call from EOA, we can remove it
    callGasLimit += INNER_GAS_OVERHEAD
    callGasLimit += paymasterPostOpGasLimit

    return {
      callGasLimit: bumpBigIntPercent(callGasLimit, 10), // markup to cover the 63/64 problem,
      verificationGasLimit: bumpBigIntPercent(verificationGasLimit, 10), // observed verification overhead
      preVerificationGas,
      paymasterVerificationGasLimit,
      paymasterPostOpGasLimit
    }
  }

  /**
   * Estimates gas parameters for v0.6.0 user operations.
   *
   * @param userOperation - The {@link UserOperationV6} to estimate for
   * @param stateOverrides - Optional state overrides for simulation
   * @param baseFeePerGas - Current base fee per gas
   * @param options - Additional estimation options
   *
   * @returns Gas estimation results
   * @throws Error if simulation fails
   *
   * @internal
   */
  private async estimateUserOperationGasV6(
    userOperation: UserOperationV6,
    stateOverrides: StateOverrideSet | undefined,
    baseFeePerGas: bigint,
    options: EstimateUserOperationGasOptions
  ) {
    if (options.useBinarySearch && userOperation.initCode === "0x") {
      return this.useBinarySearch(
        userOperation,
        baseFeePerGas,
        options,
        stateOverrides
      )
    }

    // To avoid problems with variable baseFeePerGas
    const constantGasFeeUserOperation = {
      ...userOperation,
      maxPriorityFeePerGas: userOperation.maxFeePerGas
    }

    const entryPoint = this.entryPoints[EntryPointVersion.v060].contract

    if (
      !options.simulation &&
      userOperation.paymasterAndData !== "0x" &&
      this.chain.stateOverrideSupport.stateDiff
    ) {
      stateOverrides = new StateOverrideBuilder(stateOverrides)
        .overridePaymasterDeposit(
          entryPoint.address,
          getPaymasterAddressFromPaymasterAndData(
            userOperation.paymasterAndData
          )
        )
        .build()
    }

    const [executionResult, preVerificationGas] = await Promise.all([
      entryPoint.simulateHandleOp({
        userOperation: constantGasFeeUserOperation,
        targetAddress: options.entryPointAddress,
        targetCallData: "0x",
        stateOverrides
      }),
      this.estimatePreVerificationGas(userOperation, baseFeePerGas)
    ])

    const { callGasLimit, verificationGasLimit, validAfter, validUntil } =
      this.estimateVerificationAndCallGasLimits(
        constantGasFeeUserOperation,
        executionResult
      )

    return {
      callGasLimit: bumpBigIntPercent(callGasLimit, 10),
      verificationGasLimit: bumpBigIntPercent(verificationGasLimit, 10),
      preVerificationGas,
      validAfter,
      validUntil
    }
  }

  /**
   * Uses binary search to estimate gas limits for deployed accounts.
   *
   * @param userOperation - The user operation to estimate for
   * @param baseFeePerGas - Current base fee per gas
   * @param options - Estimation options
   * @param stateOverrides - Optional state overrides
   *
   * @returns Gas estimation results
   * @throws Error if binary search fails
   *
   * @internal
   */
  async useBinarySearch(
    userOperation: UserOperationV6,
    baseFeePerGas: bigint,
    options: EstimateUserOperationGasOptions,
    stateOverrides?: StateOverrideSet
  ): Promise<EstimateUserOperationGasResult> {
    const entryPoint = this.entryPoints[EntryPointVersion.v060].simulations

    const [verificationGasLimitResult, callGasLimit, preVerificationGas] =
      await Promise.all([
        entryPoint.estimateVerificationGasLimit({
          userOperation: userOperation,
          stateOverrides,
          entryPointAddress: options.entryPointAddress
        }),
        entryPoint.estimateCallGasLimit({
          userOperation: userOperation,
          stateOverrides,
          entryPointAddress: options.entryPointAddress
        }),
        this.estimatePreVerificationGas(userOperation, baseFeePerGas)
      ])

    const { verificationGasLimit, validAfter, validUntil } =
      verificationGasLimitResult

    return {
      callGasLimit,
      verificationGasLimit,
      preVerificationGas,
      validAfter,
      validUntil
    }
  }

  /**
   * Estimates verification and call gas limits from execution results.
   *
   * @param userOperation - The user operation being estimated
   * @param executionResult - The simulation execution result
   * @returns Object containing gas limits and validity window
   *
   * @internal
   */
  estimateVerificationAndCallGasLimits(
    userOperation: UserOperation,
    executionResult: ExecutionResult
  ) {
    const { preOpGas, paid } = executionResult

    let validAfter = 0
    let validUntil = 0
    if (isExecutionResultV6(executionResult)) {
      validAfter = executionResult.validAfter
      validUntil = executionResult.validUntil
    }

    const verificationGasLimit = preOpGas - userOperation.preVerificationGas

    const callGasLimit = paid / userOperation.maxFeePerGas - preOpGas

    return {
      callGasLimit,
      verificationGasLimit,
      validAfter,
      validUntil
    }
  }

  /**
   * Estimates pre-verification gas for a user operation.
   * Calculates gas costs for calldata and fixed overheads.
   *
   * @param userOperation - The {@link UserOperation} to estimate for
   * @param baseFeePerGas - Optional base fee per gas
   * @returns The estimated pre-verification gas as a bigint
   *
   * @example
   * ```typescript
   * const preVerificationGas = await estimator.estimatePreVerificationGas(
   *   userOperation,
   *   1000000000n
   * );
   * ```
   */
  async estimatePreVerificationGas(
    userOperation: UserOperation,
    baseFeePerGas?: bigint
  ): Promise<bigint> {
    userOperation = validateUserOperation(userOperation)

    let packed: ByteArray
    if (isUserOperationV6(userOperation)) {
      packed = toBytes(packUserOpV6(userOperation, true))
    } else {
      const packedUserOperation = toPackedUserOperation(userOperation)
      packed = toBytes(packUserOpV7(packedUserOperation))
    }

    const callDataCost = packed
      .map((x: number) =>
        x === 0 ? defaultGasOverheads.zeroByte : defaultGasOverheads.nonZeroByte
      )
      .reduce((sum: any, x: any) => sum + x)

    const preVerificationGas = BigInt(
      Math.round(
        callDataCost +
          defaultGasOverheads.fixed / defaultGasOverheads.bundleSize +
          defaultGasOverheads.perUserOp +
          defaultGasOverheads.perUserOpWord * packed.length
      )
    )

    return preVerificationGas
  }

  /**
   * Merges user-provided options with default estimation options.
   *
   * @param entryPointVersion - The {@link EntryPointVersion} being used
   * @param options - Partial options to merge with defaults
   * @returns Complete estimation options
   *
   * @internal
   */
  mergeEstimateUserOperationGasOptions(
    entryPointVersion: EntryPointVersion,
    options?: Partial<EstimateUserOperationGasOptions>
  ): EstimateUserOperationGasOptions {
    const entryPointAddress =
      options?.entryPointAddress ||
      this.entryPoints[entryPointVersion].contract.address

    const simulation = options?.simulation || false

    const useBinarySearch =
      options?.useBinarySearch != null
        ? options.useBinarySearch
        : this.chain.stateOverrideSupport.bytecode

    return {
      entryPointAddress,
      simulation,
      useBinarySearch
    }
  }
}
