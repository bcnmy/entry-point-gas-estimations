import { IGasEstimator } from "../interface";
import { CalculatePreVerificationGasParams, CalculatePreVerificationGas } from "../types";
import { GasEstimator } from "./GasEstimator";
/**
 * @remarks
 * MantleGasEstimator class that extends GasEstimator and has estimation logic specefic to Optimism
 */
export declare class MantleGasEstimator extends GasEstimator implements IGasEstimator {
    /**
     * Overrides the calculatePreVerificationGas method from GasEstimator for Mantle Networks.
     *
     * @param {CalculatePreVerificationGasParams} params - Configuration options for preVerificationGas.
     * @returns {Promise<CalculatePreVerificationGas>} A promise that resolves to an object having the preVerificationGas.
     *
     * @throws {Error} If there is an issue during calculating preVerificationGas.
     */
    calculatePreVerificationGas(params: CalculatePreVerificationGasParams): Promise<CalculatePreVerificationGas>;
}
//# sourceMappingURL=MantleGasEstimator.d.ts.map