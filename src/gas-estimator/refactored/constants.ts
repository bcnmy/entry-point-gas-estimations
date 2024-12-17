// Default gas overrides for simulations
export const SIMULATION_PRE_VERIFICATION_GAS = 0n;
export const SIMULATION_VERIFICATION_GAS_LIMIT = 10_000_000n;
export const SIMULATION_CALL_GAS_LIMIT = 10_000_000n;

export const defaultGasOverheads = {
  fixed: 21000,
  perUserOp: 18300,
  perUserOpWord: 4,
  zeroByte: 4,
  nonZeroByte: 16,
  bundleSize: 1,
  sigSize: 65,
};
