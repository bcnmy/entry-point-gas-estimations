import { IGasEstimator } from "../interface";
import { CalculatePreVerificationGasParams, CalculatePreVerificationGas } from "../types";
import { GasEstimator } from "./GasEstimator";
/**
 * @remarks
 * ArbitrumGasEstimator class that extends GasEstimator and has estimation logic specefic to Arbitrum
 */
export declare class ArbitrumGasEstimator extends GasEstimator implements IGasEstimator {
    /**
     * Overrides the calculatePreVerificationGas method from GasEstimator for Arbitrum Networks.
     *
     * @param {CalculatePreVerificationGasParams} params - Configuration options for preVerificationGas.
     * @returns {Promise<CalculatePreVerificationGas>} A promise that resolves to an object having the preVerificationGas.
     *
     * @throws {Error} If there is an issue during calculating preVerificationGas.
     */
    calculatePreVerificationGas(params: CalculatePreVerificationGasParams): Promise<CalculatePreVerificationGas>;
}
//# sourceMappingURL=ArbitrumGasEstimator.d.ts.map