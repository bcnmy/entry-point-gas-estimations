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
import { SupportedChain } from "../../shared/config";
import {
  CALL_GAS_LIMIT_OVERRIDE_VALUE,
  ENTRYPOINT_V6_ADDRESS,
  MAX_FEE_PER_GAS_OVERRIDE_VALUE,
  MAX_PRIORITY_FEE_PER_GAS_OVERRIDE_VALUE,
  PRE_VERIFICATION_GAS_OVERRIDE_VALUE,
  VERIFICATION_GAS_LIMIT_OVERRIDE_VALUE,
} from "./constants";
import { UserOperationV6 } from "./UserOperationV6";

describe("DefaultEntryPointV6", () => {
  const privateKey = generatePrivateKey();
  const account = privateKeyToAccount(privateKey);

  const supportedChains =
    config.get<Record<string, SupportedChain>>("supportedChains");

  const includeChainIds = config.get<number[]>("includeInTests");
  const excludeChainIds = config.get<number[]>("excludeFromTests");

  it("mock test so jest doesn't report 'Your test suite must contain at least one test'", () => {});

  for (const supportedChain of Object.values(supportedChains).filter(
    (c) =>
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
        chain: {
          id: supportedChain.chainId,
        } as chains.Chain,
        account,
        transport,
      });

      let smartAccount: BiconomySmartAccountV2;
      let userOperation: UserOperationV6;
      let callData: Hex;

      const entryPointContract = supportedChain.entryPoints?.["v060"];
      const epv6 = new EntryPointV6(
        viemClient,
        (entryPointContract?.address as Address) || ENTRYPOINT_V6_ADDRESS
      );

      beforeAll(async () => {
        smartAccount = await createSmartAccountClient({
          customChain: getCustomChain(
            supportedChain.name!,
            supportedChain.chainId,
            supportedChain.rpcUrl!,
            ""
          ),
          signer,
          bundlerUrl,
        });

        const [sender, nonce, initCode] = await Promise.all([
          smartAccount.getAddress(),
          smartAccount.getNonce(),
          smartAccount.getInitCode(),
        ]);

        callData = await smartAccount.encodeExecute(zeroAddress, 1n, "0x");

        const unsignedUserOperation: Partial<UserOperationStruct> = {
          sender,
          initCode,
          nonce,
          callGasLimit:
            supportedChain.simulation?.callGasLimit ||
            CALL_GAS_LIMIT_OVERRIDE_VALUE,
          maxFeePerGas: MAX_FEE_PER_GAS_OVERRIDE_VALUE,
          maxPriorityFeePerGas: MAX_PRIORITY_FEE_PER_GAS_OVERRIDE_VALUE,
          preVerificationGas: PRE_VERIFICATION_GAS_OVERRIDE_VALUE,
          verificationGasLimit:
            supportedChain.simulation?.verificationGasLimit ||
            VERIFICATION_GAS_LIMIT_OVERRIDE_VALUE,
          paymasterAndData: "0x",
          callData,
        };

        userOperation = (await smartAccount.signUserOp(
          unsignedUserOperation
        )) as UserOperationV6;
      }, 20_000);

      it("simulateHandleOp should revert with AA21 without a balance override", async () => {
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
              err
            );
          }
        }
      }, 20_000);

      if (supportedChain.stateOverrideSupport.balance) {
        it("simulateHandleOp should return a ExecutionResult with a balance override", async () => {
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

      const existingSmartAccountAddress =
        entryPointContract?.existingSmartAccountAddress;

      if (existingSmartAccountAddress) {
        it("should return a gas estimate for a deployed smart account", async () => {
          const initCode = "0x";

          let unsignedUserOperation: Partial<UserOperationStruct> = {
            sender: existingSmartAccountAddress,
            initCode,
            nonce: await epv6.getNonce(existingSmartAccountAddress! as Address),
            callGasLimit:
              supportedChain.simulation?.callGasLimit ||
              CALL_GAS_LIMIT_OVERRIDE_VALUE,
            maxFeePerGas: MAX_FEE_PER_GAS_OVERRIDE_VALUE,
            maxPriorityFeePerGas: MAX_PRIORITY_FEE_PER_GAS_OVERRIDE_VALUE,
            preVerificationGas: PRE_VERIFICATION_GAS_OVERRIDE_VALUE,
            verificationGasLimit:
              supportedChain.simulation?.verificationGasLimit ||
              VERIFICATION_GAS_LIMIT_OVERRIDE_VALUE,
            paymasterAndData: "0x",
            callData,
          };

          const userOperation = (await smartAccount.signUserOp(
            unsignedUserOperation
          )) as UserOperationV6;

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
