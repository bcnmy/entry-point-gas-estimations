import type { Address, PublicClient } from "viem"
import type { SupportedChain } from "../chains"
import type { EntryPointRpcClient } from "../entrypoint/shared"
import type { UserOperationV6 } from "../entrypoint/v0.6.0"
import type { UserOperationV7 } from "../entrypoint/v0.7.0"
import type { MakeOptional, StateOverrideSet } from "../shared"
import type { UserOperation } from "./UserOperation"
import type { EntryPoints, EstimateUserOperationGasResult } from "./types"

/**
 * Parameters for estimating user operation gas.
 */
export interface EstimateUserOperationGasParams {
  /** User operation without gas estimates */
  unEstimatedUserOperation: UnEstimatedUserOperation
  /** Current base fee per gas */
  baseFeePerGas: bigint
  /** Optional state overrides for simulation */
  stateOverrides?: StateOverrideSet
  /** Additional estimation options */
  options?: Partial<EstimateUserOperationGasOptions>
}

/**
 * Options for gas estimation.
 */
export interface EstimateUserOperationGasOptions {
  /** EntryPoint contract address to use */
  entryPointAddress: Address
  /** Whether to use binary search for gas estimation */
  useBinarySearch: boolean
  /** Whether to run in simulation mode */
  simulation: boolean
}

/**
 * Interface for gas estimation implementations.
 * Provides methods for estimating gas costs for user operations across different chains.
 *
 * @example
 * ```typescript
 * class CustomGasEstimator implements GasEstimator {
 *   chain: SupportedChain;
 *   entryPoints: EntryPoints;
 *   simulationLimits: SimulationLimits;
 *
 *   async estimateUserOperationGas(params: EstimateUserOperationGasParams) {
 *     // Custom implementation
 *   }
 *
 *   async estimatePreVerificationGas(userOperation: UserOperation) {
 *     // Custom implementation
 *   }
 * }
 * ```
 */
export interface GasEstimator {
  /** The chain configuration this estimator is for */
  chain: SupportedChain

  /** Map of EntryPoint contract instances by version */
  entryPoints: EntryPoints

  /** Gas limits used during simulation */
  simulationLimits: SimulationLimits

  /**
   * Estimates all gas parameters for a user operation.
   *
   * @param params - The estimation parameters
   * @param params.unEstimatedUserOperation - User operation without gas estimates
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
   *     // ... other fields without gas parameters
   *   },
   *   baseFeePerGas: 1000000000n
   * });
   * ```
   */
  estimateUserOperationGas: (
    params: EstimateUserOperationGasParams
  ) => Promise<EstimateUserOperationGasResult>

  /**
   * Estimates pre-verification gas for a user operation.
   * This includes costs for calldata and fixed overheads.
   *
   * @param userOperation - The user operation to estimate for
   * @param baseFeePerGas - Optional base fee per gas (required for some chains)
   * @returns The estimated pre-verification gas as a bigint
   *
   * @example
   * ```typescript
   * const preVerificationGas = await estimator.estimatePreVerificationGas(
   *   userOperation,
   *   1000000000n // optional baseFeePerGas
   * );
   * ```
   */
  estimatePreVerificationGas: (
    userOperation: UserOperation,
    baseFeePerGas: bigint
  ) => Promise<bigint>
}

export interface SimulationLimits {
  /** Gas limit for pre-verification operations */
  preVerificationGas: bigint
  /** Gas limit for the verification phase */
  verificationGasLimit: bigint
  /** Gas limit for the main execution call */
  callGasLimit: bigint
}

export type GasEstimatorRpcClient = Pick<
  PublicClient,
  "readContract" | "estimateGas"
> &
  EntryPointRpcClient

export type UnEstimatedUserOperation =
  | UnEstimatedUserOperationV6
  | UnEstimatedUserOperationV7

export type UnEstimatedUserOperationV6 = MakeOptional<
  UserOperationV6,
  "callGasLimit" | "verificationGasLimit" | "preVerificationGas"
>

export type UnEstimatedUserOperationV7 = MakeOptional<
  UserOperationV7,
  | "callGasLimit"
  | "verificationGasLimit"
  | "preVerificationGas"
  | "paymasterVerificationGasLimit"
  | "paymasterPostOpGasLimit"
>
