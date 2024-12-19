import { createPublicClient, http } from "viem";
import { arbitrum, mainnet, mantle, optimism } from "viem/chains";
import { createGasEstimator } from "./GasEstimator";
import { OptimismGasEstimator } from "./OptimismGasEstimator";
import { ArbitrumGasEstimator } from "./ArbitrumGasEstimator";
import { EVMGasEstimator } from "./EVMGasEstimator";
import { EntryPointVersion } from "../entrypoint/shared/types";
import { MantleGasEstimator } from "./MantleGasEstimator";
import { ChainStack, SupportedChain } from "../chains/types";

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
        rpc: rpcClient,
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
        rpc: rpcClient,
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
        rpc: rpcClient,
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
        rpc: rpcClient,
      });

      expect(gasEstimator).toBeInstanceOf(EVMGasEstimator);
    });

    it("should create a custom gas estimator with a custom chain", () => {
      const rpcClient = createPublicClient({
        chain: mainnet,
        transport: http(rpcUrl),
      });

      const chainId = 4337;
      const customChain: SupportedChain = {
        chainId,
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
        chainId,
        rpc: rpcClient,
        chain: customChain,
      });

      expect(gasEstimator.chainId).toBe(chainId);
      expect(gasEstimator).toBeInstanceOf(OptimismGasEstimator);
      expect(
        gasEstimator.entryPoints[EntryPointVersion.v060].contract.address
      ).toBe("0x006");
      expect(
        gasEstimator.entryPoints[EntryPointVersion.v070].contract.address
      ).toBe("0x007");
      expect(gasEstimator.simulationOptions).toEqual(customChain.simulation);
    });
  });
});
