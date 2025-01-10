import config from "config";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import * as chains from "viem/chains";
import {
  Address,
  createPublicClient,
  createWalletClient,
  extractChain,
  formatEther,
  Hex,
  http,
  parseEther,
  toHex,
  zeroAddress,
} from "viem";
import {
  BiconomySmartAccountV2,
  createSmartAccountClient,
  getCustomChain,
  getUserOpHash,
  UserOperationStruct,
} from "@biconomy/account";
import {
  UserOperationV6,
  userOperationV6Schema,
} from "../../../entrypoint/v0.6.0/UserOperationV6";
import { createNexusClient, NexusClient } from "@biconomy/sdk";
import { EntryPointVersion } from "../../../entrypoint/shared/types";
import { BenchmarkResults } from "../../utils";
import {
  toPackedUserOperation,
  UserOperationV7,
  userOperationV7Schema,
} from "../../../entrypoint/v0.7.0/UserOperationV7";
import {
  isEstimateUserOperationGasResultV6,
  isEstimateUserOperationGasResultV7,
} from "../../types";
import { supportedChains } from "../../../chains/chains";
import { SupportedChain } from "../../../chains/types";
import { getRequiredPrefund } from "../../../shared/utils";
import { createGasEstimator } from "../../createGasEstimator";
import { UnEstimatedUserOperation } from "../../GasEstimator";
import { getRequiredPrefundV6 } from "../../../entrypoint";

describe("e2e", () => {
  describe("estimateUserOperationGas", () => {
    const benchmarkResults: BenchmarkResults = {
      [EntryPointVersion.v060]: {},
      [EntryPointVersion.v070]: {},
    };

    afterAll(() => {
      console.log(JSON.stringify(benchmarkResults, null, 2));
    });

    const privateKey = generatePrivateKey();
    const account = privateKeyToAccount(privateKey);

    const includeChainIds = config.get<number[]>(`includeInTests`);
    const excludeChainIds = config.get<number[]>(`excludeFromTests`);
    const skipSecondSimulation = config.get<number[]>(`skipSecondSimulation`);

    const testChains = Object.values(supportedChains).filter(
      (chain) =>
        config.get<string>(`testChains.${chain.chainId}.rpcUrl`) &&
        !excludeChainIds.includes(chain.chainId) &&
        (includeChainIds.length === 0 ||
          includeChainIds.includes(chain.chainId))
    );

    // This test exists for 2 reasons:
    // 1. So the test runner doesn't throw "Your test suite must contain at least one test" if there are no testChains specified
    // 2. A sanity check that the e2e tests are setup properly
    it("should setup the e2e tests properly", async () => {
      // print the jest command line arguments
    });

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
      // This bundler URL is never called, but the format has to be correct or the createSmartAccountClient function will throw an error
      const bundlerUrl = `https://no.bundler.bro/api/v2/${testChain.chainId}/whatever`;

      describe("e2e tests", () => {
        const viemChain = extractChain({
          chains: Object.values(chains),
          id: testChain.chainId as any,
        });

        const transport = http(rpcUrl);
        const viemClient = createPublicClient({
          chain:
            viemChain ||
            ({
              id: testChain.chainId,
            } as chains.Chain),
          transport,
        });

        let maxFeePerGas: bigint;
        let maxPriorityFeePerGas: bigint;
        let baseFeePerGas: bigint;

        beforeAll(async () => {
          if (testChain.eip1559) {
            const [fees, latestBlock] = await Promise.all([
              viemClient.estimateFeesPerGas(),
              viemClient.getBlock({
                blockTag: "latest",
              }),
            ]);

            maxFeePerGas = fees.maxFeePerGas || 1n;
            maxPriorityFeePerGas = fees.maxPriorityFeePerGas || 1n;

            if (!latestBlock.baseFeePerGas) {
              throw new Error(`baseFeePerGas is null`);
            }
            baseFeePerGas = latestBlock.baseFeePerGas;
          } else {
            const gasPrice = await viemClient.getGasPrice();
            maxFeePerGas = gasPrice;
            maxPriorityFeePerGas = 1n;
            baseFeePerGas = gasPrice;
          }

          benchmarkResults[EntryPointVersion.v060][testChain.name!] = {
            smartAccountDeployment: "",
            nativeTransfer: "",
          };
          benchmarkResults[EntryPointVersion.v070][testChain.name!] = {
            smartAccountDeployment: "",
            nativeTransfer: "",
          };
        }, 20_000);

        describe(`${testChain.name} (${testChain.chainId})`, () => {
          if (testChain.smartAccountSupport.smartAccountsV2) {
            describe("EntryPoint v0.6.0", () => {
              const signer = createWalletClient({
                account,
                chain: {
                  id: testChain.chainId,
                } as chains.Chain,
                transport,
              });

              let smartAccount: BiconomySmartAccountV2;
              let nativeTransferCallData: Hex;

              const gasEstimator = createGasEstimator({
                chainId: testChain.chainId,
                rpc: viemClient,
              });

              beforeAll(async () => {
                try {
                  smartAccount = await createSmartAccountClient({
                    customChain: getCustomChain(
                      testChain.name,
                      testChain.chainId,
                      rpcUrl,
                      ""
                    ),
                    signer,
                    bundlerUrl,
                  });

                  nativeTransferCallData = await smartAccount.encodeExecute(
                    zeroAddress,
                    1n,
                    "0x"
                  );
                } catch (err: any) {
                  console.error(err);
                  throw err.message;
                }
              }, 20_000);

              describe("Base Sepolia HTTP request failed", () => {
                it("should report the actual error", async () => {
                  // const userOperation = {
                  //   sender: "0x10A57A377a1CCb20067E4A3245e597cBF9ACDaec" as Hex,
                  //   nonce: BigInt("0x0"),
                  //   initCode:
                  //     "0x000000a56Aaca3e9a4C479ea6b6CD0DbcB6634F5df20ffbc0000000000000000000000000000001c5b32f37f5bea87bdd5374eb2ac54ea8e0000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000242ede3bc00000000000000000000000000382fe477878c8c3807ab427d0db282effa01cd600000000000000000000000000000000000000000000000000000000" as Hex,
                  //   callData:
                  //     "0x0000189a00000000000000000000000010a57a377a1ccb20067e4a3245e597cbf9acdaec000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000" as Hex,
                  //   signature:
                  //     "0x00000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000001c5b32F37F5beA87BDD5374eB2aC54eA8e000000000000000000000000000000000000000000000000000000000000004181d4b4981670cb18f99f0b4a66446df1bf5b204d24cfcb659bf38ba27a4359b5711649ec2423c5e1247245eba2964679b6a1dbb85c992ae40b9b00c6935b02ff1b00000000000000000000000000000000000000000000000000000000000000" as Hex,
                  //   paymasterAndData:
                  //     "0x00000f7365cA6C59A2C93719ad53d567ed49c14C010000000000000000000000000000000000000000000000000000000064c7adcb0000000000000000000000000000000000000000000000000000000064c7a6c3000000000000000000000000da5289fcaaf71d52a80a254da614a192b693e9770000000000000000000000000000065b8abb967271817555f23945eedf08015c00000000000000000000000000000000000000000000000000000000000ab5d1000000000000000000000000000000000000000000000000000000000010c8e021a75b2144ea22b77bdeea206e69faea1b18c91a08a76de6cd424dc80bea283413fa08519fcee3960203e1d6ebebe7c34ffe27ea47452fd4dca0013e1d36da7f1b" as Hex,
                  //   maxFeePerGas: 1n,
                  //   maxPriorityFeePerGas: 1n,
                  //   verificationGasLimit: 5000000n,
                  //   callGasLimit: 20000000n,
                  //   preVerificationGas: 1000000n,
                  // };
                  const userOperation = {
                    sender: "0x10A57A377a1CCb20067E4A3245e597cBF9ACDaec",
                    nonce: "0x0",
                    initCode:
                      "0x000000a56Aaca3e9a4C479ea6b6CD0DbcB6634F5df20ffbc0000000000000000000000000000001c5b32f37f5bea87bdd5374eb2ac54ea8e0000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000242ede3bc00000000000000000000000000382fe477878c8c3807ab427d0db282effa01cd600000000000000000000000000000000000000000000000000000000",
                    callData:
                      "0x0000189a00000000000000000000000010a57a377a1ccb20067e4a3245e597cbf9acdaec000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000",
                    signature:
                      "0x00000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000001c5b32F37F5beA87BDD5374eB2aC54eA8e000000000000000000000000000000000000000000000000000000000000004181d4b4981670cb18f99f0b4a66446df1bf5b204d24cfcb659bf38ba27a4359b5711649ec2423c5e1247245eba2964679b6a1dbb85c992ae40b9b00c6935b02ff1b00000000000000000000000000000000000000000000000000000000000000",
                    paymasterAndData:
                      "0x00000f7365cA6C59A2C93719ad53d567ed49c14C010000000000000000000000000000000000000000000000000000000064c7adcb0000000000000000000000000000000000000000000000000000000064c7a6c3000000000000000000000000da5289fcaaf71d52a80a254da614a192b693e9770000000000000000000000000000065b8abb967271817555f23945eedf08015c00000000000000000000000000000000000000000000000000000000000ab5d1000000000000000000000000000000000000000000000000000000000010c8e021a75b2144ea22b77bdeea206e69faea1b18c91a08a76de6cd424dc80bea283413fa08519fcee3960203e1d6ebebe7c34ffe27ea47452fd4dca0013e1d36da7f1b",
                    maxFeePerGas,
                    maxPriorityFeePerGas,
                    verificationGasLimit: 5000000,
                    callGasLimit: 20000000,
                    preVerificationGas: 1000000,
                  };

                  console.log("userOperation:");
                  console.log(userOperation);

                  const gasEstimate =
                    await gasEstimator.estimateUserOperationGas({
                      unEstimatedUserOperation: userOperation as any,
                      baseFeePerGas,
                    });

                  console.log("gasEstimate:");
                  console.log(gasEstimate);

                  const userOperation2 = {
                    ...userOperation,
                    ...gasEstimate,
                    preVerificationGas: 155955739418820n,
                    maxFeePerGas: 367296518n,
                  };

                  console.log("userOperation2:");
                  console.log(userOperation2);

                  const prefund = getRequiredPrefundV6(userOperation2);
                  console.log("prefund:");
                  console.log(prefund);
                });
              });

              describe("estimateUserOperationGas", () => {
                it("should return a gas estimate for a smart account deployment", async () => {
                  let [sender, initCode, nonce] = await Promise.all([
                    smartAccount.getAddress(),
                    smartAccount.getInitCode(),
                    smartAccount.getNonce(),
                  ]);

                  let unsignedUserOperation: Partial<UserOperationStruct> = {
                    sender,
                    initCode,
                    nonce,
                    callGasLimit: 1n,
                    maxFeePerGas,
                    maxPriorityFeePerGas,
                    preVerificationGas: 1n,
                    verificationGasLimit: 1n,
                    paymasterAndData: "0x",
                    callData: nativeTransferCallData,
                  };

                  const signedUserOperation = await smartAccount.signUserOp(
                    unsignedUserOperation
                  );

                  let userOperation =
                    userOperationV6Schema.parse(signedUserOperation);

                  const gasEstimate =
                    await gasEstimator.estimateUserOperationGas({
                      unEstimatedUserOperation: userOperation,
                      baseFeePerGas,
                    });

                  if (!isEstimateUserOperationGasResultV6(gasEstimate)) {
                    throw new Error(
                      "Expected EstimateUserOperationGasResultV6"
                    );
                  }

                  expect(gasEstimate).toBeDefined();
                  const {
                    callGasLimit,
                    verificationGasLimit,
                    preVerificationGas,
                    validUntil,
                  } = gasEstimate;

                  console.log(gasEstimate);

                  expect(callGasLimit).toBeGreaterThan(0n);
                  expect(verificationGasLimit).toBeGreaterThan(0n);
                  expect(preVerificationGas).toBeGreaterThan(0n);
                  expect(validUntil).toBeGreaterThan(0n);

                  userOperation = {
                    ...userOperation,
                    callGasLimit,
                    verificationGasLimit,
                    preVerificationGas,
                  };

                  var {
                    requiredPrefundEth,
                    nativeCurrencySymbol,
                    requiredPrefundUsd,
                  } = calculateRequiredPrefundV6(
                    userOperation,
                    viemChain,
                    testChain
                  );

                  benchmarkResults[EntryPointVersion.v060][
                    testChain.name!
                  ].smartAccountDeployment = `${requiredPrefundEth} ${nativeCurrencySymbol} ($${requiredPrefundUsd})`;

                  const entryPoint =
                    gasEstimator.entryPoints[EntryPointVersion.v060].contract;

                  // try running simulateHandleOp again with the returned values
                  if (!skipSecondSimulation.includes(testChain.chainId)) {
                    const { paid } = await entryPoint.simulateHandleOp({
                      userOperation,
                      targetAddress: entryPoint.address,
                      targetCallData: userOperation.callData,
                      stateOverrides: {
                        [userOperation.sender]: {
                          balance: toHex(parseEther("1000")),
                        },
                      },
                    });

                    expect(paid).toBeGreaterThan(0n);
                  }
                }, 20_000);

                if (
                  config.has(`testChains.${testChain.chainId}.testAddresses.v2`)
                ) {
                  it("should return a gas estimate for a deployed smart account", async () => {
                    try {
                      const testSender = config.get<Address>(
                        `testChains.${testChain.chainId}.testAddresses.v2`
                      );

                      // we are using an existing deployed account so we don't get AA20 account not deployed
                      const sender = testSender;

                      const entryPoint =
                        gasEstimator.entryPoints[EntryPointVersion.v060]
                          .contract;

                      let unsignedUserOperation: Partial<UserOperationStruct> =
                        {
                          sender,
                          initCode: "0x",
                          nonce: await entryPoint.getNonce(sender),
                          maxFeePerGas,
                          maxPriorityFeePerGas,
                          callGasLimit: 1n,
                          verificationGasLimit: 1n,
                          preVerificationGas: 1n,
                          paymasterAndData: "0x",
                          callData: nativeTransferCallData,
                        };

                      const userOperation = userOperationV6Schema.parse(
                        await smartAccount.signUserOp(unsignedUserOperation)
                      );

                      const gasEstimate =
                        await gasEstimator.estimateUserOperationGas({
                          unEstimatedUserOperation: userOperation,
                          baseFeePerGas,
                        });
                      expect(gasEstimate).toBeDefined();

                      const {
                        callGasLimit,
                        verificationGasLimit,
                        preVerificationGas,
                      } = gasEstimate;

                      expect(callGasLimit).toBeGreaterThan(0n);
                      expect(verificationGasLimit).toBeGreaterThan(0n);
                      expect(preVerificationGas).toBeGreaterThan(0n);

                      // try running simulateHandleOp again with the returned values
                      unsignedUserOperation = {
                        ...unsignedUserOperation,
                        callGasLimit,
                        verificationGasLimit,
                        preVerificationGas,
                      };

                      const {
                        requiredPrefundEth,
                        nativeCurrencySymbol,
                        requiredPrefundUsd,
                      } = calculateRequiredPrefundV6(
                        userOperation as UserOperationV6,
                        viemChain,
                        testChain
                      );

                      benchmarkResults[EntryPointVersion.v060][
                        testChain.name!
                      ].nativeTransfer = `${requiredPrefundEth} ${nativeCurrencySymbol} ($${requiredPrefundUsd})`;

                      const userOperation2 = userOperationV6Schema.parse(
                        await smartAccount.signUserOp(unsignedUserOperation)
                      );

                      const { paid } = await gasEstimator.entryPoints[
                        EntryPointVersion.v060
                      ].contract.simulateHandleOp({
                        userOperation: userOperation2,
                        targetAddress:
                          gasEstimator.entryPoints[EntryPointVersion.v060]
                            .contract.address,
                        targetCallData: userOperation2.callData,
                        stateOverrides: {
                          [userOperation2.sender]: {
                            balance: toHex(1000000000000000000n),
                          },
                        },
                      });

                      expect(paid).toBeGreaterThan(0n);
                    } catch (err) {
                      if (err instanceof Error) {
                        throw new Error(err.message);
                      } else {
                        console.error(err);
                        throw new Error("Unknown error");
                      }
                    }
                  }, 20_000);
                }
              });
            });
          }

          if (testChain.smartAccountSupport.nexus) {
            describe("EntryPoint v0.7.0", () => {
              let nexusClient: NexusClient;
              let userOperation: UserOperationV7;

              const gasEstimator = createGasEstimator({
                chainId: testChain.chainId,
                rpc: viemClient,
              });

              beforeAll(async () => {
                try {
                  const chain =
                    viemChain ||
                    getCustomChain(
                      testChain.name!,
                      testChain.chainId,
                      rpcUrl,
                      ""
                    );

                  nexusClient = await createNexusClient({
                    signer: account,
                    chain,
                    transport,
                    bundlerTransport: transport,
                  });

                  const { factory, factoryData } =
                    await nexusClient.account.getFactoryArgs();

                  if (!factory) {
                    fail("Factory address is not defined");
                  }

                  if (!factoryData) {
                    fail("Factory data is not defined");
                  }

                  const unsignedUserOperation = {
                    sender: nexusClient.account.address,
                    callData: await nexusClient.account.encodeExecute({
                      to: zeroAddress,
                      data: "0x",
                      value: 1n,
                    }),
                    callGasLimit: 1n,
                    maxFeePerGas,
                    maxPriorityFeePerGas,
                    nonce: await nexusClient.account.getNonce(),
                    preVerificationGas: 1n,
                    verificationGasLimit: 1n,
                    factory,
                    factoryData,
                    signature: "0x" as Hex,
                  };

                  const signature = await nexusClient.account.signUserOperation(
                    unsignedUserOperation
                  );

                  unsignedUserOperation.signature = signature;

                  userOperation = userOperationV7Schema.parse(
                    unsignedUserOperation
                  );
                } catch (err: any) {
                  console.error(err);
                  throw err.message;
                }
              }, 20_000);

              describe("Base Sepolia AA33", () => {
                it("should return a gas estimate for a smart account deployment", async () => {
                  const problematicUserOperation = {
                    callData:
                      "0xe9ae5c530000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000345e889d3867eb500dd7ff704c3ddfe0a1fb4609570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
                    factory: "0x00000024115AA990F0bAE0B6b0D5B8F68b684cd6",
                    factoryData:
                      "0x0d51f0b70000000000000000000000000382fe477878c8c3807ab427d0db282effa01cd60000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000333034e9f539ce08819e12c1b8cb29084d",
                    maxFeePerGas: 1n,
                    maxPriorityFeePerGas: 1n,
                    nonce:
                      "0x895fc1000000002d6db27c52e3c11c1cf24072004ac75cba0000000000000000",
                    sender: "0x5e889d3867eb500dd7fF704c3ddFe0A1fb460957",
                    signature:
                      "0x00000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000002D6DB27c52E3C11c1Cf24072004AC75cBa000000000000000000000000000000000000000000000000000000000000004181d4b4981670cb18f99f0b4a66446df1bf5b204d24cfcb659bf38ba27a4359b5711649ec2423c5e1247245eba2964679b6a1dbb85c992ae40b9b00c6935b02ff1b00000000000000000000000000000000000000000000000000000000000000",
                    callGasLimit: 20000000n,
                    verificationGasLimit: 5000000n,
                    preVerificationGas: 1000000n,
                    paymaster: "0x00000000301515A5410e0d768aF4f53c416edf19",
                    paymasterData:
                      "0x000000111111000000999999992a07706473244bc757e10f2a9e86fb532828afe30000000000000000000000000000000000000000000000c1f6b98af18ba800000011170044c67319e37818affd575e3598d3c6cb2075d8bafcb35f5a9e217675c103bac93de0923dae17af2e5ac0f1757eb7dc3426f1f47fb913771b22f4abb373984f931b",
                    paymasterPostOpGasLimit: 1000000n,
                    paymasterVerificationGasLimit: 5000000n,
                  };

                  const estimate = await gasEstimator.estimateUserOperationGas({
                    unEstimatedUserOperation: problematicUserOperation as any,
                    baseFeePerGas: 7129717205n,
                  });

                  console.log(`PROBLEMATIC`);
                  console.log(estimate);
                });
              });

              describe("estimateUserOperationGas", () => {
                it("should return a gas estimate for a smart account deployment", async () => {
                  try {
                    console.log(userOperation);

                    const estimate =
                      await gasEstimator.estimateUserOperationGas({
                        unEstimatedUserOperation: userOperation,
                        baseFeePerGas,
                      });

                    if (!isEstimateUserOperationGasResultV7(estimate)) {
                      throw new Error(
                        "Expected EstimateUserOperationGasResultV7"
                      );
                    }

                    expect(estimate).toBeDefined();
                    const {
                      callGasLimit,
                      verificationGasLimit,
                      preVerificationGas,
                      paymasterPostOpGasLimit,
                      paymasterVerificationGasLimit,
                    } = estimate;

                    expect(callGasLimit).toBeGreaterThan(0n);
                    expect(verificationGasLimit).toBeGreaterThan(0n);
                    expect(preVerificationGas).toBeGreaterThan(0n);
                    expect(paymasterPostOpGasLimit).toBe(0n);
                    expect(paymasterVerificationGasLimit).toBe(0n);

                    console.log(estimate);

                    userOperation = {
                      ...userOperation,
                      callGasLimit,
                      verificationGasLimit,
                      preVerificationGas,
                      paymasterPostOpGasLimit,
                      paymasterVerificationGasLimit,
                    };

                    const {
                      requiredPrefundEth,
                      requiredPrefundWei,
                      nativeCurrencySymbol,
                      requiredPrefundUsd,
                    } = calculateRequiredPrefundV7(
                      userOperation,
                      viemChain,
                      testChain
                    );

                    benchmarkResults[EntryPointVersion.v070][
                      testChain.name!
                    ].smartAccountDeployment = `${requiredPrefundEth} ${nativeCurrencySymbol} ($${requiredPrefundUsd})`;

                    const signature =
                      await nexusClient.account.signUserOperation(
                        userOperation as any
                      );

                    userOperation.signature = signature;

                    // try running simulateHandleOp again with the returned values
                    const entryPoint =
                      gasEstimator.entryPoints[EntryPointVersion.v070].contract;

                    const { paid } = await entryPoint.simulateHandleOp({
                      userOperation,
                      targetAddress: entryPoint.address,
                      targetCallData: userOperation.callData,
                      stateOverrides: {
                        [userOperation.sender]: {
                          balance: toHex(parseEther("10000000000000")),
                        },
                      },
                    });

                    expect(paid).toBeGreaterThan(0n);
                  } catch (err: any) {
                    console.error(err);
                    throw err.message;
                  }
                }, 10_000);
              });
            });
          }
        });
      });
    }
  });
});

function calculateRequiredPrefundV6(
  userOperation: UserOperationV6,
  chain: chains.Chain,
  testChain: SupportedChain
) {
  const requiredPrefundWei = getRequiredPrefund(userOperation);

  const requiredPrefundEth = formatEther(requiredPrefundWei);

  let ethPriceUsd = 0;
  let requiredPrefundUsd = "0";

  const nativeCurrencySymbol =
    chain?.nativeCurrency.symbol || testChain.nativeCurrency;
  if (config.has(`benchmarkPricesUSD.${nativeCurrencySymbol}`)) {
    ethPriceUsd = config.get<number>(
      `benchmarkPricesUSD.${nativeCurrencySymbol}`
    ); // usd
    requiredPrefundUsd = (Number(requiredPrefundEth) * ethPriceUsd).toFixed(4);
  }
  return {
    requiredPrefundEth,
    nativeCurrencySymbol,
    requiredPrefundUsd,
    requiredPrefundWei,
  };
}

function calculateRequiredPrefundV7(
  userOperation: UserOperationV7,
  chain: chains.Chain,
  testChain: SupportedChain
) {
  const requiredPrefundWei = getRequiredPrefund(userOperation);

  const requiredPrefundEth = formatEther(requiredPrefundWei);

  let ethPriceUsd = 0;
  let requiredPrefundUsd = "0";

  const nativeCurrencySymbol =
    chain?.nativeCurrency.symbol || testChain.nativeCurrency;
  if (config.has(`benchmarkPricesUSD.${nativeCurrencySymbol}`)) {
    ethPriceUsd = config.get<number>(
      `benchmarkPricesUSD.${nativeCurrencySymbol}`
    ); // usd
    requiredPrefundUsd = (Number(requiredPrefundEth) * ethPriceUsd).toFixed(4);
  }
  return {
    requiredPrefundEth,
    nativeCurrencySymbol,
    requiredPrefundUsd,
    requiredPrefundWei,
  };
}
