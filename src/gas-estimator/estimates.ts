import { EntryPointVersion } from "../entrypoint/factory";

export interface GasEstimatesV6 {
  callGasLimit: bigint;
  verificationGasLimit: bigint;
  preVerificationGas: bigint;
  validAfter: number;
  validUntil: number;
}

export interface GasEstimatesV7 extends GasEstimatesV6 {
  paymasterVerificationGasLimit: bigint;
  paymasterPostOpGasLimit: bigint;
}

export type EstimateUserOperationGasResult = GasEstimatesV6 | GasEstimatesV7;
