import config from "config";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import * as chains from "viem/chains";
import { createPublicClient, Hex, http, toHex, zeroAddress } from "viem";
import { createNexusClient, getCustomChain, NexusClient } from "@biconomy/sdk";
import { UserOperationV7, userOperationV7Schema } from "./UserOperationV7";
import { EntryPointV7Simulations } from "./EntryPointV7Simulations";
import { isExecutionResultV7 } from "./types";
import { supportedChains } from "../../chains/chains";

// Hardcoded gas values for gas estimation, to ensure user op completeness
const defaultCallGasLimit = BigInt(5_000_000);
const defaultVerificationGasLimit = BigInt(5_000_000);
const defaultPreVerificationGas = BigInt(5_000_000);

describe("EntryPointV7Simulations", () => {
  it("mock test so jest doesn't report 'Your test suite must contain at least one test'", () => {});

  (BigInt.prototype as any).toJSON = function () {
    return this.toString();
  };

  const privateKey = generatePrivateKey();
  const account = privateKeyToAccount(privateKey);

  const includeChainIds = config.get<number[]>("includeInTests");
  const excludeChainIds = config.get<number[]>("excludeFromTests");

  const testChains = Object.values(supportedChains).filter(
    (chain) =>
      chain.smartAccountSupport.nexus &&
      !excludeChainIds.includes(chain.chainId) &&
      (includeChainIds.length === 0 || includeChainIds.includes(chain.chainId))
  );

  for (const testChain of testChains) {
    let rpcUrl: string;
    try {
      rpcUrl = config.get<string>(`testChains.${testChain.chainId}.rpcUrl`);
    } catch (err) {
      console.warn(
        `No RPC URL set in test.json. Skipping ${testChain.name} (${testChain.chainId})`
      );
      continue;
    }

    describe(`${testChain.name} (${testChain.chainId})`, () => {
      const transport = http(rpcUrl);

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
          chain: getCustomChain(testChain.name, testChain.chainId, rpcUrl, ""),
          transport,
          bundlerTransport: http("https://not-gonna-use-the-bundler.com"),
        });

        let maxFeePerGas: bigint, maxPriorityFeePerGas: bigint;
        let factory: Hex, factoryData: Hex;

        const [fees, factoryArgs, callData, nonce] = await Promise.all([
          viemClient.estimateFeesPerGas(),
          nexusClient.account.getFactoryArgs(),
          nexusClient.account.encodeExecute({
            to: zeroAddress,
            data: "0x",
            value: 1n,
          }),
          nexusClient.account.getNonce(),
        ]);

        if (!factoryArgs.factory) {
          fail("Factory address is not defined");
        }

        if (!factoryArgs.factoryData) {
          fail("Factory data is not defined");
        }

        maxFeePerGas = fees.maxFeePerGas;
        maxPriorityFeePerGas = fees.maxPriorityFeePerGas;
        factory = factoryArgs.factory;
        factoryData = factoryArgs.factoryData;

        const unSignedUserOperation = {
          sender: nexusClient.account.address,
          callData,
          callGasLimit: defaultCallGasLimit,
          maxFeePerGas,
          maxPriorityFeePerGas,
          nonce,
          preVerificationGas: defaultPreVerificationGas,
          verificationGasLimit: defaultVerificationGasLimit,
          factory,
          factoryData,
          signature: "0x",
        };

        const signature = await nexusClient.account.signUserOperation(
          unSignedUserOperation as any
        );
        unSignedUserOperation.signature = signature;

        userOperation = userOperationV7Schema.parse(unSignedUserOperation);
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
