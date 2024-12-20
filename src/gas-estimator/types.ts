import { Address } from "viem";
import { EntryPointVersion } from "../entrypoint/shared/types";
import { EntryPointV6 } from "../entrypoint/v0.6.0/EntryPointV6";
import { EntryPointV6Simulations } from "../entrypoint/v0.6.0/EntryPointV6Simulations";
import { ExecutionResultV6 } from "../entrypoint/v0.6.0/types";
import { EntryPointV7Simulations } from "../entrypoint/v0.7.0/EntryPointV7Simulations";
import { ExecutionResultV7 } from "../entrypoint/v0.7.0/types";

export type ExecutionResult = ExecutionResultV6 | ExecutionResultV7;

export type EntryPoints = {
  [EntryPointVersion.v060]: {
    contract: IEntryPointV6;
    simulations: IEntryPointV6Simulations;
  };
  [EntryPointVersion.v070]: {
    contract: IEntryPointV7Simulations;
  };
};

export interface IEntryPointV6 {
  address: Address;
  simulateHandleOp: typeof EntryPointV6.prototype.simulateHandleOp;
  getNonce: typeof EntryPointV6.prototype.getNonce;
  encodeHandleOpsFunctionData: typeof EntryPointV6.prototype.encodeHandleOpsFunctionData;
}

export interface IEntryPointV6Simulations extends IEntryPointV6 {
  estimateVerificationGasLimit: typeof EntryPointV6Simulations.prototype.estimateVerificationGasLimit;
  estimateCallGasLimit: typeof EntryPointV6Simulations.prototype.estimateCallGasLimit;
}

export interface IEntryPointV7Simulations {
  address: Address;
  simulateHandleOp: typeof EntryPointV7Simulations.prototype.simulateHandleOp;
  encodeHandleOpsFunctionData: typeof EntryPointV7Simulations.prototype.encodeHandleOpsFunctionData;
}

export type EstimateUserOperationGasResult =
  | EstimateUserOperationGasResultV6
  | EstimateUserOperationGasResultV7;

export interface EstimateUserOperationGasResultV6 {
  callGasLimit: bigint;
  verificationGasLimit: bigint;
  preVerificationGas: bigint;
  validAfter: number;
  validUntil: number;
}

export function isEstimateUserOperationGasResultV6(
  result: EstimateUserOperationGasResult
): result is EstimateUserOperationGasResultV6 {
  return "validAfter" in result && "validUntil" in result;
}

export interface EstimateUserOperationGasResultV7 {
  callGasLimit: bigint;
  verificationGasLimit: bigint;
  preVerificationGas: bigint;
  paymasterVerificationGasLimit: bigint;
  paymasterPostOpGasLimit: bigint;
}

export function isEstimateUserOperationGasResultV7(
  result: EstimateUserOperationGasResult
): result is EstimateUserOperationGasResultV7 {
  return (
    "paymasterVerificationGasLimit" in result &&
    "paymasterPostOpGasLimit" in result
  );
}
