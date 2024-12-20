import {
  createPublicClient,
  createWalletClient,
  http,
  zeroAddress,
  Address,
  parseEther,
  toHex,
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
import { supportedChains } from "../../chains/chains";
import { ENTRYPOINT_V6_ADDRESS } from "./constants";

describe("EntryPointV6Simulations", () => {
  const privateKey = generatePrivateKey();
  const account = privateKeyToAccount(privateKey);

  const includeChainIds = config.get<number[]>("includeInTests");
  const excludeChainIds = config.get<number[]>("excludeFromTests");

  it("mock test so jest doesn't report 'Your test suite must contain at least one test'", () => {});

  const testChains = Object.values(supportedChains).filter(
    (chain) =>
      chain.stateOverrideSupport.balance &&
      chain.stateOverrideSupport.bytecode &&
      !excludeChainIds.includes(chain.chainId) &&
      (includeChainIds.length === 0 || includeChainIds.includes(chain.chainId))
  );

  for (const testChain of testChains) {
    let rpcUrl: string;
    if (config.has(`testChains.${testChain.chainId}.rpcUrl`)) {
      rpcUrl = config.get<string>(`testChains.${testChain.chainId}.rpcUrl`);
    } else {
      console.warn(
        `No RPC URL set in test.json. Skipping ${testChain.name} (${testChain.chainId})`
      );
      continue;
    }

    let testSender: Address;
    if (config.has(`testChains.${testChain.chainId}.testAddresses.v2`)) {
      testSender = config.get<Address>(
        `testChains.${testChain.chainId}.testAddresses.v2`
      );
    } else {
      console.warn(
        `No V2 test sender set in test.json. Skipping ${testChain.name} (${testChain.chainId}), or binary search will throw AA20 account not deployed`
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
        account,
        chain: {
          id: testChain.chainId,
        } as chains.Chain,
        transport,
      });

      let smartAccount: BiconomySmartAccountV2;
      let userOperation: UserOperationV6;

      const entryPointContractAddress =
        (testChain.entryPoints?.["v060"]?.address as Address) ||
        ENTRYPOINT_V6_ADDRESS;

      const epv6Simulator = new EntryPointV6Simulations(
        viemClient,
        entryPointContractAddress
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
            ""
          ),
        });

        const [callData, fees, nonce] = await Promise.all([
          smartAccount.encodeExecute(zeroAddress, 1n, "0x"),
          viemClient.estimateFeesPerGas(),
          epv6Simulator.getNonce(testSender),
        ]);

        if (nonce === 0n) {
          fail(
            `Expected nonce for an existing smart account to be greater than 0, got ${nonce}`
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
          await smartAccount.signUserOp(unsignedUserOperation)
        );
      }, 10_000);

      describe("estimateVerificationGasLimit", () => {
        it("should return a value greater than 0", async () => {
          const estimateResult =
            await epv6Simulator.estimateVerificationGasLimit({
              userOperation,
              stateOverrides: {
                [userOperation.sender]: {
                  balance: toHex(parseEther("10000")),
                },
              },
            });

          expect(estimateResult).toBeDefined();

          const { verificationGasLimit } = estimateResult;
          expect(verificationGasLimit).toBeGreaterThan(0);
        }, 10_000);
      });

      describe("estimateCallGasLimit", () => {
        it("should return a value greater than 0", async () => {
          const estimateResult = await epv6Simulator.estimateCallGasLimit({
            userOperation,
            stateOverrides: {
              [userOperation.sender]: {
                balance: toHex(parseEther("10000")),
              },
            },
          });
          expect(estimateResult).toBeDefined();
          expect(estimateResult).toBeGreaterThan(0n);
        });
      });
    });
  }
});
