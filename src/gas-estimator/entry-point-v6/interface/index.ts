import {
  EstimateUserOperationGasParams,
  EstimateUserOperationGas,
  EstimateVerificationGasLimitParams,
  EstimateVerificationGasLimit,
  EstimateCallGasLimitParams,
  EstimateCallGasLimit,
  CalculatePreVerificationGasParams,
  CalculatePreVerificationGas,
} from "../types";

export interface IGasEstimator {
  estimateUserOperationGas(
    params: EstimateUserOperationGasParams,
  ): Promise<EstimateUserOperationGas>;
  estimateVerificationGasLimit(
    params: EstimateVerificationGasLimitParams,
  ): Promise<EstimateVerificationGasLimit>;
  estimateCallGasLimit(
    params: EstimateCallGasLimitParams,
  ): Promise<EstimateCallGasLimit>;
  calculatePreVerificationGas(
    params: CalculatePreVerificationGasParams,
  ): Promise<CalculatePreVerificationGas>;
  setEntryPointAddress(entryPointAddress: `0x${string}`): void
}
