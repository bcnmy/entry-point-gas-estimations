import { ReadContractParameters, ReadContractReturnType } from "viem";
import {
  EstimateUserOperationGasParams,
  EstimateUserOperationGas,
  JSONRPCRequestParams,
  JSONRPCResponse,
  CalculatePreVerificationGasParams,
  CalculatePreVerificationGas,
} from "../types";

export interface IGasEstimator {
  estimateUserOperationGas(
    params: EstimateUserOperationGasParams,
  ): Promise<EstimateUserOperationGas>;
  calculatePreVerificationGas(
    params: CalculatePreVerificationGasParams,
  ): Promise<CalculatePreVerificationGas>;
  setEntryPointAddress(entryPointAddress: `0x${string}`): void;
}

export interface IRPCClient {
  request(params: JSONRPCRequestParams): Promise<JSONRPCResponse>;
  readContract(params: ReadContractParameters): Promise<ReadContractReturnType>;
}
