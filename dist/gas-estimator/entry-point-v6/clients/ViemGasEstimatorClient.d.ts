import { PublicClient, ReadContractParameters, ReadContractReturnType } from "viem";
import { IRPCClient } from "../interface";
import { JSONRPCRequestParams, JSONRPCResponse } from "../types";
export declare class ViemGasEstimatorClient implements IRPCClient {
    private publicClient;
    constructor(publicClient: PublicClient);
    readContract(params: ReadContractParameters): Promise<ReadContractReturnType>;
    request(jsonRPCRequestParams: JSONRPCRequestParams): Promise<JSONRPCResponse>;
}
//# sourceMappingURL=ViemGasEstimatorClient.d.ts.map