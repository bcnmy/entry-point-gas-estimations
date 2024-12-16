export function getRequiredPrefund(userOp: {
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

export function bumpBigIntPercent(big: bigint, percent: number) {
  return big + (big * BigInt(percent)) / BigInt(100);
}
