import { createPublicClient, http, PublicClient } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { arbitrum, arbitrumSepolia } from "viem/chains";
import { ArbitrumGasEstimator } from "../GasEstimator/ArbitrumGasEstimator";
import { ViemGasEstimatorClient } from "../clients";
import { createNexusClient } from "@biconomy/sdk";
import {
  buildNativeTransferUserOp,
  bundlerTransport,
  entryPointV7Address,
  getEIP1559FeesPerGas,
  getFactoryArgs,
} from "./helpers";

describe("smoke-test", () => {
  // So Jest doesn't complain about BigInt serialization
  (BigInt.prototype as any).toJSON = function () {
    return this.toString();
  };

  // We create a fresh private key account for test purposes,
  // making sure a new account is created using the factory on each test run
  const account = privateKeyToAccount(generatePrivateKey());

  // Production addresses
  const k1ValidatorAddress = "0x0000002D6DB27c52E3C11c1Cf24072004AC75cBa";
  const factoryAddress = "0x00000024115AA990F0bAE0B6b0D5B8F68b684cd6";

  describe("arbitrum-sepolia", () => {
    const viemClient = createPublicClient({
      chain: arbitrumSepolia,
      transport: http(),
    });

    const arbitrumGasEstimator = new ArbitrumGasEstimator({
      chainId: arbitrumSepolia.id,
      publicClient: new ViemGasEstimatorClient(viemClient as PublicClient),
      entryPointAddress: entryPointV7Address,
    });

    it("estimates gas for a native transfer correctly", async () => {
      // we need to use a try-catch block because there's an bug in jest with worker threads with bigint serialization otherwise
      try {
        const nexusClient = await createNexusClient({
          k1ValidatorAddress,
          factoryAddress,
          signer: account,
          chain: arbitrumSepolia,
          transport: http(),
          bundlerTransport,
        });

        const { maxFeePerGas, maxPriorityFeePerGas, baseFeePerGas } =
          await getEIP1559FeesPerGas(viemClient);

        const { factory, factoryData } = await getFactoryArgs(nexusClient);

        const userOperation = await buildNativeTransferUserOp(
          nexusClient,
          maxFeePerGas,
          maxPriorityFeePerGas,
          factory,
          factoryData
        );

        // this will throw if there's an error in the gas estimation
        const {
          callGasLimit,
          verificationGasLimit,
          preVerificationGas,
          paymasterVerificationGasLimit,
          paymasterPostOpGasLimit,
        } = await arbitrumGasEstimator.estimateUserOperationGas({
          userOperation,
          baseFeePerGas,
        });

        expect(callGasLimit).toBeGreaterThan(21_000n);
        expect(verificationGasLimit).toBeGreaterThan(0n);
        expect(preVerificationGas).toBeGreaterThan(0n);
        expect(paymasterVerificationGasLimit).toBeGreaterThan(0n);
        expect(paymasterPostOpGasLimit).toBeGreaterThan(0n);
      } catch (err) {
        const stringifiedError = JSON.stringify(err, null, 2);
        fail(stringifiedError);
      }
    }, 10_000);
  });

  describe("arbitrum-mainnet", () => {
    const viemClient = createPublicClient({
      chain: arbitrum,
      transport: http(),
    });

    const arbitrumGasEstimator = new ArbitrumGasEstimator({
      chainId: arbitrum.id,
      publicClient: new ViemGasEstimatorClient(viemClient as PublicClient),
      entryPointAddress: entryPointV7Address,
    });

    it("estimates gas for a native transfer correctly", async () => {
      try {
        const nexusClient = await createNexusClient({
          k1ValidatorAddress,
          factoryAddress,
          signer: account,
          chain: arbitrum,
          transport: http(),
          bundlerTransport,
        });

        const { maxFeePerGas, maxPriorityFeePerGas, baseFeePerGas } =
          await getEIP1559FeesPerGas(viemClient);

        const { factory, factoryData } = await getFactoryArgs(nexusClient);

        const userOperation = await buildNativeTransferUserOp(
          nexusClient,
          maxFeePerGas,
          maxPriorityFeePerGas,
          factory,
          factoryData
        );

        // this will throw if there's an error in the gas estimation
        const {
          callGasLimit,
          verificationGasLimit,
          preVerificationGas,
          paymasterVerificationGasLimit,
          paymasterPostOpGasLimit,
        } = await arbitrumGasEstimator.estimateUserOperationGas({
          userOperation,
          baseFeePerGas,
        });

        expect(callGasLimit).toBeGreaterThan(21_000n);
        expect(verificationGasLimit).toBeGreaterThan(0n);
        expect(preVerificationGas).toBeGreaterThan(0n);
        expect(paymasterVerificationGasLimit).toBeGreaterThan(0n);
        expect(paymasterPostOpGasLimit).toBeGreaterThan(0n);
      } catch (err) {
        const stringified = JSON.stringify(err, null, 2);
        throw new Error(stringified);
      }
    }, 10_000);
  });
});
