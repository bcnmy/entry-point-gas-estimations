import { Hex, decodeErrorResult, getAddress } from "viem";
import { z } from "zod";
import { ENTRY_POINT_ABI } from "../abis";

const hexDataPattern = /^0x[0-9A-Fa-f]*$/;
const hexPattern = /^0x[0-9a-f]*$/;
const addressPattern = /^0x[0-9,a-f,A-F]{40}$/;

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

export type GasEstimatorParams = {
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
   * A full user operation
   */
  userOperation: UserOperation;
  /**
   * The initial lower bound that will be used in the first iteration of binary search for verificationGasLimit
   * (optional) - @defaultValue 0
   */
  initialVglLowerBound?: bigint;
  /**
   * The initial upper bound that will be used in the first iteration of binary search for verificationGasLimit
   * (optional) - @defaultValue 10_000_00
   */
  initialVglUpperBound?: bigint;
  /**
   * A rounding value which rounds all guesses and the final result to a multiple of that parameter
   * (optional) - @defaultValue 1
   */
  vglRounding?: bigint;
  /**
   *  If true, contract will calculate a gas value to use in binary search
   *  If false, contract makes a call to execute the callData and get the gas
   * (optional) - @defaultValue false
   */
  verificationExecutionAtMaxGas?: boolean;
  /**
   * The initial lower bound that will be used in the first interation of binary search for call gas limit
   * (optional) - @defaultValue 0
   */
  initalCglLowerBound?: bigint;
  /**
   * The initial upper bound that will be used in the first interation of binary search for call gas limit
   * (optional) - @defaultValue 30_000_000
   */
  initialCglUpperBound?: bigint;
  /**
   * A rounding value which rounds all guesses and the final result to a multiple of that parameter
   * (optional) - @defaultValue 1
   */
  cglRounding?: bigint;
  /**
   *  If true, contract will calculate a gas value to use in binary search
   *  If false, contract makes a call to execute the callData and get the gas
   * (optional) - @defaultValue false
   */
  callDataExecutionAtMaxGas?: boolean;
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
   * A full user operation
   */
  userOperation: UserOperation;
  /**
   * The initial lower bound that will be used in the first iteration of binary search for verificationGasLimit
   * (optional) - @defaultValue 0
   */
  initialVglLowerBound?: bigint;
  /**
   * The initial upper bound that will be used in the first iteration of binary search for verificationGasLimit
   * (optional) - @defaultValue 10_000_00
   */
  initialVglUpperBound?: bigint;
  /**
   * A rounding value which rounds all guesses and the final result to a multiple of that parameter
   * (optional) - @defaultValue 1
   */
  vglRounding?: bigint;
  /**
   *  If true, contract will calculate a gas value to use in binary search
   *  If false, contract makes a call to execute the callData and get the gas
   * (optional) - @defaultValue false
   */
  verificationExecutionAtMaxGas?: boolean;
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
   * A full user operation
   */
  userOperation: UserOperation;
  /**
   * The initial lower bound that will be used in the first iteration of binary search for verificationGasLimit
   * (optional) - @defaultValue 0
   */
  initalCglLowerBound?: bigint;
  /**
   * The initial upper bound that will be used in the first interation of binary search for call gas limit
   * (optional) - @defaultValue 30_000_000
   */
  initialCglUpperBound?: bigint;
  /**
   * A rounding value which rounds all guesses and the final result to a multiple of that parameter
   * (optional) - @defaultValue 1
   */
  cglRounding?: bigint;
  /**
   *  If true, contract will calculate a gas value to use in binary search
   *  If false, contract makes a call to execute the callData and get the gas
   * (optional) - @defaultValue false
   */
  callDataExecutionAtMaxGas?: boolean;
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
   * The initial lower bound that will be used in the first iteration of binary search for verificationGasLimit
   * (optional) - @defaultValue 0
   */
  initialVglLowerBound: bigint;
  /**
   * The initial upper bound that will be used in the first iteration of binary search for verificationGasLimit
   * (optional) - @defaultValue 10_000_00
   */
  initialVglUpperBound: bigint;
  /**
   * A rounding value which rounds all guesses and the final result to a multiple of that parameter
   * (optional) - @defaultValue 1
   */
  vglRounding: bigint;
  /**
   *  If true, contract will calculate a gas value to use in binary search
   *  If false, contract makes a call to execute the callData and get the gas
   * (optional) - @defaultValue false
   */
  verificationExecutionAtMaxGas: boolean;
  /**
   * state override set that needs to be passed in eth_call to simulateHandleOp
   * (optional) = @defaultValue null
   */
  stateOverrideSet?: StateOverrideSet;
}

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
