"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScrollGasEstimator = void 0;
const viem_1 = require("viem");
const abis_1 = require("../abis");
const constants_1 = require("../constants");
const utils_1 = require("../utils");
const GasEstimator_1 = require("./GasEstimator");
/**
 * @remarks
 * ScrollGasEstimator class that extends GasEstimator and has estimation logic specefic to Optimism
 */
class ScrollGasEstimator extends GasEstimator_1.GasEstimator {
    /**
     * Overrides the calculatePreVerificationGas method from GasEstimator for Scroll Networks.
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
        const l1Fee = (await this.publicClient.readContract({
            address: constants_1.SCROLL_L1_GAS_PRICE_ORACLE_ADDRESS,
            abi: abis_1.SCROLL_L1_GAS_PRICE_ORACLE_ABI,
            functionName: "getL1Fee",
            args: [handleOpsData],
        }));
        // extraPvg = l1Cost / l2Price
        const l2MaxFee = BigInt(userOperation.maxFeePerGas);
        preVerificationGas += l1Fee / l2MaxFee;
        return {
            preVerificationGas,
        };
    }
}
exports.ScrollGasEstimator = ScrollGasEstimator;
