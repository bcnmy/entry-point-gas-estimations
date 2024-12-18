import {
  Address,
  encodeAbiParameters,
  Hex,
  keccak256,
  parseAbiParameters,
} from "viem";

export type UserOperationV6 = {
  sender: Address;
  nonce: bigint;
  initCode: Hex;
  callData: Hex;
  callGasLimit: bigint;
  verificationGasLimit: bigint;
  preVerificationGas: bigint;
  maxFeePerGas: bigint;
  maxPriorityFeePerGas: bigint;
  paymasterAndData: Hex;
  signature: Hex;
};

export function isUserOperationV6(userOp: any): userOp is UserOperationV6 {
  return (
    typeof userOp === "object" &&
    userOp !== null &&
    "sender" in userOp &&
    "nonce" in userOp &&
    "initCode" in userOp &&
    "callData" in userOp &&
    "callGasLimit" in userOp &&
    "verificationGasLimit" in userOp &&
    "preVerificationGas" in userOp &&
    "maxFeePerGas" in userOp &&
    "maxPriorityFeePerGas" in userOp &&
    "paymasterAndData" in userOp &&
    "signature" in userOp
  );
}

export function packUserOpV6(
  userOp: UserOperationV6,
  forSignature = true
): string {
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
    let encoded = encodeAbiParameters(
      [userOpType as any],
      [
        {
          ...userOp,
          signature: "0x",
        },
      ]
    );

    encoded = `0x${encoded.slice(66, encoded.length - 64)}`;
    return encoded;
  }

  const typevalues = (userOpType as any).components.map(
    (c: { name: keyof typeof userOp; type: string }) => ({
      type: c.type,
      val: userOp[c.name],
    })
  );

  return encode(typevalues, forSignature);
}

function encode(
  typevalues: Array<{ type: string; val: any }>,
  forSignature: boolean
): string {
  const types = parseAbiParameters(
    typevalues
      .map((typevalue) =>
        typevalue.type === "bytes" && forSignature ? "bytes32" : typevalue.type
      )
      .toString()
  );
  const values = typevalues.map((typevalue: any) =>
    typevalue.type === "bytes" && forSignature
      ? keccak256(typevalue.val)
      : typevalue.val
  );
  return encodeAbiParameters(types, values);
}
