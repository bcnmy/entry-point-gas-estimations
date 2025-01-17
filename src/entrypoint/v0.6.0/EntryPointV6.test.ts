import {
  createPublicClient,
  createWalletClient,
  http,
  zeroAddress,
  Address,
  Hex,
  extractChain,
  toHex,
  parseEther,
} from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import {
  BiconomySmartAccountV2,
  createSmartAccountClient,
  getCustomChain,
  UserOperationStruct,
} from "@biconomy/account";
import { EntryPointV6 } from "./EntryPointV6";
import config from "config";
import {
  ENTRYPOINT_V6_ADDRESS,
  MAX_FEE_PER_GAS_OVERRIDE_VALUE,
  MAX_PRIORITY_FEE_PER_GAS_OVERRIDE_VALUE,
} from "./constants";
import { UserOperationV6, userOperationV6Schema } from "./UserOperationV6";
import { supportedChains } from "../../chains/chains";
import {
  SIMULATION_CALL_GAS_LIMIT,
  SIMULATION_PRE_VERIFICATION_GAS,
  SIMULATION_VERIFICATION_GAS_LIMIT,
} from "../../gas-estimator/evm/constants";
import { describe, it, beforeAll, expect } from "vitest";
import * as chains from "viem/chains";
import { StateOverrideBuilder } from "../shared/stateOverrides";
import { getPaymasterAddressFromPaymasterAndData } from "../../paymaster/utils";

describe("e2e", () => {
  describe("EntryPointV6", () => {
    const privateKey = generatePrivateKey();
    const account = privateKeyToAccount(privateKey);

    const testChains = filterTestChains();

    describe.each(testChains)("On $name ($chainId)", (testChain) => {
      const bundlerUrl = `https://host.com/api/v2/${testChain.chainId}/apikey`;

      const rpcUrl = config.get<string>(
        `testChains.${testChain.chainId}.rpcUrl`,
      );

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
        chain: viemChain,
        account,
        transport,
      });

      let smartAccount: BiconomySmartAccountV2;
      let callData: Hex;

      const entryPointContractAddress =
        (testChain.entryPoints?.["v060"]?.address as Address) ||
        ENTRYPOINT_V6_ADDRESS;

      const epv6 = new EntryPointV6(viemClient, entryPointContractAddress);

      const paymasters = testChain.paymasters?.v060;

      beforeAll(async () => {
        smartAccount = await createSmartAccountClient({
          customChain: getCustomChain(
            testChain.name,
            testChain.chainId,
            rpcUrl,
            "",
          ),
          signer,
          bundlerUrl,
        });

        callData = await smartAccount.encodeExecute(zeroAddress, 1n, "0x");
      }, 20_000);

      describe("simulateHandleOp", () => {
        let userOperation: UserOperationV6;

        beforeAll(async () => {
          const [sender, nonce, initCode] = await Promise.all([
            smartAccount.getAddress(),
            smartAccount.getNonce(),
            smartAccount.getInitCode(),
          ]);

          const unsignedUserOperation: Partial<UserOperationStruct> = {
            sender,
            initCode,
            nonce,
            callGasLimit:
              testChain.simulation?.callGasLimit || SIMULATION_CALL_GAS_LIMIT,
            maxFeePerGas: MAX_FEE_PER_GAS_OVERRIDE_VALUE,
            maxPriorityFeePerGas: MAX_PRIORITY_FEE_PER_GAS_OVERRIDE_VALUE,
            preVerificationGas:
              testChain.simulation?.preVerificationGas ||
              SIMULATION_PRE_VERIFICATION_GAS,
            verificationGasLimit:
              testChain.simulation?.verificationGasLimit ||
              SIMULATION_VERIFICATION_GAS_LIMIT,
            paymasterAndData: "0x",
            callData,
          };

          const signedUserOperation = await smartAccount.signUserOp(
            unsignedUserOperation,
          );

          userOperation = userOperationV6Schema.parse(signedUserOperation);
        });

        describe("without a paymaster", () => {
          it("should revert with AA21 without a balance override", async () => {
            try {
              await epv6.simulateHandleOp({
                userOperation,
                targetAddress: epv6.address,
                targetCallData: userOperation.callData,
              });
            } catch (err: any) {
              if (err instanceof Error) {
                expect(err.message).toMatch(/AA21/);
              } else {
                throw new Error(
                  "Expected an error with a message, received: ",
                  err,
                );
              }
            }
          }, 20_000);

          it.runIf(testChain.stateOverrideSupport.balance)(
            "should return a ExecutionResult for a undeployed smart account",
            async () => {
              const stateOverrides = new StateOverrideBuilder()
                .overrideBalance(userOperation.sender, parseEther("10"))
                .build();

              const executionResult = await epv6.simulateHandleOp({
                userOperation,
                targetAddress: epv6.address,
                targetCallData: userOperation.callData,
                stateOverrides,
              });
              expect(executionResult).toBeDefined();

              const { paid, preOpGas } = executionResult;

              expect(paid).toBeGreaterThan(0);
              expect(preOpGas).toBeGreaterThan(0);
            },
          );

          it.runIf(
            config.has(`testChains.${testChain.chainId}.testAddresses.v2`),
          )(
            "should return an ExecutionResult for a deployed smart account, given a balance override",
            async () => {
              const sender = config.get<Address>(
                `testChains.${testChain.chainId}.testAddresses.v2`,
              );
              const initCode = "0x";
              const nonce = await epv6.getNonce(sender);

              const executionResult = await epv6.simulateHandleOp({
                userOperation: {
                  ...userOperation,
                  sender,
                  initCode,
                  nonce,
                },
                targetAddress: epv6.address,
                targetCallData: userOperation.callData,
                stateOverrides: new StateOverrideBuilder()
                  .overrideBalance(sender, parseEther("10"))
                  .build(),
              });
              expect(executionResult).toBeDefined();

              const { paid, preOpGas } = executionResult;

              expect(paid).toBeGreaterThan(0);
              expect(preOpGas).toBeGreaterThan(0);
            },
          );
        }, 20_000);

        describe.runIf(paymasters && testChain.stateOverrideSupport.stateDiff)(
          "with a paymaster",
          () => {
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

            it.runIf(sponsorshipPaymaster)(
              "should return an ExecutionResult for a undeployed smart account, given a sponsorship paymaster",
              async () => {
                const paymasterAndData = sponsorshipPaymaster!
                  .dummyPaymasterAndData as Hex;

                const stateOverrides = new StateOverrideBuilder()
                  .overrideBalance(userOperation.sender, 1n)
                  .overridePaymasterDeposit(
                    entryPointContractAddress,
                    getPaymasterAddressFromPaymasterAndData(paymasterAndData),
                  )
                  .build();

                const executionResult = await epv6.simulateHandleOp({
                  userOperation: {
                    ...userOperation,
                    paymasterAndData,
                  },
                  targetAddress: epv6.address,
                  targetCallData: userOperation.callData,
                  stateOverrides,
                });
                expect(executionResult).toBeDefined();

                const { paid, preOpGas } = executionResult;

                expect(paid).toBeGreaterThan(0);
                expect(preOpGas).toBeGreaterThan(0);
              },
              20_000,
            );

            it.runIf(tokenPaymaster)(
              "should return an ExecutionResult for a undeployed smart account, given a token paymaster",
              async () => {
                const paymasterAndData = tokenPaymaster!
                  .dummyPaymasterAndData as Hex;

                const stateOverrideBuilder = new StateOverrideBuilder()
                  .overridePaymasterDeposit(
                    entryPointContractAddress,
                    getPaymasterAddressFromPaymasterAndData(paymasterAndData),
                  )
                  .overrideBalance(userOperation.sender, 1n);

                const stateOverrides = stateOverrideBuilder.build();

                const executionResult = await epv6.simulateHandleOp({
                  userOperation: {
                    ...userOperation,
                    paymasterAndData,
                  },
                  targetAddress: epv6.address,
                  targetCallData: userOperation.callData,
                  stateOverrides,
                });
                expect(executionResult).toBeDefined();

                const { paid, preOpGas } = executionResult;

                expect(paid).toBeGreaterThan(0);
                expect(preOpGas).toBeGreaterThan(0);
              },
              20_000,
            );
          },
        );
      });
    });
  });
});

/**
 * Filter test chains based on config.
 */
export function filterTestChains() {
  const includeChainIds = config.get<number[]>("includeInTests");
  const excludeChainIds = config.get<number[]>("excludeFromTests");

  const testChains = Object.values(supportedChains).filter(
    (chain) =>
      !excludeChainIds.includes(chain.chainId) &&
      (includeChainIds.length === 0 || includeChainIds.includes(chain.chainId)),
  );
  return testChains;
}
