import { arbitrum, mainnet, mantle, optimism } from "viem/chains"
import { describe, expect, it } from "vitest"
import { DEFAULT_PAYMASTERS } from "../chains"
import { ChainStack, type SupportedChain } from "../chains/types"
import { EntryPointVersion } from "../entrypoint/shared/types"
import { ArbitrumGasEstimator } from "./arbitrum/ArbitrumGasEstimator"
import { createGasEstimator, mergeChainConfig } from "./createGasEstimator"
import { EVMGasEstimator } from "./evm/EVMGasEstimator"
import { MantleGasEstimator } from "./mantle/MantleGasEstimator"
import { OptimismGasEstimator } from "./optimism/OptimismGasEstimator"

describe("createGasEstimator", () => {
  const rpcUrl = "http://rpc.url"

  describe("test different chain stacks", () => {
    it("should create an OptimismGasEstimator", () => {
      const gasEstimator = createGasEstimator({
        chainId: optimism.id,
        rpc: rpcUrl
      })

      expect(gasEstimator).toBeInstanceOf(OptimismGasEstimator)
    })

    it("should create an ArbitrumGasEstimator", () => {
      const gasEstimator = createGasEstimator({
        chainId: arbitrum.id,
        rpc: rpcUrl
      })

      expect(gasEstimator).toBeInstanceOf(ArbitrumGasEstimator)
    })

    it("should create a MantleGasEstimator", () => {
      const gasEstimator = createGasEstimator({
        chainId: mantle.id,
        rpc: rpcUrl
      })

      expect(gasEstimator).toBeInstanceOf(MantleGasEstimator)
    })

    it("should create a EVMGasEstimator", () => {
      const gasEstimator = createGasEstimator({
        chainId: mainnet.id,
        rpc: rpcUrl
      })

      expect(gasEstimator).toBeInstanceOf(EVMGasEstimator)
    })

    it("should create a custom gas estimator with a full custom chain", () => {
      const customChain: SupportedChain = {
        chainId: 4337,
        name: "Biconomy Mainnet",
        isTestnet: false,
        stack: ChainStack.Optimism,
        eip1559: true,
        entryPoints: {
          [EntryPointVersion.v060]: {
            address: "0x006"
          },
          [EntryPointVersion.v070]: {
            address: "0x007"
          }
        },
        stateOverrideSupport: {
          balance: true,
          bytecode: true,
          stateDiff: true
        },
        smartAccountSupport: {
          smartAccountsV2: true,
          nexus: true
        },
        simulation: {
          preVerificationGas: 1n,
          verificationGasLimit: 2n,
          callGasLimit: 3n
        },
        paymasters: DEFAULT_PAYMASTERS
      }

      const gasEstimator = createGasEstimator({
        chainId: customChain.chainId,
        rpc: rpcUrl,
        chain: customChain
      })

      expect(gasEstimator.chain).toEqual(customChain)
      expect(gasEstimator).toBeInstanceOf(OptimismGasEstimator)
      expect(
        gasEstimator.entryPoints[EntryPointVersion.v060].contract.address
      ).toBe("0x006")
      expect(
        gasEstimator.entryPoints[EntryPointVersion.v070].contract.address
      ).toBe("0x007")
      expect(gasEstimator.simulationLimits).toEqual(customChain.simulation)
    })

    it("should default to the EVM if the chain ID is not supported", () => {
      const gasEstimator = createGasEstimator({
        chainId: 123643,
        rpc: rpcUrl
      })

      expect(gasEstimator).toBeInstanceOf(EVMGasEstimator)
    })
  })

  describe("mergeChainConfig", () => {
    it("should merge a partial chain config with the default chain config correctly", () => {
      const chain = optimism

      const partialChain: Partial<SupportedChain> = {
        entryPoints: {
          [EntryPointVersion.v060]: {
            address: "0x006"
          }
        }
      }

      const merged = mergeChainConfig(chain.id, partialChain)

      expect(merged.entryPoints![EntryPointVersion.v060]?.address).toBe("0x006")
    })
  })
})
