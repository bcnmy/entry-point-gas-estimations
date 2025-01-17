import type { Address, Hex } from "viem"

export function getPaymasterAddressFromPaymasterAndData(
  paymasterAndData: Hex
): Address {
  return paymasterAndData.slice(0, 42) as Address
}
