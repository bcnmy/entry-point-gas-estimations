import { Address, Chain, createPublicClient, http } from "viem";
import { supportedChains } from "../chains/chains";
import {
  ChainStack,
  SupportedChain,
  SupportedChainSchema,
} from "../chains/types";
import { GasEstimator, GasEstimatorRpcClient } from "./GasEstimator";
import { ENTRYPOINT_V6_ADDRESS } from "../entrypoint/v0.6.0/constants";
import { EntryPointVersion } from "../entrypoint/shared/types";
import { EntryPointV6 } from "../entrypoint/v0.6.0/EntryPointV6";
import { EntryPointV6Simulations } from "../entrypoint/v0.6.0/EntryPointV6Simulations";
import { ENTRYPOINT_V7_ADDRESS } from "../entrypoint/v0.7.0/constants";
import { EntryPointV7Simulations } from "../entrypoint/v0.7.0/EntryPointV7Simulations";
import { EntryPoints } from "./types";
import { OptimismGasEstimator } from "./optimism/OptimismGasEstimator";
import { ArbitrumGasEstimator } from "./arbitrum/ArbitrumGasEstimator";
import { EVMGasEstimator } from "./evm/EVMGasEstimator";
import { MantleGasEstimator } from "./mantle/MantleGasEstimator";

export interface CreateGasEstimatorOptions {
  chainId: number;
  chain?: SupportedChain;
  rpc: string | GasEstimatorRpcClient;
}

export function createGasEstimator({
  chainId,
  chain,
  rpc,
}: CreateGasEstimatorOptions): GasEstimator {
  chain = mergeChainConfig(chainId, chain);

  let rpcClient = createRpcClient(chainId, rpc);

  const entryPointContracts = createEntryPoints(chain, rpcClient);

  let gasEstimator: GasEstimator;
  switch (chain?.stack) {
    case ChainStack.Optimism:
      gasEstimator = new OptimismGasEstimator(
        chain,
        rpcClient,
        entryPointContracts,
        chain.simulation,
      );
      break;
    case ChainStack.Arbitrum:
      gasEstimator = new ArbitrumGasEstimator(
        chain,
        rpcClient,
        entryPointContracts,
        chain.simulation,
      );
      break;
    case ChainStack.Mantle:
      gasEstimator = new MantleGasEstimator(
        chain,
        rpcClient,
        entryPointContracts,
        chain.simulation,
      );
      break;
    default:
      gasEstimator = new EVMGasEstimator(
        chain,
        rpcClient,
        entryPointContracts,
        chain?.simulation,
      );
      break;
  }

  return gasEstimator;
}

export function mergeChainConfig(
  chainId: number,
  chain?: Partial<SupportedChain>,
): SupportedChain {
  const defaultChainConfig = supportedChains[chainId];
  if (chain == null) {
    return defaultChainConfig;
  }

  // otherwise merge the chain configs
  const partialSchema = SupportedChainSchema.partial();
  const clientConfig = partialSchema.parse(chain);

  const merged = { ...defaultChainConfig, ...clientConfig };
  SupportedChainSchema.parse(merged);

  return merged;
}

export function createRpcClient(
  chainId: number,
  rpc: string | GasEstimatorRpcClient,
): GasEstimatorRpcClient {
  let rpcClient: GasEstimatorRpcClient;
  if (typeof rpc === "string") {
    rpcClient = createPublicClient({
      chain: {
        id: chainId,
      } as Chain,
      transport: http(rpc),
    });
  } else {
    rpcClient = rpc;
  }
  return rpcClient;
}

export function createEntryPoints(
  chain: SupportedChain,
  rpcClient: GasEstimatorRpcClient,
): EntryPoints {
  const entryPointV6Address =
    (chain?.entryPoints?.[EntryPointVersion.v060]?.address as Address) ||
    ENTRYPOINT_V6_ADDRESS;

  const entryPointV6 = new EntryPointV6(rpcClient, entryPointV6Address);

  const entryPointV6Simulations = new EntryPointV6Simulations(
    rpcClient,
    entryPointV6Address,
  );

  const entryPointV7Address =
    (chain?.entryPoints?.[EntryPointVersion.v070]?.address as Address) ||
    ENTRYPOINT_V7_ADDRESS;

  const entryPointV7Simulations = new EntryPointV7Simulations(
    rpcClient,
    entryPointV7Address,
  );

  const entryPointContracts: EntryPoints = {
    [EntryPointVersion.v060]: {
      contract: entryPointV6,
      simulations: entryPointV6Simulations,
    },
    [EntryPointVersion.v070]: {
      contract: entryPointV7Simulations,
    },
  };
  return entryPointContracts;
}
