import { arbitrum, mainnet, mantle, optimism } from "viem/chains";
import { OptimismGasEstimator } from "./optimism/OptimismGasEstimator";
import { ArbitrumGasEstimator } from "./arbitrum/ArbitrumGasEstimator";
import { EVMGasEstimator } from "./evm/EVMGasEstimator";
import { EntryPointVersion } from "../entrypoint/shared/types";
import { ChainStack, SupportedChain } from "../chains/types";
import { createGasEstimator, mergeChainConfig } from "./createGasEstimator";
import { MantleGasEstimator } from "./mantle/MantleGasEstimator";
import { describe, it, expect } from "vitest";

describe("createGasEstimator", () => {
  const rpcUrl = "http://rpc.url";

  describe("test different chain stacks", () => {
    it("should create an OptimismGasEstimator", () => {
      const gasEstimator = createGasEstimator({
        chainId: optimism.id,
        rpc: rpcUrl,
      });

      expect(gasEstimator).toBeInstanceOf(OptimismGasEstimator);
    });

    it("should create an ArbitrumGasEstimator", () => {
      const gasEstimator = createGasEstimator({
        chainId: arbitrum.id,
        rpc: rpcUrl,
      });

      expect(gasEstimator).toBeInstanceOf(ArbitrumGasEstimator);
    });

    it("should create a MantleGasEstimator", () => {
      const gasEstimator = createGasEstimator({
        chainId: mantle.id,
        rpc: rpcUrl,
      });

      expect(gasEstimator).toBeInstanceOf(MantleGasEstimator);
    });

    it("should create a EVMGasEstimator", () => {
      const gasEstimator = createGasEstimator({
        chainId: mainnet.id,
        rpc: rpcUrl,
      });

      expect(gasEstimator).toBeInstanceOf(EVMGasEstimator);
    });

    it("should create a custom gas estimator with a full custom chain", () => {
      const customChain: SupportedChain = {
        chainId: 4337,
        name: "Biconomy Mainnet",
        isTestnet: false,
        stack: ChainStack.Optimism,
        eip1559: true,
        entryPoints: {
          [EntryPointVersion.v060]: {
            address: "0x006",
          },
          [EntryPointVersion.v070]: {
            address: "0x007",
          },
        },
        stateOverrideSupport: {
          balance: true,
          bytecode: true,
        },
        smartAccountSupport: {
          smartAccountsV2: true,
          nexus: true,
        },
        simulation: {
          preVerificationGas: 1n,
          verificationGasLimit: 2n,
          callGasLimit: 3n,
        },
      };

      const gasEstimator = createGasEstimator({
        chainId: customChain.chainId,
        rpc: rpcUrl,
        chain: customChain,
      });

      expect(gasEstimator.chainId).toBe(customChain.chainId);
      expect(gasEstimator).toBeInstanceOf(OptimismGasEstimator);
      expect(
        gasEstimator.entryPoints[EntryPointVersion.v060].contract.address,
      ).toBe("0x006");
      expect(
        gasEstimator.entryPoints[EntryPointVersion.v070].contract.address,
      ).toBe("0x007");
      expect(gasEstimator.simulationOptions).toEqual(customChain.simulation);
    });

    it("should default to the EVM if the chain ID is not supported", () => {
      const gasEstimator = createGasEstimator({
        chainId: 123643,
        rpc: rpcUrl,
      });

      expect(gasEstimator).toBeInstanceOf(EVMGasEstimator);
    });
  });

  describe("mergeChainConfig", () => {
    it("should merge a partial chain config with the default chain config correctly", () => {
      const chain = optimism;

      const partialChain: Partial<SupportedChain> = {
        entryPoints: {
          [EntryPointVersion.v060]: {
            address: "0x006",
          },
        },
      };

      const merged = mergeChainConfig(chain.id, partialChain);

      expect(merged.entryPoints![EntryPointVersion.v060]?.address).toBe(
        "0x006",
      );
    });
  });
});
