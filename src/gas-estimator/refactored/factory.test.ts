import { createPublicClient, http } from "viem";
import { arbitrum, mainnet, mantle, optimism } from "viem/chains";
import { createGasEstimator } from "./GasEstimator";
import { OptimismGasEstimator } from "./OptimismGasEstimator";
import { ArbitrumGasEstimator } from "./ArbitrumGasEstimator";
import { MantleGasEstimator } from "./MantleGasEstimator.ts";
import { EVMGasEstimator } from "./EVMGasEstimator";
import { ChainStack } from "../../shared/types";
import { EntryPointVersion } from "../../entrypoint/shared/types";

describe("factory", () => {
  describe("createGasEstimator", () => {
    const rpcUrl = "http://rpc.url";

    it("should create an OptimismGasEstimator", () => {
      const rpcClient = createPublicClient({
        chain: optimism,
        transport: http(rpcUrl),
      });

      const gasEstimator = createGasEstimator({
        chainId: optimism.id,
        rpcClient,
      });

      expect(gasEstimator).toBeInstanceOf(OptimismGasEstimator);
    });

    it("should create an ArbitrumGasEstimator", () => {
      const rpcClient = createPublicClient({
        chain: arbitrum,
        transport: http(rpcUrl),
      });

      const gasEstimator = createGasEstimator({
        chainId: arbitrum.id,
        rpcClient,
      });

      expect(gasEstimator).toBeInstanceOf(ArbitrumGasEstimator);
    });

    it("should create a MantleGasEstimator", () => {
      const rpcClient = createPublicClient({
        chain: mantle,
        transport: http(rpcUrl),
      });

      const gasEstimator = createGasEstimator({
        chainId: mantle.id,
        rpcClient,
      });

      expect(gasEstimator).toBeInstanceOf(MantleGasEstimator);
    });

    it("should create a EVMGasEstimator", () => {
      const rpcClient = createPublicClient({
        chain: mainnet,
        transport: http(rpcUrl),
      });

      const gasEstimator = createGasEstimator({
        chainId: mainnet.id,
        rpcClient,
      });

      expect(gasEstimator).toBeInstanceOf(EVMGasEstimator);
    });

    it("should create a custom gas estimator with the params passed", () => {
      const rpcClient = createPublicClient({
        chain: mainnet,
        transport: http(rpcUrl),
      });

      const chainId = 654321;
      const gasEstimator = createGasEstimator({
        chainId,
        rpcClient,
        stack: ChainStack.Optimism,
        entryPoints: {
          [EntryPointVersion.v060]: {
            address: "0x006",
          },
          [EntryPointVersion.v070]: {
            address: "0x007",
          },
        },
        simulationOptions: {
          preVerificationGas: 1n,
          verificationGasLimit: 2n,
          callGasLimit: 3n,
        },
      });

      expect(gasEstimator.chainId).toBe(chainId);
      expect(gasEstimator).toBeInstanceOf(OptimismGasEstimator);
      expect(
        gasEstimator.entryPoints[EntryPointVersion.v060].contract.address
      ).toBe("0x006");
      expect(
        gasEstimator.entryPoints[EntryPointVersion.v070].contract.address
      ).toBe("0x007");
      expect(gasEstimator.simulationOptions).toEqual({
        preVerificationGas: 1n,
        verificationGasLimit: 2n,
        callGasLimit: 3n,
      });
    });
  });
});
