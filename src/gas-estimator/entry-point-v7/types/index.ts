import { Hash, Hex, decodeErrorResult, getAddress } from "viem";
import { z } from "zod";
import { IRPCClient } from "../interface";
import { ENTRY_POINT_ABI } from "../abis";

const hexDataPattern = /^0x[0-9A-Fa-f]*$/;
const hexPattern = /^0x[0-9a-f]*$/;
const addressPattern = /^0x[0-9,a-f,A-F]{40}$/;
export const hexData32Pattern = /^0x([0-9a-fA-F][0-9a-fA-F]){0,32}$/;

const addressSchema = z
  .string()
  .regex(addressPattern, { message: "not a valid hex address" })
  .transform((val: any) => getAddress(val));

export const hexNumberSchema = z
  .string()
  .regex(hexDataPattern)
  .or(z.number())
  .or(z.bigint())
  .transform((val: any) => BigInt(val));

export const hexDataSchema = z
  .string()
  .regex(hexDataPattern, { message: "not valid hex data" })
  .transform((val: any) => val.toLowerCase() as Hex);

export const executionResultSchema = z
  .tuple([
    z.bigint(),
    z.bigint(),
    z.number(),
    z.number(),
    z.boolean(),
    z.string().regex(hexPattern),
  ])
  .transform((val) => ({
    preOpGas: val[0],
    paid: val[1],
    validAfter: val[2],
    validUntil: val[3],
    targetSuccess: val[4],
    targetResult: val[5] as HexData,
  }));

export const signatureValidationFailedSchema = z
  .tuple([addressSchema])
  .transform((val) => ({ aggregator: val[0] }));

export const signatureValidationFailedErrorSchema = z.object({
  args: signatureValidationFailedSchema,
  errorName: z.literal("SignatureValidationFailed"),
});

export const senderAddressResultSchema = z
  .tuple([addressSchema])
  .transform((val) => ({
    sender: val[0],
  }));

export const senderAddressResultErrorSchema = z.object({
  args: senderAddressResultSchema,
  errorName: z.literal("SenderAddressResult"),
});

export const failedOpSchema = z
  .tuple([z.bigint(), z.string()])
  .transform((val) => ({ opIndex: val[0], reason: val[1] }));

export const failedOpErrorSchema = z.object({
  args: failedOpSchema,
  errorName: z.literal("FailedOp"),
});

export const executionResultErrorSchema = z.object({
  args: executionResultSchema,
  errorName: z.literal("ExecutionResult"),
});

const stakeInfoSchema = z.object({
  stake: z.bigint(),
  unstakeDelaySec: z.bigint(),
});

export const validationResultSchema = z
  .tuple([
    z.object({
      preOpGas: z.bigint(),
      prefund: z.bigint(),
      sigFailed: z.boolean(),
      validAfter: z.number(),
      validUntil: z.number(),
      paymasterContext: z
        .string()
        .regex(hexPattern)
        .transform((val) => val as HexData),
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

export const validationResultErrorSchema = z.object({
  args: validationResultSchema,
  errorName: z.literal("ValidationResult"),
});

export const validationResultWithAggregationSchema = z
  .tuple([
    z.object({
      preOpGas: z.bigint(),
      prefund: z.bigint(),
      sigFailed: z.boolean(),
      validAfter: z.number(),
      validUntil: z.number(),
      paymasterContext: z
        .string()
        .regex(hexPattern)
        .transform((val) => val as HexData),
    }),
    stakeInfoSchema,
    stakeInfoSchema,
    stakeInfoSchema,
    z.object({
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

export const validationResultWithAggregationErrorSchema = z.object({
  args: validationResultWithAggregationSchema,
  errorName: z.literal("ValidationResultWithAggregation"),
});

export const entryPointErrorsSchema = z.discriminatedUnion("errorName", [
  validationResultErrorSchema,
  executionResultErrorSchema,
  failedOpErrorSchema,
  senderAddressResultErrorSchema,
  signatureValidationFailedErrorSchema,
  validationResultWithAggregationErrorSchema,
]);

export const errorCauseSchema = z.object({
  name: z.literal("ContractFunctionRevertedError"),
  data: entryPointErrorsSchema,
});

export const vmExecutionError = z.object({
  name: z.literal("CallExecutionError"),
  cause: z.object({
    name: z.literal("RpcRequestError"),
    cause: z.object({
      data: z.string().transform((val) => {
        const errorHexData = val.split("Reverted ")[1] as HexData;
        if (errorHexData === "0x") {
          throw new Error(
            `User operation reverted on-chain with unknown error (some chains don't return revert reason) ${val}`,
          );
        }
        const errorResult = decodeErrorResult({
          abi: ENTRY_POINT_ABI,
          data: errorHexData,
        });
        return entryPointErrorsSchema.parse(errorResult);
      }),
    }),
  }),
});

export const entryPointExecutionErrorSchema = z
  .object({
    name: z.literal("ContractFunctionExecutionError"),
    cause: z.discriminatedUnion("name", [errorCauseSchema, vmExecutionError]),
  })
  .transform((val) => {
    if (val.cause.name === "CallExecutionError") {
      return val.cause.cause.cause.data;
    }
    return val.cause.data;
  });

export type Address = z.infer<typeof addressSchema>;
export type HexData = z.infer<typeof hexDataSchema>;
export type ErrorCause = z.infer<typeof errorCauseSchema>;
export type ValidationResultWithAggregation = z.infer<
  typeof validationResultWithAggregationSchema
>;
export type ValidationResultError = z.infer<typeof validationResultErrorSchema>;
export type ValidationResult = z.infer<typeof validationResultSchema>;
export type ExecutionResult = z.infer<typeof executionResultSchema>;
export type FailedOp = z.infer<typeof failedOpSchema>;
export type SignatureValidationFailed = z.infer<
  typeof signatureValidationFailedSchema
>;
export type SenderAddressResult = z.infer<typeof senderAddressResultSchema>;

const hexData32Schema = z
  .string()
  .regex(hexData32Pattern, { message: "not valid 32-byte hex data" })
  .transform((val) => val as Hash);

const packerUserOperationSchema = z
  .object({
    sender: addressSchema,
    nonce: hexNumberSchema,
    initCode: hexDataSchema,
    callData: hexDataSchema,
    accountGasLimits: hexData32Schema,
    preVerificationGas: hexNumberSchema,
    gasFees: hexData32Schema,
    paymasterAndData: hexDataSchema,
    signature: hexDataSchema,
  })
  .strict()
  .transform((val) => val);
export type PackedUserOperation = z.infer<typeof packerUserOperationSchema>;

export type CreateGasEstimatorParams = {
  /**
   * The URL of the RPC (Remote Procedure Call) endpoint.
   */
  rpcUrl: string;
  /**
   * v0.7 entry point address to be passed if not deployed at 0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789
   * @defaultValue 0x0000000071727De22E5E9d8BAf0edAc6f37da032
   */
  entryPointAddress?: Address;
  /**
   * chainId of the network on which gas limits are being estimated
   */
  chainId: number;
};

export type GasEstimatorParams = {
  /**
   * The public RPC client (viem or ethers) which is used to make calls to the blockchain
   */
  publicClient: IRPCClient;
  /**
   * v0.7 entry point address to be passed if not deployed at 0x0000000071727De22E5E9d8BAf0edAc6f37da032
   * @defaultValue 0x0000000071727De22E5E9d8BAf0edAc6f37da032
   */
  entryPointAddress?: Address;
  /**
   * chainId of the network on which gas limits are being estimated
   */
  chainId: number;
};

export type UserOperation = {
  sender: Address;
  nonce: bigint;
  factory: HexData;
  factoryData: HexData;
  callData: HexData;
  callGasLimit: bigint;
  verificationGasLimit: bigint;
  preVerificationGas: bigint;
  maxFeePerGas: bigint;
  maxPriorityFeePerGas: bigint;
  paymaster: HexData;
  paymasterData: HexData;
  paymasterVerificationGasLimit: bigint;
  paymasterPostOpGasLimit: bigint;
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
  paymasterVerificationGasLimit: bigint;
  paymasterPostOpGasLimit: bigint;
};

export type EstimateVerificationGasLimit = {
  verificationGasLimit: bigint;
};

export type EstimateCallGasLimit = {
  callGasLimit: bigint;
};

export type EstimatePaymasterGasLimits = {
  paymasterVerificationGasLimit: bigint;
  paymasterPostOpGasLimit: bigint;
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

export const VALIDATION_ERRORS = {
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

export type JSONRPCMethod = "eth_call";

export enum BlockNumberTag {
  LATEST = "latest",
  EARLIEST = "earliest",
  PENDING = "pending",
}

export type EthCallParams = [
  {
    to: `0x${string}`;
    data: `0x${string}`;
  },
  BlockNumberTag,
  StateOverrideSet,
];

export type EthCallResponse =
  | {
      id: number;
      jsonrpc: string;
      data: `0x${string}`;
    }
  | {
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

export const targetCallResultSchema = z.object({
  gasUsed: z.bigint(),
  success: z.boolean(),
  returnData: z
    .string()
    .regex(hexPattern)
    .transform((val) => val as HexData),
});

export type TargetCallResult = z.infer<typeof targetCallResultSchema>;

export type SimulateHandleOpResult<
  TypeResult extends "failed" | "execution" = "failed" | "execution",
> = {
  result: TypeResult;
  data: TypeResult extends "failed"
    ? string
    : {
        callDataResult?: TargetCallResult;
        executionResult: ExecutionResult;
      };
  code?: TypeResult extends "failed" ? number : undefined;
};

export enum ExecutionErrors {
  UserOperationReverted = -32521,
}

export type SimulateHandleOpParams = {
  userOperation: UserOperation;
  supportsEthCallStateOverride: boolean;
  supportsEthCallByteCodeOverride: boolean;
  stateOverrideSet?: StateOverrideSet;
};

export type EstimateVerificationGasAndCallGasLimitsParams = {
  userOperation: UserOperation;
  executionResult: ExecutionResult;
  callDataResult: TargetCallResult;
};

export type EstimateVerificationGasAndCallGasLimitsResponse = {
  callGasLimit: bigint;
  verificationGasLimit: bigint;
};
