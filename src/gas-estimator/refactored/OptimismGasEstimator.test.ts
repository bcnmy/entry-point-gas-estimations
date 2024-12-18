import { optimism } from "viem/chains";
import { EntryPointVersion } from "../../entrypoint/shared/types";
import { EntryPointV6 } from "../../entrypoint/v0.6.0/EntryPointV6";
import { EntryPointV6Simulations } from "../../entrypoint/v0.6.0/EntryPointV6Simulations";
import { EntryPointV7Simulations } from "../../entrypoint/v0.7.0/EntryPointV7Simulations";
import { SimulationOptions } from "./EVMGasEstimator";
import { createGasEstimator } from "./GasEstimator";
import { OptimismGasEstimator } from "./OptimismGasEstimator";
import { EntryPoints, GasEstimatorRpcClient } from "./types";
import config from "config";
import { SupportedChain } from "../../shared/config";
import {
  createPublicClient,
  createWalletClient,
  Hex,
  http,
  zeroAddress,
} from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import {
  BiconomySmartAccountV2,
  createSmartAccountClient,
  UserOperationStruct,
} from "@biconomy/account";
import { UserOperationV6 } from "../../entrypoint/v0.6.0/UserOperationV6";
import {
  SIMULATION_CALL_GAS_LIMIT,
  SIMULATION_PRE_VERIFICATION_GAS,
  SIMULATION_VERIFICATION_GAS_LIMIT,
} from "./constants";

describe("OptimismGasEstimator", () => {
  describe("unit", () => {
    const mockRpcClient: GasEstimatorRpcClient = {
      readContract: jest.fn().mockResolvedValue(1n),
      estimateGas: jest.fn().mockResolvedValue(1n),
      chain: optimism,
      request: jest.fn(),
    };

    const mockEntryPoints: EntryPoints = {
      [EntryPointVersion.v060]: {
        contract: {
          encodeHandleOpsFunctionData: jest.fn().mockReturnValue("0x"),
        } as unknown as EntryPointV6,
        simulations: {} as EntryPointV6Simulations,
      },
      [EntryPointVersion.v070]: {
        contract: {} as EntryPointV7Simulations,
      },
    };
    it("should take the L1 fee into account when calculating the pre-verification gas", async () => {
      const opGasEstimator = new OptimismGasEstimator(
        10,
        mockRpcClient,
        mockEntryPoints,
        {} as SimulationOptions
      );

      const pvg = await opGasEstimator.estimatePreVerificationGas(
        {
          callData: "0x",
          sender: "0xb7744Ce158A09183F01296bCB262bB9F65E2FFd7",
          preVerificationGas: 1n,
          verificationGasLimit: 1n,
          callGasLimit: 1n,
          maxFeePerGas: 1n,
          maxPriorityFeePerGas: 1n,
          initCode: "0x",
          nonce: 1n,
          paymasterAndData: "0x",
          signature: "0x",
        },
        1n
      );

      expect(pvg).toBeDefined();
      expect(mockRpcClient.readContract).toHaveBeenCalled();
    });

    it("should the L1 fee into account when calculating the pre-verification gas, when created by a factory", async () => {
      const opGasEstimator = createGasEstimator({
        chainId: 10,
        rpcClient: mockRpcClient,
      });

      const pvg = await opGasEstimator.estimatePreVerificationGas(
        {
          callData: "0x",
          sender: "0xb7744Ce158A09183F01296bCB262bB9F65E2FFd7",
          preVerificationGas: 1n,
          verificationGasLimit: 1n,
          callGasLimit: 1n,
          maxFeePerGas: 1n,
          maxPriorityFeePerGas: 1n,
          initCode: "0x",
          nonce: 1n,
          paymasterAndData: "0x",
          signature: "0x",
        },
        1n
      );

      expect(pvg).toBeDefined();
      expect(mockRpcClient.readContract).toHaveBeenCalled();
    });
  });

  describe("e2e", () => {
    const supportedChains =
      config.get<Record<string, SupportedChain>>("supportedChains");

    const optimismConfig = supportedChains[optimism.id];
    const transport = http(optimismConfig.rpcUrl);
    const viemClient = createPublicClient({
      chain: optimism,
      transport,
    });

    const privateKey = generatePrivateKey();
    const account = privateKeyToAccount(privateKey);

    const signer = createWalletClient({
      account,
      chain: optimism,
      transport,
    });

    const bundlerUrl = `https://bundler.biconomy.io/api/v2/${optimism.id}/whatever`;

    let maxFeePerGas: bigint;
    let maxPriorityFeePerGas: bigint;
    let baseFeePerGas: bigint;
    let smartAccount: BiconomySmartAccountV2;
    let nativeTransferCallData: Hex;

    const opGasEstimator = new OptimismGasEstimator(
      optimism.id,
      viemClient,
      {
        [EntryPointVersion.v060]: {
          contract: new EntryPointV6(viemClient),
          simulations: new EntryPointV6Simulations(viemClient),
        },
        [EntryPointVersion.v070]: {
          contract: new EntryPointV7Simulations(viemClient),
        },
      },
      {
        preVerificationGas: SIMULATION_PRE_VERIFICATION_GAS,
        verificationGasLimit: SIMULATION_VERIFICATION_GAS_LIMIT,
        callGasLimit: SIMULATION_CALL_GAS_LIMIT,
      }
    );

    beforeAll(async () => {
      const [fees, latestBlock] = await Promise.all([
        viemClient.estimateFeesPerGas(),
        viemClient.getBlock({
          blockTag: "latest",
        }),
      ]);

      maxFeePerGas = fees.maxFeePerGas;
      maxPriorityFeePerGas = fees.maxPriorityFeePerGas;

      if (!latestBlock.baseFeePerGas) {
        throw new Error(`baseFeePerGas is null`);
      }
      baseFeePerGas = latestBlock.baseFeePerGas;

      smartAccount = await createSmartAccountClient({
        signer,
        bundlerUrl,
      });

      nativeTransferCallData = await smartAccount.encodeExecute(
        zeroAddress,
        1n,
        "0x"
      );
    }, 20_000);

    it("should estimate pvg correctly", async () => {
      let unsignedUserOperation: Partial<UserOperationStruct> = {
        sender: await smartAccount.getAddress(),
        initCode: await smartAccount.getInitCode(),
        nonce: await smartAccount.getNonce(),
        callGasLimit: 1n,
        maxFeePerGas,
        maxPriorityFeePerGas,
        preVerificationGas: 1n,
        verificationGasLimit: 1n,
        paymasterAndData: "0x",
        callData: nativeTransferCallData,
      };

      const userOperation = (await smartAccount.signUserOp(
        unsignedUserOperation
      )) as UserOperationV6;

      const pvg = await opGasEstimator.estimatePreVerificationGas(
        userOperation,
        baseFeePerGas
      );

      expect(pvg).toBeDefined();
      expect(pvg).toBeGreaterThan(0n);
      expect(typeof pvg).toBe("bigint");
    });
  });
});
