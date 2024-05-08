import { Hex } from "viem";
import { z } from "zod";
import { IRPCClient } from "../interface";
declare const addressSchema: z.ZodEffects<z.ZodString, `0x${string}`, string>;
export declare const hexNumberSchema: z.ZodEffects<z.ZodUnion<[z.ZodUnion<[z.ZodString, z.ZodNumber]>, z.ZodBigInt]>, bigint, string | number | bigint>;
export declare const hexDataSchema: z.ZodEffects<z.ZodString, `0x${string}`, string>;
export declare const executionResultSchema: z.ZodEffects<z.ZodTuple<[z.ZodBigInt, z.ZodBigInt, z.ZodNumber, z.ZodNumber, z.ZodBoolean, z.ZodString], null>, {
    preOpGas: bigint;
    paid: bigint;
    validAfter: number;
    validUntil: number;
    targetSuccess: boolean;
    targetResult: `0x${string}`;
}, [bigint, bigint, number, number, boolean, string]>;
export declare const signatureValidationFailedSchema: z.ZodEffects<z.ZodTuple<[z.ZodEffects<z.ZodString, `0x${string}`, string>], null>, {
    aggregator: `0x${string}`;
}, [string]>;
export declare const signatureValidationFailedErrorSchema: z.ZodObject<{
    args: z.ZodEffects<z.ZodTuple<[z.ZodEffects<z.ZodString, `0x${string}`, string>], null>, {
        aggregator: `0x${string}`;
    }, [string]>;
    errorName: z.ZodLiteral<"SignatureValidationFailed">;
}, "strip", z.ZodTypeAny, {
    args: {
        aggregator: `0x${string}`;
    };
    errorName: "SignatureValidationFailed";
}, {
    args: [string];
    errorName: "SignatureValidationFailed";
}>;
export declare const senderAddressResultSchema: z.ZodEffects<z.ZodTuple<[z.ZodEffects<z.ZodString, `0x${string}`, string>], null>, {
    sender: `0x${string}`;
}, [string]>;
export declare const senderAddressResultErrorSchema: z.ZodObject<{
    args: z.ZodEffects<z.ZodTuple<[z.ZodEffects<z.ZodString, `0x${string}`, string>], null>, {
        sender: `0x${string}`;
    }, [string]>;
    errorName: z.ZodLiteral<"SenderAddressResult">;
}, "strip", z.ZodTypeAny, {
    args: {
        sender: `0x${string}`;
    };
    errorName: "SenderAddressResult";
}, {
    args: [string];
    errorName: "SenderAddressResult";
}>;
export declare const failedOpSchema: z.ZodEffects<z.ZodTuple<[z.ZodBigInt, z.ZodString], null>, {
    opIndex: bigint;
    reason: string;
}, [bigint, string]>;
export declare const failedOpErrorSchema: z.ZodObject<{
    args: z.ZodEffects<z.ZodTuple<[z.ZodBigInt, z.ZodString], null>, {
        opIndex: bigint;
        reason: string;
    }, [bigint, string]>;
    errorName: z.ZodLiteral<"FailedOp">;
}, "strip", z.ZodTypeAny, {
    args: {
        opIndex: bigint;
        reason: string;
    };
    errorName: "FailedOp";
}, {
    args: [bigint, string];
    errorName: "FailedOp";
}>;
export declare const executionResultErrorSchema: z.ZodObject<{
    args: z.ZodEffects<z.ZodTuple<[z.ZodBigInt, z.ZodBigInt, z.ZodNumber, z.ZodNumber, z.ZodBoolean, z.ZodString], null>, {
        preOpGas: bigint;
        paid: bigint;
        validAfter: number;
        validUntil: number;
        targetSuccess: boolean;
        targetResult: `0x${string}`;
    }, [bigint, bigint, number, number, boolean, string]>;
    errorName: z.ZodLiteral<"ExecutionResult">;
}, "strip", z.ZodTypeAny, {
    args: {
        preOpGas: bigint;
        paid: bigint;
        validAfter: number;
        validUntil: number;
        targetSuccess: boolean;
        targetResult: `0x${string}`;
    };
    errorName: "ExecutionResult";
}, {
    args: [bigint, bigint, number, number, boolean, string];
    errorName: "ExecutionResult";
}>;
export declare const validationResultSchema: z.ZodEffects<z.ZodTuple<[z.ZodObject<{
    preOpGas: z.ZodBigInt;
    prefund: z.ZodBigInt;
    sigFailed: z.ZodBoolean;
    validAfter: z.ZodNumber;
    validUntil: z.ZodNumber;
    paymasterContext: z.ZodEffects<z.ZodString, `0x${string}`, string>;
}, "strip", z.ZodTypeAny, {
    preOpGas: bigint;
    validAfter: number;
    validUntil: number;
    prefund: bigint;
    sigFailed: boolean;
    paymasterContext: `0x${string}`;
}, {
    preOpGas: bigint;
    validAfter: number;
    validUntil: number;
    prefund: bigint;
    sigFailed: boolean;
    paymasterContext: string;
}>, z.ZodObject<{
    stake: z.ZodBigInt;
    unstakeDelaySec: z.ZodBigInt;
}, "strip", z.ZodTypeAny, {
    stake: bigint;
    unstakeDelaySec: bigint;
}, {
    stake: bigint;
    unstakeDelaySec: bigint;
}>, z.ZodObject<{
    stake: z.ZodBigInt;
    unstakeDelaySec: z.ZodBigInt;
}, "strip", z.ZodTypeAny, {
    stake: bigint;
    unstakeDelaySec: bigint;
}, {
    stake: bigint;
    unstakeDelaySec: bigint;
}>, z.ZodObject<{
    stake: z.ZodBigInt;
    unstakeDelaySec: z.ZodBigInt;
}, "strip", z.ZodTypeAny, {
    stake: bigint;
    unstakeDelaySec: bigint;
}, {
    stake: bigint;
    unstakeDelaySec: bigint;
}>], null>, {
    returnInfo: {
        preOpGas: bigint;
        validAfter: number;
        validUntil: number;
        prefund: bigint;
        sigFailed: boolean;
        paymasterContext: `0x${string}`;
    };
    senderInfo: {
        stake: bigint;
        unstakeDelaySec: bigint;
    };
    factoryInfo: {
        stake: bigint;
        unstakeDelaySec: bigint;
    };
    paymasterInfo: {
        stake: bigint;
        unstakeDelaySec: bigint;
    };
}, [{
    preOpGas: bigint;
    validAfter: number;
    validUntil: number;
    prefund: bigint;
    sigFailed: boolean;
    paymasterContext: string;
}, {
    stake: bigint;
    unstakeDelaySec: bigint;
}, {
    stake: bigint;
    unstakeDelaySec: bigint;
}, {
    stake: bigint;
    unstakeDelaySec: bigint;
}]>;
export declare const validationResultErrorSchema: z.ZodObject<{
    args: z.ZodEffects<z.ZodTuple<[z.ZodObject<{
        preOpGas: z.ZodBigInt;
        prefund: z.ZodBigInt;
        sigFailed: z.ZodBoolean;
        validAfter: z.ZodNumber;
        validUntil: z.ZodNumber;
        paymasterContext: z.ZodEffects<z.ZodString, `0x${string}`, string>;
    }, "strip", z.ZodTypeAny, {
        preOpGas: bigint;
        validAfter: number;
        validUntil: number;
        prefund: bigint;
        sigFailed: boolean;
        paymasterContext: `0x${string}`;
    }, {
        preOpGas: bigint;
        validAfter: number;
        validUntil: number;
        prefund: bigint;
        sigFailed: boolean;
        paymasterContext: string;
    }>, z.ZodObject<{
        stake: z.ZodBigInt;
        unstakeDelaySec: z.ZodBigInt;
    }, "strip", z.ZodTypeAny, {
        stake: bigint;
        unstakeDelaySec: bigint;
    }, {
        stake: bigint;
        unstakeDelaySec: bigint;
    }>, z.ZodObject<{
        stake: z.ZodBigInt;
        unstakeDelaySec: z.ZodBigInt;
    }, "strip", z.ZodTypeAny, {
        stake: bigint;
        unstakeDelaySec: bigint;
    }, {
        stake: bigint;
        unstakeDelaySec: bigint;
    }>, z.ZodObject<{
        stake: z.ZodBigInt;
        unstakeDelaySec: z.ZodBigInt;
    }, "strip", z.ZodTypeAny, {
        stake: bigint;
        unstakeDelaySec: bigint;
    }, {
        stake: bigint;
        unstakeDelaySec: bigint;
    }>], null>, {
        returnInfo: {
            preOpGas: bigint;
            validAfter: number;
            validUntil: number;
            prefund: bigint;
            sigFailed: boolean;
            paymasterContext: `0x${string}`;
        };
        senderInfo: {
            stake: bigint;
            unstakeDelaySec: bigint;
        };
        factoryInfo: {
            stake: bigint;
            unstakeDelaySec: bigint;
        };
        paymasterInfo: {
            stake: bigint;
            unstakeDelaySec: bigint;
        };
    }, [{
        preOpGas: bigint;
        validAfter: number;
        validUntil: number;
        prefund: bigint;
        sigFailed: boolean;
        paymasterContext: string;
    }, {
        stake: bigint;
        unstakeDelaySec: bigint;
    }, {
        stake: bigint;
        unstakeDelaySec: bigint;
    }, {
        stake: bigint;
        unstakeDelaySec: bigint;
    }]>;
    errorName: z.ZodLiteral<"ValidationResult">;
}, "strip", z.ZodTypeAny, {
    args: {
        returnInfo: {
            preOpGas: bigint;
            validAfter: number;
            validUntil: number;
            prefund: bigint;
            sigFailed: boolean;
            paymasterContext: `0x${string}`;
        };
        senderInfo: {
            stake: bigint;
            unstakeDelaySec: bigint;
        };
        factoryInfo: {
            stake: bigint;
            unstakeDelaySec: bigint;
        };
        paymasterInfo: {
            stake: bigint;
            unstakeDelaySec: bigint;
        };
    };
    errorName: "ValidationResult";
}, {
    args: [{
        preOpGas: bigint;
        validAfter: number;
        validUntil: number;
        prefund: bigint;
        sigFailed: boolean;
        paymasterContext: string;
    }, {
        stake: bigint;
        unstakeDelaySec: bigint;
    }, {
        stake: bigint;
        unstakeDelaySec: bigint;
    }, {
        stake: bigint;
        unstakeDelaySec: bigint;
    }];
    errorName: "ValidationResult";
}>;
export declare const validationResultWithAggregationSchema: z.ZodEffects<z.ZodTuple<[z.ZodObject<{
    preOpGas: z.ZodBigInt;
    prefund: z.ZodBigInt;
    sigFailed: z.ZodBoolean;
    validAfter: z.ZodNumber;
    validUntil: z.ZodNumber;
    paymasterContext: z.ZodEffects<z.ZodString, `0x${string}`, string>;
}, "strip", z.ZodTypeAny, {
    preOpGas: bigint;
    validAfter: number;
    validUntil: number;
    prefund: bigint;
    sigFailed: boolean;
    paymasterContext: `0x${string}`;
}, {
    preOpGas: bigint;
    validAfter: number;
    validUntil: number;
    prefund: bigint;
    sigFailed: boolean;
    paymasterContext: string;
}>, z.ZodObject<{
    stake: z.ZodBigInt;
    unstakeDelaySec: z.ZodBigInt;
}, "strip", z.ZodTypeAny, {
    stake: bigint;
    unstakeDelaySec: bigint;
}, {
    stake: bigint;
    unstakeDelaySec: bigint;
}>, z.ZodObject<{
    stake: z.ZodBigInt;
    unstakeDelaySec: z.ZodBigInt;
}, "strip", z.ZodTypeAny, {
    stake: bigint;
    unstakeDelaySec: bigint;
}, {
    stake: bigint;
    unstakeDelaySec: bigint;
}>, z.ZodObject<{
    stake: z.ZodBigInt;
    unstakeDelaySec: z.ZodBigInt;
}, "strip", z.ZodTypeAny, {
    stake: bigint;
    unstakeDelaySec: bigint;
}, {
    stake: bigint;
    unstakeDelaySec: bigint;
}>, z.ZodObject<{
    aggregator: z.ZodEffects<z.ZodString, `0x${string}`, string>;
    stakeInfo: z.ZodObject<{
        stake: z.ZodBigInt;
        unstakeDelaySec: z.ZodBigInt;
    }, "strip", z.ZodTypeAny, {
        stake: bigint;
        unstakeDelaySec: bigint;
    }, {
        stake: bigint;
        unstakeDelaySec: bigint;
    }>;
}, "strip", z.ZodTypeAny, {
    aggregator: `0x${string}`;
    stakeInfo: {
        stake: bigint;
        unstakeDelaySec: bigint;
    };
}, {
    aggregator: string;
    stakeInfo: {
        stake: bigint;
        unstakeDelaySec: bigint;
    };
}>], null>, {
    returnInfo: {
        preOpGas: bigint;
        validAfter: number;
        validUntil: number;
        prefund: bigint;
        sigFailed: boolean;
        paymasterContext: `0x${string}`;
    };
    senderInfo: {
        stake: bigint;
        unstakeDelaySec: bigint;
    };
    factoryInfo: {
        stake: bigint;
        unstakeDelaySec: bigint;
    };
    paymasterInfo: {
        stake: bigint;
        unstakeDelaySec: bigint;
    };
    aggregatorInfo: {
        aggregator: `0x${string}`;
        stakeInfo: {
            stake: bigint;
            unstakeDelaySec: bigint;
        };
    };
}, [{
    preOpGas: bigint;
    validAfter: number;
    validUntil: number;
    prefund: bigint;
    sigFailed: boolean;
    paymasterContext: string;
}, {
    stake: bigint;
    unstakeDelaySec: bigint;
}, {
    stake: bigint;
    unstakeDelaySec: bigint;
}, {
    stake: bigint;
    unstakeDelaySec: bigint;
}, {
    aggregator: string;
    stakeInfo: {
        stake: bigint;
        unstakeDelaySec: bigint;
    };
}]>;
export declare const validationResultWithAggregationErrorSchema: z.ZodObject<{
    args: z.ZodEffects<z.ZodTuple<[z.ZodObject<{
        preOpGas: z.ZodBigInt;
        prefund: z.ZodBigInt;
        sigFailed: z.ZodBoolean;
        validAfter: z.ZodNumber;
        validUntil: z.ZodNumber;
        paymasterContext: z.ZodEffects<z.ZodString, `0x${string}`, string>;
    }, "strip", z.ZodTypeAny, {
        preOpGas: bigint;
        validAfter: number;
        validUntil: number;
        prefund: bigint;
        sigFailed: boolean;
        paymasterContext: `0x${string}`;
    }, {
        preOpGas: bigint;
        validAfter: number;
        validUntil: number;
        prefund: bigint;
        sigFailed: boolean;
        paymasterContext: string;
    }>, z.ZodObject<{
        stake: z.ZodBigInt;
        unstakeDelaySec: z.ZodBigInt;
    }, "strip", z.ZodTypeAny, {
        stake: bigint;
        unstakeDelaySec: bigint;
    }, {
        stake: bigint;
        unstakeDelaySec: bigint;
    }>, z.ZodObject<{
        stake: z.ZodBigInt;
        unstakeDelaySec: z.ZodBigInt;
    }, "strip", z.ZodTypeAny, {
        stake: bigint;
        unstakeDelaySec: bigint;
    }, {
        stake: bigint;
        unstakeDelaySec: bigint;
    }>, z.ZodObject<{
        stake: z.ZodBigInt;
        unstakeDelaySec: z.ZodBigInt;
    }, "strip", z.ZodTypeAny, {
        stake: bigint;
        unstakeDelaySec: bigint;
    }, {
        stake: bigint;
        unstakeDelaySec: bigint;
    }>, z.ZodObject<{
        aggregator: z.ZodEffects<z.ZodString, `0x${string}`, string>;
        stakeInfo: z.ZodObject<{
            stake: z.ZodBigInt;
            unstakeDelaySec: z.ZodBigInt;
        }, "strip", z.ZodTypeAny, {
            stake: bigint;
            unstakeDelaySec: bigint;
        }, {
            stake: bigint;
            unstakeDelaySec: bigint;
        }>;
    }, "strip", z.ZodTypeAny, {
        aggregator: `0x${string}`;
        stakeInfo: {
            stake: bigint;
            unstakeDelaySec: bigint;
        };
    }, {
        aggregator: string;
        stakeInfo: {
            stake: bigint;
            unstakeDelaySec: bigint;
        };
    }>], null>, {
        returnInfo: {
            preOpGas: bigint;
            validAfter: number;
            validUntil: number;
            prefund: bigint;
            sigFailed: boolean;
            paymasterContext: `0x${string}`;
        };
        senderInfo: {
            stake: bigint;
            unstakeDelaySec: bigint;
        };
        factoryInfo: {
            stake: bigint;
            unstakeDelaySec: bigint;
        };
        paymasterInfo: {
            stake: bigint;
            unstakeDelaySec: bigint;
        };
        aggregatorInfo: {
            aggregator: `0x${string}`;
            stakeInfo: {
                stake: bigint;
                unstakeDelaySec: bigint;
            };
        };
    }, [{
        preOpGas: bigint;
        validAfter: number;
        validUntil: number;
        prefund: bigint;
        sigFailed: boolean;
        paymasterContext: string;
    }, {
        stake: bigint;
        unstakeDelaySec: bigint;
    }, {
        stake: bigint;
        unstakeDelaySec: bigint;
    }, {
        stake: bigint;
        unstakeDelaySec: bigint;
    }, {
        aggregator: string;
        stakeInfo: {
            stake: bigint;
            unstakeDelaySec: bigint;
        };
    }]>;
    errorName: z.ZodLiteral<"ValidationResultWithAggregation">;
}, "strip", z.ZodTypeAny, {
    args: {
        returnInfo: {
            preOpGas: bigint;
            validAfter: number;
            validUntil: number;
            prefund: bigint;
            sigFailed: boolean;
            paymasterContext: `0x${string}`;
        };
        senderInfo: {
            stake: bigint;
            unstakeDelaySec: bigint;
        };
        factoryInfo: {
            stake: bigint;
            unstakeDelaySec: bigint;
        };
        paymasterInfo: {
            stake: bigint;
            unstakeDelaySec: bigint;
        };
        aggregatorInfo: {
            aggregator: `0x${string}`;
            stakeInfo: {
                stake: bigint;
                unstakeDelaySec: bigint;
            };
        };
    };
    errorName: "ValidationResultWithAggregation";
}, {
    args: [{
        preOpGas: bigint;
        validAfter: number;
        validUntil: number;
        prefund: bigint;
        sigFailed: boolean;
        paymasterContext: string;
    }, {
        stake: bigint;
        unstakeDelaySec: bigint;
    }, {
        stake: bigint;
        unstakeDelaySec: bigint;
    }, {
        stake: bigint;
        unstakeDelaySec: bigint;
    }, {
        aggregator: string;
        stakeInfo: {
            stake: bigint;
            unstakeDelaySec: bigint;
        };
    }];
    errorName: "ValidationResultWithAggregation";
}>;
export declare const entryPointErrorsSchema: z.ZodDiscriminatedUnion<"errorName", [z.ZodObject<{
    args: z.ZodEffects<z.ZodTuple<[z.ZodObject<{
        preOpGas: z.ZodBigInt;
        prefund: z.ZodBigInt;
        sigFailed: z.ZodBoolean;
        validAfter: z.ZodNumber;
        validUntil: z.ZodNumber;
        paymasterContext: z.ZodEffects<z.ZodString, `0x${string}`, string>;
    }, "strip", z.ZodTypeAny, {
        preOpGas: bigint;
        validAfter: number;
        validUntil: number;
        prefund: bigint;
        sigFailed: boolean;
        paymasterContext: `0x${string}`;
    }, {
        preOpGas: bigint;
        validAfter: number;
        validUntil: number;
        prefund: bigint;
        sigFailed: boolean;
        paymasterContext: string;
    }>, z.ZodObject<{
        stake: z.ZodBigInt;
        unstakeDelaySec: z.ZodBigInt;
    }, "strip", z.ZodTypeAny, {
        stake: bigint;
        unstakeDelaySec: bigint;
    }, {
        stake: bigint;
        unstakeDelaySec: bigint;
    }>, z.ZodObject<{
        stake: z.ZodBigInt;
        unstakeDelaySec: z.ZodBigInt;
    }, "strip", z.ZodTypeAny, {
        stake: bigint;
        unstakeDelaySec: bigint;
    }, {
        stake: bigint;
        unstakeDelaySec: bigint;
    }>, z.ZodObject<{
        stake: z.ZodBigInt;
        unstakeDelaySec: z.ZodBigInt;
    }, "strip", z.ZodTypeAny, {
        stake: bigint;
        unstakeDelaySec: bigint;
    }, {
        stake: bigint;
        unstakeDelaySec: bigint;
    }>], null>, {
        returnInfo: {
            preOpGas: bigint;
            validAfter: number;
            validUntil: number;
            prefund: bigint;
            sigFailed: boolean;
            paymasterContext: `0x${string}`;
        };
        senderInfo: {
            stake: bigint;
            unstakeDelaySec: bigint;
        };
        factoryInfo: {
            stake: bigint;
            unstakeDelaySec: bigint;
        };
        paymasterInfo: {
            stake: bigint;
            unstakeDelaySec: bigint;
        };
    }, [{
        preOpGas: bigint;
        validAfter: number;
        validUntil: number;
        prefund: bigint;
        sigFailed: boolean;
        paymasterContext: string;
    }, {
        stake: bigint;
        unstakeDelaySec: bigint;
    }, {
        stake: bigint;
        unstakeDelaySec: bigint;
    }, {
        stake: bigint;
        unstakeDelaySec: bigint;
    }]>;
    errorName: z.ZodLiteral<"ValidationResult">;
}, "strip", z.ZodTypeAny, {
    args: {
        returnInfo: {
            preOpGas: bigint;
            validAfter: number;
            validUntil: number;
            prefund: bigint;
            sigFailed: boolean;
            paymasterContext: `0x${string}`;
        };
        senderInfo: {
            stake: bigint;
            unstakeDelaySec: bigint;
        };
        factoryInfo: {
            stake: bigint;
            unstakeDelaySec: bigint;
        };
        paymasterInfo: {
            stake: bigint;
            unstakeDelaySec: bigint;
        };
    };
    errorName: "ValidationResult";
}, {
    args: [{
        preOpGas: bigint;
        validAfter: number;
        validUntil: number;
        prefund: bigint;
        sigFailed: boolean;
        paymasterContext: string;
    }, {
        stake: bigint;
        unstakeDelaySec: bigint;
    }, {
        stake: bigint;
        unstakeDelaySec: bigint;
    }, {
        stake: bigint;
        unstakeDelaySec: bigint;
    }];
    errorName: "ValidationResult";
}>, z.ZodObject<{
    args: z.ZodEffects<z.ZodTuple<[z.ZodBigInt, z.ZodBigInt, z.ZodNumber, z.ZodNumber, z.ZodBoolean, z.ZodString], null>, {
        preOpGas: bigint;
        paid: bigint;
        validAfter: number;
        validUntil: number;
        targetSuccess: boolean;
        targetResult: `0x${string}`;
    }, [bigint, bigint, number, number, boolean, string]>;
    errorName: z.ZodLiteral<"ExecutionResult">;
}, "strip", z.ZodTypeAny, {
    args: {
        preOpGas: bigint;
        paid: bigint;
        validAfter: number;
        validUntil: number;
        targetSuccess: boolean;
        targetResult: `0x${string}`;
    };
    errorName: "ExecutionResult";
}, {
    args: [bigint, bigint, number, number, boolean, string];
    errorName: "ExecutionResult";
}>, z.ZodObject<{
    args: z.ZodEffects<z.ZodTuple<[z.ZodBigInt, z.ZodString], null>, {
        opIndex: bigint;
        reason: string;
    }, [bigint, string]>;
    errorName: z.ZodLiteral<"FailedOp">;
}, "strip", z.ZodTypeAny, {
    args: {
        opIndex: bigint;
        reason: string;
    };
    errorName: "FailedOp";
}, {
    args: [bigint, string];
    errorName: "FailedOp";
}>, z.ZodObject<{
    args: z.ZodEffects<z.ZodTuple<[z.ZodEffects<z.ZodString, `0x${string}`, string>], null>, {
        sender: `0x${string}`;
    }, [string]>;
    errorName: z.ZodLiteral<"SenderAddressResult">;
}, "strip", z.ZodTypeAny, {
    args: {
        sender: `0x${string}`;
    };
    errorName: "SenderAddressResult";
}, {
    args: [string];
    errorName: "SenderAddressResult";
}>, z.ZodObject<{
    args: z.ZodEffects<z.ZodTuple<[z.ZodEffects<z.ZodString, `0x${string}`, string>], null>, {
        aggregator: `0x${string}`;
    }, [string]>;
    errorName: z.ZodLiteral<"SignatureValidationFailed">;
}, "strip", z.ZodTypeAny, {
    args: {
        aggregator: `0x${string}`;
    };
    errorName: "SignatureValidationFailed";
}, {
    args: [string];
    errorName: "SignatureValidationFailed";
}>, z.ZodObject<{
    args: z.ZodEffects<z.ZodTuple<[z.ZodObject<{
        preOpGas: z.ZodBigInt;
        prefund: z.ZodBigInt;
        sigFailed: z.ZodBoolean;
        validAfter: z.ZodNumber;
        validUntil: z.ZodNumber;
        paymasterContext: z.ZodEffects<z.ZodString, `0x${string}`, string>;
    }, "strip", z.ZodTypeAny, {
        preOpGas: bigint;
        validAfter: number;
        validUntil: number;
        prefund: bigint;
        sigFailed: boolean;
        paymasterContext: `0x${string}`;
    }, {
        preOpGas: bigint;
        validAfter: number;
        validUntil: number;
        prefund: bigint;
        sigFailed: boolean;
        paymasterContext: string;
    }>, z.ZodObject<{
        stake: z.ZodBigInt;
        unstakeDelaySec: z.ZodBigInt;
    }, "strip", z.ZodTypeAny, {
        stake: bigint;
        unstakeDelaySec: bigint;
    }, {
        stake: bigint;
        unstakeDelaySec: bigint;
    }>, z.ZodObject<{
        stake: z.ZodBigInt;
        unstakeDelaySec: z.ZodBigInt;
    }, "strip", z.ZodTypeAny, {
        stake: bigint;
        unstakeDelaySec: bigint;
    }, {
        stake: bigint;
        unstakeDelaySec: bigint;
    }>, z.ZodObject<{
        stake: z.ZodBigInt;
        unstakeDelaySec: z.ZodBigInt;
    }, "strip", z.ZodTypeAny, {
        stake: bigint;
        unstakeDelaySec: bigint;
    }, {
        stake: bigint;
        unstakeDelaySec: bigint;
    }>, z.ZodObject<{
        aggregator: z.ZodEffects<z.ZodString, `0x${string}`, string>;
        stakeInfo: z.ZodObject<{
            stake: z.ZodBigInt;
            unstakeDelaySec: z.ZodBigInt;
        }, "strip", z.ZodTypeAny, {
            stake: bigint;
            unstakeDelaySec: bigint;
        }, {
            stake: bigint;
            unstakeDelaySec: bigint;
        }>;
    }, "strip", z.ZodTypeAny, {
        aggregator: `0x${string}`;
        stakeInfo: {
            stake: bigint;
            unstakeDelaySec: bigint;
        };
    }, {
        aggregator: string;
        stakeInfo: {
            stake: bigint;
            unstakeDelaySec: bigint;
        };
    }>], null>, {
        returnInfo: {
            preOpGas: bigint;
            validAfter: number;
            validUntil: number;
            prefund: bigint;
            sigFailed: boolean;
            paymasterContext: `0x${string}`;
        };
        senderInfo: {
            stake: bigint;
            unstakeDelaySec: bigint;
        };
        factoryInfo: {
            stake: bigint;
            unstakeDelaySec: bigint;
        };
        paymasterInfo: {
            stake: bigint;
            unstakeDelaySec: bigint;
        };
        aggregatorInfo: {
            aggregator: `0x${string}`;
            stakeInfo: {
                stake: bigint;
                unstakeDelaySec: bigint;
            };
        };
    }, [{
        preOpGas: bigint;
        validAfter: number;
        validUntil: number;
        prefund: bigint;
        sigFailed: boolean;
        paymasterContext: string;
    }, {
        stake: bigint;
        unstakeDelaySec: bigint;
    }, {
        stake: bigint;
        unstakeDelaySec: bigint;
    }, {
        stake: bigint;
        unstakeDelaySec: bigint;
    }, {
        aggregator: string;
        stakeInfo: {
            stake: bigint;
            unstakeDelaySec: bigint;
        };
    }]>;
    errorName: z.ZodLiteral<"ValidationResultWithAggregation">;
}, "strip", z.ZodTypeAny, {
    args: {
        returnInfo: {
            preOpGas: bigint;
            validAfter: number;
            validUntil: number;
            prefund: bigint;
            sigFailed: boolean;
            paymasterContext: `0x${string}`;
        };
        senderInfo: {
            stake: bigint;
            unstakeDelaySec: bigint;
        };
        factoryInfo: {
            stake: bigint;
            unstakeDelaySec: bigint;
        };
        paymasterInfo: {
            stake: bigint;
            unstakeDelaySec: bigint;
        };
        aggregatorInfo: {
            aggregator: `0x${string}`;
            stakeInfo: {
                stake: bigint;
                unstakeDelaySec: bigint;
            };
        };
    };
    errorName: "ValidationResultWithAggregation";
}, {
    args: [{
        preOpGas: bigint;
        validAfter: number;
        validUntil: number;
        prefund: bigint;
        sigFailed: boolean;
        paymasterContext: string;
    }, {
        stake: bigint;
        unstakeDelaySec: bigint;
    }, {
        stake: bigint;
        unstakeDelaySec: bigint;
    }, {
        stake: bigint;
        unstakeDelaySec: bigint;
    }, {
        aggregator: string;
        stakeInfo: {
            stake: bigint;
            unstakeDelaySec: bigint;
        };
    }];
    errorName: "ValidationResultWithAggregation";
}>]>;
export declare const errorCauseSchema: z.ZodObject<{
    name: z.ZodLiteral<"ContractFunctionRevertedError">;
    data: z.ZodDiscriminatedUnion<"errorName", [z.ZodObject<{
        args: z.ZodEffects<z.ZodTuple<[z.ZodObject<{
            preOpGas: z.ZodBigInt;
            prefund: z.ZodBigInt;
            sigFailed: z.ZodBoolean;
            validAfter: z.ZodNumber;
            validUntil: z.ZodNumber;
            paymasterContext: z.ZodEffects<z.ZodString, `0x${string}`, string>;
        }, "strip", z.ZodTypeAny, {
            preOpGas: bigint;
            validAfter: number;
            validUntil: number;
            prefund: bigint;
            sigFailed: boolean;
            paymasterContext: `0x${string}`;
        }, {
            preOpGas: bigint;
            validAfter: number;
            validUntil: number;
            prefund: bigint;
            sigFailed: boolean;
            paymasterContext: string;
        }>, z.ZodObject<{
            stake: z.ZodBigInt;
            unstakeDelaySec: z.ZodBigInt;
        }, "strip", z.ZodTypeAny, {
            stake: bigint;
            unstakeDelaySec: bigint;
        }, {
            stake: bigint;
            unstakeDelaySec: bigint;
        }>, z.ZodObject<{
            stake: z.ZodBigInt;
            unstakeDelaySec: z.ZodBigInt;
        }, "strip", z.ZodTypeAny, {
            stake: bigint;
            unstakeDelaySec: bigint;
        }, {
            stake: bigint;
            unstakeDelaySec: bigint;
        }>, z.ZodObject<{
            stake: z.ZodBigInt;
            unstakeDelaySec: z.ZodBigInt;
        }, "strip", z.ZodTypeAny, {
            stake: bigint;
            unstakeDelaySec: bigint;
        }, {
            stake: bigint;
            unstakeDelaySec: bigint;
        }>], null>, {
            returnInfo: {
                preOpGas: bigint;
                validAfter: number;
                validUntil: number;
                prefund: bigint;
                sigFailed: boolean;
                paymasterContext: `0x${string}`;
            };
            senderInfo: {
                stake: bigint;
                unstakeDelaySec: bigint;
            };
            factoryInfo: {
                stake: bigint;
                unstakeDelaySec: bigint;
            };
            paymasterInfo: {
                stake: bigint;
                unstakeDelaySec: bigint;
            };
        }, [{
            preOpGas: bigint;
            validAfter: number;
            validUntil: number;
            prefund: bigint;
            sigFailed: boolean;
            paymasterContext: string;
        }, {
            stake: bigint;
            unstakeDelaySec: bigint;
        }, {
            stake: bigint;
            unstakeDelaySec: bigint;
        }, {
            stake: bigint;
            unstakeDelaySec: bigint;
        }]>;
        errorName: z.ZodLiteral<"ValidationResult">;
    }, "strip", z.ZodTypeAny, {
        args: {
            returnInfo: {
                preOpGas: bigint;
                validAfter: number;
                validUntil: number;
                prefund: bigint;
                sigFailed: boolean;
                paymasterContext: `0x${string}`;
            };
            senderInfo: {
                stake: bigint;
                unstakeDelaySec: bigint;
            };
            factoryInfo: {
                stake: bigint;
                unstakeDelaySec: bigint;
            };
            paymasterInfo: {
                stake: bigint;
                unstakeDelaySec: bigint;
            };
        };
        errorName: "ValidationResult";
    }, {
        args: [{
            preOpGas: bigint;
            validAfter: number;
            validUntil: number;
            prefund: bigint;
            sigFailed: boolean;
            paymasterContext: string;
        }, {
            stake: bigint;
            unstakeDelaySec: bigint;
        }, {
            stake: bigint;
            unstakeDelaySec: bigint;
        }, {
            stake: bigint;
            unstakeDelaySec: bigint;
        }];
        errorName: "ValidationResult";
    }>, z.ZodObject<{
        args: z.ZodEffects<z.ZodTuple<[z.ZodBigInt, z.ZodBigInt, z.ZodNumber, z.ZodNumber, z.ZodBoolean, z.ZodString], null>, {
            preOpGas: bigint;
            paid: bigint;
            validAfter: number;
            validUntil: number;
            targetSuccess: boolean;
            targetResult: `0x${string}`;
        }, [bigint, bigint, number, number, boolean, string]>;
        errorName: z.ZodLiteral<"ExecutionResult">;
    }, "strip", z.ZodTypeAny, {
        args: {
            preOpGas: bigint;
            paid: bigint;
            validAfter: number;
            validUntil: number;
            targetSuccess: boolean;
            targetResult: `0x${string}`;
        };
        errorName: "ExecutionResult";
    }, {
        args: [bigint, bigint, number, number, boolean, string];
        errorName: "ExecutionResult";
    }>, z.ZodObject<{
        args: z.ZodEffects<z.ZodTuple<[z.ZodBigInt, z.ZodString], null>, {
            opIndex: bigint;
            reason: string;
        }, [bigint, string]>;
        errorName: z.ZodLiteral<"FailedOp">;
    }, "strip", z.ZodTypeAny, {
        args: {
            opIndex: bigint;
            reason: string;
        };
        errorName: "FailedOp";
    }, {
        args: [bigint, string];
        errorName: "FailedOp";
    }>, z.ZodObject<{
        args: z.ZodEffects<z.ZodTuple<[z.ZodEffects<z.ZodString, `0x${string}`, string>], null>, {
            sender: `0x${string}`;
        }, [string]>;
        errorName: z.ZodLiteral<"SenderAddressResult">;
    }, "strip", z.ZodTypeAny, {
        args: {
            sender: `0x${string}`;
        };
        errorName: "SenderAddressResult";
    }, {
        args: [string];
        errorName: "SenderAddressResult";
    }>, z.ZodObject<{
        args: z.ZodEffects<z.ZodTuple<[z.ZodEffects<z.ZodString, `0x${string}`, string>], null>, {
            aggregator: `0x${string}`;
        }, [string]>;
        errorName: z.ZodLiteral<"SignatureValidationFailed">;
    }, "strip", z.ZodTypeAny, {
        args: {
            aggregator: `0x${string}`;
        };
        errorName: "SignatureValidationFailed";
    }, {
        args: [string];
        errorName: "SignatureValidationFailed";
    }>, z.ZodObject<{
        args: z.ZodEffects<z.ZodTuple<[z.ZodObject<{
            preOpGas: z.ZodBigInt;
            prefund: z.ZodBigInt;
            sigFailed: z.ZodBoolean;
            validAfter: z.ZodNumber;
            validUntil: z.ZodNumber;
            paymasterContext: z.ZodEffects<z.ZodString, `0x${string}`, string>;
        }, "strip", z.ZodTypeAny, {
            preOpGas: bigint;
            validAfter: number;
            validUntil: number;
            prefund: bigint;
            sigFailed: boolean;
            paymasterContext: `0x${string}`;
        }, {
            preOpGas: bigint;
            validAfter: number;
            validUntil: number;
            prefund: bigint;
            sigFailed: boolean;
            paymasterContext: string;
        }>, z.ZodObject<{
            stake: z.ZodBigInt;
            unstakeDelaySec: z.ZodBigInt;
        }, "strip", z.ZodTypeAny, {
            stake: bigint;
            unstakeDelaySec: bigint;
        }, {
            stake: bigint;
            unstakeDelaySec: bigint;
        }>, z.ZodObject<{
            stake: z.ZodBigInt;
            unstakeDelaySec: z.ZodBigInt;
        }, "strip", z.ZodTypeAny, {
            stake: bigint;
            unstakeDelaySec: bigint;
        }, {
            stake: bigint;
            unstakeDelaySec: bigint;
        }>, z.ZodObject<{
            stake: z.ZodBigInt;
            unstakeDelaySec: z.ZodBigInt;
        }, "strip", z.ZodTypeAny, {
            stake: bigint;
            unstakeDelaySec: bigint;
        }, {
            stake: bigint;
            unstakeDelaySec: bigint;
        }>, z.ZodObject<{
            aggregator: z.ZodEffects<z.ZodString, `0x${string}`, string>;
            stakeInfo: z.ZodObject<{
                stake: z.ZodBigInt;
                unstakeDelaySec: z.ZodBigInt;
            }, "strip", z.ZodTypeAny, {
                stake: bigint;
                unstakeDelaySec: bigint;
            }, {
                stake: bigint;
                unstakeDelaySec: bigint;
            }>;
        }, "strip", z.ZodTypeAny, {
            aggregator: `0x${string}`;
            stakeInfo: {
                stake: bigint;
                unstakeDelaySec: bigint;
            };
        }, {
            aggregator: string;
            stakeInfo: {
                stake: bigint;
                unstakeDelaySec: bigint;
            };
        }>], null>, {
            returnInfo: {
                preOpGas: bigint;
                validAfter: number;
                validUntil: number;
                prefund: bigint;
                sigFailed: boolean;
                paymasterContext: `0x${string}`;
            };
            senderInfo: {
                stake: bigint;
                unstakeDelaySec: bigint;
            };
            factoryInfo: {
                stake: bigint;
                unstakeDelaySec: bigint;
            };
            paymasterInfo: {
                stake: bigint;
                unstakeDelaySec: bigint;
            };
            aggregatorInfo: {
                aggregator: `0x${string}`;
                stakeInfo: {
                    stake: bigint;
                    unstakeDelaySec: bigint;
                };
            };
        }, [{
            preOpGas: bigint;
            validAfter: number;
            validUntil: number;
            prefund: bigint;
            sigFailed: boolean;
            paymasterContext: string;
        }, {
            stake: bigint;
            unstakeDelaySec: bigint;
        }, {
            stake: bigint;
            unstakeDelaySec: bigint;
        }, {
            stake: bigint;
            unstakeDelaySec: bigint;
        }, {
            aggregator: string;
            stakeInfo: {
                stake: bigint;
                unstakeDelaySec: bigint;
            };
        }]>;
        errorName: z.ZodLiteral<"ValidationResultWithAggregation">;
    }, "strip", z.ZodTypeAny, {
        args: {
            returnInfo: {
                preOpGas: bigint;
                validAfter: number;
                validUntil: number;
                prefund: bigint;
                sigFailed: boolean;
                paymasterContext: `0x${string}`;
            };
            senderInfo: {
                stake: bigint;
                unstakeDelaySec: bigint;
            };
            factoryInfo: {
                stake: bigint;
                unstakeDelaySec: bigint;
            };
            paymasterInfo: {
                stake: bigint;
                unstakeDelaySec: bigint;
            };
            aggregatorInfo: {
                aggregator: `0x${string}`;
                stakeInfo: {
                    stake: bigint;
                    unstakeDelaySec: bigint;
                };
            };
        };
        errorName: "ValidationResultWithAggregation";
    }, {
        args: [{
            preOpGas: bigint;
            validAfter: number;
            validUntil: number;
            prefund: bigint;
            sigFailed: boolean;
            paymasterContext: string;
        }, {
            stake: bigint;
            unstakeDelaySec: bigint;
        }, {
            stake: bigint;
            unstakeDelaySec: bigint;
        }, {
            stake: bigint;
            unstakeDelaySec: bigint;
        }, {
            aggregator: string;
            stakeInfo: {
                stake: bigint;
                unstakeDelaySec: bigint;
            };
        }];
        errorName: "ValidationResultWithAggregation";
    }>]>;
}, "strip", z.ZodTypeAny, {
    data: {
        args: {
            aggregator: `0x${string}`;
        };
        errorName: "SignatureValidationFailed";
    } | {
        args: {
            sender: `0x${string}`;
        };
        errorName: "SenderAddressResult";
    } | {
        args: {
            opIndex: bigint;
            reason: string;
        };
        errorName: "FailedOp";
    } | {
        args: {
            preOpGas: bigint;
            paid: bigint;
            validAfter: number;
            validUntil: number;
            targetSuccess: boolean;
            targetResult: `0x${string}`;
        };
        errorName: "ExecutionResult";
    } | {
        args: {
            returnInfo: {
                preOpGas: bigint;
                validAfter: number;
                validUntil: number;
                prefund: bigint;
                sigFailed: boolean;
                paymasterContext: `0x${string}`;
            };
            senderInfo: {
                stake: bigint;
                unstakeDelaySec: bigint;
            };
            factoryInfo: {
                stake: bigint;
                unstakeDelaySec: bigint;
            };
            paymasterInfo: {
                stake: bigint;
                unstakeDelaySec: bigint;
            };
        };
        errorName: "ValidationResult";
    } | {
        args: {
            returnInfo: {
                preOpGas: bigint;
                validAfter: number;
                validUntil: number;
                prefund: bigint;
                sigFailed: boolean;
                paymasterContext: `0x${string}`;
            };
            senderInfo: {
                stake: bigint;
                unstakeDelaySec: bigint;
            };
            factoryInfo: {
                stake: bigint;
                unstakeDelaySec: bigint;
            };
            paymasterInfo: {
                stake: bigint;
                unstakeDelaySec: bigint;
            };
            aggregatorInfo: {
                aggregator: `0x${string}`;
                stakeInfo: {
                    stake: bigint;
                    unstakeDelaySec: bigint;
                };
            };
        };
        errorName: "ValidationResultWithAggregation";
    };
    name: "ContractFunctionRevertedError";
}, {
    data: {
        args: [string];
        errorName: "SignatureValidationFailed";
    } | {
        args: [string];
        errorName: "SenderAddressResult";
    } | {
        args: [bigint, string];
        errorName: "FailedOp";
    } | {
        args: [bigint, bigint, number, number, boolean, string];
        errorName: "ExecutionResult";
    } | {
        args: [{
            preOpGas: bigint;
            validAfter: number;
            validUntil: number;
            prefund: bigint;
            sigFailed: boolean;
            paymasterContext: string;
        }, {
            stake: bigint;
            unstakeDelaySec: bigint;
        }, {
            stake: bigint;
            unstakeDelaySec: bigint;
        }, {
            stake: bigint;
            unstakeDelaySec: bigint;
        }];
        errorName: "ValidationResult";
    } | {
        args: [{
            preOpGas: bigint;
            validAfter: number;
            validUntil: number;
            prefund: bigint;
            sigFailed: boolean;
            paymasterContext: string;
        }, {
            stake: bigint;
            unstakeDelaySec: bigint;
        }, {
            stake: bigint;
            unstakeDelaySec: bigint;
        }, {
            stake: bigint;
            unstakeDelaySec: bigint;
        }, {
            aggregator: string;
            stakeInfo: {
                stake: bigint;
                unstakeDelaySec: bigint;
            };
        }];
        errorName: "ValidationResultWithAggregation";
    };
    name: "ContractFunctionRevertedError";
}>;
export declare const vmExecutionError: z.ZodObject<{
    name: z.ZodLiteral<"CallExecutionError">;
    cause: z.ZodObject<{
        name: z.ZodLiteral<"RpcRequestError">;
        cause: z.ZodObject<{
            data: z.ZodEffects<z.ZodString, {
                args: {
                    aggregator: `0x${string}`;
                };
                errorName: "SignatureValidationFailed";
            } | {
                args: {
                    sender: `0x${string}`;
                };
                errorName: "SenderAddressResult";
            } | {
                args: {
                    opIndex: bigint;
                    reason: string;
                };
                errorName: "FailedOp";
            } | {
                args: {
                    preOpGas: bigint;
                    paid: bigint;
                    validAfter: number;
                    validUntil: number;
                    targetSuccess: boolean;
                    targetResult: `0x${string}`;
                };
                errorName: "ExecutionResult";
            } | {
                args: {
                    returnInfo: {
                        preOpGas: bigint;
                        validAfter: number;
                        validUntil: number;
                        prefund: bigint;
                        sigFailed: boolean;
                        paymasterContext: `0x${string}`;
                    };
                    senderInfo: {
                        stake: bigint;
                        unstakeDelaySec: bigint;
                    };
                    factoryInfo: {
                        stake: bigint;
                        unstakeDelaySec: bigint;
                    };
                    paymasterInfo: {
                        stake: bigint;
                        unstakeDelaySec: bigint;
                    };
                };
                errorName: "ValidationResult";
            } | {
                args: {
                    returnInfo: {
                        preOpGas: bigint;
                        validAfter: number;
                        validUntil: number;
                        prefund: bigint;
                        sigFailed: boolean;
                        paymasterContext: `0x${string}`;
                    };
                    senderInfo: {
                        stake: bigint;
                        unstakeDelaySec: bigint;
                    };
                    factoryInfo: {
                        stake: bigint;
                        unstakeDelaySec: bigint;
                    };
                    paymasterInfo: {
                        stake: bigint;
                        unstakeDelaySec: bigint;
                    };
                    aggregatorInfo: {
                        aggregator: `0x${string}`;
                        stakeInfo: {
                            stake: bigint;
                            unstakeDelaySec: bigint;
                        };
                    };
                };
                errorName: "ValidationResultWithAggregation";
            }, string>;
        }, "strip", z.ZodTypeAny, {
            data: {
                args: {
                    aggregator: `0x${string}`;
                };
                errorName: "SignatureValidationFailed";
            } | {
                args: {
                    sender: `0x${string}`;
                };
                errorName: "SenderAddressResult";
            } | {
                args: {
                    opIndex: bigint;
                    reason: string;
                };
                errorName: "FailedOp";
            } | {
                args: {
                    preOpGas: bigint;
                    paid: bigint;
                    validAfter: number;
                    validUntil: number;
                    targetSuccess: boolean;
                    targetResult: `0x${string}`;
                };
                errorName: "ExecutionResult";
            } | {
                args: {
                    returnInfo: {
                        preOpGas: bigint;
                        validAfter: number;
                        validUntil: number;
                        prefund: bigint;
                        sigFailed: boolean;
                        paymasterContext: `0x${string}`;
                    };
                    senderInfo: {
                        stake: bigint;
                        unstakeDelaySec: bigint;
                    };
                    factoryInfo: {
                        stake: bigint;
                        unstakeDelaySec: bigint;
                    };
                    paymasterInfo: {
                        stake: bigint;
                        unstakeDelaySec: bigint;
                    };
                };
                errorName: "ValidationResult";
            } | {
                args: {
                    returnInfo: {
                        preOpGas: bigint;
                        validAfter: number;
                        validUntil: number;
                        prefund: bigint;
                        sigFailed: boolean;
                        paymasterContext: `0x${string}`;
                    };
                    senderInfo: {
                        stake: bigint;
                        unstakeDelaySec: bigint;
                    };
                    factoryInfo: {
                        stake: bigint;
                        unstakeDelaySec: bigint;
                    };
                    paymasterInfo: {
                        stake: bigint;
                        unstakeDelaySec: bigint;
                    };
                    aggregatorInfo: {
                        aggregator: `0x${string}`;
                        stakeInfo: {
                            stake: bigint;
                            unstakeDelaySec: bigint;
                        };
                    };
                };
                errorName: "ValidationResultWithAggregation";
            };
        }, {
            data: string;
        }>;
    }, "strip", z.ZodTypeAny, {
        name: "RpcRequestError";
        cause: {
            data: {
                args: {
                    aggregator: `0x${string}`;
                };
                errorName: "SignatureValidationFailed";
            } | {
                args: {
                    sender: `0x${string}`;
                };
                errorName: "SenderAddressResult";
            } | {
                args: {
                    opIndex: bigint;
                    reason: string;
                };
                errorName: "FailedOp";
            } | {
                args: {
                    preOpGas: bigint;
                    paid: bigint;
                    validAfter: number;
                    validUntil: number;
                    targetSuccess: boolean;
                    targetResult: `0x${string}`;
                };
                errorName: "ExecutionResult";
            } | {
                args: {
                    returnInfo: {
                        preOpGas: bigint;
                        validAfter: number;
                        validUntil: number;
                        prefund: bigint;
                        sigFailed: boolean;
                        paymasterContext: `0x${string}`;
                    };
                    senderInfo: {
                        stake: bigint;
                        unstakeDelaySec: bigint;
                    };
                    factoryInfo: {
                        stake: bigint;
                        unstakeDelaySec: bigint;
                    };
                    paymasterInfo: {
                        stake: bigint;
                        unstakeDelaySec: bigint;
                    };
                };
                errorName: "ValidationResult";
            } | {
                args: {
                    returnInfo: {
                        preOpGas: bigint;
                        validAfter: number;
                        validUntil: number;
                        prefund: bigint;
                        sigFailed: boolean;
                        paymasterContext: `0x${string}`;
                    };
                    senderInfo: {
                        stake: bigint;
                        unstakeDelaySec: bigint;
                    };
                    factoryInfo: {
                        stake: bigint;
                        unstakeDelaySec: bigint;
                    };
                    paymasterInfo: {
                        stake: bigint;
                        unstakeDelaySec: bigint;
                    };
                    aggregatorInfo: {
                        aggregator: `0x${string}`;
                        stakeInfo: {
                            stake: bigint;
                            unstakeDelaySec: bigint;
                        };
                    };
                };
                errorName: "ValidationResultWithAggregation";
            };
        };
    }, {
        name: "RpcRequestError";
        cause: {
            data: string;
        };
    }>;
}, "strip", z.ZodTypeAny, {
    name: "CallExecutionError";
    cause: {
        name: "RpcRequestError";
        cause: {
            data: {
                args: {
                    aggregator: `0x${string}`;
                };
                errorName: "SignatureValidationFailed";
            } | {
                args: {
                    sender: `0x${string}`;
                };
                errorName: "SenderAddressResult";
            } | {
                args: {
                    opIndex: bigint;
                    reason: string;
                };
                errorName: "FailedOp";
            } | {
                args: {
                    preOpGas: bigint;
                    paid: bigint;
                    validAfter: number;
                    validUntil: number;
                    targetSuccess: boolean;
                    targetResult: `0x${string}`;
                };
                errorName: "ExecutionResult";
            } | {
                args: {
                    returnInfo: {
                        preOpGas: bigint;
                        validAfter: number;
                        validUntil: number;
                        prefund: bigint;
                        sigFailed: boolean;
                        paymasterContext: `0x${string}`;
                    };
                    senderInfo: {
                        stake: bigint;
                        unstakeDelaySec: bigint;
                    };
                    factoryInfo: {
                        stake: bigint;
                        unstakeDelaySec: bigint;
                    };
                    paymasterInfo: {
                        stake: bigint;
                        unstakeDelaySec: bigint;
                    };
                };
                errorName: "ValidationResult";
            } | {
                args: {
                    returnInfo: {
                        preOpGas: bigint;
                        validAfter: number;
                        validUntil: number;
                        prefund: bigint;
                        sigFailed: boolean;
                        paymasterContext: `0x${string}`;
                    };
                    senderInfo: {
                        stake: bigint;
                        unstakeDelaySec: bigint;
                    };
                    factoryInfo: {
                        stake: bigint;
                        unstakeDelaySec: bigint;
                    };
                    paymasterInfo: {
                        stake: bigint;
                        unstakeDelaySec: bigint;
                    };
                    aggregatorInfo: {
                        aggregator: `0x${string}`;
                        stakeInfo: {
                            stake: bigint;
                            unstakeDelaySec: bigint;
                        };
                    };
                };
                errorName: "ValidationResultWithAggregation";
            };
        };
    };
}, {
    name: "CallExecutionError";
    cause: {
        name: "RpcRequestError";
        cause: {
            data: string;
        };
    };
}>;
export declare const entryPointExecutionErrorSchema: z.ZodEffects<z.ZodObject<{
    name: z.ZodLiteral<"ContractFunctionExecutionError">;
    cause: z.ZodDiscriminatedUnion<"name", [z.ZodObject<{
        name: z.ZodLiteral<"ContractFunctionRevertedError">;
        data: z.ZodDiscriminatedUnion<"errorName", [z.ZodObject<{
            args: z.ZodEffects<z.ZodTuple<[z.ZodObject<{
                preOpGas: z.ZodBigInt;
                prefund: z.ZodBigInt;
                sigFailed: z.ZodBoolean;
                validAfter: z.ZodNumber;
                validUntil: z.ZodNumber;
                paymasterContext: z.ZodEffects<z.ZodString, `0x${string}`, string>;
            }, "strip", z.ZodTypeAny, {
                preOpGas: bigint;
                validAfter: number;
                validUntil: number;
                prefund: bigint;
                sigFailed: boolean;
                paymasterContext: `0x${string}`;
            }, {
                preOpGas: bigint;
                validAfter: number;
                validUntil: number;
                prefund: bigint;
                sigFailed: boolean;
                paymasterContext: string;
            }>, z.ZodObject<{
                stake: z.ZodBigInt;
                unstakeDelaySec: z.ZodBigInt;
            }, "strip", z.ZodTypeAny, {
                stake: bigint;
                unstakeDelaySec: bigint;
            }, {
                stake: bigint;
                unstakeDelaySec: bigint;
            }>, z.ZodObject<{
                stake: z.ZodBigInt;
                unstakeDelaySec: z.ZodBigInt;
            }, "strip", z.ZodTypeAny, {
                stake: bigint;
                unstakeDelaySec: bigint;
            }, {
                stake: bigint;
                unstakeDelaySec: bigint;
            }>, z.ZodObject<{
                stake: z.ZodBigInt;
                unstakeDelaySec: z.ZodBigInt;
            }, "strip", z.ZodTypeAny, {
                stake: bigint;
                unstakeDelaySec: bigint;
            }, {
                stake: bigint;
                unstakeDelaySec: bigint;
            }>], null>, {
                returnInfo: {
                    preOpGas: bigint;
                    validAfter: number;
                    validUntil: number;
                    prefund: bigint;
                    sigFailed: boolean;
                    paymasterContext: `0x${string}`;
                };
                senderInfo: {
                    stake: bigint;
                    unstakeDelaySec: bigint;
                };
                factoryInfo: {
                    stake: bigint;
                    unstakeDelaySec: bigint;
                };
                paymasterInfo: {
                    stake: bigint;
                    unstakeDelaySec: bigint;
                };
            }, [{
                preOpGas: bigint;
                validAfter: number;
                validUntil: number;
                prefund: bigint;
                sigFailed: boolean;
                paymasterContext: string;
            }, {
                stake: bigint;
                unstakeDelaySec: bigint;
            }, {
                stake: bigint;
                unstakeDelaySec: bigint;
            }, {
                stake: bigint;
                unstakeDelaySec: bigint;
            }]>;
            errorName: z.ZodLiteral<"ValidationResult">;
        }, "strip", z.ZodTypeAny, {
            args: {
                returnInfo: {
                    preOpGas: bigint;
                    validAfter: number;
                    validUntil: number;
                    prefund: bigint;
                    sigFailed: boolean;
                    paymasterContext: `0x${string}`;
                };
                senderInfo: {
                    stake: bigint;
                    unstakeDelaySec: bigint;
                };
                factoryInfo: {
                    stake: bigint;
                    unstakeDelaySec: bigint;
                };
                paymasterInfo: {
                    stake: bigint;
                    unstakeDelaySec: bigint;
                };
            };
            errorName: "ValidationResult";
        }, {
            args: [{
                preOpGas: bigint;
                validAfter: number;
                validUntil: number;
                prefund: bigint;
                sigFailed: boolean;
                paymasterContext: string;
            }, {
                stake: bigint;
                unstakeDelaySec: bigint;
            }, {
                stake: bigint;
                unstakeDelaySec: bigint;
            }, {
                stake: bigint;
                unstakeDelaySec: bigint;
            }];
            errorName: "ValidationResult";
        }>, z.ZodObject<{
            args: z.ZodEffects<z.ZodTuple<[z.ZodBigInt, z.ZodBigInt, z.ZodNumber, z.ZodNumber, z.ZodBoolean, z.ZodString], null>, {
                preOpGas: bigint;
                paid: bigint;
                validAfter: number;
                validUntil: number;
                targetSuccess: boolean;
                targetResult: `0x${string}`;
            }, [bigint, bigint, number, number, boolean, string]>;
            errorName: z.ZodLiteral<"ExecutionResult">;
        }, "strip", z.ZodTypeAny, {
            args: {
                preOpGas: bigint;
                paid: bigint;
                validAfter: number;
                validUntil: number;
                targetSuccess: boolean;
                targetResult: `0x${string}`;
            };
            errorName: "ExecutionResult";
        }, {
            args: [bigint, bigint, number, number, boolean, string];
            errorName: "ExecutionResult";
        }>, z.ZodObject<{
            args: z.ZodEffects<z.ZodTuple<[z.ZodBigInt, z.ZodString], null>, {
                opIndex: bigint;
                reason: string;
            }, [bigint, string]>;
            errorName: z.ZodLiteral<"FailedOp">;
        }, "strip", z.ZodTypeAny, {
            args: {
                opIndex: bigint;
                reason: string;
            };
            errorName: "FailedOp";
        }, {
            args: [bigint, string];
            errorName: "FailedOp";
        }>, z.ZodObject<{
            args: z.ZodEffects<z.ZodTuple<[z.ZodEffects<z.ZodString, `0x${string}`, string>], null>, {
                sender: `0x${string}`;
            }, [string]>;
            errorName: z.ZodLiteral<"SenderAddressResult">;
        }, "strip", z.ZodTypeAny, {
            args: {
                sender: `0x${string}`;
            };
            errorName: "SenderAddressResult";
        }, {
            args: [string];
            errorName: "SenderAddressResult";
        }>, z.ZodObject<{
            args: z.ZodEffects<z.ZodTuple<[z.ZodEffects<z.ZodString, `0x${string}`, string>], null>, {
                aggregator: `0x${string}`;
            }, [string]>;
            errorName: z.ZodLiteral<"SignatureValidationFailed">;
        }, "strip", z.ZodTypeAny, {
            args: {
                aggregator: `0x${string}`;
            };
            errorName: "SignatureValidationFailed";
        }, {
            args: [string];
            errorName: "SignatureValidationFailed";
        }>, z.ZodObject<{
            args: z.ZodEffects<z.ZodTuple<[z.ZodObject<{
                preOpGas: z.ZodBigInt;
                prefund: z.ZodBigInt;
                sigFailed: z.ZodBoolean;
                validAfter: z.ZodNumber;
                validUntil: z.ZodNumber;
                paymasterContext: z.ZodEffects<z.ZodString, `0x${string}`, string>;
            }, "strip", z.ZodTypeAny, {
                preOpGas: bigint;
                validAfter: number;
                validUntil: number;
                prefund: bigint;
                sigFailed: boolean;
                paymasterContext: `0x${string}`;
            }, {
                preOpGas: bigint;
                validAfter: number;
                validUntil: number;
                prefund: bigint;
                sigFailed: boolean;
                paymasterContext: string;
            }>, z.ZodObject<{
                stake: z.ZodBigInt;
                unstakeDelaySec: z.ZodBigInt;
            }, "strip", z.ZodTypeAny, {
                stake: bigint;
                unstakeDelaySec: bigint;
            }, {
                stake: bigint;
                unstakeDelaySec: bigint;
            }>, z.ZodObject<{
                stake: z.ZodBigInt;
                unstakeDelaySec: z.ZodBigInt;
            }, "strip", z.ZodTypeAny, {
                stake: bigint;
                unstakeDelaySec: bigint;
            }, {
                stake: bigint;
                unstakeDelaySec: bigint;
            }>, z.ZodObject<{
                stake: z.ZodBigInt;
                unstakeDelaySec: z.ZodBigInt;
            }, "strip", z.ZodTypeAny, {
                stake: bigint;
                unstakeDelaySec: bigint;
            }, {
                stake: bigint;
                unstakeDelaySec: bigint;
            }>, z.ZodObject<{
                aggregator: z.ZodEffects<z.ZodString, `0x${string}`, string>;
                stakeInfo: z.ZodObject<{
                    stake: z.ZodBigInt;
                    unstakeDelaySec: z.ZodBigInt;
                }, "strip", z.ZodTypeAny, {
                    stake: bigint;
                    unstakeDelaySec: bigint;
                }, {
                    stake: bigint;
                    unstakeDelaySec: bigint;
                }>;
            }, "strip", z.ZodTypeAny, {
                aggregator: `0x${string}`;
                stakeInfo: {
                    stake: bigint;
                    unstakeDelaySec: bigint;
                };
            }, {
                aggregator: string;
                stakeInfo: {
                    stake: bigint;
                    unstakeDelaySec: bigint;
                };
            }>], null>, {
                returnInfo: {
                    preOpGas: bigint;
                    validAfter: number;
                    validUntil: number;
                    prefund: bigint;
                    sigFailed: boolean;
                    paymasterContext: `0x${string}`;
                };
                senderInfo: {
                    stake: bigint;
                    unstakeDelaySec: bigint;
                };
                factoryInfo: {
                    stake: bigint;
                    unstakeDelaySec: bigint;
                };
                paymasterInfo: {
                    stake: bigint;
                    unstakeDelaySec: bigint;
                };
                aggregatorInfo: {
                    aggregator: `0x${string}`;
                    stakeInfo: {
                        stake: bigint;
                        unstakeDelaySec: bigint;
                    };
                };
            }, [{
                preOpGas: bigint;
                validAfter: number;
                validUntil: number;
                prefund: bigint;
                sigFailed: boolean;
                paymasterContext: string;
            }, {
                stake: bigint;
                unstakeDelaySec: bigint;
            }, {
                stake: bigint;
                unstakeDelaySec: bigint;
            }, {
                stake: bigint;
                unstakeDelaySec: bigint;
            }, {
                aggregator: string;
                stakeInfo: {
                    stake: bigint;
                    unstakeDelaySec: bigint;
                };
            }]>;
            errorName: z.ZodLiteral<"ValidationResultWithAggregation">;
        }, "strip", z.ZodTypeAny, {
            args: {
                returnInfo: {
                    preOpGas: bigint;
                    validAfter: number;
                    validUntil: number;
                    prefund: bigint;
                    sigFailed: boolean;
                    paymasterContext: `0x${string}`;
                };
                senderInfo: {
                    stake: bigint;
                    unstakeDelaySec: bigint;
                };
                factoryInfo: {
                    stake: bigint;
                    unstakeDelaySec: bigint;
                };
                paymasterInfo: {
                    stake: bigint;
                    unstakeDelaySec: bigint;
                };
                aggregatorInfo: {
                    aggregator: `0x${string}`;
                    stakeInfo: {
                        stake: bigint;
                        unstakeDelaySec: bigint;
                    };
                };
            };
            errorName: "ValidationResultWithAggregation";
        }, {
            args: [{
                preOpGas: bigint;
                validAfter: number;
                validUntil: number;
                prefund: bigint;
                sigFailed: boolean;
                paymasterContext: string;
            }, {
                stake: bigint;
                unstakeDelaySec: bigint;
            }, {
                stake: bigint;
                unstakeDelaySec: bigint;
            }, {
                stake: bigint;
                unstakeDelaySec: bigint;
            }, {
                aggregator: string;
                stakeInfo: {
                    stake: bigint;
                    unstakeDelaySec: bigint;
                };
            }];
            errorName: "ValidationResultWithAggregation";
        }>]>;
    }, "strip", z.ZodTypeAny, {
        data: {
            args: {
                aggregator: `0x${string}`;
            };
            errorName: "SignatureValidationFailed";
        } | {
            args: {
                sender: `0x${string}`;
            };
            errorName: "SenderAddressResult";
        } | {
            args: {
                opIndex: bigint;
                reason: string;
            };
            errorName: "FailedOp";
        } | {
            args: {
                preOpGas: bigint;
                paid: bigint;
                validAfter: number;
                validUntil: number;
                targetSuccess: boolean;
                targetResult: `0x${string}`;
            };
            errorName: "ExecutionResult";
        } | {
            args: {
                returnInfo: {
                    preOpGas: bigint;
                    validAfter: number;
                    validUntil: number;
                    prefund: bigint;
                    sigFailed: boolean;
                    paymasterContext: `0x${string}`;
                };
                senderInfo: {
                    stake: bigint;
                    unstakeDelaySec: bigint;
                };
                factoryInfo: {
                    stake: bigint;
                    unstakeDelaySec: bigint;
                };
                paymasterInfo: {
                    stake: bigint;
                    unstakeDelaySec: bigint;
                };
            };
            errorName: "ValidationResult";
        } | {
            args: {
                returnInfo: {
                    preOpGas: bigint;
                    validAfter: number;
                    validUntil: number;
                    prefund: bigint;
                    sigFailed: boolean;
                    paymasterContext: `0x${string}`;
                };
                senderInfo: {
                    stake: bigint;
                    unstakeDelaySec: bigint;
                };
                factoryInfo: {
                    stake: bigint;
                    unstakeDelaySec: bigint;
                };
                paymasterInfo: {
                    stake: bigint;
                    unstakeDelaySec: bigint;
                };
                aggregatorInfo: {
                    aggregator: `0x${string}`;
                    stakeInfo: {
                        stake: bigint;
                        unstakeDelaySec: bigint;
                    };
                };
            };
            errorName: "ValidationResultWithAggregation";
        };
        name: "ContractFunctionRevertedError";
    }, {
        data: {
            args: [string];
            errorName: "SignatureValidationFailed";
        } | {
            args: [string];
            errorName: "SenderAddressResult";
        } | {
            args: [bigint, string];
            errorName: "FailedOp";
        } | {
            args: [bigint, bigint, number, number, boolean, string];
            errorName: "ExecutionResult";
        } | {
            args: [{
                preOpGas: bigint;
                validAfter: number;
                validUntil: number;
                prefund: bigint;
                sigFailed: boolean;
                paymasterContext: string;
            }, {
                stake: bigint;
                unstakeDelaySec: bigint;
            }, {
                stake: bigint;
                unstakeDelaySec: bigint;
            }, {
                stake: bigint;
                unstakeDelaySec: bigint;
            }];
            errorName: "ValidationResult";
        } | {
            args: [{
                preOpGas: bigint;
                validAfter: number;
                validUntil: number;
                prefund: bigint;
                sigFailed: boolean;
                paymasterContext: string;
            }, {
                stake: bigint;
                unstakeDelaySec: bigint;
            }, {
                stake: bigint;
                unstakeDelaySec: bigint;
            }, {
                stake: bigint;
                unstakeDelaySec: bigint;
            }, {
                aggregator: string;
                stakeInfo: {
                    stake: bigint;
                    unstakeDelaySec: bigint;
                };
            }];
            errorName: "ValidationResultWithAggregation";
        };
        name: "ContractFunctionRevertedError";
    }>, z.ZodObject<{
        name: z.ZodLiteral<"CallExecutionError">;
        cause: z.ZodObject<{
            name: z.ZodLiteral<"RpcRequestError">;
            cause: z.ZodObject<{
                data: z.ZodEffects<z.ZodString, {
                    args: {
                        aggregator: `0x${string}`;
                    };
                    errorName: "SignatureValidationFailed";
                } | {
                    args: {
                        sender: `0x${string}`;
                    };
                    errorName: "SenderAddressResult";
                } | {
                    args: {
                        opIndex: bigint;
                        reason: string;
                    };
                    errorName: "FailedOp";
                } | {
                    args: {
                        preOpGas: bigint;
                        paid: bigint;
                        validAfter: number;
                        validUntil: number;
                        targetSuccess: boolean;
                        targetResult: `0x${string}`;
                    };
                    errorName: "ExecutionResult";
                } | {
                    args: {
                        returnInfo: {
                            preOpGas: bigint;
                            validAfter: number;
                            validUntil: number;
                            prefund: bigint;
                            sigFailed: boolean;
                            paymasterContext: `0x${string}`;
                        };
                        senderInfo: {
                            stake: bigint;
                            unstakeDelaySec: bigint;
                        };
                        factoryInfo: {
                            stake: bigint;
                            unstakeDelaySec: bigint;
                        };
                        paymasterInfo: {
                            stake: bigint;
                            unstakeDelaySec: bigint;
                        };
                    };
                    errorName: "ValidationResult";
                } | {
                    args: {
                        returnInfo: {
                            preOpGas: bigint;
                            validAfter: number;
                            validUntil: number;
                            prefund: bigint;
                            sigFailed: boolean;
                            paymasterContext: `0x${string}`;
                        };
                        senderInfo: {
                            stake: bigint;
                            unstakeDelaySec: bigint;
                        };
                        factoryInfo: {
                            stake: bigint;
                            unstakeDelaySec: bigint;
                        };
                        paymasterInfo: {
                            stake: bigint;
                            unstakeDelaySec: bigint;
                        };
                        aggregatorInfo: {
                            aggregator: `0x${string}`;
                            stakeInfo: {
                                stake: bigint;
                                unstakeDelaySec: bigint;
                            };
                        };
                    };
                    errorName: "ValidationResultWithAggregation";
                }, string>;
            }, "strip", z.ZodTypeAny, {
                data: {
                    args: {
                        aggregator: `0x${string}`;
                    };
                    errorName: "SignatureValidationFailed";
                } | {
                    args: {
                        sender: `0x${string}`;
                    };
                    errorName: "SenderAddressResult";
                } | {
                    args: {
                        opIndex: bigint;
                        reason: string;
                    };
                    errorName: "FailedOp";
                } | {
                    args: {
                        preOpGas: bigint;
                        paid: bigint;
                        validAfter: number;
                        validUntil: number;
                        targetSuccess: boolean;
                        targetResult: `0x${string}`;
                    };
                    errorName: "ExecutionResult";
                } | {
                    args: {
                        returnInfo: {
                            preOpGas: bigint;
                            validAfter: number;
                            validUntil: number;
                            prefund: bigint;
                            sigFailed: boolean;
                            paymasterContext: `0x${string}`;
                        };
                        senderInfo: {
                            stake: bigint;
                            unstakeDelaySec: bigint;
                        };
                        factoryInfo: {
                            stake: bigint;
                            unstakeDelaySec: bigint;
                        };
                        paymasterInfo: {
                            stake: bigint;
                            unstakeDelaySec: bigint;
                        };
                    };
                    errorName: "ValidationResult";
                } | {
                    args: {
                        returnInfo: {
                            preOpGas: bigint;
                            validAfter: number;
                            validUntil: number;
                            prefund: bigint;
                            sigFailed: boolean;
                            paymasterContext: `0x${string}`;
                        };
                        senderInfo: {
                            stake: bigint;
                            unstakeDelaySec: bigint;
                        };
                        factoryInfo: {
                            stake: bigint;
                            unstakeDelaySec: bigint;
                        };
                        paymasterInfo: {
                            stake: bigint;
                            unstakeDelaySec: bigint;
                        };
                        aggregatorInfo: {
                            aggregator: `0x${string}`;
                            stakeInfo: {
                                stake: bigint;
                                unstakeDelaySec: bigint;
                            };
                        };
                    };
                    errorName: "ValidationResultWithAggregation";
                };
            }, {
                data: string;
            }>;
        }, "strip", z.ZodTypeAny, {
            name: "RpcRequestError";
            cause: {
                data: {
                    args: {
                        aggregator: `0x${string}`;
                    };
                    errorName: "SignatureValidationFailed";
                } | {
                    args: {
                        sender: `0x${string}`;
                    };
                    errorName: "SenderAddressResult";
                } | {
                    args: {
                        opIndex: bigint;
                        reason: string;
                    };
                    errorName: "FailedOp";
                } | {
                    args: {
                        preOpGas: bigint;
                        paid: bigint;
                        validAfter: number;
                        validUntil: number;
                        targetSuccess: boolean;
                        targetResult: `0x${string}`;
                    };
                    errorName: "ExecutionResult";
                } | {
                    args: {
                        returnInfo: {
                            preOpGas: bigint;
                            validAfter: number;
                            validUntil: number;
                            prefund: bigint;
                            sigFailed: boolean;
                            paymasterContext: `0x${string}`;
                        };
                        senderInfo: {
                            stake: bigint;
                            unstakeDelaySec: bigint;
                        };
                        factoryInfo: {
                            stake: bigint;
                            unstakeDelaySec: bigint;
                        };
                        paymasterInfo: {
                            stake: bigint;
                            unstakeDelaySec: bigint;
                        };
                    };
                    errorName: "ValidationResult";
                } | {
                    args: {
                        returnInfo: {
                            preOpGas: bigint;
                            validAfter: number;
                            validUntil: number;
                            prefund: bigint;
                            sigFailed: boolean;
                            paymasterContext: `0x${string}`;
                        };
                        senderInfo: {
                            stake: bigint;
                            unstakeDelaySec: bigint;
                        };
                        factoryInfo: {
                            stake: bigint;
                            unstakeDelaySec: bigint;
                        };
                        paymasterInfo: {
                            stake: bigint;
                            unstakeDelaySec: bigint;
                        };
                        aggregatorInfo: {
                            aggregator: `0x${string}`;
                            stakeInfo: {
                                stake: bigint;
                                unstakeDelaySec: bigint;
                            };
                        };
                    };
                    errorName: "ValidationResultWithAggregation";
                };
            };
        }, {
            name: "RpcRequestError";
            cause: {
                data: string;
            };
        }>;
    }, "strip", z.ZodTypeAny, {
        name: "CallExecutionError";
        cause: {
            name: "RpcRequestError";
            cause: {
                data: {
                    args: {
                        aggregator: `0x${string}`;
                    };
                    errorName: "SignatureValidationFailed";
                } | {
                    args: {
                        sender: `0x${string}`;
                    };
                    errorName: "SenderAddressResult";
                } | {
                    args: {
                        opIndex: bigint;
                        reason: string;
                    };
                    errorName: "FailedOp";
                } | {
                    args: {
                        preOpGas: bigint;
                        paid: bigint;
                        validAfter: number;
                        validUntil: number;
                        targetSuccess: boolean;
                        targetResult: `0x${string}`;
                    };
                    errorName: "ExecutionResult";
                } | {
                    args: {
                        returnInfo: {
                            preOpGas: bigint;
                            validAfter: number;
                            validUntil: number;
                            prefund: bigint;
                            sigFailed: boolean;
                            paymasterContext: `0x${string}`;
                        };
                        senderInfo: {
                            stake: bigint;
                            unstakeDelaySec: bigint;
                        };
                        factoryInfo: {
                            stake: bigint;
                            unstakeDelaySec: bigint;
                        };
                        paymasterInfo: {
                            stake: bigint;
                            unstakeDelaySec: bigint;
                        };
                    };
                    errorName: "ValidationResult";
                } | {
                    args: {
                        returnInfo: {
                            preOpGas: bigint;
                            validAfter: number;
                            validUntil: number;
                            prefund: bigint;
                            sigFailed: boolean;
                            paymasterContext: `0x${string}`;
                        };
                        senderInfo: {
                            stake: bigint;
                            unstakeDelaySec: bigint;
                        };
                        factoryInfo: {
                            stake: bigint;
                            unstakeDelaySec: bigint;
                        };
                        paymasterInfo: {
                            stake: bigint;
                            unstakeDelaySec: bigint;
                        };
                        aggregatorInfo: {
                            aggregator: `0x${string}`;
                            stakeInfo: {
                                stake: bigint;
                                unstakeDelaySec: bigint;
                            };
                        };
                    };
                    errorName: "ValidationResultWithAggregation";
                };
            };
        };
    }, {
        name: "CallExecutionError";
        cause: {
            name: "RpcRequestError";
            cause: {
                data: string;
            };
        };
    }>]>;
}, "strip", z.ZodTypeAny, {
    name: "ContractFunctionExecutionError";
    cause: {
        data: {
            args: {
                aggregator: `0x${string}`;
            };
            errorName: "SignatureValidationFailed";
        } | {
            args: {
                sender: `0x${string}`;
            };
            errorName: "SenderAddressResult";
        } | {
            args: {
                opIndex: bigint;
                reason: string;
            };
            errorName: "FailedOp";
        } | {
            args: {
                preOpGas: bigint;
                paid: bigint;
                validAfter: number;
                validUntil: number;
                targetSuccess: boolean;
                targetResult: `0x${string}`;
            };
            errorName: "ExecutionResult";
        } | {
            args: {
                returnInfo: {
                    preOpGas: bigint;
                    validAfter: number;
                    validUntil: number;
                    prefund: bigint;
                    sigFailed: boolean;
                    paymasterContext: `0x${string}`;
                };
                senderInfo: {
                    stake: bigint;
                    unstakeDelaySec: bigint;
                };
                factoryInfo: {
                    stake: bigint;
                    unstakeDelaySec: bigint;
                };
                paymasterInfo: {
                    stake: bigint;
                    unstakeDelaySec: bigint;
                };
            };
            errorName: "ValidationResult";
        } | {
            args: {
                returnInfo: {
                    preOpGas: bigint;
                    validAfter: number;
                    validUntil: number;
                    prefund: bigint;
                    sigFailed: boolean;
                    paymasterContext: `0x${string}`;
                };
                senderInfo: {
                    stake: bigint;
                    unstakeDelaySec: bigint;
                };
                factoryInfo: {
                    stake: bigint;
                    unstakeDelaySec: bigint;
                };
                paymasterInfo: {
                    stake: bigint;
                    unstakeDelaySec: bigint;
                };
                aggregatorInfo: {
                    aggregator: `0x${string}`;
                    stakeInfo: {
                        stake: bigint;
                        unstakeDelaySec: bigint;
                    };
                };
            };
            errorName: "ValidationResultWithAggregation";
        };
        name: "ContractFunctionRevertedError";
    } | {
        name: "CallExecutionError";
        cause: {
            name: "RpcRequestError";
            cause: {
                data: {
                    args: {
                        aggregator: `0x${string}`;
                    };
                    errorName: "SignatureValidationFailed";
                } | {
                    args: {
                        sender: `0x${string}`;
                    };
                    errorName: "SenderAddressResult";
                } | {
                    args: {
                        opIndex: bigint;
                        reason: string;
                    };
                    errorName: "FailedOp";
                } | {
                    args: {
                        preOpGas: bigint;
                        paid: bigint;
                        validAfter: number;
                        validUntil: number;
                        targetSuccess: boolean;
                        targetResult: `0x${string}`;
                    };
                    errorName: "ExecutionResult";
                } | {
                    args: {
                        returnInfo: {
                            preOpGas: bigint;
                            validAfter: number;
                            validUntil: number;
                            prefund: bigint;
                            sigFailed: boolean;
                            paymasterContext: `0x${string}`;
                        };
                        senderInfo: {
                            stake: bigint;
                            unstakeDelaySec: bigint;
                        };
                        factoryInfo: {
                            stake: bigint;
                            unstakeDelaySec: bigint;
                        };
                        paymasterInfo: {
                            stake: bigint;
                            unstakeDelaySec: bigint;
                        };
                    };
                    errorName: "ValidationResult";
                } | {
                    args: {
                        returnInfo: {
                            preOpGas: bigint;
                            validAfter: number;
                            validUntil: number;
                            prefund: bigint;
                            sigFailed: boolean;
                            paymasterContext: `0x${string}`;
                        };
                        senderInfo: {
                            stake: bigint;
                            unstakeDelaySec: bigint;
                        };
                        factoryInfo: {
                            stake: bigint;
                            unstakeDelaySec: bigint;
                        };
                        paymasterInfo: {
                            stake: bigint;
                            unstakeDelaySec: bigint;
                        };
                        aggregatorInfo: {
                            aggregator: `0x${string}`;
                            stakeInfo: {
                                stake: bigint;
                                unstakeDelaySec: bigint;
                            };
                        };
                    };
                    errorName: "ValidationResultWithAggregation";
                };
            };
        };
    };
}, {
    name: "ContractFunctionExecutionError";
    cause: {
        data: {
            args: [string];
            errorName: "SignatureValidationFailed";
        } | {
            args: [string];
            errorName: "SenderAddressResult";
        } | {
            args: [bigint, string];
            errorName: "FailedOp";
        } | {
            args: [bigint, bigint, number, number, boolean, string];
            errorName: "ExecutionResult";
        } | {
            args: [{
                preOpGas: bigint;
                validAfter: number;
                validUntil: number;
                prefund: bigint;
                sigFailed: boolean;
                paymasterContext: string;
            }, {
                stake: bigint;
                unstakeDelaySec: bigint;
            }, {
                stake: bigint;
                unstakeDelaySec: bigint;
            }, {
                stake: bigint;
                unstakeDelaySec: bigint;
            }];
            errorName: "ValidationResult";
        } | {
            args: [{
                preOpGas: bigint;
                validAfter: number;
                validUntil: number;
                prefund: bigint;
                sigFailed: boolean;
                paymasterContext: string;
            }, {
                stake: bigint;
                unstakeDelaySec: bigint;
            }, {
                stake: bigint;
                unstakeDelaySec: bigint;
            }, {
                stake: bigint;
                unstakeDelaySec: bigint;
            }, {
                aggregator: string;
                stakeInfo: {
                    stake: bigint;
                    unstakeDelaySec: bigint;
                };
            }];
            errorName: "ValidationResultWithAggregation";
        };
        name: "ContractFunctionRevertedError";
    } | {
        name: "CallExecutionError";
        cause: {
            name: "RpcRequestError";
            cause: {
                data: string;
            };
        };
    };
}>, {
    args: {
        aggregator: `0x${string}`;
    };
    errorName: "SignatureValidationFailed";
} | {
    args: {
        sender: `0x${string}`;
    };
    errorName: "SenderAddressResult";
} | {
    args: {
        opIndex: bigint;
        reason: string;
    };
    errorName: "FailedOp";
} | {
    args: {
        preOpGas: bigint;
        paid: bigint;
        validAfter: number;
        validUntil: number;
        targetSuccess: boolean;
        targetResult: `0x${string}`;
    };
    errorName: "ExecutionResult";
} | {
    args: {
        returnInfo: {
            preOpGas: bigint;
            validAfter: number;
            validUntil: number;
            prefund: bigint;
            sigFailed: boolean;
            paymasterContext: `0x${string}`;
        };
        senderInfo: {
            stake: bigint;
            unstakeDelaySec: bigint;
        };
        factoryInfo: {
            stake: bigint;
            unstakeDelaySec: bigint;
        };
        paymasterInfo: {
            stake: bigint;
            unstakeDelaySec: bigint;
        };
    };
    errorName: "ValidationResult";
} | {
    args: {
        returnInfo: {
            preOpGas: bigint;
            validAfter: number;
            validUntil: number;
            prefund: bigint;
            sigFailed: boolean;
            paymasterContext: `0x${string}`;
        };
        senderInfo: {
            stake: bigint;
            unstakeDelaySec: bigint;
        };
        factoryInfo: {
            stake: bigint;
            unstakeDelaySec: bigint;
        };
        paymasterInfo: {
            stake: bigint;
            unstakeDelaySec: bigint;
        };
        aggregatorInfo: {
            aggregator: `0x${string}`;
            stakeInfo: {
                stake: bigint;
                unstakeDelaySec: bigint;
            };
        };
    };
    errorName: "ValidationResultWithAggregation";
}, {
    name: "ContractFunctionExecutionError";
    cause: {
        data: {
            args: [string];
            errorName: "SignatureValidationFailed";
        } | {
            args: [string];
            errorName: "SenderAddressResult";
        } | {
            args: [bigint, string];
            errorName: "FailedOp";
        } | {
            args: [bigint, bigint, number, number, boolean, string];
            errorName: "ExecutionResult";
        } | {
            args: [{
                preOpGas: bigint;
                validAfter: number;
                validUntil: number;
                prefund: bigint;
                sigFailed: boolean;
                paymasterContext: string;
            }, {
                stake: bigint;
                unstakeDelaySec: bigint;
            }, {
                stake: bigint;
                unstakeDelaySec: bigint;
            }, {
                stake: bigint;
                unstakeDelaySec: bigint;
            }];
            errorName: "ValidationResult";
        } | {
            args: [{
                preOpGas: bigint;
                validAfter: number;
                validUntil: number;
                prefund: bigint;
                sigFailed: boolean;
                paymasterContext: string;
            }, {
                stake: bigint;
                unstakeDelaySec: bigint;
            }, {
                stake: bigint;
                unstakeDelaySec: bigint;
            }, {
                stake: bigint;
                unstakeDelaySec: bigint;
            }, {
                aggregator: string;
                stakeInfo: {
                    stake: bigint;
                    unstakeDelaySec: bigint;
                };
            }];
            errorName: "ValidationResultWithAggregation";
        };
        name: "ContractFunctionRevertedError";
    } | {
        name: "CallExecutionError";
        cause: {
            name: "RpcRequestError";
            cause: {
                data: string;
            };
        };
    };
}>;
export type Address = z.infer<typeof addressSchema>;
export type HexData = z.infer<typeof hexDataSchema>;
export type ErrorCause = z.infer<typeof errorCauseSchema>;
export type ValidationResultWithAggregation = z.infer<typeof validationResultWithAggregationSchema>;
export type ValidationResultError = z.infer<typeof validationResultErrorSchema>;
export type ValidationResult = z.infer<typeof validationResultSchema>;
export type ExecutionResult = z.infer<typeof executionResultSchema>;
export type FailedOp = z.infer<typeof failedOpSchema>;
export type SignatureValidationFailed = z.infer<typeof signatureValidationFailedSchema>;
export type SenderAddressResult = z.infer<typeof senderAddressResultSchema>;
export type CreateGasEstimatorParams = {
    /**
     * The URL of the RPC (Remote Procedure Call) endpoint.
     */
    rpcUrl: string;
    /**
     * v0.6 entry point address to be passed if not deployed at 0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789
     * @defaultValue 0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789
     */
    entryPointAddress?: Address;
};
export type GasEstimatorParams = {
    /**
     * The public RPC client (viem or ethers) which is used to make calls to the blockchain
     */
    publicClient: IRPCClient;
    /**
     * v0.6 entry point address to be passed if not deployed at 0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789
     * @defaultValue 0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789
     */
    entryPointAddress?: Address;
};
export type UserOperation = {
    sender: Address;
    nonce: bigint;
    initCode: HexData;
    callData: HexData;
    callGasLimit: bigint;
    verificationGasLimit: bigint;
    preVerificationGas: bigint;
    maxFeePerGas: bigint;
    maxPriorityFeePerGas: bigint;
    paymasterAndData: HexData;
    signature: HexData;
};
export type EstimateUserOperationGasParams = {
    /**
     * A boolean value that needs to be passed false if the RPC provider does not support state overrides.
     * @defaultValue true
     */
    supportsEthCallStateOverride?: boolean;
    /**
     * A boolean values that needs to be passed false if the RPC provider is not consistent in responses when using
     * bytecode overrides
     * @defaultValue true
     */
    supportsEthCallByteCodeOverride?: boolean;
    /**
     * A full user operation
     */
    userOperation: UserOperation;
    /**
     * state override set that needs to be passed in eth_call to simulateHandleOp
     * (optional) = @defaultValue null
     */
    stateOverrideSet?: StateOverrideSet;
    /**
     * (optional)
     * baseFeePerGas required in case of Optimism Networks
     */
    baseFeePerGas?: bigint;
};
export type EstimateVerificationGasLimitParams = {
    /**
     * A boolean value that needs to be passed false if the RPC provider does not support state overrides.
     * @defaultValue true
     */
    supportsEthCallStateOverride?: boolean;
    /**
     * A boolean values that needs to be passed false if the RPC provider is not consistent in responses when using
     * bytecode overrides
     * @defaultValue true
     */
    supportsEthCallByteCodeOverride?: boolean;
    /**
     * A full user operation
     */
    userOperation: UserOperation;
    /**
     * state override set that needs to be passed in eth_call to simulateHandleOp
     * (optional) = @defaultValue null
     */
    stateOverrideSet?: StateOverrideSet;
    /**
     * (optional)
     * baseFeePerGas required in case of Optimism Networks
     */
    baseFeePerGas?: bigint;
};
export type EstimateCallGasLimitParams = {
    /**
     * A boolean value that needs to be passed false if the RPC provider does not support state overrides.
     * @defaultValue true
     */
    supportsEthCallStateOverride?: boolean;
    /**
     * A boolean values that needs to be passed false if the RPC provider is not consistent in responses when using
     * bytecode overrides
     * @defaultValue true
     */
    supportsEthCallByteCodeOverride?: boolean;
    /**
     * A full user operation
     */
    userOperation: UserOperation;
    /**
     * state override set that needs to be passed in eth_call to simulateHandleOp
     * (optional) = @defaultValue null
     */
    stateOverrideSet?: StateOverrideSet;
    /**
     * (optional)
     * baseFeePerGas required in case of Optimism Networks
     */
    baseFeePerGas?: bigint;
};
export type SimulateHandleOpParams = {
    /**
     * A full user operation
     */
    userOperation: UserOperation;
    /**
     * A boolean value that decides if to state override the bytecode at the entry point address
     */
    replacedEntryPoint: boolean;
    /**
     * target address to be passed in the simulateHandleOp call
     */
    targetAddress: Address;
    /**
     * target call data to be passed in the simulateHandleOp call
     */
    targetCallData: HexData;
    /**
     * A boolean value that needs to be passed false if the RPC provider does not support state overrides.
     * @defaultValue true
     */
    supportsEthCallStateOverride?: boolean;
    /**
     * A boolean values that needs to be passed false if the RPC provider is not consistent in responses when using
     * bytecode overrides
     * @defaultValue true
     */
    supportsEthCallByteCodeOverride?: boolean;
    /**
     * A state override that might be required while making eth_call to simulateHandleOp
     */
    stateOverrideSet?: StateOverrideSet;
};
export type EstimateVerificationGasParams = {
    /**
     * A full user operation
     */
    userOperation: UserOperation;
    /**
     * state override set that needs to be passed in eth_call to simulateHandleOp
     * (optional) = @defaultValue null
     */
    stateOverrideSet?: StateOverrideSet;
};
export type CalculatePreVerificationGasParams = {
    /**
     * A full user operation
     */
    userOperation: UserOperation;
    /**
     * (optional)
     * baseFeePerGas required in case of Optimism Networks
     */
    baseFeePerGas?: bigint;
};
export type SimulateHandleOp = {
    result: "failed" | "execution";
    data: string | ExecutionResult;
};
export type EstimateUserOperationGas = {
    callGasLimit: bigint;
    verificationGasLimit: bigint;
    preVerificationGas: bigint;
    validAfter: number;
    validUntil: number;
};
export type EstimateVerificationGasLimit = {
    verificationGasLimit: bigint;
    validAfter: number;
    validUntil: number;
};
export type EstimateCallGasLimit = {
    callGasLimit: bigint;
};
export type CalculatePreVerificationGas = {
    preVerificationGas: bigint;
};
export type StateOverrideSet = {
    [key: string]: {
        balance?: Hex;
        nonce?: Hex;
        code?: Hex;
        state?: object;
        stateDiff?: object;
    };
};
export declare const VALIDATION_ERRORS: {
    INVALID_USER_OP_FIELDS: number;
    SIMULATE_VALIDATION_FAILED: number;
    SIMULATE_PAYMASTER_VALIDATION_FAILED: number;
    OP_CODE_VALIDATION_FAILED: number;
    USER_OP_EXPIRES_SHORTLY: number;
    ENTITY_IS_THROTTLED: number;
    ENTITY_INSUFFICIENT_STAKE: number;
    UNSUPPORTED_AGGREGATOR: number;
    INVALID_WALLET_SIGNATURE: number;
    WALLET_TRANSACTION_REVERTED: number;
    UNAUTHORIZED_REQUEST: number;
    INTERNAL_SERVER_ERROR: number;
    BAD_REQUEST: number;
    USER_OP_HASH_NOT_FOUND: number;
    UNABLE_TO_PROCESS_USER_OP: number;
    METHOD_NOT_FOUND: number;
};
export type JSONRPCMethod = "eth_call";
export declare enum BlockNumberTag {
    LATEST = "latest",
    EARLIEST = "earliest",
    PENDING = "pending"
}
export type EthCallParams = [
    {
        to: `0x${string}`;
        data: `0x${string}`;
    },
    BlockNumberTag,
    StateOverrideSet
];
export type EthCallResponse = {
    id: number;
    jsonrpc: string;
    data: `0x${string}`;
} | {
    id: number;
    jsonrpc: string;
    error: {
        code: number;
        message: string;
        data: `0x${string}`;
    };
};
export type JSONRPCParams = EthCallParams;
export type JSONRPCResponse = EthCallResponse;
export type JSONRPCRequestParams = {
    method: JSONRPCMethod;
    params: JSONRPCParams;
};
export {};
//# sourceMappingURL=index.d.ts.map