import { createPublicClient, http } from "viem";
import { GasEstimator } from "./GasEstimator";
import { ViemGasEstimatorClient } from "../clients";
import { CreateGasEstimatorParams } from "../types";

export function createGasEstimator(params: CreateGasEstimatorParams): GasEstimator {
  const {
    rpcUrl,
    ...rest
  } = params;
  const publicClient = new ViemGasEstimatorClient(createPublicClient({
    transport: http(rpcUrl)
  }));
  return new GasEstimator({
    publicClient,
    ...rest
  });
}
