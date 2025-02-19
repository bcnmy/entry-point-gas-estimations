import {
  type NexusClient,
  createNexusClient,
  getCustomChain
} from "@biconomy/sdk"
import config from "config"
import {
  http,
  type Address,
  type Hex,
  createPublicClient,
  parseEther,
  zeroAddress
} from "viem"
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts"
import type * as chains from "viem/chains"
import { beforeAll, describe, expect, it } from "vitest"
import { supportedChains } from "../../chains/chains"
import { PAYMASTER_DEPOSIT_MAX } from "../../paymaster/constants"
import { StateOverrideBuilder } from "../shared/stateOverrides"
import { EntryPointV7Simulations } from "./EntryPointV7Simulations"
import { type UserOperationV7, userOperationV7Schema } from "./UserOperationV7"
import { isExecutionResultV7 } from "./types"

// Hardcoded gas values for gas estimation, to ensure user op completeness
const defaultCallGasLimit = BigInt(5_000_000)
const defaultVerificationGasLimit = BigInt(5_000_000)
const defaultPreVerificationGas = BigInt(5_000_000)

describe("e2e", () => {
  describe("EntryPointV7Simulations", () => {
    const privateKey = generatePrivateKey()
    const account = privateKeyToAccount(privateKey)

    const testChains = filterTestChains()

    describe.each(testChains)("On $name ($chainId)", (testChain) => {
      const rpcUrl = config.get<string>(
        `testChains.${testChain.chainId}.rpcUrl`
      )
      const transport = http(rpcUrl)

      const viemClient = createPublicClient({
        chain: {
          id: testChain.chainId
        } as chains.Chain,
        transport
      })

      const epV7Simulations = new EntryPointV7Simulations(viemClient)

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
        nexusClient = await createNexusClient({
          bootStrapAddress: testChain.contracts?.bootStrapAddress as Hex | undefined,
          validatorAddress: testChain.contracts?.validatorAddress as Hex | undefined,
          factoryAddress: testChain.contracts?.factoryAddress as Hex | undefined,
          signer: account,
          chain: getCustomChain(testChain.name, testChain.chainId, rpcUrl, ""),
          transport,
          bundlerTransport: http("https://not-gonna-use-the-bundler.com")
        })

        const [fees, factoryArgs, callData, nonce] = await Promise.all([
          viemClient.estimateFeesPerGas(),
          nexusClient.account.getFactoryArgs(),
          nexusClient.account.encodeExecute({
            to: zeroAddress,
            data: "0x",
            value: 1n
          }),
          nexusClient.account.getNonce()
        ])

        if (!factoryArgs.factory) {
          throw new Error("Factory address is not defined")
        }

        if (!factoryArgs.factoryData) {
          throw new Error("Factory data is not defined")
        }

        const maxFeePerGas = fees.maxFeePerGas
        const maxPriorityFeePerGas = fees.maxPriorityFeePerGas
        const factory = factoryArgs.factory
        const factoryData = factoryArgs.factoryData

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
          signature: "0x"
        }

        const signature = await nexusClient.account.signUserOperation(
          unSignedUserOperation as any
        )
        unSignedUserOperation.signature = signature

        userOperation = userOperationV7Schema.parse(unSignedUserOperation)
      }, 10_000)

      describe("without a paymaster", () => {
        describe.runIf(testChain.stateOverrideSupport.balance)(
          "if the sender has enough funds to pay for gas",
          () => {
            let stateOverrides: any = undefined

            beforeAll(() => {
              stateOverrides = new StateOverrideBuilder()
                .overrideBalance(userOperation.sender, parseEther("10"))
                .build()
            })

            describe("simulateHandleOp", () => {
              it("should return an ExecutionResult greater than 0", async () => {
                const result = await epV7Simulations.simulateHandleOp({
                  userOperation,
                  targetAddress: userOperation.sender,
                  targetCallData: userOperation.callData,
                  stateOverrides
                })

                expect(result).toBeDefined()
                expect(isExecutionResultV7(result)).toBe(true)
              }, 10_000)
            })
          }
        )
      })

      describe.runIf(sponsorshipPaymaster)(
        "given a sponsorship paymaster",
        () => {
          let paymaster: Address;
          let paymasterData: Hex;

          beforeAll(() => {
            paymaster = sponsorshipPaymaster![0] as Address
            paymasterData = sponsorshipPaymaster![1]
              .dummyPaymasterData as Hex
          })

          describe.runIf(testChain.stateOverrideSupport.stateDiff)(
            "If we can override the paymaster deposit on the entrypoint",
            () => {
              let stateOverrides: any = undefined

              beforeAll(() => {
                stateOverrides = new StateOverrideBuilder()
                  .overrideBalance(userOperation.sender, 1n)
                  .overridePaymasterDeposit(epV7Simulations.address, paymaster)
                  .build()
              })

              describe("simulateHandleOp", () => {
                it("should return an ExecutionResult greater than 0", async () => {
                  const sponsoredUserOperation = {
                    ...userOperation,
                    paymaster,
                    paymasterData,
                    paymasterVerificationGasLimit: userOperation.verificationGasLimit,
                    paymasterPostOpGasLimit: testChain.paymasters?.v070?.[paymaster]?.postOpGasLimit
                  }

                  const result = await epV7Simulations.simulateHandleOp({
                    userOperation: sponsoredUserOperation,
                    targetAddress: userOperation.sender,
                    targetCallData: userOperation.callData,
                    stateOverrides
                  })

                  expect(result).toBeDefined()
                  expect(isExecutionResultV7(result)).toBe(true)
                })
              })
            }
          )
        }
      )

      describe.runIf(tokenPaymaster)("given a token paymaster", () => {
        let paymaster: Address
        let paymasterData: Hex

        beforeAll(() => {
          paymaster = tokenPaymaster![0] as Address
          paymasterData = tokenPaymaster![1].dummyPaymasterData as Hex
        })

        describe.runIf(testChain.stateOverrideSupport.stateDiff)(
          "if the paymaster has enough deposit to sponsor the user op",
          () => {
            let stateOverrides: any = undefined
            beforeAll(() => {
              stateOverrides = new StateOverrideBuilder()
                .overrideBalance(userOperation.sender, 1n)
                .overridePaymasterDeposit(
                  epV7Simulations.address,
                  paymaster,
                  PAYMASTER_DEPOSIT_MAX
                )
                .build()
            })

            describe("simulateHandleOp", () => {
              it("should return an ExecutionResult greater than 0", async () => {
                const sponsoredUserOperation = {
                  ...userOperation,
                  paymaster,
                  paymasterData,
                  paymasterVerificationGasLimit: userOperation.verificationGasLimit,
                  paymasterPostOpGasLimit: testChain.paymasters?.v070?.[paymaster]?.postOpGasLimit
                }

                const result = await epV7Simulations.simulateHandleOp({
                  userOperation: sponsoredUserOperation,
                  targetAddress: userOperation.sender,
                  targetCallData: userOperation.callData,
                  stateOverrides
                })

                expect(result).toBeDefined()
                expect(isExecutionResultV7(result)).toBe(true)
              })
            })
          }
        )
      })
    })
  })

  function filterTestChains() {
    const includeChainIds = config.get<number[]>("includeInTests")
    const excludeChainIds = config.get<number[]>("excludeFromTests")

    const testChains = Object.values(supportedChains).filter(
      (chain) =>
        chain.smartAccountSupport.nexus &&
        !excludeChainIds.includes(chain.chainId) &&
        (includeChainIds.length === 0 ||
          includeChainIds.includes(chain.chainId))
    )
    return testChains
  }
})
