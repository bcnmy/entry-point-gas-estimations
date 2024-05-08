"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ViemGasEstimatorClient = void 0;
class ViemGasEstimatorClient {
    constructor(publicClient) {
        this.publicClient = publicClient;
    }
    async readContract(params) {
        const { address, abi, functionName, args } = params;
        return await this.publicClient.readContract({
            address,
            abi,
            functionName,
            args,
        });
    }
    async request(jsonRPCRequestParams) {
        const { method, params } = jsonRPCRequestParams;
        return await this.publicClient.request({
            method,
            // @ts-ignore
            params,
        });
    }
}
exports.ViemGasEstimatorClient = ViemGasEstimatorClient;
