import {
  createPublicClient,
  createWalletClient,
  http,
  zeroAddress,
  extractChain,
  getContract,
  Address,
} from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import {
  ENTRY_POINT_ABI,
  UserOperation,
} from "../gas-estimator/entry-point-v6";
import {
  BiconomySmartAccountV2,
  createSmartAccountClient,
  UserOperationStruct,
} from "@biconomy/account";
import * as chains from "viem/chains";
import config from "config";
import { SupportedChain } from "../shared/config";
import { EntryPointV6Simulations } from "./EntryPointV6Simulations";
import { defaultEntryPointAddresses } from "./constants";
import { EntryPointVersion } from "./types";

describe("EntryPointV6Simulations", () => {
  const supportedChains = config.get<SupportedChain[]>("supportedChains");

  const privateKey = generatePrivateKey();
  const account = privateKeyToAccount(privateKey);

  const excludeChainIds = [43114, 5611, 1115, 1116, 56400, 42170];
  const includeChainIds: number[] = [];

  for (const supportedChain of Object.values(supportedChains)
    .map((c) => c)
    .filter(
      (c) =>
        c.supportsBytecodeOverride &&
        c.deployedSmartAccountAddress &&
        !excludeChainIds.includes(c.chainId) &&
        (includeChainIds.length === 0 || includeChainIds.includes(c.chainId))
    )) {
    const chain = extractChain({
      chains: Object.values(chains),
      id: supportedChain.chainId as any,
    });

    if (chain) {
      describe(`${chain.name} (${chain.id})`, () => {
        const bundlerUrl = `https://bundler.biconomy.io/api/v2/${chain.id}/whatever`;

        const transport = supportedChain.rpcUrl
          ? http(supportedChain.rpcUrl)
          : http();

        const viemClient = createPublicClient({
          chain,
          transport,
        });

        const signer = createWalletClient({
          account,
          chain,
          transport,
        });

        let smartAccount: BiconomySmartAccountV2;
        let userOperation: UserOperation;

        beforeAll(async () => {
          smartAccount = await createSmartAccountClient({
            signer,
            bundlerUrl,
          });

          // we are using an existing deployed account so we don't get AA20 account not deployed
          const sender = supportedChain.deployedSmartAccountAddress;

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
              (supportedChain.entryPointV6Address as Address) ||
              defaultEntryPointAddresses[EntryPointVersion.V006],
            client: viemClient,
          });

          let nonce = 0n;
          try {
            nonce = await epContract.read.getNonce([
              supportedChain.deployedSmartAccountAddress!,
              0n,
            ]);
          } catch (err) {
            console.error(err);
          }

          const unsignedUserOperation: Partial<UserOperationStruct> = {
            sender,
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
              supportedChain.entryPointV6Address
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
              supportedChain.entryPointV6Address
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
  }
});
