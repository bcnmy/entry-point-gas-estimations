import { IGasEstimator } from "../interface";
import { CalculatePreVerificationGasParams, CalculatePreVerificationGas } from "../types";
import { GasEstimator } from "./GasEstimator";
/**
 * @remarks
 * ScrollGasEstimator class that extends GasEstimator and has estimation logic specefic to Optimism
 */
export declare class ScrollGasEstimator extends GasEstimator implements IGasEstimator {
    /**
     * Overrides the calculatePreVerificationGas method from GasEstimator for Scroll Networks.
     *
     * @param {CalculatePreVerificationGasParams} params - Configuration options for preVerificationGas.
     * @returns {Promise<CalculatePreVerificationGas>} A promise that resolves to an object having the preVerificationGas.
     *
     * @throws {Error} If there is an issue during calculating preVerificationGas.
     */
    calculatePreVerificationGas(params: CalculatePreVerificationGasParams): Promise<CalculatePreVerificationGas>;
}
//# sourceMappingURL=ScrollGasEstimator.d.ts.map