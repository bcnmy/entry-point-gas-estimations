"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createScrollGasEstimator = exports.createMantleGasEstimator = exports.createArbitrumGasEstimator = exports.createOptimismGasEstimator = exports.createGasEstimator = void 0;
const viem_1 = require("viem");
const GasEstimator_1 = require("./GasEstimator");
const clients_1 = require("../clients");
const OptimismGasEstimator_1 = require("./OptimismGasEstimator");
const ArbitrumGasEstimator_1 = require("./ArbitrumGasEstimator");
const MantleGasEstimator_1 = require("./MantleGasEstimator");
const ScrollGasEstimator_1 = require("./ScrollGasEstimator");
/**
 * factory method to create the general gas estimator instance
 * @param {CreateGasEstimatorParams} params config for creating the gas estimator client
 * @returns {GasEstimator} returns the general gas estimator client
 */
function createGasEstimator(params) {
    const { rpcUrl, ...rest } = params;
    const publicClient = new clients_1.ViemGasEstimatorClient((0, viem_1.createPublicClient)({
        transport: (0, viem_1.http)(rpcUrl),
    }));
    return new GasEstimator_1.GasEstimator({
        publicClient,
        ...rest,
    });
}
exports.createGasEstimator = createGasEstimator;
/**
 * factory method to create the optimism gas estimator instance
 * @param {CreateGasEstimatorParams} params config for creating the gas estimator client
 * @returns {GasEstimator} returns the optimism gas estimator client
 */
function createOptimismGasEstimator(params) {
    const { rpcUrl, ...rest } = params;
    const publicClient = new clients_1.ViemGasEstimatorClient((0, viem_1.createPublicClient)({
        transport: (0, viem_1.http)(rpcUrl),
    }));
    return new OptimismGasEstimator_1.OptimismGasEstimator({
        publicClient,
        ...rest,
    });
}
exports.createOptimismGasEstimator = createOptimismGasEstimator;
/**
 * factory method to create the arbitrum gas estimator instance
 * @param {CreateGasEstimatorParams} params config for creating the gas estimator client
 * @returns {GasEstimator} returns the arbitrum gas estimator client
 */
function createArbitrumGasEstimator(params) {
    const { rpcUrl, ...rest } = params;
    const publicClient = new clients_1.ViemGasEstimatorClient((0, viem_1.createPublicClient)({
        transport: (0, viem_1.http)(rpcUrl),
    }));
    return new ArbitrumGasEstimator_1.ArbitrumGasEstimator({
        publicClient,
        ...rest,
    });
}
exports.createArbitrumGasEstimator = createArbitrumGasEstimator;
/**
 * factory method to create the mantle gas estimator instance
 * @param {CreateGasEstimatorParams} params config for creating the gas estimator client
 * @returns {GasEstimator} returns the mantle gas estimator client
 */
function createMantleGasEstimator(params) {
    const { rpcUrl, ...rest } = params;
    const publicClient = new clients_1.ViemGasEstimatorClient((0, viem_1.createPublicClient)({
        transport: (0, viem_1.http)(rpcUrl),
    }));
    return new MantleGasEstimator_1.MantleGasEstimator({
        publicClient,
        ...rest,
    });
}
exports.createMantleGasEstimator = createMantleGasEstimator;
/**
 * factory method to create the scroll gas estimator instance
 * @param {CreateGasEstimatorParams} params config for creating the gas estimator client
 * @returns {GasEstimator} returns the optimism gas estimator client
 */
function createScrollGasEstimator(params) {
    const { rpcUrl, ...rest } = params;
    const publicClient = new clients_1.ViemGasEstimatorClient((0, viem_1.createPublicClient)({
        transport: (0, viem_1.http)(rpcUrl),
    }));
    return new ScrollGasEstimator_1.ScrollGasEstimator({
        publicClient,
        ...rest,
    });
}
exports.createScrollGasEstimator = createScrollGasEstimator;
