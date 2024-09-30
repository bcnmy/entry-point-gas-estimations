import {
  concat,
  decodeAbiParameters,
  encodeAbiParameters,
  Hex,
  pad,
  toHex,
} from "viem";
import {
  PackedUserOperation,
  UserOperation,
  VALIDATION_ERRORS,
} from "../types";

export class RpcError extends Error {
  code?: number;

  data?: any;

  // error codes from: https://eips.ethereum.org/EIPS/eip-1474
  constructor(msg: string, code?: number, data: any = undefined) {
    super(msg);

    this.code = code;
    this.data = data;
  }
}

const panicCodes: { [key: number]: string } = {
  // from https://docs.soliditylang.org/en/v0.8.0/control-structures.html
  1: "assert(false)",
  17: "arithmetic overflow/underflow",
  18: "divide by zero",
  33: "invalid enum value",
  34: "storage byte array that is incorrectly encoded",
  49: ".pop() on an empty array.",
  50: "array sout-of-bounds or negative index",
  65: "memory overflow",
  81: "zero-initialized variable of internal function type",
};

export function toPackedUserOperation(
  unpackedUserOperation: UserOperation,
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
    signature: unpackedUserOperation.signature,
  };
}

export function getInitCode(unpackedUserOperation: UserOperation) {
  return unpackedUserOperation.factory
    ? concat([
        unpackedUserOperation.factory,
        unpackedUserOperation.factoryData || ("0x" as Hex),
      ])
    : "0x";
}

export function getAccountGasLimits(unpackedUserOperation: UserOperation) {
  return concat([
    pad(toHex(unpackedUserOperation.verificationGasLimit), {
      size: 16,
    }),
    pad(toHex(unpackedUserOperation.callGasLimit), { size: 16 }),
  ]);
}

export function getGasLimits(unpackedUserOperation: UserOperation) {
  return concat([
    pad(toHex(unpackedUserOperation.maxPriorityFeePerGas), {
      size: 16,
    }),
    pad(toHex(unpackedUserOperation.maxFeePerGas), { size: 16 }),
  ]);
}

export function getPaymasterAndData(unpackedUserOperation: UserOperation) {
  return unpackedUserOperation.paymaster
    ? concat([
        unpackedUserOperation.paymaster,
        pad(toHex(unpackedUserOperation.paymasterVerificationGasLimit || 0n), {
          size: 16,
        }),
        pad(toHex(unpackedUserOperation.paymasterPostOpGasLimit || 0n), {
          size: 16,
        }),
        unpackedUserOperation.paymasterData || ("0x" as Hex),
      ])
    : "0x";
}

export function parseFailedOpWithRevert(data: Hex) {
  const methodSig = data.slice(0, 10);
  const dataParams = `0x${data.slice(10)}` as Hex;

  if (methodSig === "0x08c379a0") {
    const [err] = decodeAbiParameters(
      [
        {
          name: "err",
          type: "string",
        },
      ],
      dataParams,
    );

    return err;
  }

  if (methodSig === "0x4e487b71") {
    const [code] = decodeAbiParameters(
      [
        {
          name: "err",
          type: "uint256",
        },
      ],
      dataParams,
    );

    return panicCodes[Number(code)] ?? `${code}`;
  }

  return data;
}

export function packUserOp(op: PackedUserOperation): `0x${string}` {
  return encodeAbiParameters(
    [
      {
        internalType: "address",
        name: "sender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "nonce",
        type: "uint256",
      },
      {
        internalType: "bytes",
        name: "initCode",
        type: "bytes",
      },
      {
        internalType: "bytes",
        name: "callData",
        type: "bytes",
      },
      {
        internalType: "uint256",
        name: "accountGasLimits",
        type: "bytes32",
      },
      {
        internalType: "uint256",
        name: "preVerificationGas",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "gasFees",
        type: "bytes32",
      },
      {
        internalType: "bytes",
        name: "paymasterAndData",
        type: "bytes",
      },
      {
        internalType: "bytes",
        name: "signature",
        type: "bytes",
      },
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
      op.signature,
    ],
  );
}

export function handleFailedOp(revertReason: string) {
  revertReason = removeSpecialCharacters(revertReason);
  if (revertReason.includes("AA1") || revertReason.includes("AA2")) {
    throw new RpcError(
      revertReason,
      VALIDATION_ERRORS.SIMULATE_VALIDATION_FAILED,
    );
  } else if (revertReason.includes("AA3")) {
    throw new RpcError(
      revertReason,
      VALIDATION_ERRORS.SIMULATE_PAYMASTER_VALIDATION_FAILED,
    );
  } else if (revertReason.includes("AA9")) {
    throw new RpcError(
      revertReason,
      VALIDATION_ERRORS.WALLET_TRANSACTION_REVERTED,
    );
  } else if (revertReason.includes("AA4")) {
    throw new RpcError(
      revertReason,
      VALIDATION_ERRORS.SIMULATE_VALIDATION_FAILED,
    );
  } else if (revertReason.includes("AA")) {
    throw new RpcError(
      revertReason,
      VALIDATION_ERRORS.SIMULATE_VALIDATION_FAILED,
    );
  }
  throw new RpcError(
    "UserOperation reverted during execution phase",
    VALIDATION_ERRORS.SIMULATE_VALIDATION_FAILED,
  );
}

function removeSpecialCharacters(input: string): string {
  const match = input.match(/AA(\d+)\s(.+)/);

  if (match) {
    const errorCode = match[1]; // e.g., "25"
    const errorMessage = match[2]; // e.g., "invalid account nonce"
    const newMatch = `AA${errorCode} ${errorMessage}`.match(
      // eslint-disable-next-line no-control-regex
      /AA.*?(?=\\u|\u0000)/,
    );
    if (newMatch) {
      const extractedString = newMatch[0];
      return extractedString;
    }
    return `AA${errorCode} ${errorMessage}`;
  }
  return input;
}
