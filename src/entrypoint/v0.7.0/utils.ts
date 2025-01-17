import type { UserOperationV7 } from "./UserOperationV7"

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
