import { Address, PublicClient } from "viem";
import { EntryPoints, EstimateUserOperationGasResult } from "./types";
import { EntryPointRpcClient } from "../entrypoint/shared/types";
import { UserOperation } from "./UserOperation";
import { MakeOptional, StateOverrideSet } from "../shared/types";
import { UserOperationV6 } from "../entrypoint/v0.6.0/UserOperationV6";
import { UserOperationV7 } from "../entrypoint/v0.7.0/UserOperationV7";

export interface EstimateUserOperationGasParams {
  unEstimatedUserOperation: UnEstimatedUserOperation;
  baseFeePerGas: bigint;
  stateOverrides?: StateOverrideSet;
  partialOptions?: Partial<EstimateUserOperationGasOptions>;
}

export interface EstimateUserOperationGasOptions {
  entryPointAddress: Address;
  useBinarySearch: boolean;
  overrideSenderBalance: boolean;
}

export interface GasEstimator {
  chainId: number;
  entryPoints: EntryPoints;
  simulationOptions: SimulationOptions;
  estimateUserOperationGas: (
    params: EstimateUserOperationGasParams
  ) => Promise<EstimateUserOperationGasResult>;
  estimatePreVerificationGas: (
    userOperation: UserOperation,
    baseFeePerGas: bigint
  ) => Promise<bigint>;
}
export interface SimulationOptions {
  preVerificationGas: bigint;
  verificationGasLimit: bigint;
  callGasLimit: bigint;
}

export type GasEstimatorRpcClient = Pick<
  PublicClient,
  "readContract" | "estimateGas"
> &
  EntryPointRpcClient;

export type UnEstimatedUserOperation =
  | UnEstimatedUserOperationV6
  | UnEstimatedUserOperationV7;

export type UnEstimatedUserOperationV6 = MakeOptional<
  UserOperationV6,
  "callGasLimit" | "verificationGasLimit" | "preVerificationGas"
>;

export type UnEstimatedUserOperationV7 = MakeOptional<
  UserOperationV7,
  | "callGasLimit"
  | "verificationGasLimit"
  | "preVerificationGas"
  | "paymasterVerificationGasLimit"
  | "paymasterPostOpGasLimit"
>;
