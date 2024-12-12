import {
  createPublicClient,
  createWalletClient,
  http,
  zeroAddress,
  extractChain,
  Address,
  toHex,
  parseEther,
} from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import {
  CALL_GAS_LIMIT_OVERRIDE_VALUE,
  MAX_FEE_PER_GAS_OVERRIDE_VALUE,
  MAX_PRIORITY_FEE_PER_GAS_OVERRIDE_VALUE,
  PRE_VERIFICATION_GAS_OVERRIDE_VALUE,
  UserOperation,
  VERIFICATION_GAS_LIMIT_OVERRIDE_VALUE,
} from "../gas-estimator/entry-point-v6";
import {
  BiconomySmartAccountV2,
  createSmartAccountClient,
  UserOperationStruct,
} from "@biconomy/account";
import * as chains from "viem/chains";
import { EntryPointV6 } from "./EntryPointV6";
import { ParseError } from "./types";
import config from "config";
import { SupportedChain } from "../shared/config";

describe("EntryPointV006", () => {
  describe("simulateHandleOp", () => {
    const supportedChains = config.get<SupportedChain[]>("supportedChains");

    const privateKey = generatePrivateKey();
    const account = privateKeyToAccount(privateKey);

    for (const supportedChain of Object.values(supportedChains)) {
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

            const sender = await smartAccount.getAddress();
            const nonce = await smartAccount.getNonce();
            const initCode = await smartAccount.getInitCode();
            const callData = await smartAccount.encodeExecute(
              zeroAddress,
              1n,
              "0x"
            );

            const unsignedUserOperation: Partial<UserOperationStruct> = {
              sender,
              initCode,
              nonce,
              callGasLimit:
                supportedChain.callGasLimitOverride ||
                CALL_GAS_LIMIT_OVERRIDE_VALUE,
              maxFeePerGas: MAX_FEE_PER_GAS_OVERRIDE_VALUE,
              maxPriorityFeePerGas: MAX_PRIORITY_FEE_PER_GAS_OVERRIDE_VALUE,
              preVerificationGas: PRE_VERIFICATION_GAS_OVERRIDE_VALUE,
              verificationGasLimit:
                supportedChain.verificationGasLimitOverride ||
                VERIFICATION_GAS_LIMIT_OVERRIDE_VALUE,
              paymasterAndData: "0x",
              callData,
            };

            userOperation = (await smartAccount.signUserOp(
              unsignedUserOperation
            )) as UserOperation;
          }, 10_000);

          it("simulateHandleOp should revert with AA21 without a balance override", async () => {
            const epv6 = new EntryPointV6(
              viemClient,
              supportedChain.entryPointV6Address
            );
            try {
              await epv6.simulateHandleOp({
                userOperation,
              });
            } catch (err: any) {
              expect(err).not.toBeInstanceOf(ParseError);

              if (err instanceof Error) {
                expect(err.message).toMatch(/AA21/);
              } else {
                throw new Error(
                  "Expected an error with a message, received: ",
                  err
                );
              }
            }
          }, 10_000);

          if (supportedChain.supportsBalanceOverride) {
            it("simulateHandleOp should return a ExecutionResult with a balance override", async () => {
              const epv6 = new EntryPointV6(
                viemClient,
                supportedChain.entryPointV6Address
              );
              const executionResult = await epv6.simulateHandleOp({
                userOperation,
                balanceStateOverride: {
                  [userOperation.sender]: {
                    balance: toHex(parseEther("10")),
                  },
                },
              });
              expect(executionResult).toBeDefined();
            }, 20_000);
          }
        });
      }
    }
  });
});
