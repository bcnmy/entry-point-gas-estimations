import config from "config";
import { Address } from "viem";
import { ENTRYPOINT_V6_ADDRESS } from "../entrypoint/v0.6.0/constants";
import { ENTRYPOINT_V7_ADDRESS } from "../entrypoint/v0.7.0/constants";
import {
  SIMULATION_CALL_GAS_LIMIT,
  SIMULATION_PRE_VERIFICATION_GAS,
  SIMULATION_VERIFICATION_GAS_LIMIT,
} from "./constants";
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
import { MantleGasEstimator } from "./MantleGasEstimator.ts";
import {
  EntryPoints,
  EstimateUserOperationGasResult,
  GasEstimatorRpcClient,
} from "./types";
import { EntryPointVersion } from "../entrypoint/shared/types";
import { ChainStack } from "../shared/types";
import { UserOperation } from "./UserOperation";
import z from "zod";

export function createGasEstimator({
  chainId,
  rpcClient,
  stack = getStack(chainId),
  entryPoints = getSupportedEntryPoints(chainId),
  simulationOptions = getSimulationOptions(chainId),
}: CreateGasEstimatorOptions): GasEstimator {
  chainId = z.coerce.number().parse(chainId);

  const entryPointV6 = new EntryPointV6(
    rpcClient,
    entryPoints[EntryPointVersion.v060].address
  );

  const entryPointV6Simulations = new EntryPointV6Simulations(
    rpcClient,
    entryPoints[EntryPointVersion.v060].address
  );

  const entryPointV7Simulations = new EntryPointV7Simulations(
    rpcClient,
    entryPoints[EntryPointVersion.v070].address
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
  switch (stack) {
    case ChainStack.Optimism:
      gasEstimator = new OptimismGasEstimator(
        chainId,
        rpcClient,
        entryPointContracts,
        simulationOptions
      );
      break;
    case ChainStack.Arbitrum:
      gasEstimator = new ArbitrumGasEstimator(
        chainId,
        rpcClient,
        entryPointContracts,
        simulationOptions
      );
      break;
    case ChainStack.Mantle:
      gasEstimator = new MantleGasEstimator(
        chainId,
        rpcClient,
        entryPointContracts,
        simulationOptions
      );
      break;
    default:
      gasEstimator = new EVMGasEstimator(
        chainId,
        rpcClient,
        entryPointContracts,
        simulationOptions
      );
  }

  return gasEstimator;
}

function getStack(chainId: number): ChainStack {
  chainId = z.coerce.number().parse(chainId);
  return config.has(`supportedChains.${chainId}.stack`)
    ? config.get<ChainStack>(`supportedChains.${chainId}.stack`)
    : ChainStack.EVM;
}

function getSupportedEntryPoints(
  chainId: number
): Record<EntryPointVersion, { address: Address }> {
  chainId = z.coerce.number().parse(chainId);

  const entryPointV6Address = config.has(
    `supportedChains.${chainId}.entryPoints.${EntryPointVersion.v060}.address`
  )
    ? config.get<Address>(
        `supportedChains.${chainId}.entryPoints.${EntryPointVersion.v060}.address`
      )
    : ENTRYPOINT_V6_ADDRESS;

  const entryPointV7Address = config.has(
    `supportedChains.${chainId}.entryPoints.${EntryPointVersion.v070}.address`
  )
    ? config.get<Address>(
        `supportedChains.${chainId}.entryPoints.${EntryPointVersion.v070}.address`
      )
    : ENTRYPOINT_V7_ADDRESS;

  return {
    [EntryPointVersion.v060]: { address: entryPointV6Address },
    [EntryPointVersion.v070]: { address: entryPointV7Address },
  };
}

function getSimulationOptions(chainId: number): SimulationOptions {
  chainId = z.coerce.number().parse(chainId);

  const preVerificationGas = config.has(
    `supportedChains.${chainId}.simulation.preVerificationGas`
  )
    ? BigInt(
        config.get<number>(
          `supportedChains.${chainId}.simulation.preVerificationGas`
        )
      )
    : SIMULATION_PRE_VERIFICATION_GAS;

  const verificationGasLimit = config.has(
    `supportedChains.${chainId}.simulation.verificationGasLimit`
  )
    ? BigInt(
        config.get<number>(
          `supportedChains.${chainId}.simulation.verificationGasLimit`
        )
      )
    : SIMULATION_VERIFICATION_GAS_LIMIT;

  const callGasLimit = config.has(
    `supportedChains.${chainId}.simulation.callGasLimit`
  )
    ? BigInt(
        config.get<number>(`supportedChains.${chainId}.simulation.callGasLimit`)
      )
    : SIMULATION_CALL_GAS_LIMIT;

  return {
    preVerificationGas,
    verificationGasLimit,
    callGasLimit,
  };
}

export interface CreateGasEstimatorOptions {
  chainId: number;
  rpcClient: GasEstimatorRpcClient;
  stack?: ChainStack;
  entryPoints?: Record<EntryPointVersion, { address: Address }>;
  simulationOptions?: SimulationOptions;
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
