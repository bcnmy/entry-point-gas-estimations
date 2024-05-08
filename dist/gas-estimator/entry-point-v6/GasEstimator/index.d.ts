import { GasEstimator } from "./GasEstimator";
import { CreateGasEstimatorParams } from "../types";
import { OptimismGasEstimator } from "./OptimismGasEstimator";
import { ArbitrumGasEstimator } from "./ArbitrumGasEstimator";
import { MantleGasEstimator } from "./MantleGasEstimator";
/**
 * factory method to create the general gas estimator instance
 * @param {CreateGasEstimatorParams} params config for creating the gas estimator client
 * @returns {GasEstimator} returns the general gas estimator client
 */
export declare function createGasEstimator(params: CreateGasEstimatorParams): GasEstimator;
/**
 * factory method to create the optimism gas estimator instance
 * @param {CreateGasEstimatorParams} params config for creating the gas estimator client
 * @returns {GasEstimator} returns the optimism gas estimator client
 */
export declare function createOptimismGasEstimator(params: CreateGasEstimatorParams): OptimismGasEstimator;
/**
 * factory method to create the arbitrum gas estimator instance
 * @param {CreateGasEstimatorParams} params config for creating the gas estimator client
 * @returns {GasEstimator} returns the arbitrum gas estimator client
 */
export declare function createArbitrumGasEstimator(params: CreateGasEstimatorParams): ArbitrumGasEstimator;
/**
 * factory method to create the mantle gas estimator instance
 * @param {CreateGasEstimatorParams} params config for creating the gas estimator client
 * @returns {GasEstimator} returns the mantle gas estimator client
 */
export declare function createMantleGasEstimator(params: CreateGasEstimatorParams): MantleGasEstimator;
/**
 * factory method to create the scroll gas estimator instance
 * @param {CreateGasEstimatorParams} params config for creating the gas estimator client
 * @returns {GasEstimator} returns the optimism gas estimator client
 */
export declare function createScrollGasEstimator(params: CreateGasEstimatorParams): OptimismGasEstimator;
//# sourceMappingURL=index.d.ts.map