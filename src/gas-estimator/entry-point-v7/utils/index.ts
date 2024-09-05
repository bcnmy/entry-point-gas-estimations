import { Address, concat, decodeAbiParameters, decodeErrorResult, decodeFunctionResult, encodeAbiParameters, Hex, keccak256, pad, toHex } from "viem";
import { ExecutionErrors, ExecutionResult, PackedUserOperation, SimulateHandleOpResult, TargetCallResult, targetCallResultSchema, UserOperation, VALIDATION_ERRORS } from "../types";
import { ENTRY_POINT_ABI } from "../abis";

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
  81: "zero-initialized variable of internal function type"
}

export function toPackedUserOperation(
  unpackedUserOperation: UserOperation
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

export function getInitCode(unpackedUserOperation: UserOperation) {
  return unpackedUserOperation.factory
      ? concat([
            unpackedUserOperation.factory,
            unpackedUserOperation.factoryData || ("0x" as Hex)
        ])
      : "0x"
}

export function getAccountGasLimits(unpackedUserOperation: UserOperation) {
  return concat([
      pad(toHex(unpackedUserOperation.verificationGasLimit), {
          size: 16
      }),
      pad(toHex(unpackedUserOperation.callGasLimit), { size: 16 })
  ])
}

export function getGasLimits(unpackedUserOperation: UserOperation) {
  return concat([
      pad(toHex(unpackedUserOperation.maxPriorityFeePerGas), {
          size: 16
      }),
      pad(toHex(unpackedUserOperation.maxFeePerGas), { size: 16 })
  ])
}

export function getPaymasterAndData(unpackedUserOperation: UserOperation) {
  return unpackedUserOperation.paymaster
      ? concat([
            unpackedUserOperation.paymaster,
            pad(
                toHex(
                    unpackedUserOperation.paymasterVerificationGasLimit || 0n
                ),
                {
                    size: 16
                }
            ),
            pad(toHex(unpackedUserOperation.paymasterPostOpGasLimit || 0n), {
                size: 16
            }),
            unpackedUserOperation.paymasterData || ("0x" as Hex)
        ])
      : "0x"
}

export const getUserOperationHash = (
  userOperation: PackedUserOperation,
  entryPointAddress: Address,
  chainId: number
) => {
  const hash = keccak256(
      encodeAbiParameters(
          [
              {
                  name: "sender",
                  type: "address"
              },
              {
                  name: "nonce",
                  type: "uint256"
              },
              {
                  name: "initCodeHash",
                  type: "bytes32"
              },
              {
                  name: "callDataHash",
                  type: "bytes32"
              },
              {
                  name: "accountGasLimits",
                  type: "bytes32"
              },
              {
                  name: "preVerificationGas",
                  type: "uint256"
              },
              {
                  name: "gasFees",
                  type: "bytes32"
              },
              {
                  name: "paymasterAndDataHash",
                  type: "bytes32"
              }
          ],
          [
              userOperation.sender,
              userOperation.nonce,
              keccak256(userOperation.initCode),
              keccak256(userOperation.callData),
              userOperation.accountGasLimits,
              userOperation.preVerificationGas,
              userOperation.gasFees,
              keccak256(userOperation.paymasterAndData)
          ]
      )
  )

  return keccak256(
      encodeAbiParameters(
          [
              {
                  name: "userOpHash",
                  type: "bytes32"
              },
              {
                  name: "entryPointAddress",
                  type: "address"
              },
              {
                  name: "chainId",
                  type: "uint256"
              }
          ],
          [hash, entryPointAddress, BigInt(chainId)]
      )
  )
}

export function getSimulateHandleOpResult (data: Hex): SimulateHandleOpResult {
  try {
      const decodedError = decodeErrorResult({
          abi: ENTRY_POINT_ABI,
          data: data
      })

      if (
          decodedError &&
          decodedError.errorName === "FailedOp" &&
          decodedError.args
      ) {
          return {
              result: "failed",
              data: decodedError.args[1] as string,
              code: VALIDATION_ERRORS.SIMULATE_VALIDATION_FAILED
          } as const
      }

      if (
          decodedError &&
          decodedError.errorName === "FailedOpWithRevert" &&
          decodedError.args
      ) {
          return {
              result: "failed",
              data: parseFailedOpWithRevert(decodedError.args?.[2] as Hex),
              code: VALIDATION_ERRORS.SIMULATE_VALIDATION_FAILED
          } as const
      }
  } catch {
      // no error we go the result
      const decodedResult: ExecutionResult = decodeFunctionResult({
          abi: ENTRY_POINT_ABI,
          functionName: "simulateHandleOp",
          data
      }) as unknown as ExecutionResult

      return {
          result: "execution",
          data: {
              executionResult: decodedResult
          } as const
      }
  }
  throw new Error("Unexpected error")
}

export function parseFailedOpWithRevert(data: Hex) {
  const methodSig = data.slice(0, 10)
  const dataParams = `0x${data.slice(10)}` as Hex

  if (methodSig === "0x08c379a0") {
      const [err] = decodeAbiParameters(
          [
              {
                  name: "err",
                  type: "string"
              }
          ],
          dataParams
      )

      return err
  }

  if (methodSig === "0x4e487b71") {
      const [code] = decodeAbiParameters(
          [
              {
                  name: "err",
                  type: "uint256"
              }
          ],
          dataParams
      )

      return panicCodes[Number(code)] ?? `${code}`
  }

  return data
}

export function validateTargetCallDataResult(data: Hex):
    | {
          result: "success"
          data: TargetCallResult
      }
    | {
          result: "failed"
          data: string
          code: number
      } {
    try {
        const targetCallResult = decodeFunctionResult({
            abi: ENTRY_POINT_ABI,
            functionName: "simulateCallData",
            data: data
        })

        const parsedTargetCallResult =
            targetCallResultSchema.parse(targetCallResult)

        if (parsedTargetCallResult.success) {
            return {
                result: "success",
                data: parsedTargetCallResult
            } as const
        }

        return {
            result: "failed",
            data: parsedTargetCallResult.returnData,
            code: ExecutionErrors.UserOperationReverted
        } as const
    } catch (_e) {
        // no error we go the result
        return {
            result: "failed",
            data: "Unknown error, could not parse target call data result.",
            code: ExecutionErrors.UserOperationReverted
        } as const
    }
}

export function packUserOp(op: PackedUserOperation): `0x${string}` {
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