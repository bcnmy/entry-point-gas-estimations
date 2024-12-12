import { Address } from "viem";
import { EntryPointVersion } from "../entrypoint/types";
import { createEVMGasEstimator } from "./EVMGasEstimator";
import { GasEstimatesV6, GasEstimatesV7 } from "./estimates";

describe("EVMGasEstimator", () => {
  describe("createEVMGasEstimator", () => {
    it("should use default entrypoint contracts given no parameters", () => {
      const gasEstimator = createEVMGasEstimator({});

      expect(gasEstimator).toBeDefined();
      expect(gasEstimator.entryPointContracts["v0.0.6"].address).toBe(
        "0x5ff137d4b0fdcd49dca30c7cf57e578a026d2789"
      );
      expect(gasEstimator.entryPointContracts["v0.0.7"].address).toBe(
        "0x0000000071727de22e5e9d8baf0edac6f37da032"
      );
    });

    it("should create a EVMGasEstimator given custom EP addresses", () => {
      const entryPoints = {
        [EntryPointVersion.V006]: {
          entryPointVersion: EntryPointVersion.V006,
          entryPointAddress: "0xdeadbeef" as Address,
        },
        [EntryPointVersion.V007]: {
          entryPointVersion: EntryPointVersion.V007,
          entryPointAddress: "0xbeefdead" as Address,
        },
      };

      const gasEstimator = createEVMGasEstimator({
        entryPoints,
      });

      expect(gasEstimator).toBeDefined();
      expect(gasEstimator.entryPointContracts["v0.0.6"].address).toBe(
        "0xdeadbeef"
      );
      expect(gasEstimator.entryPointContracts["v0.0.7"].address).toBe(
        "0xbeefdead"
      );
    });
  });

  describe("estimateUserOperationGas", () => {
    it("should return correct gas limits for EPv0.6.0", async () => {
      const gasEstimator = createEVMGasEstimator({});
      const result =
        await gasEstimator.estimateUserOperationGas<GasEstimatesV6>(
          EntryPointVersion.V006
        );
      expect(result.callGasLimit).toBe(0n);
      expect(result.verificationGasLimit).toBe(0n);
      expect(result.preVerificationGas).toBe(0n);
      expect(result.validAfter).toBe(0);
      expect(result.validUntil).toBe(0);
    });

    it("should return correct gas limits for EPv0.7.0", async () => {
      const gasEstimator = createEVMGasEstimator({});
      const result =
        await gasEstimator.estimateUserOperationGas<GasEstimatesV7>(
          EntryPointVersion.V007
        );
      expect(result.callGasLimit).toBe(0n);
      expect(result.verificationGasLimit).toBe(0n);
      expect(result.preVerificationGas).toBe(0n);
      expect(result.validAfter).toBe(0);
      expect(result.validUntil).toBe(0);
      expect(result.paymasterVerificationGasLimit).toBe(0n);
      expect(result.paymasterPostOpGasLimit).toBe(0n);
    });
  });
});
