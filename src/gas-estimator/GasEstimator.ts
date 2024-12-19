import { Address, Chain, createPublicClient, http, PublicClient } from "viem";
import { ENTRYPOINT_V6_ADDRESS } from "../entrypoint/v0.6.0/constants";
import { ENTRYPOINT_V7_ADDRESS } from "../entrypoint/v0.7.0/constants";
import { EntryPointV6 } from "../entrypoint/v0.6.0/EntryPointV6";
import { EntryPointV6Simulations } from "../entrypoint/v0.6.0/EntryPointV6Simulations";
import { EntryPointV7Simulations } from "../entrypoint/v0.7.0/EntryPointV7Simulations";
import {
  SimulationOptions,
  EstimateUserOperationGasParams,
  EVMGasEstimator,
} from "./EVMGasEstimator";
import { OptimismGasEstimator } from "./OptimismGasEstimator";
import { ArbitrumGasEstimator } from "./ArbitrumGasEstimator";
import { EntryPoints, EstimateUserOperationGasResult } from "./types";
import {
  EntryPointRpcClient,
  EntryPointVersion,
} from "../entrypoint/shared/types";
import { UserOperation } from "./UserOperation";
import {
  ChainStack,
  SupportedChain,
  SupportedChainSchema,
} from "../chains/types";
import { MantleGasEstimator } from "./MantleGasEstimator";
import { supportedChains } from "../chains/chains";

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
  if (chain != null) {
    chain = SupportedChainSchema.parse(chain);
  } else {
    chain = supportedChains[chainId];
  }

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

  const entryPointV6Address =
    (chain.entryPoints?.[EntryPointVersion.v060]?.address as Address) ||
    ENTRYPOINT_V6_ADDRESS;

  const entryPointV6 = new EntryPointV6(rpcClient, entryPointV6Address);

  const entryPointV6Simulations = new EntryPointV6Simulations(
    rpcClient,
    entryPointV6Address
  );

  const entryPointV7Address =
    (chain.entryPoints?.[EntryPointVersion.v070]?.address as Address) ||
    ENTRYPOINT_V7_ADDRESS;

  const entryPointV7Simulations = new EntryPointV7Simulations(
    rpcClient,
    entryPointV7Address
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

  let gasEstimator: GasEstimator;
  switch (chain.stack) {
    case ChainStack.Optimism:
      gasEstimator = new OptimismGasEstimator(
        chainId,
        rpcClient,
        entryPointContracts,
        chain.simulation
      );
      break;
    case ChainStack.Arbitrum:
      gasEstimator = new ArbitrumGasEstimator(
        chainId,
        rpcClient,
        entryPointContracts,
        chain.simulation
      );
      break;
    case ChainStack.Mantle:
      gasEstimator = new MantleGasEstimator(
        chainId,
        rpcClient,
        entryPointContracts,
        chain.simulation
      );
      break;
    default:
      gasEstimator = new EVMGasEstimator(
        chainId,
        rpcClient,
        entryPointContracts,
        chain.simulation
      );
  }

  return gasEstimator;
}

export interface GasEstimator {
  chainId: number;
  entryPoints: EntryPoints;
  simulationOptions: SimulationOptions;
  estimateUserOperationGas: (
    params: EstimateUserOperationGasParams
  ) => Promise<EstimateUserOperationGasResult>;
  estimatePreVerificationGas: (
    userOperation: UserOperation,
    baseFeePerGas: bigint
  ) => Promise<bigint>;
}

export type GasEstimatorRpcClient = Pick<
  PublicClient,
  "readContract" | "estimateGas"
> &
  EntryPointRpcClient;
