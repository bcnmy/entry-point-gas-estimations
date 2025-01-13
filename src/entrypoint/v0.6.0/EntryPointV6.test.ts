import {
  createPublicClient,
  createWalletClient,
  http,
  zeroAddress,
  Address,
  toHex,
  parseEther,
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
import { EntryPointV6 } from "./EntryPointV6";
import { ParseError } from "./types";
import config from "config";
import {
  ENTRYPOINT_V6_ADDRESS,
  MAX_FEE_PER_GAS_OVERRIDE_VALUE,
  MAX_PRIORITY_FEE_PER_GAS_OVERRIDE_VALUE,
} from "./constants";
import { userOperationV6Schema } from "./UserOperationV6";
import { supportedChains } from "../../chains/chains";
import {
  SIMULATION_CALL_GAS_LIMIT,
  SIMULATION_PRE_VERIFICATION_GAS,
  SIMULATION_VERIFICATION_GAS_LIMIT,
} from "../../gas-estimator/evm/constants";
import { describe, it, beforeAll, expect } from "vitest";

describe("DefaultEntryPointV6", () => {
  const privateKey = generatePrivateKey();
  const account = privateKeyToAccount(privateKey);

  const includeChainIds = config.get<number[]>("includeInTests");
  const excludeChainIds = config.get<number[]>("excludeFromTests");

  const testChains = Object.values(supportedChains).filter(
    (chain) =>
      !excludeChainIds.includes(chain.chainId) &&
      (includeChainIds.length === 0 || includeChainIds.includes(chain.chainId)),
  );

  for (const testChain of testChains) {
    let rpcUrl: string;
    try {
      rpcUrl = config.get<string>(`testChains.${testChain.chainId}.rpcUrl`);
    } catch (err) {
      console.warn(
        `No RPC URL set in test.json. Skipping ${testChain.name} (${testChain.chainId})`,
      );
      continue;
    }

    describe(`${testChain.name} (${testChain.chainId})`, () => {
      const bundlerUrl = `https://no.bundler.bro/api/v2/${testChain.chainId}/whatever`;

      const transport = http(rpcUrl);

      const viemClient = createPublicClient({
        chain: {
          id: testChain.chainId,
        } as chains.Chain,
        transport,
      });

      const signer = createWalletClient({
        chain: {
          id: testChain.chainId,
        } as chains.Chain,
        account,
        transport,
      });

      let smartAccount: BiconomySmartAccountV2;
      let callData: Hex;

      const entryPointContractAddress =
        (testChain.entryPoints?.["v060"]?.address as Address) ||
        ENTRYPOINT_V6_ADDRESS;

      const epv6 = new EntryPointV6(viemClient, entryPointContractAddress);

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

      it("simulateHandleOp should revert with AA21 without a balance override", async () => {
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

        const userOperation = userOperationV6Schema.parse(signedUserOperation);

        try {
          await epv6.simulateHandleOp({
            userOperation,
            targetAddress: epv6.address,
            targetCallData: userOperation.callData,
          });
        } catch (err: any) {
          expect(err).not.toBeInstanceOf(ParseError);

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

      if (testChain.stateOverrideSupport.balance) {
        it("simulateHandleOp should return a ExecutionResult with a balance override", async () => {
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

          const userOperation =
            userOperationV6Schema.parse(signedUserOperation);

          try {
            const executionResult = await epv6.simulateHandleOp({
              userOperation,
              targetAddress: epv6.address,
              targetCallData: userOperation.callData,
              stateOverrides: {
                [userOperation.sender]: {
                  balance: toHex(parseEther("10")),
                },
              },
            });
            expect(executionResult).toBeDefined();

            const { paid, preOpGas } = executionResult;
            expect(paid).toBeGreaterThan(0);
            expect(preOpGas).toBeGreaterThan(0);
          } catch (err: any) {
            throw err.message;
          }
        }, 20_000);
      }

      if (config.has(`testChains.${testChain.chainId}.testAddresses.v2`)) {
        it("should return a gas estimate for a deployed smart account", async () => {
          const initCode = "0x";

          const testSender = config.get<Address>(
            `testChains.${testChain.chainId}.testAddresses.v2`,
          );

          let unsignedUserOperation: Partial<UserOperationStruct> = {
            sender: testSender,
            initCode,
            nonce: await epv6.getNonce(testSender),
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

          const userOperation =
            userOperationV6Schema.parse(signedUserOperation);

          const executionResult = await epv6.simulateHandleOp({
            userOperation,
            targetAddress: epv6.address,
            targetCallData: userOperation.callData,
            stateOverrides: {
              [userOperation.sender]: {
                balance: toHex(parseEther("10")),
              },
            },
          });
          expect(executionResult).toBeDefined();
        });
      }
    });
  }
});
