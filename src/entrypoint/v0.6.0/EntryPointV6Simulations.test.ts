import {
  createPublicClient,
  createWalletClient,
  http,
  zeroAddress,
  Address,
  parseEther,
  extractChain,
  Hex,
} from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import {
  BiconomySmartAccountV2,
  createSmartAccountClient,
  getCustomChain,
  UserOperationStruct,
} from "@biconomy/account";
import * as chains from "viem/chains";
import config from "config";
import { EntryPointV6Simulations } from "./EntryPointV6Simulations";
import { UserOperationV6, userOperationV6Schema } from "./UserOperationV6";
import {
  DEFAULT_ENTRYPOINT_V6_SPONSORSHIP_PAYMASTER_ADDRESS,
  DEFAULT_ENTRYPOINT_V6_TOKEN_PAYMASTER_ADDRESS,
  supportedChains,
} from "../../chains/chains";
import { ENTRYPOINT_V6_ADDRESS } from "./constants";
import { describe, it, beforeAll, expect } from "vitest";
import { StateOverrideBuilder } from "../shared/stateOverrides";

describe("e2e", () => {
  describe("EntryPointV6Simulations", () => {
    const privateKey = generatePrivateKey();
    const account = privateKeyToAccount(privateKey);

    const testChains = filterTestChains();

    describe.each(testChains)("On $name ($chainId)", (testChain) => {
      const rpcUrl = config.get<string>(
        `testChains.${testChain.chainId}.rpcUrl`,
      );

      const testSender = config.get<Address>(
        `testChains.${testChain.chainId}.testAddresses.v2`,
      );

      const bundlerUrl = `https://no.bundler.bro/api/v2/${testChain.chainId}/whatever`;

      const transport = http(rpcUrl);

      const viemChain =
        extractChain({
          chains: Object.values(chains),
          id: testChain.chainId as any,
        }) ||
        ({
          id: testChain.chainId,
        } as chains.Chain);

      const viemClient = createPublicClient({
        chain: viemChain,
        transport,
      });

      const signer = createWalletClient({
        account,
        chain: viemChain,
        transport,
      });

      let smartAccount: BiconomySmartAccountV2;
      let userOperation: UserOperationV6;

      const paymasters = testChain?.paymasters?.v060;

      const sponsorshipPaymaster = paymasters
        ? Object.values(paymasters).find(
            (paymaster) => paymaster.type === "sponsorship",
          )
        : undefined;

      const tokenPaymaster = paymasters
        ? Object.values(paymasters).find(
            (paymaster) => paymaster.type === "token",
          )
        : undefined;

      const entryPointContractAddress =
        (testChain.entryPoints?.["v060"]?.address as Address) ||
        ENTRYPOINT_V6_ADDRESS;

      const epv6Simulator = new EntryPointV6Simulations(
        viemClient,
        entryPointContractAddress,
      );

      let maxFeePerGas: bigint, maxPriorityFeePerGas: bigint;

      beforeAll(async () => {
        smartAccount = await createSmartAccountClient({
          signer,
          bundlerUrl,
          customChain: getCustomChain(
            testChain.name,
            testChain.chainId,
            rpcUrl,
            "",
          ),
        });

        const [callData, fees, nonce] = await Promise.all([
          smartAccount.encodeExecute(zeroAddress, 1n, "0x"),
          viemClient.estimateFeesPerGas(),
          epv6Simulator.getNonce(testSender),
        ]);

        if (nonce === 0n) {
          throw new Error(
            `Expected nonce for an existing smart account to be greater than 0, got ${nonce}`,
          );
        }

        maxFeePerGas = fees.maxFeePerGas;
        maxPriorityFeePerGas = fees.maxPriorityFeePerGas;

        const unsignedUserOperation: Partial<UserOperationStruct> = {
          // We are using an existing deployed account so we don't get AA20 account not deployed
          sender: testSender,
          // 🔥 We can't use estimateVerificationGasLimit if init code != 0x (if the account is not deployed)
          initCode: "0x",
          nonce,
          callGasLimit: 20_000_000n,
          maxFeePerGas,
          maxPriorityFeePerGas,
          preVerificationGas: 100_000n,
          verificationGasLimit: 10_000_000n,
          paymasterAndData: "0x",
          callData,
        };

        userOperation = userOperationV6Schema.parse(
          await smartAccount.signUserOp(unsignedUserOperation),
        );
      }, 10_000);

      describe("without a paymaster", () => {
        let stateOverrides: any = undefined;

        describe.runIf(testChain.stateOverrideSupport.balance)(
          "If we can override the sender's balance",
          () => {
            beforeAll(() => {
              stateOverrides = new StateOverrideBuilder()
                .overrideBalance(userOperation.sender, parseEther("10000"))
                .build();
            });

            describe("estimateVerificationGasLimit", () => {
              it("should return a non-zero value", async () => {
                const estimateResult =
                  await epv6Simulator.estimateVerificationGasLimit({
                    userOperation,
                    stateOverrides,
                  });

                expect(estimateResult).toBeDefined();

                const { verificationGasLimit } = estimateResult;
                expect(verificationGasLimit).toBeGreaterThan(0);
              }, 10_000);
            });

            describe("estimateCallGasLimit", () => {
              it("should return a non-zero value", async () => {
                const estimateResult = await epv6Simulator.estimateCallGasLimit(
                  {
                    userOperation,
                    stateOverrides,
                  },
                );
                expect(estimateResult).toBeDefined();
                expect(estimateResult).toBeGreaterThan(0n);
              });
            });
          },
        );
      });

      describe.runIf(testChain.stateOverrideSupport.stateDiff)(
        "If we can override the entrypoint's paymaster deposit",
        () => {
          let stateOverrides: any = undefined;

          beforeAll(() => {
            stateOverrides = new StateOverrideBuilder()
              .overridePaymasterDeposit(
                entryPointContractAddress,
                DEFAULT_ENTRYPOINT_V6_SPONSORSHIP_PAYMASTER_ADDRESS,
              )
              .overridePaymasterDeposit(
                entryPointContractAddress,
                DEFAULT_ENTRYPOINT_V6_TOKEN_PAYMASTER_ADDRESS,
              )
              .overrideBalance(userOperation.sender, 1n)
              .build();
          });

          describe.runIf(sponsorshipPaymaster)(
            "given a sponsorship paymaster",
            () => {
              const paymasterAndData = sponsorshipPaymaster!
                .dummyPaymasterAndData as Hex;

              describe("estimateVerificationGasLimit", () => {
                it("should return a non-zero value", async () => {
                  const sponsoredUserOperation = {
                    ...userOperation,
                    paymasterAndData: paymasterAndData,
                  };

                  const estimateResult =
                    await epv6Simulator.estimateVerificationGasLimit({
                      userOperation: sponsoredUserOperation,
                      stateOverrides,
                    });

                  expect(estimateResult).toBeDefined();

                  const { verificationGasLimit } = estimateResult;
                  expect(verificationGasLimit).toBeGreaterThan(0);
                });
              });

              describe("estimateCallGasLimit", () => {
                it("should return a non-zero value", async () => {
                  const sponsoredUserOperation = {
                    ...userOperation,
                    paymasterAndData,
                  };

                  const callGasLimit = await epv6Simulator.estimateCallGasLimit(
                    {
                      userOperation: sponsoredUserOperation,
                      stateOverrides: new StateOverrideBuilder()
                        .overrideBalance(userOperation.sender, 1n)
                        .build(),
                    },
                  );

                  expect(callGasLimit).toBeDefined();
                  expect(callGasLimit).toBeGreaterThan(0n);
                });
              });
            },
          );

          describe.runIf(tokenPaymaster)(
            "given a token paymaster",
            async () => {
              const paymasterAndData = tokenPaymaster!
                .dummyPaymasterAndData as Hex;

              describe("estimateVerificationGasLimit", () => {
                it("should return a non-zero value", async () => {
                  const estimateResult =
                    await epv6Simulator.estimateVerificationGasLimit({
                      userOperation: {
                        ...userOperation,
                        paymasterAndData: paymasterAndData,
                      },
                      stateOverrides,
                    });

                  expect(estimateResult).toBeDefined();

                  const { verificationGasLimit } = estimateResult;
                  expect(verificationGasLimit).toBeGreaterThan(0);
                });
              });

              describe("estimateCallGasLimit", () => {
                it("should return a non-zero value", async () => {
                  const tokenPaymasterUserOperation = {
                    ...userOperation,
                    paymasterAndData: paymasterAndData,
                  };

                  const callGasLimit = await epv6Simulator.estimateCallGasLimit(
                    {
                      userOperation: tokenPaymasterUserOperation,
                      stateOverrides,
                    },
                  );

                  expect(callGasLimit).toBeGreaterThan(0n);
                });
              });
            },
          );
        },
      );
    });
  });
});

function filterTestChains() {
  const includeChainIds = config.get<number[]>("includeInTests");
  const excludeChainIds = config.get<number[]>("excludeFromTests");

  const testChains = Object.values(supportedChains).filter(
    (chain) =>
      chain.stateOverrideSupport.bytecode &&
      !excludeChainIds.includes(chain.chainId) &&
      (includeChainIds.length === 0 ||
        includeChainIds.includes(chain.chainId)) &&
      config.has(`testChains.${chain.chainId}.testAddresses.v2`),
  );
  return testChains;
}
