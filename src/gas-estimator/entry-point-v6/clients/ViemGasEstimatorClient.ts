import {
  PublicClient,
  ReadContractParameters,
  ReadContractReturnType,
} from "viem";
import { IRPCClient } from "../interface";
import { JSONRPCRequestParams, JSONRPCResponse } from "../types";

export class ViemGasEstimatorClient implements IRPCClient {
  constructor(private publicClient: PublicClient) {}

  async readContract(
    params: ReadContractParameters,
  ): Promise<ReadContractReturnType> {
    const { address, abi, functionName, args } = params;
    return await this.publicClient.readContract({
      address,
      abi,
      functionName,
      args,
    });
  }

  async request(
    jsonRPCRequestParams: JSONRPCRequestParams,
  ): Promise<JSONRPCResponse> {
    const { method, params } = jsonRPCRequestParams;
    return await this.publicClient.request({
      method,
      // @ts-ignore
      params,
    });
  }
}
