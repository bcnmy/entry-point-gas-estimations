import {
  createPublicClient,
  createWalletClient,
  http,
  zeroAddress,
  getContract,
  Address,
} from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import {
  ENTRY_POINT_ABI,
  UserOperation,
} from "../../gas-estimator/entry-point-v6";
import {
  BiconomySmartAccountV2,
  createSmartAccountClient,
  getCustomChain,
  UserOperationStruct,
} from "@biconomy/account";
import * as chains from "viem/chains";
import config from "config";
import { SupportedChain } from "../../shared/config";
import { EntryPointV6Simulations } from "./EntryPointV6Simulations";
import { ENTRYPOINT_V6_ADDRESS } from "./constants";

describe("EntryPointV6Simulations", () => {
  const privateKey = generatePrivateKey();
  const account = privateKeyToAccount(privateKey);

  const supportedChains =
    config.get<Record<string, SupportedChain>>("supportedChains");

  const includeChainIds = config.get<number[]>("includeInTests");
  const excludeChainIds = config.get<number[]>("excludeFromTests");

  for (const supportedChain of Object.values(supportedChains)
    .map((c) => c)
    .filter(
      (c) =>
        c.stateOverrideSupport.bytecode &&
        c.entryPoints?.["v0.6.0"].existingSmartAccountAddress &&
        !excludeChainIds.includes(c.chainId) &&
        (includeChainIds.length === 0 || includeChainIds.includes(c.chainId))
    )) {
    describe(`${supportedChain.name} (${supportedChain.chainId})`, () => {
      const bundlerUrl = `https://bundler.biconomy.io/api/v2/${supportedChain.chainId}/whatever`;

      const transport = supportedChain.rpcUrl
        ? http(supportedChain.rpcUrl)
        : http();

      const viemClient = createPublicClient({
        chain: {
          id: supportedChain.chainId,
        } as chains.Chain,
        transport,
      });

      const signer = createWalletClient({
        account,
        chain: {
          id: supportedChain.chainId,
        } as chains.Chain,
        transport,
      });

      let smartAccount: BiconomySmartAccountV2;
      let userOperation: UserOperation;

      beforeAll(async () => {
        smartAccount = await createSmartAccountClient({
          signer,
          bundlerUrl,
          customChain: getCustomChain(
            supportedChain.name!,
            supportedChain.chainId,
            supportedChain.rpcUrl!,
            ""
          ),
        });

        // 🔥 We can't use estimateVerificationGasLimit if init code != 0x
        const initCode = "0x";

        const callData = await smartAccount.encodeExecute(
          zeroAddress,
          1n,
          "0x"
        );

        const { maxFeePerGas, maxPriorityFeePerGas } =
          await viemClient.estimateFeesPerGas();

        const epContract = getContract({
          abi: ENTRY_POINT_ABI,
          address:
            (supportedChain.entryPoints?.["v0.6.0"].address as Address) ||
            ENTRYPOINT_V6_ADDRESS,
          client: viemClient,
        });

        let nonce = 0n;
        try {
          nonce = await epContract.read.getNonce([
            supportedChain.entryPoints?.["v0.6.0"]
              .existingSmartAccountAddress! as Address,
            0n,
          ]);
        } catch (err) {
          console.error(err);
        }

        const unsignedUserOperation: Partial<UserOperationStruct> = {
          // we are using an existing deployed account so we don't get AA20 account not deployed
          sender:
            supportedChain.entryPoints?.["v0.6.0"].existingSmartAccountAddress!,
          initCode,
          nonce,
          callGasLimit: 20_000_000n,
          maxFeePerGas,
          maxPriorityFeePerGas,
          preVerificationGas: 100_000n,
          verificationGasLimit: 10_000_000n,
          paymasterAndData: "0x",
          callData,
        };

        userOperation = (await smartAccount.signUserOp(
          unsignedUserOperation
        )) as UserOperation;
      }, 10_000);

      describe("estimateVerificationGasLimit", () => {
        it("should return a value greater than 0", async () => {
          const epv6Simulator = new EntryPointV6Simulations(
            viemClient,
            supportedChain.entryPoints?.["v0.6.0"].address as Address
          );

          const estimateResult =
            await epv6Simulator.estimateVerificationGasLimit({
              userOperation,
            });

          expect(estimateResult).toBeDefined();

          const { verificationGasLimit } = estimateResult;
          expect(verificationGasLimit).toBeGreaterThan(0);
        }, 10_000);
      });

      describe("estimateCallGasLimit", () => {
        it("should return a value greater than 0", async () => {
          const epv6Simulator = new EntryPointV6Simulations(
            viemClient,
            supportedChain.entryPoints?.["v0.6.0"].address as Address
          );
          const estimateResult = await epv6Simulator.estimateCallGasLimit({
            userOperation,
          });
          expect(estimateResult).toBeDefined();
          expect(estimateResult).toBeGreaterThan(0n);
        });
      });
    });
  }
});
