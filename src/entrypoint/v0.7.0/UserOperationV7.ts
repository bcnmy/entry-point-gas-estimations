import {
  type Address,
  type Hex,
  concat,
  encodeAbiParameters,
  pad,
  toHex
} from "viem"
import z from "zod"
import {
  addressSchema,
  hexData32Schema,
  hexDataSchema,
  hexNumberSchema
} from "../../shared/types"

/**
 * Schema for validating and transforming UserOperation objects for EntryPoint v0.7.0.
 * Enforces correct types and transforms string values to their appropriate types.
 *
 * @example
 * ```typescript
 * const userOp = userOperationV7Schema.parse({
 *   sender: "0x123...",
 *   nonce: "0x1",
 *   factory: "0x456...",
 *   factoryData: "0x789...",
 *   callData: "0xabc...",
 *   callGasLimit: "1000000",
 *   verificationGasLimit: "1000000",
 *   preVerificationGas: "21000",
 *   maxFeePerGas: "1000000000",
 *   maxPriorityFeePerGas: "1000000000",
 *   paymaster: "0xdef...",
 *   paymasterData: "0x123...",
 *   signature: "0x456..."
 * });
 * ```
 */
export const userOperationV7Schema = z
  .object({
    /** The sender account address */
    sender: z.string(),
    /** Account nonce */
    nonce: z.coerce.bigint(),
    /** Factory contract address for account deployment */
    factory: z.string().optional(),
    /** Factory initialization data */
    factoryData: z.string().optional(),
    /** The calldata to execute on the sender account */
    callData: z.string(),
    /** Gas limit for the main execution call */
    callGasLimit: z.coerce.bigint(),
    /** Gas limit for the verification phase */
    verificationGasLimit: z.coerce.bigint(),
    /** Gas overhead for pre-verification operations */
    preVerificationGas: z.coerce.bigint(),
    /** Maximum total fee per gas unit */
    maxFeePerGas: z.coerce.bigint(),
    /** Maximum priority fee per gas unit */
    maxPriorityFeePerGas: z.coerce.bigint(),
    /** Paymaster contract address */
    paymaster: z.string().optional(),
    /** Additional data for the paymaster */
    paymasterData: z.string().optional(),
    /** Gas limit for paymaster verification */
    paymasterVerificationGasLimit: z.coerce.bigint().optional(),
    /** Gas limit for paymaster post-operation execution */
    paymasterPostOpGasLimit: z.coerce.bigint().optional(),
    /** Signature authorizing the operation */
    signature: z.string()
  })
  .transform((val) => ({
    ...val,
    sender: val.sender as Address,
    factory: val.factory as Hex,
    factoryData: val.factoryData as Hex,
    callData: val.callData as Hex,
    paymaster: val.paymaster as Hex,
    paymasterData: val.paymasterData as Hex,
    signature: val.signature as Hex
  }))

export type UserOperationV7 = z.infer<typeof userOperationV7Schema>

/**
 * Schema for a packed user operation, which is a more gas-efficient format
 * used by the EntryPoint contract.
 *
 * @example
 * ```typescript
 * const packedOp = packedUserOperationSchema.parse({
 *   sender: "0x123...",
 *   nonce: "0x1",
 *   initCode: "0x",
 *   callData: "0x123...",
 *   accountGasLimits: "0x...",
 *   preVerificationGas: "0x1",
 *   gasFees: "0x...",
 *   paymasterAndData: "0x",
 *   signature: "0x..."
 * });
 * ```
 */
export const packedUserOperationSchema = z
  .object({
    sender: addressSchema,
    nonce: hexNumberSchema,
    initCode: hexDataSchema,
    callData: hexDataSchema,
    accountGasLimits: hexData32Schema,
    preVerificationGas: hexNumberSchema,
    gasFees: hexData32Schema,
    paymasterAndData: hexDataSchema,
    signature: hexDataSchema
  })
  .strict()
  .transform((val) => val)

export type PackedUserOperation = z.infer<typeof packedUserOperationSchema>

/**
 * Converts an unpacked UserOperation to its packed format.
 *
 * @param unpackedUserOperation - The unpacked user operation to convert
 * @returns The packed user operation format
 *
 * @example
 * ```typescript
 * const packed = toPackedUserOperation({
 *   sender: "0x123...",
 *   nonce: 1n,
 *   // ... other UserOperation fields
 * });
 * ```
 */
export function toPackedUserOperation(
  unpackedUserOperation: UserOperationV7
): PackedUserOperation {
  return {
    sender: unpackedUserOperation.sender,
    nonce: unpackedUserOperation.nonce,
    initCode: getInitCode(unpackedUserOperation),
    callData: unpackedUserOperation.callData,
    accountGasLimits: getAccountGasLimits(unpackedUserOperation),
    preVerificationGas: unpackedUserOperation.preVerificationGas,
    gasFees: getGasLimits(unpackedUserOperation),
    paymasterAndData: getPaymasterAndData(unpackedUserOperation),
    signature: unpackedUserOperation.signature
  }
}

/**
 * Gets the initialization code for account deployment.
 *
 * @param unpackedUserOperation - The unpacked user operation
 * @returns The initialization code or "0x" if no factory is specified
 *
 * @example
 * ```typescript
 * const initCode = getInitCode({
 *   factory: "0x123...",
 *   factoryData: "0x456..."
 * });
 * ```
 */
export function getInitCode(unpackedUserOperation: UserOperationV7) {
  return unpackedUserOperation.factory
    ? concat([
        unpackedUserOperation.factory,
        unpackedUserOperation.factoryData || ("0x" as Hex)
      ])
    : "0x"
}

/**
 * Gets the packed gas limits for account verification and execution.
 *
 * @param unpackedUserOperation - The unpacked user operation
 * @returns The packed gas limits as a 32-byte hex string
 *
 * @example
 * ```typescript
 * const gasLimits = getAccountGasLimits({
 *   verificationGasLimit: 1000000n,
 *   callGasLimit: 500000n
 * });
 * ```
 */
export function getAccountGasLimits(unpackedUserOperation: UserOperationV7) {
  return concat([
    pad(toHex(unpackedUserOperation.verificationGasLimit), {
      size: 16
    }),
    pad(toHex(unpackedUserOperation.callGasLimit), { size: 16 })
  ])
}

/**
 * Gets the packed gas fee parameters.
 *
 * @param unpackedUserOperation - The unpacked user operation
 * @returns The packed gas fees as a 32-byte hex string
 *
 * @example
 * ```typescript
 * const gasFees = getGasLimits({
 *   maxPriorityFeePerGas: 1000000000n,
 *   maxFeePerGas: 2000000000n
 * });
 * ```
 */
export function getGasLimits(unpackedUserOperation: UserOperationV7) {
  return concat([
    pad(toHex(unpackedUserOperation.maxPriorityFeePerGas), {
      size: 16
    }),
    pad(toHex(unpackedUserOperation.maxFeePerGas), { size: 16 })
  ])
}

/**
 * Gets the packed paymaster data including verification and post-op gas limits.
 *
 * @param unpackedUserOperation - The unpacked user operation
 * @returns The packed paymaster data or "0x" if no paymaster is specified
 *
 * @example
 * ```typescript
 * const paymasterData = getPaymasterAndData({
 *   paymaster: "0x123...",
 *   paymasterVerificationGasLimit: 100000n,
 *   paymasterPostOpGasLimit: 50000n,
 *   paymasterData: "0x456..."
 * });
 * ```
 */
export function getPaymasterAndData(unpackedUserOperation: UserOperationV7) {
  return unpackedUserOperation.paymaster
    ? concat([
        unpackedUserOperation.paymaster,
        pad(toHex(unpackedUserOperation.paymasterVerificationGasLimit || 0n), {
          size: 16
        }),
        pad(toHex(unpackedUserOperation.paymasterPostOpGasLimit || 0n), {
          size: 16
        }),
        unpackedUserOperation.paymasterData || ("0x" as Hex)
      ])
    : "0x"
}

/**
 * Packs a UserOperation into the format expected by the EntryPoint contract.
 *
 * @param op - The packed user operation to encode
 * @returns The ABI-encoded packed operation
 *
 * @example
 * ```typescript
 * const packed = packUserOpV7({
 *   sender: "0x123...",
 *   nonce: "0x1",
 *   // ... other PackedUserOperation fields
 * });
 * ```
 */
export function packUserOpV7(op: PackedUserOperation): Hex {
  return encodeAbiParameters(
    [
      {
        internalType: "address",
        name: "sender",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "nonce",
        type: "uint256"
      },
      {
        internalType: "bytes",
        name: "initCode",
        type: "bytes"
      },
      {
        internalType: "bytes",
        name: "callData",
        type: "bytes"
      },
      {
        internalType: "uint256",
        name: "accountGasLimits",
        type: "bytes32"
      },
      {
        internalType: "uint256",
        name: "preVerificationGas",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "gasFees",
        type: "bytes32"
      },
      {
        internalType: "bytes",
        name: "paymasterAndData",
        type: "bytes"
      },
      {
        internalType: "bytes",
        name: "signature",
        type: "bytes"
      }
    ],
    [
      op.sender,
      op.nonce,
      op.initCode,
      op.callData,
      op.accountGasLimits,
      op.preVerificationGas,
      op.gasFees,
      op.paymasterAndData,
      op.signature
    ]
  )
}
