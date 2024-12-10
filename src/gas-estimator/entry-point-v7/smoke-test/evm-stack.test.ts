import { createPublicClient, http, PublicClient } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import {
  avalanche,
  avalancheFuji,
  bsc,
  bscTestnet,
  gnosis,
  gnosisChiado,
  mainnet,
  polygon,
  polygonAmoy,
  sepolia,
} from "viem/chains";
import { GasEstimator } from "../GasEstimator/GasEstimator";
import {
  buildNativeTransferUserOp,
  bundlerTransport,
  entryPointV7Address,
  factoryAddress,
  getEIP1559FeesPerGas,
  getFactoryArgs,
  k1ValidatorAddress,
} from "./helpers";
import { ViemGasEstimatorClient } from "../clients";
import { createNexusClient } from "@biconomy/sdk";
import { UserOperation as PackageUserOperation } from "../types";
import { toPackedUserOperation } from "../utils";

describe("smoke-test", () => {
  // So Jest doesn't complain about BigInt serialization
  (BigInt.prototype as any).toJSON = function () {
    return this.toString();
  };

  // We create a fresh private key account for test purposes,
  // making sure a new account is created using the factory on each test run
  const account = privateKeyToAccount(generatePrivateKey());

  // Skip because the contracts are not attested yet
  describe.skip("ethereum-sepolia", () => {
    const viemClient = createPublicClient({
      chain: sepolia,
      transport: http(),
    });

    const ethereumGasEstimator = new GasEstimator({
      chainId: sepolia.id,
      publicClient: new ViemGasEstimatorClient(viemClient as PublicClient),
      entryPointAddress: entryPointV7Address,
    });

    it("estimates gas for a native transfer correctly", async () => {
      let userOperation: PackageUserOperation | undefined;
      // we need to use a try-catch block because there's an bug in jest with worker threads with bigint serialization otherwise
      try {
        const nexusClient = await createNexusClient({
          k1ValidatorAddress,
          factoryAddress,
          signer: account,
          chain: sepolia,
          transport: http(),
          bundlerTransport,
        });

        const { maxFeePerGas, maxPriorityFeePerGas, baseFeePerGas } =
          await getEIP1559FeesPerGas(viemClient);

        const { factory, factoryData } = await getFactoryArgs(nexusClient);

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
        } = await ethereumGasEstimator.estimateUserOperationGas({
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
        console.warn(
          `userOperation=${JSON.stringify(
            userOperation ? toPackedUserOperation(userOperation) : undefined,
            null,
            2
          )}`
        );
        console.error(err);
        throw new Error("Error: " + stringifiedError);
      }
    }, 10_000);
  });

  // Skip because the contracts are not attested yet
  describe.skip("ethereum-mainnet", () => {
    const viemClient = createPublicClient({
      chain: mainnet,
      transport: http(),
    });

    const ethereumGasEstimator = new GasEstimator({
      chainId: mainnet.id,
      publicClient: new ViemGasEstimatorClient(viemClient as PublicClient),
      entryPointAddress: entryPointV7Address,
    });

    it("estimates gas for a native transfer correctly", async () => {
      let userOperation: PackageUserOperation | undefined;
      // we need to use a try-catch block because there's an bug in jest with worker threads with bigint serialization otherwise
      try {
        const nexusClient = await createNexusClient({
          k1ValidatorAddress,
          factoryAddress,
          signer: account,
          chain: mainnet,
          transport: http(),
          bundlerTransport,
        });

        const { maxFeePerGas, maxPriorityFeePerGas, baseFeePerGas } =
          await getEIP1559FeesPerGas(viemClient);

        const { factory, factoryData } = await getFactoryArgs(nexusClient);

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
        } = await ethereumGasEstimator.estimateUserOperationGas({
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
        console.warn(
          `[ethereum-mainnet] userOperation=${JSON.stringify(
            userOperation ? toPackedUserOperation(userOperation) : undefined,
            null,
            2
          )}`
        );
        console.error(err);
        throw new Error("Error: " + stringifiedError);
      }
    }, 10_000);
  });

  describe("polygon-mainnet", () => {
    const viemClient = createPublicClient({
      chain: polygon,
      transport: http(),
    });

    const ethereumGasEstimator = new GasEstimator({
      chainId: polygon.id,
      publicClient: new ViemGasEstimatorClient(viemClient as PublicClient),
      entryPointAddress: entryPointV7Address,
    });

    it("estimates gas for a native transfer correctly", async () => {
      let userOperation: PackageUserOperation | undefined;
      // we need to use a try-catch block because there's an bug in jest with worker threads with bigint serialization otherwise
      try {
        const nexusClient = await createNexusClient({
          k1ValidatorAddress,
          factoryAddress,
          signer: account,
          chain: polygon,
          transport: http(),
          bundlerTransport,
        });

        const { maxFeePerGas, maxPriorityFeePerGas, baseFeePerGas } =
          await getEIP1559FeesPerGas(viemClient);

        const { factory, factoryData } = await getFactoryArgs(nexusClient);

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
        } = await ethereumGasEstimator.estimateUserOperationGas({
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
        console.warn(
          `[polygon-mainnet] userOperation=${JSON.stringify(
            userOperation ? toPackedUserOperation(userOperation) : undefined,
            null,
            2
          )}`
        );
        console.error(err);
        throw new Error("Error: " + stringifiedError);
      }
    });
  });

  describe("polygon-amoy", () => {
    const viemClient = createPublicClient({
      chain: polygonAmoy,
      transport: http(),
    });

    const ethereumGasEstimator = new GasEstimator({
      chainId: polygonAmoy.id,
      publicClient: new ViemGasEstimatorClient(viemClient as PublicClient),
      entryPointAddress: entryPointV7Address,
    });

    it("estimates gas for a native transfer correctly", async () => {
      let userOperation: PackageUserOperation | undefined;
      // we need to use a try-catch block because there's an bug in jest with worker threads with bigint serialization otherwise
      try {
        const nexusClient = await createNexusClient({
          k1ValidatorAddress,
          factoryAddress,
          signer: account,
          chain: polygonAmoy,
          transport: http(),
          bundlerTransport,
        });

        const { maxFeePerGas, maxPriorityFeePerGas, baseFeePerGas } =
          await getEIP1559FeesPerGas(viemClient);

        const { factory, factoryData } = await getFactoryArgs(nexusClient);

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
        } = await ethereumGasEstimator.estimateUserOperationGas({
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
        console.warn(
          `[polygon-amoy] userOperation=${JSON.stringify(
            userOperation ? toPackedUserOperation(userOperation) : undefined,
            null,
            2
          )}`
        );
        console.error(err);
        throw new Error("Error: " + stringifiedError);
      }
    });
  });

  describe("bsc-mainnet", () => {
    const viemClient = createPublicClient({
      chain: bsc,
      transport: http(),
    });

    const ethereumGasEstimator = new GasEstimator({
      chainId: bsc.id,
      publicClient: new ViemGasEstimatorClient(viemClient as PublicClient),
      entryPointAddress: entryPointV7Address,
    });

    it("estimates gas for a native transfer correctly", async () => {
      let userOperation: PackageUserOperation | undefined;
      // we need to use a try-catch block because there's an bug in jest with worker threads with bigint serialization otherwise
      try {
        const nexusClient = await createNexusClient({
          k1ValidatorAddress,
          factoryAddress,
          signer: account,
          chain: bsc,
          transport: http(),
          bundlerTransport,
        });

        const { maxFeePerGas, maxPriorityFeePerGas, baseFeePerGas } =
          await getEIP1559FeesPerGas(viemClient);

        const { factory, factoryData } = await getFactoryArgs(nexusClient);

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
        } = await ethereumGasEstimator.estimateUserOperationGas({
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
        console.warn(
          `[bsc-mainnet] userOperation=${JSON.stringify(
            userOperation ? toPackedUserOperation(userOperation) : undefined,
            null,
            2
          )}`
        );
        console.error(`[bsc-mainnet] ${err}`);
        throw new Error("Error: " + stringifiedError);
      }
    });
  });

  describe("bsc-testnet", () => {
    const viemClient = createPublicClient({
      chain: bscTestnet,
      transport: http(),
    });

    const ethereumGasEstimator = new GasEstimator({
      chainId: bscTestnet.id,
      publicClient: new ViemGasEstimatorClient(viemClient as PublicClient),
      entryPointAddress: entryPointV7Address,
    });

    it("estimates gas for a native transfer correctly", async () => {
      let userOperation: PackageUserOperation | undefined;
      // we need to use a try-catch block because there's an bug in jest with worker threads with bigint serialization otherwise
      try {
        const nexusClient = await createNexusClient({
          k1ValidatorAddress,
          factoryAddress,
          signer: account,
          chain: bscTestnet,
          transport: http(),
          bundlerTransport,
        });

        const { maxFeePerGas, maxPriorityFeePerGas, baseFeePerGas } =
          await getEIP1559FeesPerGas(viemClient);

        const { factory, factoryData } = await getFactoryArgs(nexusClient);

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
        } = await ethereumGasEstimator.estimateUserOperationGas({
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
        console.warn(
          `[bsc-testnet] userOperation=${JSON.stringify(
            userOperation ? toPackedUserOperation(userOperation) : undefined,
            null,
            2
          )}`
        );
        console.error(err);
        throw new Error("Error: " + stringifiedError);
      }
    });
  });

  // Skipping because it throws 'invalid opcode: MCOPY'
  describe.skip("avalanche-mainnet", () => {
    const viemClient = createPublicClient({
      chain: avalanche,
      transport: http(),
    });

    const ethereumGasEstimator = new GasEstimator({
      chainId: avalanche.id,
      publicClient: new ViemGasEstimatorClient(viemClient as PublicClient),
      entryPointAddress: entryPointV7Address,
    });

    it("estimates gas for a native transfer correctly", async () => {
      let userOperation: PackageUserOperation | undefined;
      // we need to use a try-catch block because there's an bug in jest with worker threads with bigint serialization otherwise
      try {
        const nexusClient = await createNexusClient({
          k1ValidatorAddress,
          factoryAddress,
          signer: account,
          chain: avalanche,
          transport: http(),
          bundlerTransport,
        });

        const { maxFeePerGas, maxPriorityFeePerGas, baseFeePerGas } =
          await getEIP1559FeesPerGas(viemClient);

        const { factory, factoryData } = await getFactoryArgs(nexusClient);

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
        } = await ethereumGasEstimator.estimateUserOperationGas({
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
        console.warn(
          `[avalanche-mainnet] userOperation=${JSON.stringify(
            userOperation ? toPackedUserOperation(userOperation) : undefined,
            null,
            2
          )}`
        );
        console.error(err);
        throw new Error("Error: " + stringifiedError);
      }
    }, 10_000);
  });

  describe("avalanche-fuji", () => {
    const viemClient = createPublicClient({
      chain: avalancheFuji,
      transport: http(),
    });

    const ethereumGasEstimator = new GasEstimator({
      chainId: avalancheFuji.id,
      publicClient: new ViemGasEstimatorClient(viemClient as PublicClient),
      entryPointAddress: entryPointV7Address,
    });

    it("estimates gas for a native transfer correctly", async () => {
      let userOperation: PackageUserOperation | undefined;
      // we need to use a try-catch block because there's an bug in jest with worker threads with bigint serialization otherwise
      try {
        const nexusClient = await createNexusClient({
          k1ValidatorAddress,
          factoryAddress,
          signer: account,
          chain: avalancheFuji,
          transport: http(),
          bundlerTransport,
        });

        const { maxFeePerGas, maxPriorityFeePerGas, baseFeePerGas } =
          await getEIP1559FeesPerGas(viemClient);

        const { factory, factoryData } = await getFactoryArgs(nexusClient);

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
        } = await ethereumGasEstimator.estimateUserOperationGas({
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
        console.warn(
          `[avalanche-fuji] userOperation=${JSON.stringify(
            userOperation ? toPackedUserOperation(userOperation) : undefined,
            null,
            2
          )}`
        );
        console.error(err);
        throw new Error("Error: " + stringifiedError);
      }
    }, 10_000);
  });

  // Skipping because it throws 'AA14 initCode must return sender`
  describe.skip("gnosis-mainnet", () => {
    const viemClient = createPublicClient({
      chain: gnosis,
      transport: http(),
    });

    const ethereumGasEstimator = new GasEstimator({
      chainId: gnosis.id,
      publicClient: new ViemGasEstimatorClient(viemClient as PublicClient),
      entryPointAddress: entryPointV7Address,
    });

    it("estimates gas for a native transfer correctly", async () => {
      let userOperation: PackageUserOperation | undefined;
      // we need to use a try-catch block because there's an bug in jest with worker threads with bigint serialization otherwise
      try {
        const nexusClient = await createNexusClient({
          k1ValidatorAddress,
          factoryAddress,
          signer: account,
          chain: gnosis,
          transport: http(),
          bundlerTransport,
        });

        const { maxFeePerGas, maxPriorityFeePerGas, baseFeePerGas } =
          await getEIP1559FeesPerGas(viemClient);

        const { factory, factoryData } = await getFactoryArgs(nexusClient);

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
        } = await ethereumGasEstimator.estimateUserOperationGas({
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
        console.warn(
          `[gnosis-mainnet] userOperation=${JSON.stringify(
            userOperation ? toPackedUserOperation(userOperation) : undefined,
            null,
            2
          )}`
        );
        console.error(err);
        throw new Error("Error: " + stringifiedError);
      }
    }, 10_000);
  });

  describe.skip("gnosis-chiado", () => {
    const viemClient = createPublicClient({
      chain: gnosisChiado,
      transport: http(),
    });

    const ethereumGasEstimator = new GasEstimator({
      chainId: gnosisChiado.id,
      publicClient: new ViemGasEstimatorClient(viemClient as PublicClient),
      entryPointAddress: entryPointV7Address,
    });

    it("estimates gas for a native transfer correctly", async () => {
      let userOperation: PackageUserOperation | undefined;
      // we need to use a try-catch block because there's an bug in jest with worker threads with bigint serialization otherwise
      try {
        const nexusClient = await createNexusClient({
          k1ValidatorAddress,
          factoryAddress,
          signer: account,
          chain: gnosisChiado,
          transport: http(),
          bundlerTransport,
        });

        const { maxFeePerGas, maxPriorityFeePerGas, baseFeePerGas } =
          await getEIP1559FeesPerGas(viemClient);

        const { factory, factoryData } = await getFactoryArgs(nexusClient);

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
        } = await ethereumGasEstimator.estimateUserOperationGas({
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
        console.warn(
          `[gnosis-chiado] userOperation=${JSON.stringify(
            userOperation ? toPackedUserOperation(userOperation) : undefined,
            null,
            2
          )}`
        );
        console.error(err);
        throw new Error("Error: " + stringifiedError);
      }
    }, 10_000);
  });
});
