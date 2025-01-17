import { describe, expect, it } from "vitest"
import { userOperationV7Schema } from "./UserOperationV7"

describe("UserOperationV7", () => {
  describe("userOperationV7Schema", () => {
    const validUserOperation = {
      sender: "0x5ff137d4b0fdcd49dca30c7cf57e578a026d2789",
      nonce: 1n,
      factory: "0x",
      factoryData: "0x",
      callData: "0x",
      callGasLimit: 1n,
      verificationGasLimit: 1n,
      preVerificationGas: 1n,
      maxFeePerGas: 1n,
      maxPriorityFeePerGas: 1n,
      paymaster: "0x",
      paymasterVerificationGasLimit: 1n,
      paymasterPostOpGasLimit: 1n,
      paymasterData: "0x",
      signature: "0x"
    }

    it("should return true for a valid UserOperation", () => {
      expect(userOperationV7Schema.parse(validUserOperation)).toEqual(
        validUserOperation
      )
    })

    it("should return true with numbers instead of bigints", () => {
      const userOperation = {
        sender: "0x5ff137d4b0fdcd49dca30c7cf57e578a026d2789",
        nonce: 1,
        factory: "0x",
        factoryData: "0x",
        callData: "0x",
        callGasLimit: 1,
        verificationGasLimit: 1,
        preVerificationGas: 1,
        maxFeePerGas: 1,
        maxPriorityFeePerGas: 1,
        paymaster: "0x",
        paymasterVerificationGasLimit: 1,
        paymasterPostOpGasLimit: 1,
        paymasterData: "0x",
        signature: "0x"
      }

      expect(userOperationV7Schema.parse(userOperation)).toEqual(
        validUserOperation
      )
    })

    it("should return true with hex strings instead of bigints", () => {
      const userOperation = {
        sender: "0x5ff137d4b0fdcd49dca30c7cf57e578a026d2789",
        nonce: "0x1",
        factory: "0x",
        factoryData: "0x",
        callData: "0x",
        callGasLimit: "0x1",
        verificationGasLimit: "0x1",
        preVerificationGas: "0x1",
        maxFeePerGas: "0x1",
        maxPriorityFeePerGas: "0x1",
        paymaster: "0x",
        paymasterVerificationGasLimit: "0x1",
        paymasterPostOpGasLimit: "0x1",
        paymasterData: "0x",
        signature: "0x"
      }

      expect(userOperationV7Schema.parse(userOperation)).toEqual(
        validUserOperation
      )
    })
  })
})
