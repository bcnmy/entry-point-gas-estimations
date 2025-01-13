import { optimism } from "viem/chains";
import { EntryPointVersion } from "../../entrypoint/shared/types";
import { EntryPointV6 } from "../../entrypoint/v0.6.0/EntryPointV6";
import { EntryPointV6Simulations } from "../../entrypoint/v0.6.0/EntryPointV6Simulations";
import { EntryPointV7Simulations } from "../../entrypoint/v0.7.0/EntryPointV7Simulations";
import { OptimismGasEstimator } from "./OptimismGasEstimator";
import { EntryPoints } from "../types";
import config from "config";
import { GasEstimatorRpcClient, SimulationOptions } from "../GasEstimator";
import { createGasEstimator } from "../createGasEstimator";
import { describe, it, vitest } from "vitest";

describe("OptimismGasEstimator", () => {
  describe("unit", () => {
    const mockRpcClient: GasEstimatorRpcClient = {
      readContract: vitest.fn().mockResolvedValue(1n),
      estimateGas: vitest.fn().mockResolvedValue(1n),
      chain: optimism,
      request: vitest.fn(),
    };

    const mockEntryPoints: EntryPoints = {
      [EntryPointVersion.v060]: {
        contract: {
          encodeHandleOpsFunctionData: vitest.fn().mockReturnValue("0x"),
        } as unknown as EntryPointV6,
        simulations: {} as EntryPointV6Simulations,
      },
      [EntryPointVersion.v070]: {
        contract: {} as EntryPointV7Simulations,
      },
    };
    it("should take the L1 fee into account when calculating the pre-verification gas", async () => {
      const opGasEstimator = new OptimismGasEstimator(
        10,
        mockRpcClient,
        mockEntryPoints,
        {} as SimulationOptions,
      );

      const pvg = await opGasEstimator.estimatePreVerificationGas(
        {
          callData: "0x",
          sender: "0xb7744Ce158A09183F01296bCB262bB9F65E2FFd7",
          preVerificationGas: 1n,
          verificationGasLimit: 1n,
          callGasLimit: 1n,
          maxFeePerGas: 1n,
          maxPriorityFeePerGas: 1n,
          initCode: "0x",
          nonce: 1n,
          paymasterAndData: "0x",
          signature: "0x",
        },
        1n,
      );

      expect(pvg).toBeDefined();
      expect(mockRpcClient.readContract).toHaveBeenCalled();
    });

    it("should the L1 fee into account when calculating the pre-verification gas, when created by a factory", async () => {
      const opGasEstimator = createGasEstimator({
        chainId: 10,
        rpc: mockRpcClient,
      });

      const pvg = await opGasEstimator.estimatePreVerificationGas(
        {
          callData: "0x",
          sender: "0xb7744Ce158A09183F01296bCB262bB9F65E2FFd7",
          preVerificationGas: 1n,
          verificationGasLimit: 1n,
          callGasLimit: 1n,
          maxFeePerGas: 1n,
          maxPriorityFeePerGas: 1n,
          initCode: "0x",
          nonce: 1n,
          paymasterAndData: "0x",
          signature: "0x",
        },
        1n,
      );

      expect(pvg).toBeDefined();
      expect(mockRpcClient.readContract).toHaveBeenCalled();
    });
  });

  describe("e2e", () => {
    it("should estimate preVerificationGas for a user operation", async () => {
      const opGasEstimator = createGasEstimator({
        chainId: 10,
        rpc: config.get<string>(`testChains.10.rpcUrl`),
      });

      const gasEstimate = await opGasEstimator.estimatePreVerificationGas(
        {
          sender: "0xb7744Ce158A09183F01296bCB262bB9F65E2FFd7",
          nonce: BigInt("0xb"),
          initCode: "0x",
          callData:
            "0x0000189a00000000000000000000000029c3e9456c0eca5beb1f78763204bac6c6824077000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000",
          callGasLimit: BigInt("0x1"),
          verificationGasLimit: BigInt("0x1"),
          preVerificationGas: BigInt("0x1"),
          maxFeePerGas: BigInt("0x1"),
          maxPriorityFeePerGas: BigInt("0x1"),
          paymasterAndData: "0x",
          signature:
            "0x00000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000001c5b32f37f5bea87bdd5374eb2ac54ea8e0000000000000000000000000000000000000000000000000000000000000041a0bd000c5e270e3a12206421374aa98e467135d3138d109da7f2d9c70fbb4b3c06b7edad0587c238580d65070cd0bc3c363b2c56e4689a42d8d6e534a205e1031b00000000000000000000000000000000000000000000000000000000000000",
        },
        1975661n,
      );

      expect(gasEstimate).toBeDefined();
    });
  });
});
