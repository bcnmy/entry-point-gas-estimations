"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArbitrumGasEstimator = void 0;
const viem_1 = require("viem");
const abis_1 = require("../abis");
const constants_1 = require("../constants");
const utils_1 = require("../utils");
const GasEstimator_1 = require("./GasEstimator");
/**
 * @remarks
 * ArbitrumGasEstimator class that extends GasEstimator and has estimation logic specefic to Arbitrum
 */
class ArbitrumGasEstimator extends GasEstimator_1.GasEstimator {
    /**
     * Overrides the calculatePreVerificationGas method from GasEstimator for Arbitrum Networks.
     *
     * @param {CalculatePreVerificationGasParams} params - Configuration options for preVerificationGas.
     * @returns {Promise<CalculatePreVerificationGas>} A promise that resolves to an object having the preVerificationGas.
     *
     * @throws {Error} If there is an issue during calculating preVerificationGas.
     */
    async calculatePreVerificationGas(params) {
        const { userOperation } = params;
        const packed = (0, viem_1.toBytes)((0, utils_1.packUserOp)(userOperation, false));
        const callDataCost = packed
            .map((x) => x === 0
            ? constants_1.defaultGasOverheads.zeroByte
            : constants_1.defaultGasOverheads.nonZeroByte)
            .reduce((sum, x) => sum + x);
        let preVerificationGas = BigInt(Math.round(callDataCost +
            constants_1.defaultGasOverheads.fixed / constants_1.defaultGasOverheads.bundleSize +
            constants_1.defaultGasOverheads.perUserOp +
            constants_1.defaultGasOverheads.perUserOpWord * packed.length));
        const handleOpsData = (0, viem_1.encodeFunctionData)({
            abi: abis_1.ENTRY_POINT_ABI,
            functionName: "handleOps",
            args: [[userOperation], userOperation.sender],
        });
        const gasEstimateForL1 = await this.publicClient.readContract({
            address: constants_1.NODE_INTERFACE_ARBITRUM_ADDRESS,
            abi: abis_1.ARBITRUM_L1_FEE_GAS_PRICE_ORACLE_ABI,
            functionName: "gasEstimateL1Component",
            args: [this.entryPointAddress, false, handleOpsData],
        });
        preVerificationGas += BigInt(gasEstimateForL1[0].toString());
        return {
            preVerificationGas,
        };
    }
}
exports.ArbitrumGasEstimator = ArbitrumGasEstimator;
