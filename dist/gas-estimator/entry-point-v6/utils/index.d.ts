import { ExecutionResult, UserOperation } from "../types";
export declare class RpcError extends Error {
    code?: number;
    data?: any;
    constructor(msg: string, code?: number, data?: any);
}
export declare function tooLow(error: string): boolean;
export declare function getCallGasEstimationSimulatorResult(data: ExecutionResult): bigint | null;
export declare function getVerificationGasEstimationSimulatorResult(data: `0x${string}`): {
    verificationGasLimit: bigint;
    validAfter: number;
    validUntil: number;
} | null;
export declare function handleFailedOp(revertReason: string): void;
export declare function getSimulationResult(errorResult: unknown, simulationType: "validation" | "execution"): {
    preOpGas: bigint;
    paid: bigint;
    validAfter: number;
    validUntil: number;
    targetSuccess: boolean;
    targetResult: `0x${string}`;
} | {
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
} | {
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
export declare function packUserOp(userOp: UserOperation, forSignature?: boolean): string;
//# sourceMappingURL=index.d.ts.map