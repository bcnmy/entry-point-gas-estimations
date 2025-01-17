import type { Address, Hex } from "viem"

/**
 * Extracts the paymaster address from a paymasterAndData field.
 * The paymaster address is the first 20 bytes (40 hex characters + '0x' prefix)
 * of the paymasterAndData string.
 *
 * @param paymasterAndData - The full paymasterAndData hex string from a {@link UserOperationV6}
 * @returns The paymaster's Ethereum address
 *
 * @example
 * ```typescript
 * const paymasterAndData = "0x1234567890123456789012345678901234567890abcdef...";
 * const paymasterAddress = getPaymasterAddressFromPaymasterAndData(paymasterAndData);
 * // Returns: "0x1234567890123456789012345678901234567890"
 * ```
 *
 * @remarks
 * The paymasterAndData field contains:
 * - First 20 bytes: paymaster contract address
 * - Remaining bytes: arbitrary data used by the paymaster
 */
export function getPaymasterAddressFromPaymasterAndData(
  paymasterAndData: Hex
): Address {
  return paymasterAndData.slice(0, 42) as Address
}
