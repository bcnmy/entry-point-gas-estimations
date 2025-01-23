import type { Hex } from "viem"
import { getAddress, numberToHex, pad, toHex } from "viem"
import { concat, keccak256 } from "viem"
import type { StateOverrideSet } from "../../shared/types"

/**
 * Cleans up and formats Account Abstraction (AA) revert reasons by extracting the error code and message.
 * Handles null byte termination and standardizes the output format.
 *
 * @param revertReason - The raw revert reason string from the transaction
 * @returns A cleaned up revert reason in the format "AA{code} {message}"
 *
 * @example
 * ```typescript
 * cleanUpRevertReason("AA25 invalid account nonce\u0000"); // Returns "AA25 invalid account nonce"
 * cleanUpRevertReason("AA31 paymaster deposit too low"); // Returns "AA31 paymaster deposit too low"
 * ```
 */
export function cleanUpRevertReason(revertReason: string): string {
  const match = revertReason.match(/AA(\d+)\s(.+)/)

  if (match) {
    const errorCode = match[1] // e.g., "25"
    const errorMessage = match[2] // e.g., "invalid account nonce"
    const newMatch = `AA${errorCode} ${errorMessage}`.match(
      // biome-ignore lint/suspicious/noControlCharactersInRegex: needed for null byte matching
      /AA.*?(?=\\u|\u0000)/
    )
    if (newMatch) {
      const extractedString = newMatch[0]
      return extractedString
    }
    return `AA${errorCode} ${errorMessage}`
  }
  return revertReason
}

/**
 * Recursively merges two state override objects, combining their properties.
 * If a key exists in both objects and the values are objects, they are merged recursively.
 *
 * @param destination - The base state override set to merge into
 * @param source - Optional state override set to merge from
 * @returns A new merged state override set
 *
 * @example
 * ```typescript
 * const base = { '0x123': { balance: '0x1' } };
 * const override = { '0x123': { code: '0x2' } };
 * mergeStateOverrides(base, override);
 * // Returns: { '0x123': { balance: '0x1', code: '0x2' } }
 * ```
 */
export function mergeStateOverrides(
  destination: StateOverrideSet,
  source?: StateOverrideSet
): StateOverrideSet {
  if (!source) return destination

  const merged: StateOverrideSet = { ...destination }

  // Use Object.entries to properly type the keys
  for (const [key, value] of Object.entries(source)) {
    const hexKey = key as `0x${string}`
    if (
      value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      destination[hexKey] &&
      typeof destination[hexKey] === "object" &&
      !Array.isArray(destination[hexKey])
    ) {
      merged[hexKey] = mergeStateOverrides(
        destination[hexKey] as StateOverrideSet,
        value as StateOverrideSet
      )
    } else {
      merged[hexKey] = value
    }
  }

  return merged
}

/**
 * Calculates the storage slot key for a Solidity mapping given its slot number and key.
 * Implements the storage layout algorithm described in the Solidity documentation.
 * See: {@link https://docs.soliditylang.org/en/latest/internals/layout_in_storage.html}
 *
 * @param mappingSlot - The storage slot where the mapping is declared (position in contract storage)
 * @param key - The mapping key (can be an address or number in hex format)
 * @returns The keccak256 hash of the concatenated and padded slot and key
 *
 * @example
 * ```typescript
 * // For an address key
 * calculateMappingStorageKey(0n, "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199");
 *
 * // For a number key
 * calculateMappingStorageKey(2n, "0x1"); // For mapping at slot 2 with key 1
 * ```
 *
 * @remarks
 * For mappings in Solidity like `mapping(address => uint256)`, the storage slot
 * of a value is calculated by keccak256(abi.encode(key, uint256(slot)))
 */
export function calculateMappingStorageKey(mappingSlot: bigint, key: Hex) {
  // Convert the slot number to padded hex
  const paddedSlot = pad(toHex(mappingSlot), { size: 32 })

  // Handle different key types (address or number)
  let paddedKey: Hex
  if (key.startsWith("0x")) {
    // If key is an address, ensure it's checksummed and padded
    paddedKey = pad(getAddress(key), { size: 32 })
  } else {
    // If key is a number, convert to hex and pad
    paddedKey = pad(numberToHex(BigInt(key)), { size: 32 })
  }

  // Concatenate key and slot, then hash
  const concatenated = concat([paddedKey, paddedSlot])
  return keccak256(concatenated)
}
