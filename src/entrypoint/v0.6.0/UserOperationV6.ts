import {
  type Address,
  type Hex,
  encodeAbiParameters,
  keccak256,
  parseAbiParameters
} from "viem"
import z from "zod"

/**
 * Zod schema for validating and transforming UserOperation objects for EntryPoint v0.6.0.
 * Enforces correct types and transforms string values to their appropriate types.
 *
 * @example
 * ```typescript
 * const userOp = userOperationV6Schema.parse({
 *   sender: "0x123...",
 *   nonce: "0x1",
 *   initCode: "0x",
 *   callData: "0x123...",
 *   callGasLimit: "1000000",
 *   verificationGasLimit: "1000000",
 *   preVerificationGas: "21000",
 *   maxFeePerGas: "1000000000",
 *   maxPriorityFeePerGas: "1000000000",
 *   paymasterAndData: "0x",
 *   signature: "0x123..."
 * });
 * ```
 */
export const userOperationV6Schema = z
  .object({
    /** The sender account address */
    sender: z.string(),
    /** Account nonce */
    nonce: z.coerce.bigint(),
    /** Contract initialization code for account deployment */
    initCode: z.string(),
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
    /** Paymaster contract address and additional data */
    paymasterAndData: z.string(),
    /** Signature authorizing the operation */
    signature: z.string()
  })
  .transform((val) => ({
    ...val,
    sender: val.sender as Address,
    initCode: val.initCode as Hex,
    callData: val.callData as Hex,
    paymasterAndData: val.paymasterAndData as Hex,
    signature: val.signature as Hex
  }))

export type UserOperationV6 = z.infer<typeof userOperationV6Schema>

/**
 * Packs a UserOperation into an EIP-712 compatible format for signing or verification.
 *
 * @param userOp - The user operation to pack
 * @param forSignature - If true, returns the packed data for signing (excludes the signature field)
 * @returns The packed user operation as a hex string
 *
 * @example
 * ```typescript
 * // Pack for signing
 * const packedForSign = packUserOpV6(userOp, true);
 *
 * // Pack with signature included
 * const packedWithSig = packUserOpV6(userOp, false);
 * ```
 */
export function packUserOpV6(
  userOp: UserOperationV6,
  forSignature = true
): string {
  const userOpType = {
    components: [
      {
        type: "address",
        name: "sender"
      },
      {
        type: "uint256",
        name: "nonce"
      },
      {
        type: "bytes",
        name: "initCode"
      },
      {
        type: "bytes",
        name: "callData"
      },
      {
        type: "uint256",
        name: "callGasLimit"
      },
      {
        type: "uint256",
        name: "verificationGasLimit"
      },
      {
        type: "uint256",
        name: "preVerificationGas"
      },
      {
        type: "uint256",
        name: "maxFeePerGas"
      },
      {
        type: "uint256",
        name: "maxPriorityFeePerGas"
      },
      {
        type: "bytes",
        name: "paymasterAndData"
      },
      {
        type: "bytes",
        name: "signature"
      }
    ],
    name: "userOp",
    type: "tuple"
  }

  if (forSignature) {
    // lighter signature scheme (must match UserOperation#pack):
    // do encode a zero-length signature, but strip afterwards the appended zero-length value
    let encoded = encodeAbiParameters(
      [userOpType as any],
      [
        {
          ...userOp,
          signature: "0x"
        }
      ]
    )

    encoded = `0x${encoded.slice(66, encoded.length - 64)}`
    return encoded
  }

  const typeValues = (userOpType as any).components.map(
    (c: { name: keyof typeof userOp; type: string }) => ({
      type: c.type,
      val: userOp[c.name]
    })
  )

  return encode(typeValues, forSignature)
}

/**
 * Internal helper function to encode user operation data.
 *
 * @param typeValues - Array of type and value pairs to encode
 * @param forSignature - If true, hashes bytes values for signing
 * @returns The encoded data as a hex string
 *
 * @internal
 */
function encode(
  typeValues: Array<{ type: string; val: any }>,
  forSignature: boolean
): string {
  const types = parseAbiParameters(
    typeValues
      .map((typeValue) =>
        typeValue.type === "bytes" && forSignature ? "bytes32" : typeValue.type
      )
      .toString()
  )
  const values = typeValues.map((typeValue: any) =>
    typeValue.type === "bytes" && forSignature
      ? keccak256(typeValue.val)
      : typeValue.val
  )
  return encodeAbiParameters(types, values)
}
