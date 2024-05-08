"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlockNumberTag = exports.VALIDATION_ERRORS = exports.entryPointExecutionErrorSchema = exports.vmExecutionError = exports.errorCauseSchema = exports.entryPointErrorsSchema = exports.validationResultWithAggregationErrorSchema = exports.validationResultWithAggregationSchema = exports.validationResultErrorSchema = exports.validationResultSchema = exports.executionResultErrorSchema = exports.failedOpErrorSchema = exports.failedOpSchema = exports.senderAddressResultErrorSchema = exports.senderAddressResultSchema = exports.signatureValidationFailedErrorSchema = exports.signatureValidationFailedSchema = exports.executionResultSchema = exports.hexDataSchema = exports.hexNumberSchema = void 0;
const viem_1 = require("viem");
const zod_1 = require("zod");
const abis_1 = require("../abis");
const hexDataPattern = /^0x[0-9A-Fa-f]*$/;
const hexPattern = /^0x[0-9a-f]*$/;
const addressPattern = /^0x[0-9,a-f,A-F]{40}$/;
const addressSchema = zod_1.z
    .string()
    .regex(addressPattern, { message: "not a valid hex address" })
    .transform((val) => (0, viem_1.getAddress)(val));
exports.hexNumberSchema = zod_1.z
    .string()
    .regex(hexDataPattern)
    .or(zod_1.z.number())
    .or(zod_1.z.bigint())
    .transform((val) => BigInt(val));
exports.hexDataSchema = zod_1.z
    .string()
    .regex(hexDataPattern, { message: "not valid hex data" })
    .transform((val) => val.toLowerCase());
exports.executionResultSchema = zod_1.z
    .tuple([
    zod_1.z.bigint(),
    zod_1.z.bigint(),
    zod_1.z.number(),
    zod_1.z.number(),
    zod_1.z.boolean(),
    zod_1.z.string().regex(hexPattern),
])
    .transform((val) => ({
    preOpGas: val[0],
    paid: val[1],
    validAfter: val[2],
    validUntil: val[3],
    targetSuccess: val[4],
    targetResult: val[5],
}));
exports.signatureValidationFailedSchema = zod_1.z
    .tuple([addressSchema])
    .transform((val) => ({ aggregator: val[0] }));
exports.signatureValidationFailedErrorSchema = zod_1.z.object({
    args: exports.signatureValidationFailedSchema,
    errorName: zod_1.z.literal("SignatureValidationFailed"),
});
exports.senderAddressResultSchema = zod_1.z
    .tuple([addressSchema])
    .transform((val) => ({
    sender: val[0],
}));
exports.senderAddressResultErrorSchema = zod_1.z.object({
    args: exports.senderAddressResultSchema,
    errorName: zod_1.z.literal("SenderAddressResult"),
});
exports.failedOpSchema = zod_1.z
    .tuple([zod_1.z.bigint(), zod_1.z.string()])
    .transform((val) => ({ opIndex: val[0], reason: val[1] }));
exports.failedOpErrorSchema = zod_1.z.object({
    args: exports.failedOpSchema,
    errorName: zod_1.z.literal("FailedOp"),
});
exports.executionResultErrorSchema = zod_1.z.object({
    args: exports.executionResultSchema,
    errorName: zod_1.z.literal("ExecutionResult"),
});
const stakeInfoSchema = zod_1.z.object({
    stake: zod_1.z.bigint(),
    unstakeDelaySec: zod_1.z.bigint(),
});
exports.validationResultSchema = zod_1.z
    .tuple([
    zod_1.z.object({
        preOpGas: zod_1.z.bigint(),
        prefund: zod_1.z.bigint(),
        sigFailed: zod_1.z.boolean(),
        validAfter: zod_1.z.number(),
        validUntil: zod_1.z.number(),
        paymasterContext: zod_1.z
            .string()
            .regex(hexPattern)
            .transform((val) => val),
    }),
    stakeInfoSchema,
    stakeInfoSchema,
    stakeInfoSchema,
])
    .transform((val) => ({
    returnInfo: val[0],
    senderInfo: val[1],
    factoryInfo: val[2],
    paymasterInfo: val[3],
}));
exports.validationResultErrorSchema = zod_1.z.object({
    args: exports.validationResultSchema,
    errorName: zod_1.z.literal("ValidationResult"),
});
exports.validationResultWithAggregationSchema = zod_1.z
    .tuple([
    zod_1.z.object({
        preOpGas: zod_1.z.bigint(),
        prefund: zod_1.z.bigint(),
        sigFailed: zod_1.z.boolean(),
        validAfter: zod_1.z.number(),
        validUntil: zod_1.z.number(),
        paymasterContext: zod_1.z
            .string()
            .regex(hexPattern)
            .transform((val) => val),
    }),
    stakeInfoSchema,
    stakeInfoSchema,
    stakeInfoSchema,
    zod_1.z.object({
        aggregator: addressSchema,
        stakeInfo: stakeInfoSchema,
    }),
])
    .transform((val) => ({
    returnInfo: val[0],
    senderInfo: val[1],
    factoryInfo: val[2],
    paymasterInfo: val[3],
    aggregatorInfo: val[4],
}));
exports.validationResultWithAggregationErrorSchema = zod_1.z.object({
    args: exports.validationResultWithAggregationSchema,
    errorName: zod_1.z.literal("ValidationResultWithAggregation"),
});
exports.entryPointErrorsSchema = zod_1.z.discriminatedUnion("errorName", [
    exports.validationResultErrorSchema,
    exports.executionResultErrorSchema,
    exports.failedOpErrorSchema,
    exports.senderAddressResultErrorSchema,
    exports.signatureValidationFailedErrorSchema,
    exports.validationResultWithAggregationErrorSchema,
]);
exports.errorCauseSchema = zod_1.z.object({
    name: zod_1.z.literal("ContractFunctionRevertedError"),
    data: exports.entryPointErrorsSchema,
});
exports.vmExecutionError = zod_1.z.object({
    name: zod_1.z.literal("CallExecutionError"),
    cause: zod_1.z.object({
        name: zod_1.z.literal("RpcRequestError"),
        cause: zod_1.z.object({
            data: zod_1.z.string().transform((val) => {
                const errorHexData = val.split("Reverted ")[1];
                if (errorHexData === "0x") {
                    throw new Error(`User operation reverted on-chain with unknown error (some chains don't return revert reason) ${val}`);
                }
                const errorResult = (0, viem_1.decodeErrorResult)({
                    abi: abis_1.ENTRY_POINT_ABI,
                    data: errorHexData,
                });
                return exports.entryPointErrorsSchema.parse(errorResult);
            }),
        }),
    }),
});
exports.entryPointExecutionErrorSchema = zod_1.z
    .object({
    name: zod_1.z.literal("ContractFunctionExecutionError"),
    cause: zod_1.z.discriminatedUnion("name", [exports.errorCauseSchema, exports.vmExecutionError]),
})
    .transform((val) => {
    if (val.cause.name === "CallExecutionError") {
        return val.cause.cause.cause.data;
    }
    return val.cause.data;
});
exports.VALIDATION_ERRORS = {
    INVALID_USER_OP_FIELDS: -32602,
    SIMULATE_VALIDATION_FAILED: -32500,
    SIMULATE_PAYMASTER_VALIDATION_FAILED: -32501,
    OP_CODE_VALIDATION_FAILED: -32502,
    USER_OP_EXPIRES_SHORTLY: -32503,
    ENTITY_IS_THROTTLED: -32504,
    ENTITY_INSUFFICIENT_STAKE: -32505,
    UNSUPPORTED_AGGREGATOR: -32506,
    INVALID_WALLET_SIGNATURE: -32507,
    WALLET_TRANSACTION_REVERTED: -32000,
    UNAUTHORIZED_REQUEST: -32001,
    INTERNAL_SERVER_ERROR: -32002,
    BAD_REQUEST: -32003,
    USER_OP_HASH_NOT_FOUND: -32004,
    UNABLE_TO_PROCESS_USER_OP: -32005,
    METHOD_NOT_FOUND: -32601,
};
var BlockNumberTag;
(function (BlockNumberTag) {
    BlockNumberTag["LATEST"] = "latest";
    BlockNumberTag["EARLIEST"] = "earliest";
    BlockNumberTag["PENDING"] = "pending";
})(BlockNumberTag || (exports.BlockNumberTag = BlockNumberTag = {}));
