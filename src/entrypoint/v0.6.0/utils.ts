/**
 * Calculates the required prefund amount for a user operation based on its gas parameters.
 * The prefund amount is used to ensure the account has sufficient funds to cover the operation's gas costs.
 * For operations using a paymaster, the gas requirements are multiplied by 3 to account for potential
 * paymaster failures and refunds.
 *
 * @param userOp - The user operation to calculate prefund for
 * @param userOp.paymasterAndData - Paymaster contract address and data, "0x" if no paymaster is used
 * @param userOp.callGasLimit - Gas limit for the main execution call
 * @param userOp.verificationGasLimit - Gas limit for the verification phase
 * @param userOp.preVerificationGas - Gas for pre-verification operations
 * @param userOp.maxFeePerGas - Maximum total fee per gas unit
 *
 * @returns The required prefund amount in wei as a bigint
 *
 * @example
 * ```typescript
 * const prefund = getRequiredPrefundV6({
 *   paymasterAndData: "0x", // No paymaster
 *   callGasLimit: 100000n,
 *   verificationGasLimit: 50000n,
 *   preVerificationGas: 21000n,
 *   maxFeePerGas: 1000000000n
 * });
 *
 * const prefundWithPaymaster = getRequiredPrefundV6({
 *   paymasterAndData: "0x123...", // Using paymaster
 *   callGasLimit: 100000n,
 *   verificationGasLimit: 50000n,
 *   preVerificationGas: 21000n,
 *   maxFeePerGas: 1000000000n
 * }); // Will be 3x higher due to paymaster multiplier
 * ```
 */
export function getRequiredPrefundV6(userOp: {
  paymasterAndData: string
  callGasLimit: bigint
  verificationGasLimit: bigint
  preVerificationGas: bigint
  maxFeePerGas: bigint
}) {
  const multiplier = userOp.paymasterAndData !== "0x" ? 3n : 1n

  const requiredGas =
    userOp.callGasLimit +
    userOp.verificationGasLimit * multiplier +
    userOp.preVerificationGas

  return requiredGas * userOp.maxFeePerGas
}
