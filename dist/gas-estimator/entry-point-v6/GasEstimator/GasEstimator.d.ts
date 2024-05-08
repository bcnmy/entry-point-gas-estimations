import { Address, EstimateCallGasLimitParams, EstimateCallGasLimit, EstimateUserOperationGasParams, EstimateUserOperationGas, EstimateVerificationGasLimitParams, EstimateVerificationGasLimit, GasEstimatorParams, CalculatePreVerificationGas, CalculatePreVerificationGasParams } from "../types";
import { IGasEstimator, IRPCClient } from "../interface";
/**
 * @remarks
 * GasEstimator class exposes methods to calculate gas limits for EntryPoint v0.6 compatible userOps
 */
export declare class GasEstimator implements IGasEstimator {
    /**
     * The publicClient created using viem
     */
    protected publicClient: IRPCClient;
    /**
     * v0.6 entry point address
     * @defaultValue 0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789
     */
    protected entryPointAddress: Address;
    /**
     * the bytecode of the contract that extends the Entry Point contract and
     * implements the binary search logic for call gas estimation
     * @defaultValue is stored in constants.ts
     */
    private callGasEstimationSimulatorByteCode;
    /**
     * the bytecode of the contract that extends the Entry Point contract and
     * implements the binary search logic for verification gas estimation
     * @defaultValue is stored in constants.ts
     */
    private verificationGasEstimationSimulatorByteCode;
    /**
     * Creates a new instance of GasEstimator
     * @param {GasEstimatorParams} params - Configuration options for the gas estimator.
     */
    constructor(params: GasEstimatorParams);
    /**
     * Estimates gas for a user operation.
     *
     * @param {EstimateUserOperationGasArgs} params - Configuration options for gas estimation.
     * @returns {Promise<EstimateUserOperationGas>} A promise that resolves to the estimated gas limits.
     *
     * @throws {Error | RpcError} If there is an issue during gas estimation.
     */
    estimateUserOperationGas(params: EstimateUserOperationGasParams): Promise<EstimateUserOperationGas>;
    /**
     * Estimates gas for a user operation.
     *
     * @param {EstimateVerificationGasLimitParams} params - Configuration options for verificationGasLimit gas estimation.
     * @returns {Promise<EstimateVerificationGasLimit>} A promise that resolves to an object containing the verificationGasLimit
     *
     * @throws {Error | RpcError} If there is an issue during gas estimation.
     */
    estimateVerificationGasLimit(params: EstimateVerificationGasLimitParams): Promise<EstimateVerificationGasLimit>;
    /**
     * Estimates gas for a user operation.
     *
     * @param {EstimateCallGasLimitParams} params - Configuration options for callGasLimit gas estimation.
     * @returns {Promise<EstimateCallGasLimit>} A promise that resolves to the estimated gas limits.
     *
     * @throws {Error | RpcError} If there is an issue during gas estimation.
     */
    estimateCallGasLimit(params: EstimateCallGasLimitParams): Promise<EstimateCallGasLimit>;
    /**
     * Calculates preVerificationGas
     * @param {CalculatePreVerificationGas} params - Configuration options for preVerificationGas
     * @returns {Promise<CalculatePreVerificationGas>} A promise that resolves to an object having the preVerificationGas
     *
     * @throws {Error} If there is an issue during calculating preVerificationGas
     */
    calculatePreVerificationGas(params: CalculatePreVerificationGasParams): Promise<CalculatePreVerificationGas>;
    /**
     * Public method to allow overriding the current entry point address
     * @param {`0x${string}`} entryPointAddress
     */
    setEntryPointAddress(entryPointAddress: `0x${string}`): void;
    /**
     * Makes eth_call to simulateHandleOp
     *
     * @param {SimulateHandleOpArgs} params - Configuration options for simulateHandleOp execution.
     * @returns {Promise<SimulateHandleOp>} A promise that resolves to the result of eth_call to simulateHandleOp
     *
     * @throws {Error} If there is an making eth_call to simulateHandleOp
     */
    private simulateHandleOp;
    /**
     * Makes eth_call to estimateVerificationGas on the Verification Gas Simulation Executor contract
     * @param {EstimateVerificationGasParams} params - Configuration options for estimateVerificationGas execution.
     * @returns {Promise<EstimateVerificationGas>} A promise that resolves to the result of eth_call to estimateVerificationGas
     *
     * @throws {Error} If there is an making eth_call to estimateVerificationGas
     */
    private estimateVerificationGas;
    /**
     * Estimates gas for a user operation for a blockchain whose RPC does not support state overrides or
     * does not give correct response for bytecode state override.
     *
     * @param {EstimateUserOperationGasParams} params - Configuration options for gas estimation.
     * @returns {Promise<EstimateUserOperationGas>} A promise that resolves to the estimated gas limits.
     *
     * @throws {Error} If there is an issue during gas estimation.
     */
    private estimateUserOperationGasWithoutFullEthCallSupport;
}
//# sourceMappingURL=GasEstimator.d.ts.map