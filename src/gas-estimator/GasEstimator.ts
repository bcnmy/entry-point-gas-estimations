import type { Address, PublicClient } from "viem"
import type { SupportedChain } from "../chains"
import type { EntryPointRpcClient } from "../entrypoint/shared"
import type { UserOperationV6 } from "../entrypoint/v0.6.0"
import type { UserOperationV7 } from "../entrypoint/v0.7.0"
import type { MakeOptional, StateOverrideSet } from "../shared"
import type { UserOperation } from "./UserOperation"
import type { EntryPoints, EstimateUserOperationGasResult } from "./types"

export interface EstimateUserOperationGasParams {
  unEstimatedUserOperation: UnEstimatedUserOperation
  baseFeePerGas: bigint
  stateOverrides?: StateOverrideSet
  options?: Partial<EstimateUserOperationGasOptions>
}

export interface EstimateUserOperationGasOptions {
  entryPointAddress: Address
  useBinarySearch: boolean
  simulation: boolean
}

export interface GasEstimator {
  chain: SupportedChain
  entryPoints: EntryPoints
  simulationLimits: SimulationLimits
  estimateUserOperationGas: (
    params: EstimateUserOperationGasParams
  ) => Promise<EstimateUserOperationGasResult>
  estimatePreVerificationGas: (
    userOperation: UserOperation,
    baseFeePerGas: bigint
  ) => Promise<bigint>
}
export interface SimulationLimits {
  preVerificationGas: bigint
  verificationGasLimit: bigint
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
