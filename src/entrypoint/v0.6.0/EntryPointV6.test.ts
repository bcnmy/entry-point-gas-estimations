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
} from "../../gas-estimator/entry-point-v6";
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
import { ENTRYPOINT_V6_ADDRESS } from "./constants";

describe("DefaultEntryPointV6", () => {
  const privateKey = generatePrivateKey();
  const account = privateKeyToAccount(privateKey);

  const supportedChains =
    config.get<Record<string, SupportedChain>>("supportedChains");

  const includeChainIds = config.get<number[]>("includeInTests");
  const excludeChainIds = config.get<number[]>("excludeFromTests");

  for (const supportedChain of Object.values(supportedChains).filter(
    (c) =>
      includeChainIds.length === 0 ||
      (includeChainIds.includes(c.chainId) &&
        !excludeChainIds.includes(c.chainId))
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
      let userOperation: UserOperation;

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
        )) as UserOperation;
      }, 10_000);

      it("simulateHandleOp should revert with AA21 without a balance override", async () => {
        const epv6 = new EntryPointV6(
          viemClient,
          (supportedChain.entryPoints?.["v0.6.0"].address as Address) ||
            ENTRYPOINT_V6_ADDRESS
        );
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
      }, 10_000);

      if (supportedChain.stateOverrideSupport.balance) {
        it("simulateHandleOp should return a ExecutionResult with a balance override", async () => {
          const epv6 = new EntryPointV6(
            viemClient,
            (supportedChain.entryPoints?.["v0.6.0"].address as Address) ||
              ENTRYPOINT_V6_ADDRESS
          );
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
        }, 20_000);
      }
    });
  }
});
