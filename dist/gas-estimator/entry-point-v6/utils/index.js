"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.packUserOp = exports.getSimulationResult = exports.handleFailedOp = exports.getVerificationGasEstimationSimulatorResult = exports.getCallGasEstimationSimulatorResult = exports.tooLow = exports.RpcError = void 0;
/* eslint-disable @typescript-eslint/no-shadow */
const viem_1 = require("viem");
const abis_1 = require("../abis");
const types_1 = require("../types");
const zod_validation_error_1 = require("zod-validation-error");
class RpcError extends Error {
    // error codes from: https://eips.ethereum.org/EIPS/eip-1474
    constructor(msg, code, data = undefined) {
        super(msg);
        this.code = code;
        this.data = data;
    }
}
exports.RpcError = RpcError;
function tooLow(error) {
    return (error === "AA40 over verificationGasLimit" ||
        error === "AA41 too little verificationGas" ||
        error === "AA51 prefund below actualGasCost" ||
        error === "AA13 initCode failed or OOG" ||
        error === "AA21 didn't pay prefund" ||
        error === "AA23 reverted (or OOG)" ||
        error === "AA33 reverted (or OOG)" ||
        error === "return data out of bounds" ||
        error === "validation OOG");
}
exports.tooLow = tooLow;
function getCallGasEstimationSimulatorResult(data) {
    const result = (0, viem_1.decodeErrorResult)({
        abi: abis_1.CALL_GAS_ESTIMATION_SIMULATOR,
        data: data.targetResult,
    });
    if (result.errorName === "EstimateCallGasRevertAtMax") {
        throw new RpcError("UserOperation reverted during execution phase", types_1.VALIDATION_ERRORS.SIMULATE_VALIDATION_FAILED);
    }
    if (result.errorName === "EstimateCallGasContinuation") {
        return (result.args[0] + result.args[1]) / 2n;
    }
    if (result.errorName === "EstimateCallGasResult") {
        return result.args[0];
    }
    return null;
}
exports.getCallGasEstimationSimulatorResult = getCallGasEstimationSimulatorResult;
function getVerificationGasEstimationSimulatorResult(data) {
    const result = (0, viem_1.decodeErrorResult)({
        abi: abis_1.VERIFICATION_GAS_ESTIMATION_SIMULATOR,
        data,
    });
    if (result.errorName === "FailedOp") {
        handleFailedOp(result.args[1]);
    }
    if (result.errorName === "FailedOpError") {
        const { args } = result;
        const errorResult = (0, viem_1.decodeErrorResult)({
            abi: abis_1.ENTRY_POINT_ABI,
            data: args[0],
        });
        if (errorResult.errorName === "FailedOp") {
            handleFailedOp(errorResult.args[1]);
        }
    }
    if (result.errorName === "EstimateVerificationGasResult") {
        return {
            verificationGasLimit: result.args[0],
            validAfter: result.args[1],
            validUntil: result.args[2],
        };
    }
    if (result.errorName === "EstimateVerificationGasContinuation") {
        return {
            verificationGasLimit: (result.args[0] + result.args[1]) / 2n,
            validAfter: result.args[2],
            validUntil: result.args[3],
        };
    }
    return null;
}
exports.getVerificationGasEstimationSimulatorResult = getVerificationGasEstimationSimulatorResult;
function handleFailedOp(revertReason) {
    revertReason = removeSpecialCharacters(revertReason);
    if (revertReason.includes("AA1") || revertReason.includes("AA2")) {
        throw new RpcError(revertReason, types_1.VALIDATION_ERRORS.SIMULATE_VALIDATION_FAILED);
    }
    else if (revertReason.includes("AA3")) {
        throw new RpcError(revertReason, types_1.VALIDATION_ERRORS.SIMULATE_PAYMASTER_VALIDATION_FAILED);
    }
    else if (revertReason.includes("AA9")) {
        throw new RpcError(revertReason, types_1.VALIDATION_ERRORS.WALLET_TRANSACTION_REVERTED);
    }
    else if (revertReason.includes("AA4")) {
        throw new RpcError(revertReason, types_1.VALIDATION_ERRORS.SIMULATE_VALIDATION_FAILED);
    }
    else if (revertReason.includes("AA")) {
        throw new RpcError(revertReason, types_1.VALIDATION_ERRORS.SIMULATE_VALIDATION_FAILED);
    }
    throw new RpcError("UserOperation reverted during execution phase", types_1.VALIDATION_ERRORS.SIMULATE_VALIDATION_FAILED);
}
exports.handleFailedOp = handleFailedOp;
function removeSpecialCharacters(input) {
    const match = input.match(/AA(\d+)\s(.+)/);
    if (match) {
        const errorCode = match[1]; // e.g., "25"
        const errorMessage = match[2]; // e.g., "invalid account nonce"
        const newMatch = `AA${errorCode} ${errorMessage}`.match(
        // eslint-disable-next-line no-control-regex
        /AA.*?(?=\\u|\u0000)/);
        if (newMatch) {
            const extractedString = newMatch[0];
            return extractedString;
        }
        return `AA${errorCode} ${errorMessage}`;
    }
    return input;
}
function getSimulationResult(errorResult, simulationType) {
    const entryPointErrorSchemaParsing = types_1.entryPointExecutionErrorSchema.safeParse(errorResult);
    if (!entryPointErrorSchemaParsing.success) {
        try {
            const err = (0, zod_validation_error_1.fromZodError)(entryPointErrorSchemaParsing.error);
            err.message = `User Operation simulation returned unexpected invalid response: ${err.message}`;
            throw err;
        }
        catch {
            if (errorResult instanceof viem_1.BaseError) {
                const revertError = errorResult.walk((err) => err instanceof viem_1.ContractFunctionExecutionError);
                throw new RpcError(
                // @ts-ignore
                `UserOperation reverted during simulation with reason: ${revertError?.cause?.reason}`, types_1.VALIDATION_ERRORS.SIMULATE_VALIDATION_FAILED);
            }
            throw new Error(`User Operation simulation returned unexpected invalid response: ${errorResult}`);
        }
    }
    const errorData = entryPointErrorSchemaParsing.data;
    if (errorData.errorName === "FailedOp") {
        const { reason } = errorData.args;
        throw new RpcError(`UserOperation reverted during simulation with reason: ${reason}`, types_1.VALIDATION_ERRORS.SIMULATE_VALIDATION_FAILED);
    }
    if (simulationType === "validation") {
        if (errorData.errorName !== "ValidationResult" &&
            errorData.errorName !== "ValidationResultWithAggregation") {
            throw new Error("Unexpected error - errorName is not ValidationResult or ValidationResultWithAggregation");
        }
    }
    else if (errorData.errorName !== "ExecutionResult") {
        throw new Error("Unexpected error - errorName is not ExecutionResult");
    }
    const simulationResult = errorData.args;
    return simulationResult;
}
exports.getSimulationResult = getSimulationResult;
function encode(typevalues, forSignature) {
    const types = (0, viem_1.parseAbiParameters)(typevalues
        .map((typevalue) => typevalue.type === "bytes" && forSignature ? "bytes32" : typevalue.type)
        .toString());
    const values = typevalues.map((typevalue) => typevalue.type === "bytes" && forSignature
        ? (0, viem_1.keccak256)(typevalue.val)
        : typevalue.val);
    return (0, viem_1.encodeAbiParameters)(types, values);
}
function packUserOp(userOp, forSignature = true) {
    const userOpType = {
        components: [
            {
                type: "address",
                name: "sender",
            },
            {
                type: "uint256",
                name: "nonce",
            },
            {
                type: "bytes",
                name: "initCode",
            },
            {
                type: "bytes",
                name: "callData",
            },
            {
                type: "uint256",
                name: "callGasLimit",
            },
            {
                type: "uint256",
                name: "verificationGasLimit",
            },
            {
                type: "uint256",
                name: "preVerificationGas",
            },
            {
                type: "uint256",
                name: "maxFeePerGas",
            },
            {
                type: "uint256",
                name: "maxPriorityFeePerGas",
            },
            {
                type: "bytes",
                name: "paymasterAndData",
            },
            {
                type: "bytes",
                name: "signature",
            },
        ],
        name: "userOp",
        type: "tuple",
    };
    if (forSignature) {
        // lighter signature scheme (must match UserOperation#pack):
        // do encode a zero-length signature, but strip afterwards the appended zero-length value
        let encoded = (0, viem_1.encodeAbiParameters)([userOpType], [
            {
                ...userOp,
                signature: "0x",
            },
        ]);
        encoded = `0x${encoded.slice(66, encoded.length - 64)}`;
        return encoded;
    }
    const typevalues = userOpType.components.map((c) => ({
        type: c.type,
        val: userOp[c.name],
    }));
    return encode(typevalues, forSignature);
}
exports.packUserOp = packUserOp;
