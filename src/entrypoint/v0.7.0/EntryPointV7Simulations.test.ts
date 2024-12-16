import config from "config";
import { SupportedChain } from "../../shared/config";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import * as chains from "viem/chains";
import { createPublicClient, http, toHex, zeroAddress } from "viem";
import { createNexusClient, getCustomChain, NexusClient } from "@biconomy/sdk";
import { UserOperationV7 } from "./UserOperationV7";
import { EntryPointV7Simulations } from "./EntryPointV7Simulations";
import { isExecutionResultV7 } from "./types";

// Hardcoded gas values for gas estimation, to ensure user op completeness
const defaultCallGasLimit = BigInt(5_000_000);
const defaultVerificationGasLimit = BigInt(5_000_000);
const defaultPreVerificationGas = BigInt(5_000_000);

describe("EntryPointV7Simulations", () => {
  (BigInt.prototype as any).toJSON = function () {
    return this.toString();
  };

  const privateKey = generatePrivateKey();
  const account = privateKeyToAccount(privateKey);

  const supportedChains =
    config.get<Record<number, SupportedChain>>("supportedChains");

  const includeChainIds = config.get<number[]>("includeInTests");
  const excludeChainIds = config.get<number[]>("excludeFromTests");

  it("mock test so jest doesn't report 'Your test suite must contain at least one test'", () => {});

  const testChains = Object.values(supportedChains).filter(
    (chain) =>
      chain.smartAccountSupport.nexus &&
      !excludeChainIds.includes(chain.chainId) &&
      (includeChainIds.length === 0 || includeChainIds.includes(chain.chainId))
  );

  for (const testChain of testChains) {
    describe(`${testChain.name} (${testChain.chainId})`, () => {
      const transport = testChain.rpcUrl ? http(testChain.rpcUrl) : http();

      const viemClient = createPublicClient({
        chain: {
          id: testChain.chainId,
        } as chains.Chain,
        transport,
      });

      const epV7Simulations = new EntryPointV7Simulations(viemClient);

      let nexusClient: NexusClient;
      let userOperation: UserOperationV7;

      beforeAll(async () => {
        nexusClient = await createNexusClient({
          k1ValidatorAddress: "0x0000002D6DB27c52E3C11c1Cf24072004AC75cBa",
          factoryAddress: "0x00000024115AA990F0bAE0B6b0D5B8F68b684cd6",
          signer: account,
          chain: getCustomChain(
            testChain.name!,
            testChain.chainId!,
            testChain.rpcUrl!,
            ""
          ),
          transport,
          bundlerTransport: http("https://not-gonna-use-the-bundler.com"),
        });

        const { maxFeePerGas, maxPriorityFeePerGas } =
          await viemClient.estimateFeesPerGas();

        const { factory, factoryData } =
          await nexusClient.account.getFactoryArgs();

        const vitalik = "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045";
        userOperation = {
          sender: nexusClient.account.address,
          callData: await nexusClient.account.encodeExecute({
            to: vitalik,
            data: "0x",
            value: 1n,
          }),
          callGasLimit: defaultCallGasLimit,
          maxFeePerGas,
          maxPriorityFeePerGas,
          nonce: await nexusClient.account.getNonce(),
          preVerificationGas: defaultPreVerificationGas,
          verificationGasLimit: defaultVerificationGasLimit,
          factory: factory || "0x",
          factoryData: factoryData || "0x",
          signature: "0x",
        };

        const signature = await nexusClient.account.signUserOperation(
          userOperation
        );
        userOperation.signature = signature;
      }, 10_000);

      it("simulateHandleOp should return an ExecutionResult given a balance override", async () => {
        const result = await epV7Simulations.simulateHandleOp({
          userOperation,
          targetAddress: zeroAddress,
          targetCallData: "0x",
          stateOverrides: {
            [userOperation.sender]: {
              balance: toHex(100000_000000000000000000n),
            },
          },
        });

        expect(result).toBeDefined();
        expect(isExecutionResultV7(result)).toBe(true);
      }, 10_000);
    });
  }
});
