import type { UserOperationV7 } from "./UserOperationV7"

/**
 * Calculates the required prefund amount for a user operation based on its gas parameters.
 * The prefund amount is used to ensure the account has sufficient funds to cover the operation's gas costs.
 * For v0.7.0, this includes separate verification gas limits for both the account and paymaster.
 *
 * @param userOp - The user operation to calculate prefund for
 * @param userOp.verificationGasLimit - Gas limit for account verification
 * @param userOp.callGasLimit - Gas limit for the main execution call
 * @param userOp.preVerificationGas - Gas for pre-verification operations
 * @param userOp.paymasterVerificationGasLimit - Optional gas limit for paymaster verification
 * @param userOp.paymasterPostOpGasLimit - Optional gas limit for paymaster post-operation execution
 * @param userOp.maxFeePerGas - Maximum total fee per gas unit
 *
 * @returns The required prefund amount in wei as a bigint
 *
 * @example
 * ```typescript
 * // Without paymaster
 * const prefund = getRequiredPrefundV7({
 *   verificationGasLimit: 50000n,
 *   callGasLimit: 100000n,
 *   preVerificationGas: 21000n,
 *   maxFeePerGas: 1000000000n
 * });
 *
 * // With paymaster
 * const prefundWithPaymaster = getRequiredPrefundV7({
 *   verificationGasLimit: 50000n,
 *   callGasLimit: 100000n,
 *   preVerificationGas: 21000n,
 *   paymasterVerificationGasLimit: 40000n,
 *   paymasterPostOpGasLimit: 20000n,
 *   maxFeePerGas: 1000000000n
 * });
 * ```
 *
 * @remarks
 * The v0.7.0 version differs from v0.6.0 by handling paymaster gas limits separately
 * rather than using a multiplier. This allows for more precise gas estimation and
 * potentially lower prefund requirements.
 */
export function getRequiredPrefundV7(
  userOp: Pick<
    UserOperationV7,
    | "verificationGasLimit"
    | "callGasLimit"
    | "preVerificationGas"
    | "paymasterVerificationGasLimit"
    | "paymasterPostOpGasLimit"
    | "maxFeePerGas"
  >
) {
  const requiredGas =
    userOp.verificationGasLimit +
    userOp.callGasLimit +
    userOp.preVerificationGas +
    (userOp.paymasterVerificationGasLimit || 0n) +
    (userOp.paymasterPostOpGasLimit || 0n)

  return requiredGas * userOp.maxFeePerGas
}
