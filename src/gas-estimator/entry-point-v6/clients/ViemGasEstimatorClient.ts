import { PublicClient, RpcRequestErrorType } from "viem";
import { IRPCClient } from "../interface";
import { RPCClientRequestParams } from "../types";

export class ViemGasEstimatorClient implements IRPCClient {
  constructor(private publicClient: PublicClient) {}

  async request(params: RPCClientRequestParams): Promise<RpcRequestErrorType> {
    return await this.publicClient.request(params);
  }

}