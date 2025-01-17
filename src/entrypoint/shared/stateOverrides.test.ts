import type { Hex } from "viem"
import { StateOverrideBuilder } from "./stateOverrides"

import { describe, expect, it } from "vitest"
import { DEFAULT_ENTRYPOINT_V6_SPONSORSHIP_PAYMASTER_ADDRESS } from "../.."
import { PAYMASTER_DEPOSIT_MAX } from "../../paymaster/constants"
import { ENTRYPOINT_V6_ADDRESS } from "../v0.6.0"
import { calculateMappingStorageKey } from "./utils"

describe("StateOverrideBuilder", () => {
  it("should return undefined if no state overrides are provided", () => {
    const builder = new StateOverrideBuilder()
    expect(builder.build()).toBeUndefined()
  })

  it("should override the balance of an address", () => {
    const builder = new StateOverrideBuilder()
    builder.overrideBalance("0x1234", 1n)
    expect(builder.build()).toEqual({ "0x1234": { balance: "0x1" } })
  })

  it("should override the code of an address", () => {
    const builder = new StateOverrideBuilder()
    builder.overrideCode("0x1234", "0x1234")
    expect(builder.build()).toEqual({ "0x1234": { code: "0x1234" } })
  })

  it("should override the paymaster deposit on the entrypoint contract", () => {
    const builder = new StateOverrideBuilder()
    const entryPointAddress = ENTRYPOINT_V6_ADDRESS
    const paymasterAddress = DEFAULT_ENTRYPOINT_V6_SPONSORSHIP_PAYMASTER_ADDRESS

    builder.overridePaymasterDeposit(entryPointAddress, paymasterAddress)

    const stateOverrides = builder.build()

    expect(stateOverrides).toEqual({
      [entryPointAddress]: {
        stateDiff: {
          [calculateMappingStorageKey(0n, paymasterAddress)]:
            PAYMASTER_DEPOSIT_MAX
        }
      }
    })
  })

  it("should override everything", () => {
    const entryPointAddress = ENTRYPOINT_V6_ADDRESS
    const paymasterAddress = DEFAULT_ENTRYPOINT_V6_SPONSORSHIP_PAYMASTER_ADDRESS

    const builder = new StateOverrideBuilder()
    builder
      .overrideBalance("0x1234", 1n)
      .overridePaymasterDeposit(entryPointAddress, paymasterAddress)
      .overrideCode(entryPointAddress, "0x1234")

    const stateOverrides = builder.build()

    expect(stateOverrides).toEqual({
      "0x1234": { balance: "0x1" },
      [entryPointAddress]: {
        code: "0x1234",
        stateDiff: {
          [calculateMappingStorageKey(0n, paymasterAddress)]:
            PAYMASTER_DEPOSIT_MAX
        }
      }
    })
  })

  it("should merge correctly given an existing state override key", () => {
    const bytecode: Hex = "0x1234"

    const builder = new StateOverrideBuilder({
      [ENTRYPOINT_V6_ADDRESS]: {
        code: bytecode
      }
    })

    builder.overridePaymasterDeposit(
      ENTRYPOINT_V6_ADDRESS,
      DEFAULT_ENTRYPOINT_V6_SPONSORSHIP_PAYMASTER_ADDRESS
    )

    const stateOverrides = builder.build()

    expect(stateOverrides).toEqual({
      [ENTRYPOINT_V6_ADDRESS]: {
        code: bytecode,
        stateDiff: {
          [calculateMappingStorageKey(
            0n,
            DEFAULT_ENTRYPOINT_V6_SPONSORSHIP_PAYMASTER_ADDRESS
          )]: PAYMASTER_DEPOSIT_MAX
        }
      }
    })
  })
})
