import { createPublicClient, http, PublicClient } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { OptimismGasEstimator } from "../GasEstimator/OptimismGasEstimator";
import { createNexusClient } from "@biconomy/sdk";
import { ViemGasEstimatorClient } from "../clients/ViemGasEstimatorClient";
import { base, optimism } from "viem/chains";
import { UserOperation as PackageUserOperation } from "../types";
import {
  buildNativeTransferUserOp,
  bundlerTransport,
  entryPointV7Address,
  getEIP1559FeesPerGas,
  getFactoryArgs,
} from "./helpers";

describe("smoke-test", () => {
  // We create a fresh private key account for test purposes,
  // making sure a new account is created using the factory on each test run
  const privateKey = generatePrivateKey();
  const account = privateKeyToAccount(privateKey);

  describe("op-mainnet", () => {
    const viemClient = createPublicClient({
      chain: optimism,
      transport: http(),
    });

    const opGasEstimator = new OptimismGasEstimator({
      chainId: optimism.id,
      publicClient: new ViemGasEstimatorClient(viemClient as PublicClient),
      entryPointAddress: entryPointV7Address,
    });

    it("estimates gas for a native transfer correctly", async () => {
      let userOperation: PackageUserOperation | undefined;
      try {
        const nexusClient = await createNexusClient({
          signer: account,
          chain: optimism,
          transport: http(),
          bundlerTransport,
        });

        const { factory, factoryData } = await getFactoryArgs(nexusClient);

        const { maxFeePerGas, maxPriorityFeePerGas, baseFeePerGas } =
          await getEIP1559FeesPerGas(viemClient);

        userOperation = await buildNativeTransferUserOp(
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
        } = await opGasEstimator.estimateUserOperationGas({
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
        console.warn(`userOperation=${JSON.stringify(userOperation, null, 2)}`);
        throw new Error(`Error: ${stringified}`);
      }
    }, 10_000);
  });

  describe("base-mainnet", () => {
    const viemClient = createPublicClient({
      chain: base,
      transport: http(),
    });

    const opGasEstimator = new OptimismGasEstimator({
      chainId: base.id,
      publicClient: new ViemGasEstimatorClient(viemClient as PublicClient),
      entryPointAddress: entryPointV7Address,
    });

    it("estimates gas for a native transfer correctly", async () => {
      const nexusClient = await createNexusClient({
        signer: account,
        chain: base,
        transport: http(),
        bundlerTransport,
      });

      const { factory, factoryData } = await getFactoryArgs(nexusClient);

      const { maxFeePerGas, maxPriorityFeePerGas, baseFeePerGas } =
        await getEIP1559FeesPerGas(viemClient);

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
      } = await opGasEstimator.estimateUserOperationGas({
        userOperation,
        baseFeePerGas,
      });

      expect(callGasLimit).toBeGreaterThan(21_000n);
      expect(verificationGasLimit).toBeGreaterThan(0n);
      expect(preVerificationGas).toBeGreaterThan(0n);
      expect(paymasterVerificationGasLimit).toBeGreaterThan(0n);
      expect(paymasterPostOpGasLimit).toBeGreaterThan(0n);
    }, 10_000);
  });
});
