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

export const userOperationV7Schema = z
  .object({
    sender: z.string(),
    nonce: z.coerce.bigint(),
    factory: z.string().optional(),
    factoryData: z.string().optional(),
    callData: z.string(),
    callGasLimit: z.coerce.bigint(),
    verificationGasLimit: z.coerce.bigint(),
    preVerificationGas: z.coerce.bigint(),
    maxFeePerGas: z.coerce.bigint(),
    maxPriorityFeePerGas: z.coerce.bigint(),
    paymaster: z.string().optional(),
    paymasterData: z.string().optional(),
    paymasterVerificationGasLimit: z.coerce.bigint().optional(),
    paymasterPostOpGasLimit: z.coerce.bigint().optional(),
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

const packedUserOperationSchema = z
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

export function getInitCode(unpackedUserOperation: UserOperationV7) {
  return unpackedUserOperation.factory
    ? concat([
        unpackedUserOperation.factory,
        unpackedUserOperation.factoryData || ("0x" as Hex)
      ])
    : "0x"
}

export function getAccountGasLimits(unpackedUserOperation: UserOperationV7) {
  return concat([
    pad(toHex(unpackedUserOperation.verificationGasLimit), {
      size: 16
    }),
    pad(toHex(unpackedUserOperation.callGasLimit), { size: 16 })
  ])
}

export function getGasLimits(unpackedUserOperation: UserOperationV7) {
  return concat([
    pad(toHex(unpackedUserOperation.maxPriorityFeePerGas), {
      size: 16
    }),
    pad(toHex(unpackedUserOperation.maxFeePerGas), { size: 16 })
  ])
}

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
      op.nonce, // need non zero bytes to get better estimations for preVerificationGas
      op.initCode,
      op.callData,
      op.accountGasLimits, // need non zero bytes to get better estimations for preVerificationGas
      op.preVerificationGas, // need non zero bytes to get better estimations for preVerificationGas
      op.gasFees, // need non zero bytes to get better estimations for preVerificationGas
      op.paymasterAndData,
      op.signature
    ]
  )
}
