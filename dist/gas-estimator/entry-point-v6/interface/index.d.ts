import { ReadContractParameters, ReadContractReturnType } from "viem";
import { EstimateUserOperationGasParams, EstimateUserOperationGas, EstimateVerificationGasLimitParams, EstimateVerificationGasLimit, EstimateCallGasLimitParams, EstimateCallGasLimit, CalculatePreVerificationGasParams, CalculatePreVerificationGas, JSONRPCRequestParams, JSONRPCResponse } from "../types";
export interface IGasEstimator {
    estimateUserOperationGas(params: EstimateUserOperationGasParams): Promise<EstimateUserOperationGas>;
    estimateVerificationGasLimit(params: EstimateVerificationGasLimitParams): Promise<EstimateVerificationGasLimit>;
    estimateCallGasLimit(params: EstimateCallGasLimitParams): Promise<EstimateCallGasLimit>;
    calculatePreVerificationGas(params: CalculatePreVerificationGasParams): Promise<CalculatePreVerificationGas>;
    setEntryPointAddress(entryPointAddress: `0x${string}`): void;
}
export interface IRPCClient {
    request(params: JSONRPCRequestParams): Promise<JSONRPCResponse>;
    readContract(params: ReadContractParameters): Promise<ReadContractReturnType>;
}
//# sourceMappingURL=index.d.ts.map