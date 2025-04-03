import {
  type BiconomySmartAccountV2,
  type UserOperationStruct,
  createSmartAccountClient,
  getCustomChain,
  createECDSAOwnershipValidationModule,
} from "@biconomy/account"
import config from "config"
import {
  http,
  type Address,
  type Hex,
  createPublicClient,
  createWalletClient,
  extractChain,
  parseEther,
  zeroAddress,
} from "viem"
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts"
import * as chains from "viem/chains"
import { beforeAll, describe, expect, it } from "vitest"
import { supportedChains } from "../../chains/chains"
import {
  SIMULATION_CALL_GAS_LIMIT,
  SIMULATION_PRE_VERIFICATION_GAS,
  SIMULATION_VERIFICATION_GAS_LIMIT,
} from "../../gas-estimator/evm/constants"
import { getPaymasterAddressFromPaymasterAndData } from "../../paymaster/utils"
import { StateOverrideBuilder } from "../shared/stateOverrides"
import { EntryPointV6 } from "./EntryPointV6"
import { type UserOperationV6, userOperationV6Schema } from "./UserOperationV6"
import {
  ENTRYPOINT_V6_ADDRESS,
  MAX_FEE_PER_GAS_OVERRIDE_VALUE,
  MAX_PRIORITY_FEE_PER_GAS_OVERRIDE_VALUE,
} from "./constants"

describe("e2e", () => {
  describe("EntryPointV6", () => {
    const privateKey = generatePrivateKey()
    const account = privateKeyToAccount(privateKey)

    const testChains = filterTestChains()

    describe.each(testChains)("On $name ($chainId)", (testChain) => {
      const bundlerUrl = `https://host.com/api/v2/${testChain.chainId}/apikey`

      const rpcUrl = config.get<string>(
        `testChains.${testChain.chainId}.rpcUrl`,
      )

      const transport = http(rpcUrl)

      const viemChain =
        extractChain({
          chains: Object.values(chains),
          id: testChain.chainId as any,
        }) ||
        ({
          id: testChain.chainId,
        } as chains.Chain)

      const viemClient = createPublicClient({
        chain: viemChain,
        transport,
      })

      const signer = createWalletClient({
        chain: viemChain,
        account,
        transport,
      })

      let smartAccount: BiconomySmartAccountV2
      let callData: Hex

      const entryPointContractAddress =
        (testChain.entryPoints?.v060?.address as Address) ||
        ENTRYPOINT_V6_ADDRESS

      const epv6 = new EntryPointV6(viemClient, entryPointContractAddress)

      const paymasters = testChain.paymasters?.v060

      beforeAll(async () => {
        smartAccount = await createSmartAccountClient({
          customChain: getCustomChain(
            testChain.name,
            testChain.chainId,
            rpcUrl,
            "",
          ),
          signer: signer as any,
          bundlerUrl,
          // TODO: cleanup (VeChain addresses)
          factoryAddress: "0x9CB89703d9f3A29B1bbfBad690D8D119E952c9df",
          defaultFallbackHandler: "0x33b515F1Bc3bf8aB9AF38BbBBe6F085F2D985368",
          defaultValidationModule: await createECDSAOwnershipValidationModule({
            signer: signer as any,
            entryPointAddress: entryPointContractAddress,
            moduleAddress: "0x6aF925Cb86074b5d686532eC8251cd4d710B7143",
          }),
        })

        callData = await smartAccount.encodeExecute(zeroAddress, 1n, "0x")
      }, 20_000)

      describe("simulateHandleOp", () => {
        let userOperation: UserOperationV6

        beforeAll(async () => {
          const [sender, nonce, initCode] = await Promise.all([
            smartAccount.getAddress(),
            smartAccount.getNonce(),
            smartAccount.getInitCode(),
          ])

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
          }

          const signedUserOperation = await smartAccount.signUserOp(
            unsignedUserOperation,
          )

          userOperation = userOperationV6Schema.parse(signedUserOperation)
        })

        describe("without a paymaster", () => {
          // TODO: un-skip
          it.skip("should revert with AA21 without a balance override", async () => {
            try {
              await epv6.simulateHandleOp({
                userOperation,
                targetAddress: userOperation.sender,
                targetCallData: userOperation.callData,
              })
            } catch (err: any) {
              if (err instanceof Error) {
                expect(err.message).toMatch(/AA21/)
              } else {
                throw new Error(
                  "Expected an error with a message, received: ",
                  err,
                )
              }
            }
          }, 20_000)

          it.runIf(testChain.stateOverrideSupport.balance)(
            "should return a ExecutionResult for a undeployed smart account",
            async () => {
              const stateOverrides = new StateOverrideBuilder()
                .overrideBalance(userOperation.sender, parseEther("10"))
                .build()

              const executionResult = await epv6.simulateHandleOp({
                userOperation,
                targetAddress: userOperation.sender,
                targetCallData: userOperation.callData,
                stateOverrides,
              })
              expect(executionResult).toBeDefined()

              const { paid, preOpGas } = executionResult

              expect(paid).toBeGreaterThan(0)
              expect(preOpGas).toBeGreaterThan(0)
            },
          )

          it.runIf(
            config.has(`testChains.${testChain.chainId}.testAddresses.v2`),
          )(
            "should return an ExecutionResult for a deployed smart account, given a balance override",
            async () => {
              const sender = config.get<Address>(
                `testChains.${testChain.chainId}.testAddresses.v2`,
              )
              const initCode = "0x"
              const nonce = await epv6.getNonce(sender)

              const userOp = {
                ...userOperation,
                sender,
                initCode,
                nonce,
              } as const

              // TODO: remove
              console.log("userOp", userOp)

              // TODO: remove (UserOp from Slack channel)
              const userOpFromSlack = {
                sender: "0x33b515F1Bc3bf8aB9AF38BbBBe6F085F2D985368",
                nonce: 0n,
                initCode: "0x",
                callData:
                  "0x0000189a0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000",
                callGasLimit: 15000000n,
                verificationGasLimit: 6000000n,
                preVerificationGas: 1000000n,
                maxFeePerGas: 0n,
                maxPriorityFeePerGas: 1000000n,
                paymasterAndData: "0x",
                signature:
                  "0x00000000000000000000000000000000000000000000000000000000000000400000000000000000000000006af925cb86074b5d686532ec8251cd4d710b714300000000000000000000000000000000000000000000000000000000000000418e718bf1411d20726e133ea15684256ab7e587f0667c162989ff0f470d77e05d4cedd093b827bb5a75af2600ca056e64a566083f40aa5813b96dbbf837229b841c00000000000000000000000000000000000000000000000000000000000000",
              } as const

              const executionResult = await epv6.simulateHandleOp({
                userOperation: userOpFromSlack, // TODO: replace with userOp
                targetAddress: userOperation.sender,
                targetCallData: userOperation.callData,
                stateOverrides: new StateOverrideBuilder()
                  .overrideBalance(sender, parseEther("10"))
                  .build(),
              })

              expect(executionResult).toBeDefined()

              const { paid, preOpGas } = executionResult

              expect(paid).toBeGreaterThan(0)
              expect(preOpGas).toBeGreaterThan(0)
            },
          )
        }, 20_000)

        describe.runIf(paymasters && testChain.stateOverrideSupport.stateDiff)(
          "with a paymaster",
          () => {
            const sponsorshipPaymaster = paymasters
              ? Object.values(paymasters).find(
                  (paymaster) => paymaster.type === "sponsorship",
                )
              : undefined

            const tokenPaymaster = paymasters
              ? Object.values(paymasters).find(
                  (paymaster) => paymaster.type === "token",
                )
              : undefined

            it.runIf(sponsorshipPaymaster)(
              "should return an ExecutionResult for a undeployed smart account, given a sponsorship paymaster",
              async () => {
                const paymasterAndData = sponsorshipPaymaster!
                  .dummyPaymasterAndData as Hex

                const stateOverrides = new StateOverrideBuilder()
                  .overrideBalance(userOperation.sender, 1n)
                  .overridePaymasterDeposit(
                    entryPointContractAddress,
                    getPaymasterAddressFromPaymasterAndData(paymasterAndData),
                  )
                  .build()

                const executionResult = await epv6.simulateHandleOp({
                  userOperation: {
                    ...userOperation,
                    paymasterAndData,
                  },
                  targetAddress: userOperation.sender,
                  targetCallData: userOperation.callData,
                  stateOverrides,
                })
                expect(executionResult).toBeDefined()

                const { paid, preOpGas } = executionResult

                expect(paid).toBeGreaterThan(0)
                expect(preOpGas).toBeGreaterThan(0)
              },
              20_000,
            )

            it.runIf(tokenPaymaster)(
              "should return an ExecutionResult for a undeployed smart account, given a token paymaster",
              async () => {
                const paymasterAndData = tokenPaymaster!
                  .dummyPaymasterAndData as Hex

                const stateOverrideBuilder = new StateOverrideBuilder()
                  .overridePaymasterDeposit(
                    entryPointContractAddress,
                    getPaymasterAddressFromPaymasterAndData(paymasterAndData),
                  )
                  .overrideBalance(userOperation.sender, 1n)

                const stateOverrides = stateOverrideBuilder.build()

                const executionResult = await epv6.simulateHandleOp({
                  userOperation: {
                    ...userOperation,
                    paymasterAndData,
                  },
                  targetAddress: userOperation.sender,
                  targetCallData: userOperation.callData,
                  stateOverrides,
                })
                expect(executionResult).toBeDefined()

                const { paid, preOpGas } = executionResult

                expect(paid).toBeGreaterThan(0)
                expect(preOpGas).toBeGreaterThan(0)
              },
              20_000,
            )
          },
        )
      })
    })
  })
})

/**
 * Filter test chains based on config.
 */
export function filterTestChains() {
  const includeChainIds = config.get<number[]>("includeInTests")
  const excludeChainIds = config.get<number[]>("excludeFromTests")

  const testChains = Object.values(supportedChains).filter(
    (chain) =>
      chain.smartAccountSupport.smartAccountsV2 &&
      !excludeChainIds.includes(chain.chainId) &&
      (includeChainIds.length === 0 || includeChainIds.includes(chain.chainId)),
  )
  return testChains
}
