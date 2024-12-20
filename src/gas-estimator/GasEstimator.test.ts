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
  UserOperationStruct,
} from "@biconomy/account";
import {
  UserOperationV6,
  userOperationV6Schema,
} from "../entrypoint/v0.6.0/UserOperationV6";
import { createNexusClient, NexusClient } from "@biconomy/sdk";
import { EntryPointVersion } from "../entrypoint/shared/types";
import { BenchmarkResults } from "./utils";
import {
  UserOperationV7,
  userOperationV7Schema,
} from "../entrypoint/v0.7.0/UserOperationV7";
import {
  isEstimateUserOperationGasResultV6,
  isEstimateUserOperationGasResultV7,
} from "./types";
import { supportedChains } from "../chains/chains";
import { SupportedChain } from "../chains/types";
import { getRequiredPrefund } from "../shared/utils";
import { createGasEstimator } from "./createGasEstimator";

describe("GasEstimator", () => {
  (BigInt.prototype as any).toJSON = function () {
    return this.toString();
  };

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
      chain.stateOverrideSupport.balance &&
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
            }, 20_000);

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

                const gasEstimate = await gasEstimator.estimateUserOperationGas(
                  {
                    unEstimatedUserOperation: userOperation,
                    baseFeePerGas,
                  }
                );

                if (!isEstimateUserOperationGasResultV6(gasEstimate)) {
                  throw new Error("Expected EstimateUserOperationGasResultV6");
                }

                expect(gasEstimate).toBeDefined();
                const {
                  callGasLimit,
                  verificationGasLimit,
                  preVerificationGas,
                  validUntil,
                } = gasEstimate;

                expect(callGasLimit).toBeGreaterThan(0n);
                expect(verificationGasLimit).toBeGreaterThan(0n);
                expect(preVerificationGas).toBeGreaterThan(0n);
                expect(validUntil).toBeGreaterThan(0n);

                var {
                  requiredPrefundEth,
                  nativeCurrencySymbol,
                  requiredPrefundUsd,
                } = calculateRequiredPrefundV6(
                  userOperation,
                  callGasLimit,
                  verificationGasLimit,
                  preVerificationGas,
                  viemChain,
                  testChain
                );

                benchmarkResults[EntryPointVersion.v060][
                  testChain.name!
                ].smartAccountDeployment = `${requiredPrefundEth} ${nativeCurrencySymbol} ($${requiredPrefundUsd})`;

                // try running simulateHandleOp again with the returned values
                userOperation = {
                  ...userOperation,
                  callGasLimit,
                  verificationGasLimit,
                  preVerificationGas,
                };

                const entryPoint =
                  gasEstimator.entryPoints[EntryPointVersion.v060].contract;

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
                      gasEstimator.entryPoints[EntryPointVersion.v060].contract;

                    let unsignedUserOperation: Partial<UserOperationStruct> = {
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

                    const {
                      requiredPrefundEth,
                      nativeCurrencySymbol,
                      requiredPrefundUsd,
                    } = calculateRequiredPrefundV6(
                      userOperation as UserOperationV6,
                      callGasLimit,
                      verificationGasLimit,
                      preVerificationGas,
                      viemChain,
                      testChain
                    );

                    benchmarkResults[EntryPointVersion.v060][
                      testChain.name!
                    ].nativeTransfer = `${requiredPrefundEth} ${nativeCurrencySymbol} ($${requiredPrefundUsd})`;

                    // try running simulateHandleOp again with the returned values
                    unsignedUserOperation = {
                      ...unsignedUserOperation,
                      callGasLimit,
                      verificationGasLimit,
                      preVerificationGas,
                    };

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
              nexusClient = await createNexusClient({
                k1ValidatorAddress:
                  "0x0000002D6DB27c52E3C11c1Cf24072004AC75cBa",
                factoryAddress: "0x00000024115AA990F0bAE0B6b0D5B8F68b684cd6",
                signer: account,
                chain: getCustomChain(
                  testChain.name!,
                  testChain.chainId!,
                  rpcUrl,
                  ""
                ),
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
            }, 20_000);

            describe("estimateUserOperationGas", () => {
              it("should return a gas estimate for a smart account deployment", async () => {
                const estimate = await gasEstimator.estimateUserOperationGas({
                  unEstimatedUserOperation: userOperation,
                  baseFeePerGas,
                });

                if (!isEstimateUserOperationGasResultV7(estimate)) {
                  throw new Error("Expected EstimateUserOperationGasResultV7");
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

                const {
                  requiredPrefundEth,
                  requiredPrefundWei,
                  nativeCurrencySymbol,
                  requiredPrefundUsd,
                } = calculateRequiredPrefundV7(
                  userOperation,
                  callGasLimit,
                  verificationGasLimit,
                  preVerificationGas,
                  viemChain,
                  testChain,
                  paymasterVerificationGasLimit,
                  paymasterPostOpGasLimit
                );

                benchmarkResults[EntryPointVersion.v070][
                  testChain.name!
                ].smartAccountDeployment = `${requiredPrefundEth} ${nativeCurrencySymbol} ($${requiredPrefundUsd})`;

                userOperation = {
                  ...userOperation,
                  callGasLimit,
                  verificationGasLimit,
                  preVerificationGas,
                  paymasterPostOpGasLimit,
                  paymasterVerificationGasLimit,
                };

                const signature = await nexusClient.account.signUserOperation(
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
              }, 10_000);
            });
          });
        }
      });
    });
  }
});

function calculateRequiredPrefundV6(
  userOperation: UserOperationV6,
  callGasLimit: bigint,
  verificationGasLimit: bigint,
  preVerificationGas: bigint,
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
  callGasLimit: bigint,
  verificationGasLimit: bigint,
  preVerificationGas: bigint,
  chain: chains.Chain,
  testChain: SupportedChain,
  paymasterVerificationGasLimit?: bigint,
  paymasterPostOpGasLimit?: bigint
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
