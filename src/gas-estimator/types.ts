import type { Address } from "viem"
import { EntryPointVersion } from "../entrypoint/shared/types"
import type { EntryPointV6 } from "../entrypoint/v0.6.0/EntryPointV6"
import type { EntryPointV6Simulations } from "../entrypoint/v0.6.0/EntryPointV6Simulations"
import type { ExecutionResultV6 } from "../entrypoint/v0.6.0/types"
import type { EntryPointV7Simulations } from "../entrypoint/v0.7.0/EntryPointV7Simulations"
import type { ExecutionResultV7 } from "../entrypoint/v0.7.0/types"

/**
 * Union type for execution results from different EntryPoint versions.
 * Can be either a {@link ExecutionResultV6} or {@link ExecutionResultV7}.
 */
export type ExecutionResult = ExecutionResultV6 | ExecutionResultV7

/**
 * Map of EntryPoint versions to their contract instances and simulation helpers.
 *
 * @example
 * ```typescript
 * const entryPoints: EntryPoints = {
 *   [EntryPointVersion.v060]: {
 *     contract: entryPointV6,
 *     simulations: entryPointV6Simulations
 *   },
 *   [EntryPointVersion.v070]: {
 *     contract: entryPointV7Simulations
 *   }
 * };
 * ```
 */
export type EntryPoints = {
  [EntryPointVersion.v060]: {
    contract: IEntryPointV6
    simulations: IEntryPointV6Simulations
  }
  [EntryPointVersion.v070]: {
    contract: IEntryPointV7Simulations
  }
}

/**
 * Interface for EntryPoint v0.6.0 contract interactions.
 */
export interface IEntryPointV6 {
  /** Contract address */
  address: Address
  /** Simulates handling a user operation */
  simulateHandleOp: typeof EntryPointV6.prototype.simulateHandleOp
  /** Gets the nonce for an account */
  getNonce: typeof EntryPointV6.prototype.getNonce
  /** Encodes function data for handleOps */
  encodeHandleOpsFunctionData: typeof EntryPointV6.prototype.encodeHandleOpsFunctionData
}

/**
 * Interface for EntryPoint v0.6.0 simulation methods.
 * Extends {@link IEntryPointV6} with additional gas estimation methods.
 */
export interface IEntryPointV6Simulations extends IEntryPointV6 {
  /** Estimates verification gas limit */
  estimateVerificationGasLimit: typeof EntryPointV6Simulations.prototype.estimateVerificationGasLimit
  /** Estimates call gas limit */
  estimateCallGasLimit: typeof EntryPointV6Simulations.prototype.estimateCallGasLimit
}

/**
 * Interface for EntryPoint v0.7.0 simulation methods.
 */
export interface IEntryPointV7Simulations {
  /** Contract address */
  address: Address
  /** Simulates handling a user operation */
  simulateHandleOp: typeof EntryPointV7Simulations.prototype.simulateHandleOp
  /** Encodes function data for handleOps */
  encodeHandleOpsFunctionData: typeof EntryPointV7Simulations.prototype.encodeHandleOpsFunctionData
}

/**
 * Union type for gas estimation results from different EntryPoint versions.
 * Can be either a {@link EstimateUserOperationGasResultV6} or {@link EstimateUserOperationGasResultV7}.
 */
export type EstimateUserOperationGasResult =
  | EstimateUserOperationGasResultV6
  | EstimateUserOperationGasResultV7

/**
 * Gas estimation result for EntryPoint v0.6.0.
 */
export interface EstimateUserOperationGasResultV6 {
  /** Gas limit for the main execution call */
  callGasLimit: bigint
  /** Gas limit for the verification phase */
  verificationGasLimit: bigint
  /** Gas for pre-verification operations */
  preVerificationGas: bigint
  /** Timestamp after which the operation becomes valid */
  validAfter: number
  /** Timestamp until which the operation remains valid */
  validUntil: number
}

/**
 * Type guard to check if a gas estimation result is for v0.6.0.
 *
 * @param result - The result to check
 * @returns True if the result is a v0.6.0 result
 */
export function isEstimateUserOperationGasResultV6(
  result: EstimateUserOperationGasResult
): result is EstimateUserOperationGasResultV6 {
  return "validAfter" in result && "validUntil" in result
}

/**
 * Gas estimation result for EntryPoint v0.7.0.
 */
export interface EstimateUserOperationGasResultV7 {
  /** Gas limit for the main execution call */
  callGasLimit: bigint
  /** Gas limit for the verification phase */
  verificationGasLimit: bigint
  /** Gas for pre-verification operations */
  preVerificationGas: bigint
  /** Gas limit for paymaster verification */
  paymasterVerificationGasLimit: bigint
  /** Gas limit for paymaster post-operation execution */
  paymasterPostOpGasLimit: bigint
}

/**
 * Type guard to check if a gas estimation result is for v0.7.0.
 *
 * @param result - The result to check
 * @returns True if the result is a v0.7.0 result
 */
export function isEstimateUserOperationGasResultV7(
  result: EstimateUserOperationGasResult
): result is EstimateUserOperationGasResultV7 {
  return (
    "paymasterVerificationGasLimit" in result &&
    "paymasterPostOpGasLimit" in result
  )
}
