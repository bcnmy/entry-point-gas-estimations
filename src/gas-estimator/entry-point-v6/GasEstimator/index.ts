import { createPublicClient, http } from "viem";
import { GasEstimator } from "./GasEstimator";
import { ViemGasEstimatorClient } from "../clients";
import { CreateGasEstimatorParams } from "../types";
import { OptimismGasEstimator } from "./OptimismGasEstimator";
import { ArbitrumGasEstimator } from "./ArbitrumGasEstimator";

/**
 * factory method to create the general gas estimator instance
 * @param {CreateGasEstimatorParams} params config for creating the gas estimator client
 */
export function createGasEstimator(
  params: CreateGasEstimatorParams,
): GasEstimator {
  const { rpcUrl, ...rest } = params;
  const publicClient = new ViemGasEstimatorClient(
    createPublicClient({
      transport: http(rpcUrl),
    }),
  );
  return new GasEstimator({
    publicClient,
    ...rest,
  });
}

/**
 * factory method to create the optimism gas estimator instance
 * @param {CreateGasEstimatorParams} params config for creating the gas estimator client
 */
export function createOptimismGasEstimator(
  params: CreateGasEstimatorParams,
): OptimismGasEstimator {
  const { rpcUrl, ...rest } = params;
  const publicClient = new ViemGasEstimatorClient(
    createPublicClient({
      transport: http(rpcUrl),
    }),
  );
  return new OptimismGasEstimator({
    publicClient,
    ...rest,
  });
}

/**
 * factory method to create the arbitrum gas estimator instance
 * @param {CreateGasEstimatorParams} params config for creating the gas estimator client
 */
export function createArbitrumGasEstimator(
  params: CreateGasEstimatorParams,
): ArbitrumGasEstimator {
  const { rpcUrl, ...rest } = params;
  const publicClient = new ViemGasEstimatorClient(
    createPublicClient({
      transport: http(rpcUrl),
    }),
  );
  return new ArbitrumGasEstimator({
    publicClient,
    ...rest,
  });
}
