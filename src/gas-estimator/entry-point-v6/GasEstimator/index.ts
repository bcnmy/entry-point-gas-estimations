import { createPublicClient, http } from "viem";
import { GasEstimator } from "./GasEstimator";
import { ViemGasEstimatorClient } from "../clients";
import { CreateGasEstimatorParams } from "../types";
import { OptimismGasEstimator } from "./OptimismGasEstimator";
import { ArbitrumGasEstimator } from "./ArbitrumGasEstimator";
import { MantleGasEstimator } from "./MantleGasEstimator";
import { ScrollGasEstimator } from "./ScrollGasEstimator";
import { MorphGasEstimator } from "./MorphGasEstimator";
import { SeiGasEstimator } from "./SeiGasEstimator";
import { KakarotGasEstimator } from "./KakarotGasEstimator";

/**
 * factory method to create the general gas estimator instance
 * @param {CreateGasEstimatorParams} params config for creating the gas estimator client
 * @returns {GasEstimator} returns the general gas estimator client
 */
export function createGasEstimator(
  params: CreateGasEstimatorParams
): GasEstimator {
  const { rpcUrl, ...rest } = params;
  const publicClient = new ViemGasEstimatorClient(
    createPublicClient({
      transport: http(rpcUrl),
    })
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
  params: CreateGasEstimatorParams
): OptimismGasEstimator {
  const { rpcUrl, ...rest } = params;
  const publicClient = new ViemGasEstimatorClient(
    createPublicClient({
      transport: http(rpcUrl),
    })
  );
  return new OptimismGasEstimator({
    publicClient,
    ...rest,
  });
}

/**
 * factory method to create the arbitrum gas estimator instance
 * @param {CreateGasEstimatorParams} params config for creating the gas estimator client
 * @returns {GasEstimator} returns the arbitrum gas estimator client
 */
export function createArbitrumGasEstimator(
  params: CreateGasEstimatorParams
): ArbitrumGasEstimator {
  const { rpcUrl, ...rest } = params;
  const publicClient = new ViemGasEstimatorClient(
    createPublicClient({
      transport: http(rpcUrl),
    })
  );
  return new ArbitrumGasEstimator({
    publicClient,
    ...rest,
  });
}

/**
 * factory method to create the mantle gas estimator instance
 * @param {CreateGasEstimatorParams} params config for creating the gas estimator client
 * @returns {GasEstimator} returns the mantle gas estimator client
 */
export function createMantleGasEstimator(
  params: CreateGasEstimatorParams
): MantleGasEstimator {
  const { rpcUrl, ...rest } = params;
  const publicClient = new ViemGasEstimatorClient(
    createPublicClient({
      transport: http(rpcUrl),
    })
  );
  return new MantleGasEstimator({
    publicClient,
    ...rest,
  });
}

/**
 * factory method to create the scroll gas estimator instance
 * @param {CreateGasEstimatorParams} params config for creating the gas estimator client
 * @returns {GasEstimator} returns the optimism gas estimator client
 */
export function createScrollGasEstimator(
  params: CreateGasEstimatorParams
): OptimismGasEstimator {
  const { rpcUrl, ...rest } = params;
  const publicClient = new ViemGasEstimatorClient(
    createPublicClient({
      transport: http(rpcUrl),
    })
  );
  return new ScrollGasEstimator({
    publicClient,
    ...rest,
  });
}

/**
 * factory method to create the morph gas estimator instance
 * @param {CreateGasEstimatorParams} params config for creating the gas estimator client
 * @returns {GasEstimator} returns the morph gas estimator client
 */
export function createMorphGasEstimator(
  params: CreateGasEstimatorParams
): MorphGasEstimator {
  const { rpcUrl, ...rest } = params;
  const publicClient = new ViemGasEstimatorClient(
    createPublicClient({
      transport: http(rpcUrl),
    })
  );
  return new MorphGasEstimator({
    publicClient,
    ...rest,
  });
}

/**
 * factory method to create the sei gas estimator instance
 * @param {CreateGasEstimatorParams} params config for creating the gas estimator client
 * @returns {GasEstimator} returns the sei gas estimator client
 */
export function createSeiGasEstimator(
  params: CreateGasEstimatorParams
): SeiGasEstimator {
  const { rpcUrl, ...rest } = params;
  const publicClient = new ViemGasEstimatorClient(
    createPublicClient({
      transport: http(rpcUrl),
    })
  );
  return new SeiGasEstimator({
    publicClient,
    ...rest,
  });
}

/**
 * factory method to create the kakarot gas estimator instance
 * @param {CreateGasEstimatorParams} params config for creating the gas estimator client
 * @returns {GasEstimator} returns the kakarot gas estimator client
 */
export function createKakarotGasEstimator(
  params: CreateGasEstimatorParams
): KakarotGasEstimator {
  const { rpcUrl, ...rest } = params;
  const publicClient = new ViemGasEstimatorClient(
    createPublicClient({
      transport: http(rpcUrl),
    })
  );
  return new KakarotGasEstimator({
    publicClient,
    ...rest,
  });
}
