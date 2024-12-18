import { NexusClient } from "@biconomy/sdk";
import { BlockTag, FeeValuesEIP1559, Hex, http, PublicClient } from "viem";
import { UserOperation as ViemUserOperation } from "viem/_types/account-abstraction";
import { UserOperation as PackageUserOperation } from "../types";

export const vitalik = "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045";
export const entryPointV7Address = "0x0000000071727De22E5E9d8BAf0edAc6f37da032";

// Hardcoded gas values for gas estimation, to ensure user op completeness
const defaultCallGasLimit = BigInt(5_000_000);
const defaultVerificationGasLimit = BigInt(5_000_000);
const defaultPreVerificationGas = BigInt(5_000_000);

// Production addresses
export const k1ValidatorAddress = "0x0000002D6DB27c52E3C11c1Cf24072004AC75cBa";
export const factoryAddress = "0x00000024115AA990F0bAE0B6b0D5B8F68b684cd6";

// mock bundler transport
export const bundlerTransport = http("https://not-gonna-use-the-bundler.com");

interface GasEstimator {
  estimateFeesPerGas: () => Promise<FeeValuesEIP1559>;
  getBlock(args: {
    blockTag: BlockTag | undefined;
  }): Promise<{ baseFeePerGas: bigint | null }>;
}

// helper functions
export const getEIP1559FeesPerGas = async (viemClient: GasEstimator) => {
  const { maxFeePerGas, maxPriorityFeePerGas } =
    await viemClient.estimateFeesPerGas();

  const baseFeePerGas = (await viemClient.getBlock({ blockTag: "latest" }))
    .baseFeePerGas;

  if (baseFeePerGas == null) {
    throw new Error("baseFeePerGas is null");
  }

  return { maxFeePerGas, maxPriorityFeePerGas, baseFeePerGas };
};

export const buildNativeTransferUserOp = async (
  nexusClient: NexusClient,
  maxFeePerGas: bigint,
  maxPriorityFeePerGas: bigint,
  factory: Hex,
  factoryData: Hex
) => {
  const userOperation: ViemUserOperation = {
    sender: nexusClient.account.address,
    callData: await nexusClient.account.encodeExecute({
      to: vitalik,
      data: "0x",
      value: 1n,
    }),
    callGasLimit: defaultCallGasLimit,
    maxFeePerGas,
    maxPriorityFeePerGas,
    nonce: await nexusClient.account.getNonce(),
    preVerificationGas: defaultPreVerificationGas,
    verificationGasLimit: defaultVerificationGasLimit,
    factory: factory || "0x",
    factoryData: factoryData || "0x",
    signature: "0x",
  };

  const signature = await nexusClient.account.signUserOperation(userOperation);
  userOperation.signature = signature;

  return userOperation as PackageUserOperation;
};

export const getFactoryArgs = async (nexusClient: NexusClient) => {
  const { factory, factoryData } = await nexusClient.account.getFactoryArgs();

  if (factory == null) {
    throw new Error("factory is null");
  }

  if (factoryData == null) {
    throw new Error("factoryData is null");
  }

  return { factory, factoryData };
};
