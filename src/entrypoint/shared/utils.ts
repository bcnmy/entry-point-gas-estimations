import { Hex } from "viem";
import { numberToHex, getAddress, pad, toHex } from "viem";
import { concat, keccak256 } from "viem";
import { StateOverrideSet } from "../../shared/types";

export function cleanUpRevertReason(revertReason: string): string {
  const match = revertReason.match(/AA(\d+)\s(.+)/);

  if (match) {
    const errorCode = match[1]; // e.g., "25"
    const errorMessage = match[2]; // e.g., "invalid account nonce"
    const newMatch = `AA${errorCode} ${errorMessage}`.match(
      // eslint-disable-next-line no-control-regex
      /AA.*?(?=\\u|\u0000)/,
    );
    if (newMatch) {
      const extractedString = newMatch[0];
      return extractedString;
    }
    return `AA${errorCode} ${errorMessage}`;
  }
  return revertReason;
}

export function mergeStateOverrides(
  destination: StateOverrideSet,
  source?: StateOverrideSet,
): StateOverrideSet {
  if (!source) return destination;

  const merged: StateOverrideSet = { ...destination };

  // Use Object.entries to properly type the keyss
  Object.entries(source).forEach(([key, value]) => {
    const hexKey = key as `0x${string}`;
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
        value as StateOverrideSet,
      );
    } else {
      merged[hexKey] = value;
    }
  });

  return merged;
}

/**
 * Calculates the storage key for a mapping given its slot number and key.
 * See: https://docs.soliditylang.org/en/v0.6.8/internals/layout_in_storage.html
 * @param {number} mappingSlot - The storage slot where the mapping is declared
 * @param {string} key - The mapping key (address or number)
 * @returns {string} - The storage slot where the value is stored
 */
export function calculateMappingStorageKey(mappingSlot: bigint, key: Hex) {
  // Convert the slot number to padded hex
  const paddedSlot = pad(toHex(mappingSlot), { size: 32 });

  // Handle different key types (address or number)
  let paddedKey;
  if (key.startsWith("0x")) {
    // If key is an address, ensure it's checksummed and padded
    paddedKey = pad(getAddress(key), { size: 32 });
  } else {
    // If key is a number, convert to hex and pad
    paddedKey = pad(numberToHex(BigInt(key)), { size: 32 });
  }

  // Concatenate key and slot, then hash
  const concatenated = concat([paddedKey, paddedSlot]);
  return keccak256(concatenated);
}
