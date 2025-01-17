import {
  type Address,
  type Hex,
  encodeAbiParameters,
  keccak256,
  parseAbiParameters
} from "viem"
import z from "zod"

export const userOperationV6Schema = z
  .object({
    sender: z.string(),
    nonce: z.coerce.bigint(),
    initCode: z.string(),
    callData: z.string(),
    callGasLimit: z.coerce.bigint(),
    verificationGasLimit: z.coerce.bigint(),
    preVerificationGas: z.coerce.bigint(),
    maxFeePerGas: z.coerce.bigint(),
    maxPriorityFeePerGas: z.coerce.bigint(),
    paymasterAndData: z.string(),
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
