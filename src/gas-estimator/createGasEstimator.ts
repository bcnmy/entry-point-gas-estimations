import { http, type Address, type Chain, createPublicClient } from "viem"
import { supportedChains } from "../chains/chains"
import {
  ChainStack,
  type SupportedChain,
  SupportedChainSchema
} from "../chains/types"
import { EntryPointVersion } from "../entrypoint/shared/types"
import { EntryPointV6 } from "../entrypoint/v0.6.0/EntryPointV6"
import { EntryPointV6Simulations } from "../entrypoint/v0.6.0/EntryPointV6Simulations"
import { ENTRYPOINT_V6_ADDRESS } from "../entrypoint/v0.6.0/constants"
import { EntryPointV7Simulations } from "../entrypoint/v0.7.0/EntryPointV7Simulations"
import { ENTRYPOINT_V7_ADDRESS } from "../entrypoint/v0.7.0/constants"
import type { GasEstimator, GasEstimatorRpcClient } from "./GasEstimator"
import { ArbitrumGasEstimator } from "./arbitrum/ArbitrumGasEstimator"
import { EVMGasEstimator } from "./evm/EVMGasEstimator"
import { MantleGasEstimator } from "./mantle/MantleGasEstimator"
import { OptimismGasEstimator } from "./optimism/OptimismGasEstimator"
import type { EntryPoints } from "./types"

/**
 * Options for creating a gas estimator instance.
 */
export interface CreateGasEstimatorOptions {
  /** Chain ID of the target network */
  chainId: number
  /** Optional chain configuration to override defaults */
  chain?: SupportedChain
  /** RPC endpoint URL or client instance */
  rpc: string | GasEstimatorRpcClient
}

/**
 * Creates a gas estimator instance appropriate for the specified chain.
 * Automatically selects the correct estimator implementation based on the chain type
 * (e.g., Optimism, Arbitrum, Mantle, or standard EVM).
 *
 * @param options - Configuration options for the gas estimator
 * @param options.chainId - Chain ID of the target network
 * @param options.chain - Optional chain configuration to override defaults
 * @param options.rpc - RPC endpoint URL or client instance
 *
 * @returns An instance of {@link GasEstimator} appropriate for the chain
 * @throws Error if the chain configuration is invalid
 *
 * @example
 * ```typescript
 * // Using RPC URL
 * const estimator = createGasEstimator({
 *   chainId: 1,
 *   rpc: "https://eth-mainnet.g.alchemy.com/v2/YOUR-API-KEY"
 * });
 *
 * // Using custom chain config
 * const estimator = createGasEstimator({
 *   chainId: 10,
 *   chain: {
 *     name: "Optimism",
 *     stack: ChainStack.Optimism,
 *     // ... other chain properties
 *   },
 *   rpc: rpcClient
 * });
 * ```
 */
export function createGasEstimator({
  chainId,
  chain,
  rpc
}: CreateGasEstimatorOptions): GasEstimator {
  chain = mergeChainConfig(chainId, chain)

  const rpcClient = createRpcClient(chainId, rpc)

  const entryPointContracts = createEntryPoints(chain, rpcClient)

  let gasEstimator: GasEstimator
  switch (chain?.stack) {
    case ChainStack.Optimism:
      gasEstimator = new OptimismGasEstimator(
        chain,
        rpcClient,
        entryPointContracts,
        chain.simulation
      )
      break
    case ChainStack.Arbitrum:
      gasEstimator = new ArbitrumGasEstimator(
        chain,
        rpcClient,
        entryPointContracts,
        chain.simulation
      )
      break
    case ChainStack.Mantle:
      gasEstimator = new MantleGasEstimator(
        chain,
        rpcClient,
        entryPointContracts,
        chain.simulation
      )
      break
    default:
      gasEstimator = new EVMGasEstimator(
        chain,
        rpcClient,
        entryPointContracts,
        chain?.simulation
      )
      break
  }

  return gasEstimator
}

/**
 * Merges custom chain configuration with default chain settings.
 *
 * @param chainId - Chain ID to look up default configuration
 * @param chain - Optional custom chain configuration to merge
 * @returns Complete chain configuration
 * @throws Error if the resulting configuration is invalid
 *
 * @internal
 */
export function mergeChainConfig(
  chainId: number,
  chain?: Partial<SupportedChain>
): SupportedChain {
  const defaultChainConfig = supportedChains[chainId]
  if (chain == null) {
    return defaultChainConfig
  }

  // otherwise merge the chain configs
  const partialSchema = SupportedChainSchema.partial()
  const clientConfig = partialSchema.parse(chain)

  const merged = { ...defaultChainConfig, ...clientConfig }
  SupportedChainSchema.parse(merged)

  return merged
}

/**
 * Creates an RPC client instance from a URL or existing client.
 *
 * @param chainId - Chain ID for the RPC client
 * @param rpc - RPC endpoint URL or existing client instance
 * @returns A configured {@link GasEstimatorRpcClient}
 *
 * @internal
 */
export function createRpcClient(
  chainId: number,
  rpc: string | GasEstimatorRpcClient
): GasEstimatorRpcClient {
  let rpcClient: GasEstimatorRpcClient
  if (typeof rpc === "string") {
    rpcClient = createPublicClient({
      chain: {
        id: chainId
      } as Chain,
      transport: http(rpc)
    })
  } else {
    rpcClient = rpc
  }
  return rpcClient
}

/**
 * Creates EntryPoint contract instances for both v0.6.0 and v0.7.0.
 *
 * @param chain - Chain configuration containing EntryPoint addresses
 * @param rpcClient - RPC client for contract interactions
 * @returns Map of {@link EntryPointVersion} to contract instances
 *
 * @internal
 */
export function createEntryPoints(
  chain: SupportedChain,
  rpcClient: GasEstimatorRpcClient
): EntryPoints {
  const entryPointV6Address =
    (chain?.entryPoints?.[EntryPointVersion.v060]?.address as Address) ||
    ENTRYPOINT_V6_ADDRESS

  const entryPointV6 = new EntryPointV6(rpcClient, entryPointV6Address)

  const entryPointV6Simulations = new EntryPointV6Simulations(
    rpcClient,
    entryPointV6Address
  )

  const entryPointV7Address =
    (chain?.entryPoints?.[EntryPointVersion.v070]?.address as Address) ||
    ENTRYPOINT_V7_ADDRESS

  const entryPointV7Simulations = new EntryPointV7Simulations(
    rpcClient,
    entryPointV7Address
  )

  const entryPointContracts: EntryPoints = {
    [EntryPointVersion.v060]: {
      contract: entryPointV6,
      simulations: entryPointV6Simulations
    },
    [EntryPointVersion.v070]: {
      contract: entryPointV7Simulations
    }
  }
  return entryPointContracts
}
