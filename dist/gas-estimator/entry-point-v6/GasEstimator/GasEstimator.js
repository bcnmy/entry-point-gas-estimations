"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GasEstimator = void 0;
/* eslint-disable no-await-in-loop */
/* eslint-disable @typescript-eslint/return-await */
const viem_1 = require("viem");
const zod_1 = require("zod");
const types_1 = require("../types");
const constants_1 = require("../constants");
const abis_1 = require("../abis");
const utils_1 = require("../utils");
/**
 * @remarks
 * GasEstimator class exposes methods to calculate gas limits for EntryPoint v0.6 compatible userOps
 */
class GasEstimator {
    /**
     * Creates a new instance of GasEstimator
     * @param {GasEstimatorParams} params - Configuration options for the gas estimator.
     */
    constructor(params) {
        /**
         * the bytecode of the contract that extends the Entry Point contract and
         * implements the binary search logic for call gas estimation
         * @defaultValue is stored in constants.ts
         */
        this.callGasEstimationSimulatorByteCode = constants_1.CALL_GAS_ESTIMATION_SIMULATOR_BYTECODE;
        /**
         * the bytecode of the contract that extends the Entry Point contract and
         * implements the binary search logic for verification gas estimation
         * @defaultValue is stored in constants.ts
         */
        this.verificationGasEstimationSimulatorByteCode = constants_1.VERIFICATION_GAS_ESTIMATION_SIMUATOR_BYTECODE;
        this.entryPointAddress = params.entryPointAddress
            ? params.entryPointAddress
            : constants_1.DEFAULT_ENTRY_POINT_ADDRESS;
        this.publicClient = params.publicClient;
    }
    /**
     * Estimates gas for a user operation.
     *
     * @param {EstimateUserOperationGasArgs} params - Configuration options for gas estimation.
     * @returns {Promise<EstimateUserOperationGas>} A promise that resolves to the estimated gas limits.
     *
     * @throws {Error | RpcError} If there is an issue during gas estimation.
     */
    async estimateUserOperationGas(params) {
        const { userOperation, supportsEthCallStateOverride = true, supportsEthCallByteCodeOverride = true, stateOverrideSet, baseFeePerGas, } = params;
        if (!supportsEthCallStateOverride || !supportsEthCallByteCodeOverride) {
            return await this.estimateUserOperationGasWithoutFullEthCallSupport(params);
        }
        const verificationGasLimitPromise = this.estimateVerificationGasLimit({
            userOperation,
            stateOverrideSet,
        });
        const callGasLimitPromise = this.estimateCallGasLimit({
            userOperation,
            stateOverrideSet,
        });
        const preVerificationGasPromise = this.calculatePreVerificationGas({
            userOperation,
            baseFeePerGas,
        });
        const [verificationGasLimitResponse, callGasLimitResponse, preVerficationResponse,] = await Promise.all([
            verificationGasLimitPromise,
            callGasLimitPromise,
            preVerificationGasPromise,
        ]);
        return {
            verificationGasLimit: verificationGasLimitResponse.verificationGasLimit,
            callGasLimit: callGasLimitResponse.callGasLimit,
            preVerificationGas: preVerficationResponse.preVerificationGas,
            validUntil: verificationGasLimitResponse.validUntil,
            validAfter: verificationGasLimitResponse.validAfter,
        };
    }
    /**
     * Estimates gas for a user operation.
     *
     * @param {EstimateVerificationGasLimitParams} params - Configuration options for verificationGasLimit gas estimation.
     * @returns {Promise<EstimateVerificationGasLimit>} A promise that resolves to an object containing the verificationGasLimit
     *
     * @throws {Error | RpcError} If there is an issue during gas estimation.
     */
    async estimateVerificationGasLimit(params) {
        const { userOperation, supportsEthCallStateOverride = true, supportsEthCallByteCodeOverride = true, stateOverrideSet, } = params;
        if (!supportsEthCallStateOverride || !supportsEthCallByteCodeOverride) {
            return await this.estimateUserOperationGasWithoutFullEthCallSupport(params);
        }
        const error = await this.estimateVerificationGas({
            userOperation,
            stateOverrideSet,
        });
        const result = (0, utils_1.getVerificationGasEstimationSimulatorResult)(error);
        if (result === null) {
            throw new utils_1.RpcError("Failed to estimate verificationGasLimit");
        }
        const { verificationGasLimit, validAfter, validUntil } = result;
        return {
            verificationGasLimit,
            validAfter,
            validUntil,
        };
    }
    /**
     * Estimates gas for a user operation.
     *
     * @param {EstimateCallGasLimitParams} params - Configuration options for callGasLimit gas estimation.
     * @returns {Promise<EstimateCallGasLimit>} A promise that resolves to the estimated gas limits.
     *
     * @throws {Error | RpcError} If there is an issue during gas estimation.
     */
    async estimateCallGasLimit(params) {
        const { userOperation, supportsEthCallStateOverride = true, supportsEthCallByteCodeOverride = true, stateOverrideSet, } = params;
        if (!supportsEthCallStateOverride || !supportsEthCallByteCodeOverride) {
            return await this.estimateUserOperationGasWithoutFullEthCallSupport(params);
        }
        // Setting callGasLimit to 0 to make sure call data is not executed by the Entry Point code and only
        // done inside the CallGasSimulationExecutor contract
        userOperation.callGasLimit = BigInt(0);
        const targetCallData = (0, viem_1.encodeFunctionData)({
            abi: abis_1.CALL_GAS_ESTIMATION_SIMULATOR,
            functionName: "estimateCallGas",
            args: [
                {
                    sender: userOperation.sender,
                    callData: userOperation.callData,
                    minGas: constants_1.INITIAL_CGL_LOWER_BOUND,
                    maxGas: constants_1.INITIAL_CGL_UPPER_BOUND,
                    rounding: constants_1.CGL_ROUNDING,
                    isContinuation: constants_1.CALL_DATA_EXECUTION_AT_MAX_GAS,
                },
            ],
        });
        const error = await this.simulateHandleOp({
            userOperation,
            replacedEntryPoint: true,
            targetAddress: this.entryPointAddress,
            targetCallData,
            stateOverrideSet,
        });
        if (error.result === "failed") {
            throw new utils_1.RpcError(`UserOperation reverted during simulation with reason: ${error.data}`, types_1.VALIDATION_ERRORS.SIMULATE_VALIDATION_FAILED);
        }
        const result = (0, utils_1.getCallGasEstimationSimulatorResult)(error.data);
        if (result === null) {
            throw new utils_1.RpcError("Failed to estimate call gas limit");
        }
        return {
            callGasLimit: result,
        };
    }
    /**
     * Calculates preVerificationGas
     * @param {CalculatePreVerificationGas} params - Configuration options for preVerificationGas
     * @returns {Promise<CalculatePreVerificationGas>} A promise that resolves to an object having the preVerificationGas
     *
     * @throws {Error} If there is an issue during calculating preVerificationGas
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
        return {
            preVerificationGas,
        };
    }
    /**
     * Public method to allow overriding the current entry point address
     * @param {`0x${string}`} entryPointAddress
     */
    setEntryPointAddress(entryPointAddress) {
        this.entryPointAddress = entryPointAddress;
    }
    /**
     * Makes eth_call to simulateHandleOp
     *
     * @param {SimulateHandleOpArgs} params - Configuration options for simulateHandleOp execution.
     * @returns {Promise<SimulateHandleOp>} A promise that resolves to the result of eth_call to simulateHandleOp
     *
     * @throws {Error} If there is an making eth_call to simulateHandleOp
     */
    async simulateHandleOp(params) {
        const { userOperation, replacedEntryPoint, targetAddress, targetCallData, supportsEthCallStateOverride = true, supportsEthCallByteCodeOverride = true, stateOverrideSet, } = params;
        let ethCallParmas;
        if (!supportsEthCallStateOverride) {
            ethCallParmas = [
                {
                    to: this.entryPointAddress,
                    data: (0, viem_1.encodeFunctionData)({
                        abi: abis_1.ENTRY_POINT_ABI,
                        functionName: "simulateHandleOp",
                        args: [userOperation, targetAddress, targetCallData],
                    }),
                },
                types_1.BlockNumberTag.LATEST,
            ];
        }
        else if (!supportsEthCallByteCodeOverride) {
            const ethCallFinalParam = {
                [userOperation.sender]: {
                    balance: (0, viem_1.toHex)(100000000000000000000000n),
                },
                ...stateOverrideSet,
            };
            ethCallParmas = [
                {
                    to: this.entryPointAddress,
                    data: (0, viem_1.encodeFunctionData)({
                        abi: abis_1.ENTRY_POINT_ABI,
                        functionName: "simulateHandleOp",
                        args: [userOperation, targetAddress, targetCallData],
                    }),
                },
                types_1.BlockNumberTag.LATEST,
                // @ts-ignore
                ethCallFinalParam,
            ];
        }
        else {
            let replaceEntryPointByteCodeStateOverride = {
                [userOperation.sender]: {
                    balance: (0, viem_1.toHex)(100000000000000000000000n),
                },
                [this.entryPointAddress]: {
                    code: this.callGasEstimationSimulatorByteCode,
                },
            };
            for (const stateOverrideKey in stateOverrideSet) {
                if (stateOverrideKey.toLowerCase() ===
                    this.entryPointAddress.toLowerCase()) {
                    const { balance, state, stateDiff, nonce } = stateOverrideSet[stateOverrideKey];
                    replaceEntryPointByteCodeStateOverride[this.entryPointAddress] = {
                        code: this.callGasEstimationSimulatorByteCode,
                        balance,
                        nonce,
                        state,
                        stateDiff,
                    };
                }
                else {
                    replaceEntryPointByteCodeStateOverride[stateOverrideKey] =
                        stateOverrideSet[stateOverrideKey];
                }
            }
            const unreplaceEntryPointByteCodeStateOverride = {
                [userOperation.sender]: {
                    balance: (0, viem_1.toHex)(100000000000000000000000n),
                },
                ...stateOverrideSet,
            };
            const ethCallFinalParam = replacedEntryPoint
                ? replaceEntryPointByteCodeStateOverride
                : unreplaceEntryPointByteCodeStateOverride;
            ethCallParmas = [
                {
                    to: this.entryPointAddress,
                    data: (0, viem_1.encodeFunctionData)({
                        abi: abis_1.ENTRY_POINT_ABI,
                        functionName: "simulateHandleOp",
                        args: [userOperation, targetAddress, targetCallData],
                    }),
                },
                types_1.BlockNumberTag.LATEST,
                // @ts-ignore
                ethCallFinalParam,
            ];
        }
        try {
            await this.publicClient.request({
                method: "eth_call",
                // @ts-ignore // ignoring the types error as state overides are not allowed on all networks
                params: ethCallParmas,
            });
        }
        catch (error) {
            const err = error;
            let causeParseResult = zod_1.z
                .object({
                code: zod_1.z.literal(3),
                message: zod_1.z.string().regex(/execution reverted.*/),
                data: types_1.hexDataSchema,
            })
                // @ts-ignore
                .safeParse(err.cause);
            if (!causeParseResult.success) {
                // Doing this extra check on causeParseResult as Astar networks return different error
                // @ts-ignore
                causeParseResult = zod_1.z
                    .object({
                    code: zod_1.z.literal(-32603),
                    message: zod_1.z.string().regex(/revert.*/),
                    data: types_1.hexDataSchema,
                })
                    // @ts-ignore
                    .safeParse(err.cause.cause);
                if (!causeParseResult.success) {
                    // @ts-ignore
                    throw new Error(JSON.stringify(err.cause));
                }
            }
            const cause = causeParseResult.data;
            const decodedError = (0, viem_1.decodeErrorResult)({
                abi: abis_1.ENTRY_POINT_ABI,
                data: cause.data,
            });
            if (decodedError.errorName === "FailedOp") {
                return { result: "failed", data: decodedError.args[1] };
            }
            if (decodedError.errorName === "ExecutionResult") {
                const parsedExecutionResult = types_1.executionResultSchema.parse(decodedError.args);
                return { result: "execution", data: parsedExecutionResult };
            }
        }
        throw new Error("Unexpected error while calling simulateHandleOp");
    }
    /**
     * Makes eth_call to estimateVerificationGas on the Verification Gas Simulation Executor contract
     * @param {EstimateVerificationGasParams} params - Configuration options for estimateVerificationGas execution.
     * @returns {Promise<EstimateVerificationGas>} A promise that resolves to the result of eth_call to estimateVerificationGas
     *
     * @throws {Error} If there is an making eth_call to estimateVerificationGas
     */
    async estimateVerificationGas(params) {
        const { userOperation, stateOverrideSet } = params;
        const ethCallFinalParam = {
            [userOperation.sender]: {
                balance: (0, viem_1.toHex)(100000000000000000000000n),
            },
            [this.entryPointAddress]: {
                code: this.verificationGasEstimationSimulatorByteCode,
            },
        };
        for (const stateOverrideKey in stateOverrideSet) {
            if (stateOverrideKey.toLowerCase() === this.entryPointAddress.toLowerCase()) {
                const { balance, state, stateDiff, nonce } = stateOverrideSet[stateOverrideKey];
                ethCallFinalParam[this.entryPointAddress] = {
                    code: this.verificationGasEstimationSimulatorByteCode,
                    balance,
                    nonce,
                    state,
                    stateDiff,
                };
            }
            else {
                ethCallFinalParam[stateOverrideKey] =
                    stateOverrideSet[stateOverrideKey];
            }
        }
        // first iteration should run at max vgl
        userOperation.verificationGasLimit = constants_1.INITIAL_VGL_UPPER_BOUND;
        try {
            await this.publicClient.request({
                method: "eth_call",
                params: [
                    {
                        to: this.entryPointAddress,
                        data: (0, viem_1.encodeFunctionData)({
                            abi: abis_1.VERIFICATION_GAS_ESTIMATION_SIMULATOR,
                            functionName: "estimateVerificationGas",
                            args: [
                                {
                                    op: userOperation,
                                    minGas: constants_1.INITIAL_VGL_LOWER_BOUND,
                                    maxGas: constants_1.INITIAL_VGL_UPPER_BOUND,
                                    rounding: constants_1.VGL_ROUNDING,
                                    isContinuation: constants_1.VERIFICATION_EXECUTION_AT_MAX_GAS,
                                },
                            ],
                        }),
                    },
                    types_1.BlockNumberTag.LATEST,
                    // @ts-ignore
                    ethCallFinalParam,
                ],
            });
        }
        catch (error) {
            console.error("error (log 1): ", error);
            const err = error;
            const causeParseResult = zod_1.z
                .object({
                code: zod_1.z.literal(3),
                message: zod_1.z.string().regex(/execution reverted.*/),
                data: types_1.hexDataSchema,
            })
                // @ts-ignore
                .safeParse(err.cause);
            console.error("causeParseResult (log 2): ", causeParseResult);
            if (!causeParseResult.success) {
                console.error("!causeParseResult.success (log 3): ", !causeParseResult.success);
                // @ts-ignore
                console.error("err.cause (log 4): ", err.cause);
                // @ts-ignore
                throw new Error(JSON.stringify(err.cause));
            }
            const cause = causeParseResult.data;
            return cause.data;
        }
        throw new Error("Unexpected error while calling estimateVerificationGas");
    }
    /**
     * Estimates gas for a user operation for a blockchain whose RPC does not support state overrides or
     * does not give correct response for bytecode state override.
     *
     * @param {EstimateUserOperationGasParams} params - Configuration options for gas estimation.
     * @returns {Promise<EstimateUserOperationGas>} A promise that resolves to the estimated gas limits.
     *
     * @throws {Error} If there is an issue during gas estimation.
     */
    async estimateUserOperationGasWithoutFullEthCallSupport(params) {
        const { userOperation, supportsEthCallByteCodeOverride, supportsEthCallStateOverride, baseFeePerGas, } = params;
        userOperation.maxFeePerGas = constants_1.MAX_FEE_PER_GAS_OVERRIDE_VALUE;
        userOperation.maxPriorityFeePerGas =
            constants_1.MAX_PRIORITY_FEE_PER_GAS_OVERRIDE_VALUE;
        userOperation.preVerificationGas = constants_1.PRE_VERIFICATION_GAS_OVERRIDE_VALUE;
        userOperation.verificationGasLimit = constants_1.VERIFICATION_GAS_LIMIT_OVERRIDE_VALUE;
        userOperation.callGasLimit = constants_1.CALL_GAS_LIMIT_OVERRIDE_VALUE;
        const simulateHandleOpResponse = await this.simulateHandleOp({
            userOperation,
            replacedEntryPoint: false,
            targetAddress: viem_1.zeroAddress,
            targetCallData: "0x",
            supportsEthCallStateOverride,
            supportsEthCallByteCodeOverride,
        });
        if (simulateHandleOpResponse.result === "failed" ||
            typeof simulateHandleOpResponse.data === "string") {
            (0, utils_1.handleFailedOp)(simulateHandleOpResponse.data);
        }
        const { preVerificationGas } = await this.calculatePreVerificationGas({
            userOperation,
            baseFeePerGas,
        });
        // @ts-ignore
        const { preOpGas, paid, validAfter, validUntil } = simulateHandleOpResponse.data;
        const verificationGasLimit = preOpGas - userOperation.preVerificationGas;
        const callGasLimit = paid / userOperation.maxFeePerGas - preOpGas;
        return {
            callGasLimit,
            verificationGasLimit,
            preVerificationGas,
            validUntil,
            validAfter,
        };
    }
}
exports.GasEstimator = GasEstimator;
