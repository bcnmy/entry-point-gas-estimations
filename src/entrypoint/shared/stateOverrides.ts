import { type Address, type Hex, toHex } from "viem"
import { PAYMASTER_DEPOSIT_MAX } from "../../paymaster/constants"
import type { StateOverrideSet } from "../../shared"
import { calculateMappingStorageKey, mergeStateOverrides } from "./utils"

export class StateOverrideBuilder {
  private newStateOverrides: StateOverrideSet | undefined

  constructor(private stateOverrides?: StateOverrideSet) {}

  private extendAddressOverride(
    address: Address,
    override: Record<string, unknown>
  ) {
    this.newStateOverrides = this.newStateOverrides || {}

    // If address already exists in newStateOverrides, merge the new override
    if (this.newStateOverrides[address]) {
      this.newStateOverrides[address] = {
        ...this.newStateOverrides[address],
        ...override
      }
    } else {
      // If address doesn't exist, create new override
      this.newStateOverrides[address] = override
    }
  }

  overrideBalance(address: Address, balance: bigint) {
    this.extendAddressOverride(address, { balance: toHex(balance) })
    return this
  }

  overrideCode(address: Address, code: Hex) {
    this.extendAddressOverride(address, { code })
    return this
  }

  overridePaymasterDeposit(
    entryPointAddress: Address,
    paymasterAddress: Address,
    storageValue = PAYMASTER_DEPOSIT_MAX
  ) {
    const storageKey = calculateMappingStorageKey(0n, paymasterAddress)
    const stateDiff = {
      [storageKey]: storageValue
    }

    // Get existing stateDiff if any
    const existingStateDiff =
      this.newStateOverrides?.[entryPointAddress]?.stateDiff || {}

    this.extendAddressOverride(entryPointAddress, {
      stateDiff: {
        ...existingStateDiff,
        ...stateDiff
      }
    })
    return this
  }

  build(): StateOverrideSet | undefined {
    return this.stateOverrides
      ? mergeStateOverrides(this.stateOverrides, this.newStateOverrides)
      : this.newStateOverrides
  }
}
