import { userOperationV6Schema } from "./UserOperationV6";
import { describe, it, expect } from "vitest";

describe("UserOperationV6", () => {
  describe("userOperationV6Schema", () => {
    const validUserOperation = {
      sender: "0x5ff137d4b0fdcd49dca30c7cf57e578a026d2789",
      nonce: 1n,
      initCode: "0x",
      callData: "0x",
      callGasLimit: 1n,
      verificationGasLimit: 1n,
      preVerificationGas: 1n,
      maxFeePerGas: 1n,
      maxPriorityFeePerGas: 1n,
      paymasterAndData: "0x",
      signature: "0x",
    };

    it("should return true for a valid UserOperationV6", () => {
      expect(userOperationV6Schema.parse(validUserOperation)).toEqual(
        validUserOperation,
      );
    });

    it("should return true with numbers instead of bigints", () => {
      const userOperation = {
        sender: "0x5ff137d4b0fdcd49dca30c7cf57e578a026d2789",
        nonce: 1,
        initCode: "0x",
        callData: "0x",
        callGasLimit: 1,
        verificationGasLimit: 1,
        preVerificationGas: 1,
        maxFeePerGas: 1,
        maxPriorityFeePerGas: 1,
        paymasterAndData: "0x",
        signature: "0x",
      };

      expect(userOperationV6Schema.parse(userOperation)).toEqual(
        validUserOperation,
      );
    });

    it("should return true with hex strings instead of bigints", () => {
      const userOperation = {
        sender: "0x5ff137d4b0fdcd49dca30c7cf57e578a026d2789",
        nonce: "0x1",
        initCode: "0x",
        callData: "0x",
        callGasLimit: "0x1",
        verificationGasLimit: "0x1",
        preVerificationGas: "0x1",
        maxFeePerGas: "0x1",
        maxPriorityFeePerGas: "0x1",
        paymasterAndData: "0x",
        signature: "0x",
      };

      expect(userOperationV6Schema.parse(userOperation)).toEqual(
        validUserOperation,
      );
    });
  });
});
