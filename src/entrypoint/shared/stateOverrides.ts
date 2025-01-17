import { type Address, type Hex, toHex } from "viem"
import { PAYMASTER_DEPOSIT_MAX } from "../../paymaster/constants"
import type { StateOverrideSet } from "../../shared"
import { calculateMappingStorageKey, mergeStateOverrides } from "./utils"

/**
 * Builder class for creating and managing state overrides in Ethereum transactions.
 * Allows for overriding balances, code, and paymaster deposits in a chainable manner.
 *
 * @example
 * ```typescript
 * const builder = new StateOverrideBuilder()
 *   .overrideBalance('0x123...', 1000n)
 *   .overrideCode('0x456...', '0x1234...')
 *   .build();
 * ```
 */
export class StateOverrideBuilder {
  private newStateOverrides: StateOverrideSet | undefined

  /**
   * Creates a new StateOverrideBuilder instance
   * @param stateOverrides - Optional initial state overrides to merge with new overrides
   */
  constructor(private stateOverrides?: StateOverrideSet) {}

  /**
   * Extends the state override for a specific address
   * @param address - The Ethereum address to override
   * @param override - The override values to apply
   * @private
   */
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

  /**
   * Overrides the balance for a specific address
   * @param address - The Ethereum address to override the balance for
   * @param balance - The new balance value as a bigint
   * @returns The builder instance for method chaining
   *
   * @example
   * ```typescript
   * builder.overrideBalance('0x123...', 1000000000000000000n); // Set balance to 1 ETH
   * ```
   */
  overrideBalance(address: Address, balance: bigint) {
    this.extendAddressOverride(address, { balance: toHex(balance) })
    return this
  }

  /**
   * Overrides the contract code for a specific address
   * @param address - The Ethereum address to override the code for
   * @param code - The new contract bytecode as a hex string
   * @returns The builder instance for method chaining
   *
   * @example
   * ```typescript
   * builder.overrideCode('0x123...', '0x608060405234801...');
   * ```
   */
  overrideCode(address: Address, code: Hex) {
    this.extendAddressOverride(address, { code })
    return this
  }

  /**
   * Overrides the paymaster deposit amount in the EntryPoint contract
   * @param entryPointAddress - The address of the EntryPoint contract
   * @param paymasterAddress - The address of the Paymaster contract
   * @param storageValue - The deposit amount to set, defaults to {@link PAYMASTER_DEPOSIT_MAX}
   * @returns The builder instance for method chaining
   *
   * @example
   * ```typescript
   * builder.overridePaymasterDeposit(
   *   '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789',
   *   '0x123...'
   * );
   * ```
   */
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

  /**
   * Builds and returns the final state override set
   * @returns The merged state overrides or undefined if no overrides exist
   *
   * @example
   * ```typescript
   * const overrides = new StateOverrideBuilder()
   *   .overrideBalance('0x123...', 1000n)
   *   .build();
   * ```
   */
  build(): StateOverrideSet | undefined {
    return this.stateOverrides
      ? mergeStateOverrides(this.stateOverrides, this.newStateOverrides)
      : this.newStateOverrides
  }
}
