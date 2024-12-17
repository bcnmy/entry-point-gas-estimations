export function getRequiredPrefundV6(userOp: {
  paymasterAndData: string;
  callGasLimit: bigint;
  verificationGasLimit: bigint;
  preVerificationGas: bigint;
  maxFeePerGas: bigint;
}) {
  const multiplier = userOp.paymasterAndData !== "0x" ? 3n : 1n;

  const requiredGas =
    userOp.callGasLimit +
    userOp.verificationGasLimit * multiplier +
    userOp.preVerificationGas;

  return requiredGas * userOp.maxFeePerGas;
}

export function getRequiredPrefundV7(userOp: {
  preVerificationGas: bigint;
  verificationGasLimit: bigint;
  callGasLimit: bigint;
  paymasterVerificationGasLimit: bigint;
  paymasterPostOpGasLimit: bigint;
  maxFeePerGas: bigint;
}) {
  const requiredGas =
    userOp.verificationGasLimit +
    userOp.callGasLimit +
    userOp.preVerificationGas +
    userOp.paymasterVerificationGasLimit +
    userOp.paymasterPostOpGasLimit +
    userOp.preVerificationGas;

  return requiredGas * userOp.maxFeePerGas;
}

export function bumpBigIntPercent(big: bigint, percent: number) {
  return big + (big * BigInt(percent)) / BigInt(100);
}
