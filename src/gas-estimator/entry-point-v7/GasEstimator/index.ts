import { createPublicClient, http } from "viem";
import { GasEstimator } from "./GasEstimator";
import { CreateGasEstimatorParams } from "../types";
import { OptimismGasEstimator } from "./OptimismGasEstimator";
import { ViemGasEstimatorClient } from "../clients";

/**
 * factory method to create the general gas estimator instance
 * @param {CreateGasEstimatorParams} params config for creating the gas estimator client
 * @returns {GasEstimator} returns the general gas estimator client
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
 * @returns {GasEstimator} returns the optimism gas estimator client
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
