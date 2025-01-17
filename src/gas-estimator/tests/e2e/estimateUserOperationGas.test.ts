import {
  type BiconomySmartAccountV2,
  type UserOperationStruct,
  createSmartAccountClient,
  getCustomChain
} from "@biconomy/account"
import { type NexusClient, createNexusClient } from "@biconomy/sdk"
import config from "config"
import {
  http,
  type Address,
  type Hex,
  createPublicClient,
  createWalletClient,
  extractChain,
  formatEther,
  parseEther,
  toHex,
  zeroAddress
} from "viem"
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts"
import * as chains from "viem/chains"
import { afterAll, beforeAll, describe, expect, it } from "vitest"
import { supportedChains } from "../../../chains/chains"
import type { SupportedChain } from "../../../chains/types"
import { StateOverrideBuilder } from "../../../entrypoint/shared/stateOverrides"
import { EntryPointVersion } from "../../../entrypoint/shared/types"
import {
  type UserOperationV6,
  userOperationV6Schema
} from "../../../entrypoint/v0.6.0/UserOperationV6"
import {
  type UserOperationV7,
  userOperationV7Schema
} from "../../../entrypoint/v0.7.0/UserOperationV7"
import { getPaymasterAddressFromPaymasterAndData } from "../../../paymaster/utils"
import { getRequiredPrefund } from "../../../shared/utils"
import { createGasEstimator } from "../../createGasEstimator"
import {
  isEstimateUserOperationGasResultV6,
  isEstimateUserOperationGasResultV7
} from "../../types"
import type { BenchmarkResults } from "../../utils"

describe("e2e", () => {
  const benchmarkResults: BenchmarkResults = {
    [EntryPointVersion.v060]: {},
    [EntryPointVersion.v070]: {}
  }

  afterAll(() => {
    console.log(JSON.stringify(benchmarkResults, null, 2))
  })

  const privateKey = generatePrivateKey()
  const account = privateKeyToAccount(privateKey)

  const testChains = filterTestChains()

  describe.each(testChains)("On $name ($chainId)", (testChain) => {
    const rpcUrl = config.get<string>(`testChains.${testChain.chainId}.rpcUrl`)

    // This bundler URL is never called, but the format has to be correct or the createSmartAccountClient function will throw an error
    const bundlerUrl = `https://no.bundler.bro/api/v2/${testChain.chainId}/whatever`

    const viemChain = extractChain({
      chains: Object.values(chains),
      id: testChain.chainId as any
    })

    const transport = http(rpcUrl)
    const viemClient = createPublicClient({
      chain:
        viemChain ||
        ({
          id: testChain.chainId
        } as chains.Chain),
      transport
    })

    let maxFeePerGas: bigint
    let maxPriorityFeePerGas: bigint
    let baseFeePerGas: bigint

    beforeAll(async () => {
      if (testChain.eip1559) {
        const [fees, latestBlock] = await Promise.all([
          viemClient.estimateFeesPerGas(),
          viemClient.getBlock({
            blockTag: "latest"
          })
        ])

        maxFeePerGas = fees.maxFeePerGas || 1n
        maxPriorityFeePerGas = fees.maxPriorityFeePerGas || 1n

        if (!latestBlock.baseFeePerGas) {
          throw new Error("baseFeePerGas is null")
        }
        baseFeePerGas = latestBlock.baseFeePerGas
      } else {
        const gasPrice = await viemClient.getGasPrice()
        maxFeePerGas = gasPrice
        maxPriorityFeePerGas = gasPrice
        baseFeePerGas = gasPrice
      }

      benchmarkResults[EntryPointVersion.v060][testChain.name!] = {
        smartAccountDeployment: "",
        nativeTransfer: ""
      }
      benchmarkResults[EntryPointVersion.v070][testChain.name!] = {
        smartAccountDeployment: "",
        nativeTransfer: ""
      }
    }, 20_000)

    describe.runIf(testChain.smartAccountSupport.smartAccountsV2)(
      "Using EntryPoint v0.6.0",
      () => {
        const signer = createWalletClient({
          account,
          chain: {
            id: testChain.chainId
          } as chains.Chain,
          transport
        })

        let smartAccount: BiconomySmartAccountV2
        let nativeTransferCallData: Hex

        const gasEstimator = createGasEstimator({
          chainId: testChain.chainId,
          rpc: viemClient
        })

        const entryPoint =
          gasEstimator.entryPoints[EntryPointVersion.v060].contract

        const paymasters = testChain?.paymasters?.v060

        const sponsorshipPaymaster = paymasters
          ? Object.values(paymasters).find(
              (paymaster) => paymaster.type === "sponsorship"
            )
          : undefined

        const tokenPaymaster = paymasters
          ? Object.values(paymasters).find(
              (paymaster) => paymaster.type === "token"
            )
          : undefined

        let userOperation: UserOperationV6

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
              bundlerUrl
            })

            nativeTransferCallData = await smartAccount.encodeExecute(
              zeroAddress,
              1n,
              "0x"
            )

            const [sender, initCode, nonce] = await Promise.all([
              smartAccount.getAddress(),
              smartAccount.getInitCode(),
              smartAccount.getNonce()
            ])

            const unsignedUserOperation: Partial<UserOperationStruct> = {
              sender,
              initCode,
              nonce,
              callGasLimit: 1n,
              maxFeePerGas,
              maxPriorityFeePerGas,
              preVerificationGas: 1n,
              verificationGasLimit: 1n,
              paymasterAndData: "0x",
              callData: nativeTransferCallData
            }

            const signedUserOperation = await smartAccount.signUserOp(
              unsignedUserOperation
            )

            userOperation = userOperationV6Schema.parse(signedUserOperation)
          } catch (err: any) {
            console.error(err)
            throw err.message
          }
        }, 20_000)

        describe("Given an undeployed smart account", () => {
          describe.runIf(testChain.stateOverrideSupport.balance)(
            "If we can override the sender's balance",
            () => {
              describe("Without a paymaster", () => {
                describe("estimateUserOperationGas", () => {
                  it("should return a gas estimate that doesn't revert", async () => {
                    const gasEstimate =
                      await gasEstimator.estimateUserOperationGas({
                        unEstimatedUserOperation: userOperation,
                        baseFeePerGas
                      })

                    if (!isEstimateUserOperationGasResultV6(gasEstimate)) {
                      throw new Error(
                        "Expected EstimateUserOperationGasResultV6"
                      )
                    }

                    expect(gasEstimate).toBeDefined()

                    const {
                      callGasLimit,
                      verificationGasLimit,
                      preVerificationGas
                    } = gasEstimate

                    expect(callGasLimit).toBeGreaterThan(0n)
                    expect(verificationGasLimit).toBeGreaterThan(0n)
                    expect(preVerificationGas).toBeGreaterThan(0n)

                    const estimatedUserOperation = {
                      ...userOperation,
                      callGasLimit,
                      verificationGasLimit,
                      preVerificationGas
                    }

                    // 💡 simulateHandleOp throws 'return data out of bounds' on some chains
                    // if we provide the legacy gas price as a maxFeePerGas
                    // if (!testChain.eip1559) {
                    //   estimatedUserOperation.maxFeePerGas = 1n;
                    //   estimatedUserOperation.maxPriorityFeePerGas = 1n;
                    // }

                    const {
                      requiredPrefundEth,
                      nativeCurrencySymbol,
                      requiredPrefundUsd
                    } = calculateRequiredPrefundV6(
                      estimatedUserOperation,
                      viemChain,
                      testChain
                    )

                    benchmarkResults[EntryPointVersion.v060][
                      testChain.name!
                    ].smartAccountDeployment =
                      `${requiredPrefundEth} ${nativeCurrencySymbol} ($${requiredPrefundUsd})`

                    const { paid } = await entryPoint.simulateHandleOp({
                      userOperation: estimatedUserOperation,
                      targetAddress: entryPoint.address,
                      targetCallData: estimatedUserOperation.callData,
                      stateOverrides: new StateOverrideBuilder()
                        .overrideBalance(
                          estimatedUserOperation.sender,
                          parseEther("100")
                        )
                        .build()
                    })

                    expect(paid).toBeGreaterThan(0n)
                  }, 20_000)
                })
              })

              describe.runIf(testChain.stateOverrideSupport.stateDiff)(
                "If we can override the paymaster's deposit",
                () => {
                  describe.runIf(sponsorshipPaymaster)(
                    "Given a sponsorship paymaster",
                    () => {
                      let paymasterAndData: Hex | undefined

                      beforeAll(() => {
                        paymasterAndData = sponsorshipPaymaster!
                          .dummyPaymasterAndData as Hex
                      })

                      describe("estimateUserOperationGas", () => {
                        it("should return a gas estimate that doesn't revert", async () => {
                          const unEstimatedUserOperation = {
                            ...userOperation,
                            paymasterAndData: paymasterAndData!
                          }

                          const gasEstimate =
                            await gasEstimator.estimateUserOperationGas({
                              unEstimatedUserOperation,
                              baseFeePerGas
                            })

                          if (
                            !isEstimateUserOperationGasResultV6(gasEstimate)
                          ) {
                            throw new Error(
                              "Expected EstimateUserOperationGasResultV6"
                            )
                          }

                          expect(gasEstimate).toBeDefined()
                          const {
                            callGasLimit,
                            verificationGasLimit,
                            preVerificationGas,
                            validUntil
                          } = gasEstimate

                          expect(callGasLimit).toBeGreaterThan(0n)
                          expect(verificationGasLimit).toBeGreaterThan(0n)
                          expect(preVerificationGas).toBeGreaterThan(0n)
                          expect(validUntil).toBeGreaterThan(0n)

                          const estimatedUserOperation = {
                            ...userOperation,
                            callGasLimit,
                            verificationGasLimit,
                            preVerificationGas
                          }

                          const { nativeCurrencySymbol, requiredPrefundWei } =
                            calculateRequiredPrefundV6(
                              estimatedUserOperation,
                              viemChain,
                              testChain
                            )

                          // expect the requiredPrefundWei to be greater then 0
                          expect(requiredPrefundWei).toBeGreaterThan(0n)

                          const { paid } = await entryPoint.simulateHandleOp({
                            userOperation: estimatedUserOperation,
                            targetAddress: entryPoint.address,
                            targetCallData: estimatedUserOperation.callData,
                            stateOverrides: new StateOverrideBuilder()
                              .overrideBalance(
                                estimatedUserOperation.sender,
                                parseEther("1000")
                              )
                              .overridePaymasterDeposit(
                                entryPoint.address,
                                getPaymasterAddressFromPaymasterAndData(
                                  paymasterAndData!
                                )
                              )
                              .build()
                          })

                          expect(paid).toBeGreaterThan(0n)
                        })
                      })
                    }
                  )

                  describe.runIf(tokenPaymaster)(
                    "Given a token paymaster",
                    () => {
                      let paymasterAndData: Hex | undefined

                      beforeAll(() => {
                        paymasterAndData = tokenPaymaster!
                          .dummyPaymasterAndData as Hex
                      })

                      describe("estimateUserOperationGas", () => {
                        it("should return a gas estimate that doesn't revert", async () => {
                          const unEstimatedUserOperation = {
                            ...userOperation,
                            paymasterAndData: paymasterAndData!
                          }

                          const gasEstimate =
                            await gasEstimator.estimateUserOperationGas({
                              unEstimatedUserOperation,
                              baseFeePerGas
                            })

                          if (
                            !isEstimateUserOperationGasResultV6(gasEstimate)
                          ) {
                            throw new Error(
                              "Expected EstimateUserOperationGasResultV6"
                            )
                          }

                          expect(gasEstimate).toBeDefined()
                          const {
                            callGasLimit,
                            verificationGasLimit,
                            preVerificationGas,
                            validUntil
                          } = gasEstimate

                          expect(callGasLimit).toBeGreaterThan(0n)
                          expect(verificationGasLimit).toBeGreaterThan(0n)
                          expect(preVerificationGas).toBeGreaterThan(0n)
                          expect(validUntil).toBeGreaterThan(0n)

                          const estimatedUserOperation = {
                            ...userOperation,
                            paymasterAndData: paymasterAndData!,
                            callGasLimit,
                            verificationGasLimit,
                            preVerificationGas
                          }

                          const { nativeCurrencySymbol, requiredPrefundWei } =
                            calculateRequiredPrefundV6(
                              estimatedUserOperation,
                              viemChain,
                              testChain
                            )

                          // expect the requiredPrefundWei to be greater then 0
                          expect(requiredPrefundWei).toBeGreaterThan(0n)

                          const { paid } = await entryPoint.simulateHandleOp({
                            userOperation: estimatedUserOperation,
                            targetAddress: entryPoint.address,
                            targetCallData: estimatedUserOperation.callData,
                            stateOverrides: new StateOverrideBuilder()
                              .overrideBalance(
                                estimatedUserOperation.sender,
                                parseEther("1000")
                              )
                              .overridePaymasterDeposit(
                                entryPoint.address,
                                getPaymasterAddressFromPaymasterAndData(
                                  paymasterAndData!
                                )
                              )
                              .build()
                          })
                        }, 20_000)
                      })
                    }
                  )
                }
              )
            }
          )
        })

        let testSender: Address | undefined
        if (config.has(`testChains.${testChain.chainId}.testAddresses.v2`)) {
          testSender = config.get<Address>(
            `testChains.${testChain.chainId}.testAddresses.v2`
          )
        }

        describe.runIf(testSender)("Given a deployed smart account", () => {
          describe("Without a paymaster", () => {
            describe("estimateUserOperationGas", () => {
              it("should return a gas estimate that doesn't revert", async () => {
                // we are using an existing deployed account so we don't get AA20 account not deployed
                const sender = testSender!
                const nonce = await entryPoint.getNonce(sender)
                const initCode: Hex = "0x"

                const unEstimatedUserOperation = {
                  ...userOperation,
                  sender,
                  nonce,
                  initCode
                }

                const gasEstimate = await gasEstimator.estimateUserOperationGas(
                  {
                    unEstimatedUserOperation,
                    baseFeePerGas
                  }
                )
                expect(gasEstimate).toBeDefined()

                const {
                  callGasLimit,
                  verificationGasLimit,
                  preVerificationGas
                } = gasEstimate

                expect(callGasLimit).toBeGreaterThan(0n)
                expect(verificationGasLimit).toBeGreaterThan(0n)
                expect(preVerificationGas).toBeGreaterThan(0n)

                const estimatedUserOperation = {
                  ...unEstimatedUserOperation,
                  callGasLimit,
                  verificationGasLimit,
                  preVerificationGas,
                  maxFeePerGas,
                  maxPriorityFeePerGas
                }

                const {
                  requiredPrefundEth,
                  nativeCurrencySymbol,
                  requiredPrefundUsd
                } = calculateRequiredPrefundV6(
                  estimatedUserOperation,
                  viemChain,
                  testChain
                )

                benchmarkResults[EntryPointVersion.v060][
                  testChain.name!
                ].nativeTransfer =
                  `${requiredPrefundEth} ${nativeCurrencySymbol} ($${requiredPrefundUsd})`

                const { paid } = await gasEstimator.entryPoints[
                  EntryPointVersion.v060
                ].contract.simulateHandleOp({
                  userOperation: estimatedUserOperation,
                  targetAddress:
                    gasEstimator.entryPoints[EntryPointVersion.v060].contract
                      .address,
                  targetCallData: estimatedUserOperation.callData,
                  stateOverrides: new StateOverrideBuilder()
                    .overrideBalance(
                      estimatedUserOperation.sender,
                      1000000000000000000n
                    )
                    .build()
                })

                expect(paid).toBeGreaterThan(0n)
              }, 20_000)
            })
          })
        })
      }
    )

    describe.runIf(testChain.smartAccountSupport.nexus)(
      "Using EntryPoint v0.7.0",
      () => {
        const gasEstimator = createGasEstimator({
          chainId: testChain.chainId,
          rpc: viemClient
        })

        const entryPoint =
          gasEstimator.entryPoints[EntryPointVersion.v070].contract

        let nexusClient: NexusClient
        let userOperation: UserOperationV7

        const paymasters = testChain?.paymasters?.v070

        const sponsorshipPaymaster = paymasters
          ? Object.entries(paymasters).find(
              ([_, paymasterDetails]) => paymasterDetails.type === "sponsorship"
            )
          : undefined

        const tokenPaymaster = paymasters
          ? Object.entries(paymasters).find(
              ([_, paymasterDetails]) => paymasterDetails.type === "token"
            )
          : undefined

        beforeAll(async () => {
          try {
            const chain =
              viemChain ||
              getCustomChain(testChain.name!, testChain.chainId, rpcUrl, "")

            nexusClient = await createNexusClient({
              signer: account,
              chain,
              transport,
              bundlerTransport: transport
            })

            const { factory, factoryData } =
              await nexusClient.account.getFactoryArgs()

            if (!factory) {
              throw new Error("Factory address is not defined")
            }

            if (!factoryData) {
              throw new Error("Factory data is not defined")
            }

            const unsignedUserOperation = {
              sender: nexusClient.account.address,
              callData: await nexusClient.account.encodeExecute({
                to: zeroAddress,
                data: "0x",
                value: 1n
              }),
              callGasLimit: 1n,
              maxFeePerGas,
              maxPriorityFeePerGas,
              nonce: await nexusClient.account.getNonce(),
              preVerificationGas: 1n,
              verificationGasLimit: 1n,
              factory,
              factoryData,
              signature: "0x" as Hex
            }

            const signature = await nexusClient.account.signUserOperation(
              unsignedUserOperation
            )

            unsignedUserOperation.signature = signature

            userOperation = userOperationV7Schema.parse(unsignedUserOperation)
          } catch (err: any) {
            console.error(err)
            throw err.message
          }
        }, 20_000)

        describe("Given an undeployed smart account", () => {
          describe("Without a paymaster", () => {
            describe("estimateUserOperationGas", () => {
              it("should return a gas estimate that doesn't revert", async () => {
                const estimate = await gasEstimator.estimateUserOperationGas({
                  unEstimatedUserOperation: userOperation,
                  baseFeePerGas
                })

                if (!isEstimateUserOperationGasResultV7(estimate)) {
                  throw new Error("Expected EstimateUserOperationGasResultV7")
                }

                expect(estimate).toBeDefined()
                const {
                  callGasLimit,
                  verificationGasLimit,
                  preVerificationGas,
                  paymasterPostOpGasLimit,
                  paymasterVerificationGasLimit
                } = estimate

                expect(callGasLimit).toBeGreaterThan(0n)
                expect(verificationGasLimit).toBeGreaterThan(0n)
                expect(preVerificationGas).toBeGreaterThan(0n)
                expect(paymasterPostOpGasLimit).toBe(0n)
                expect(paymasterVerificationGasLimit).toBe(0n)

                const estimatedUserOperation = {
                  ...userOperation,
                  callGasLimit,
                  verificationGasLimit,
                  preVerificationGas
                }

                const {
                  requiredPrefundEth,
                  nativeCurrencySymbol,
                  requiredPrefundUsd
                } = calculateRequiredPrefundV7(
                  estimatedUserOperation,
                  viemChain,
                  testChain
                )

                benchmarkResults[EntryPointVersion.v070][
                  testChain.name!
                ].smartAccountDeployment =
                  `${requiredPrefundEth} ${nativeCurrencySymbol} ($${requiredPrefundUsd})`

                const { paid } = await entryPoint.simulateHandleOp({
                  userOperation: estimatedUserOperation,
                  targetAddress: entryPoint.address,
                  targetCallData: estimatedUserOperation.callData,
                  stateOverrides: new StateOverrideBuilder()
                    .overrideBalance(
                      estimatedUserOperation.sender,
                      1000000000000000000n
                    )
                    .build()
                })

                expect(paid).toBeGreaterThan(0n)
              }, 10_000)
            })
          })

          describe.runIf(sponsorshipPaymaster)(
            "Given a sponsorship paymaster",
            () => {
              let paymaster: Address
              let paymasterData: Hex

              beforeAll(() => {
                paymaster = sponsorshipPaymaster![0] as Address
                paymasterData = sponsorshipPaymaster![1]
                  .dummyPaymasterData as Hex
              })

              describe("estimateUserOperationGas", () => {
                it("should return a gas estimate that doesn't revert", async () => {
                  const unEstimatedUserOperation = {
                    ...userOperation,
                    paymaster,
                    paymasterData
                  }

                  const estimate = await gasEstimator.estimateUserOperationGas({
                    unEstimatedUserOperation,
                    baseFeePerGas
                  })

                  if (!isEstimateUserOperationGasResultV7(estimate)) {
                    throw new Error("Expected EstimateUserOperationGasResultV7")
                  }

                  expect(estimate).toBeDefined()
                  const {
                    callGasLimit,
                    verificationGasLimit,
                    preVerificationGas,
                    paymasterPostOpGasLimit,
                    paymasterVerificationGasLimit
                  } = estimate

                  expect(callGasLimit).toBeGreaterThan(0n)
                  expect(verificationGasLimit).toBeGreaterThan(0n)
                  expect(preVerificationGas).toBeGreaterThan(0n)
                  expect(paymasterPostOpGasLimit).toBeGreaterThan(0n)
                  expect(paymasterVerificationGasLimit).toBeGreaterThan(0n)

                  const estimatedUserOperation = {
                    ...userOperation,
                    callGasLimit,
                    verificationGasLimit,
                    preVerificationGas,
                    paymasterPostOpGasLimit,
                    paymasterVerificationGasLimit
                  }

                  const { paid } = await entryPoint.simulateHandleOp({
                    userOperation: estimatedUserOperation,
                    targetAddress: entryPoint.address,
                    targetCallData: estimatedUserOperation.callData,
                    stateOverrides: new StateOverrideBuilder()
                      .overrideBalance(
                        estimatedUserOperation.sender,
                        parseEther("1000")
                      )
                      .overridePaymasterDeposit(entryPoint.address, paymaster)
                      .build()
                  })

                  expect(paid).toBeGreaterThan(0n)
                })
              })
            }
          )

          describe.runIf(tokenPaymaster)("Given a token paymaster", () => {
            let paymaster: Address
            let paymasterData: Hex

            beforeAll(() => {
              paymaster = tokenPaymaster![0] as Address
              paymasterData = tokenPaymaster![1].dummyPaymasterData as Hex
            })

            describe("estimateUserOperationGas", () => {
              it("should return a gas estimate that doesn't revert", async () => {
                const unEstimatedUserOperation = {
                  ...userOperation,
                  paymaster,
                  paymasterData
                }

                const estimate = await gasEstimator.estimateUserOperationGas({
                  unEstimatedUserOperation,
                  baseFeePerGas
                })

                expect(estimate).toBeDefined()

                if (!isEstimateUserOperationGasResultV7(estimate)) {
                  throw new Error("Expected EstimateUserOperationGasResultV7")
                }

                const {
                  callGasLimit,
                  verificationGasLimit,
                  preVerificationGas,
                  paymasterPostOpGasLimit,
                  paymasterVerificationGasLimit
                } = estimate

                expect(callGasLimit).toBeGreaterThan(0n)
                expect(verificationGasLimit).toBeGreaterThan(0n)
                expect(preVerificationGas).toBeGreaterThan(0n)
                expect(paymasterPostOpGasLimit).toBeGreaterThan(0n)
                expect(paymasterVerificationGasLimit).toBeGreaterThan(0n)

                const estimatedUserOperation = {
                  ...userOperation,
                  callGasLimit,
                  verificationGasLimit,
                  preVerificationGas,
                  paymasterPostOpGasLimit,
                  paymasterVerificationGasLimit
                }

                const { paid } = await entryPoint.simulateHandleOp({
                  userOperation: estimatedUserOperation,
                  targetAddress: entryPoint.address,
                  targetCallData: estimatedUserOperation.callData,
                  stateOverrides: new StateOverrideBuilder()
                    .overrideBalance(
                      estimatedUserOperation.sender,
                      parseEther("10")
                    )
                    .overridePaymasterDeposit(entryPoint.address, paymaster)
                    .build()
                })

                expect(paid).toBeGreaterThan(0n)
              })
            })
          })
        })
      }
    )
  })
})

function filterTestChains() {
  const includeChainIds = config.get<number[]>("includeInTests")
  const excludeChainIds = config.get<number[]>("excludeFromTests")

  const testChains = Object.values(supportedChains).filter(
    (chain) =>
      chain.stateOverrideSupport.balance &&
      !excludeChainIds.includes(chain.chainId) &&
      (includeChainIds.length === 0 || includeChainIds.includes(chain.chainId))
  )

  return testChains
}

function calculateRequiredPrefundV6(
  userOperation: UserOperationV6,
  chain: chains.Chain,
  testChain: SupportedChain
) {
  const requiredPrefundWei = getRequiredPrefund(userOperation)

  const requiredPrefundEth = formatEther(requiredPrefundWei)

  let ethPriceUsd = 0
  let requiredPrefundUsd = "0"

  const nativeCurrencySymbol =
    chain?.nativeCurrency.symbol || testChain.nativeCurrency
  if (config.has(`benchmarkPricesUSD.${nativeCurrencySymbol}`)) {
    ethPriceUsd = config.get<number>(
      `benchmarkPricesUSD.${nativeCurrencySymbol}`
    ) // usd
    requiredPrefundUsd = (Number(requiredPrefundEth) * ethPriceUsd).toFixed(4)
  }
  return {
    requiredPrefundEth,
    nativeCurrencySymbol,
    requiredPrefundUsd,
    requiredPrefundWei
  }
}

function calculateRequiredPrefundV7(
  userOperation: UserOperationV7,
  chain: chains.Chain,
  testChain: SupportedChain
) {
  const requiredPrefundWei = getRequiredPrefund(userOperation)

  const requiredPrefundEth = formatEther(requiredPrefundWei)

  let ethPriceUsd = 0
  let requiredPrefundUsd = "0"

  const nativeCurrencySymbol =
    chain?.nativeCurrency.symbol || testChain.nativeCurrency
  if (config.has(`benchmarkPricesUSD.${nativeCurrencySymbol}`)) {
    ethPriceUsd = config.get<number>(
      `benchmarkPricesUSD.${nativeCurrencySymbol}`
    ) // usd
    requiredPrefundUsd = (Number(requiredPrefundEth) * ethPriceUsd).toFixed(4)
  }
  return {
    requiredPrefundEth,
    nativeCurrencySymbol,
    requiredPrefundUsd,
    requiredPrefundWei
  }
}
