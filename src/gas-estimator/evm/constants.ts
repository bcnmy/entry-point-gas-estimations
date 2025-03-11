export const defaultGasOverheads = {
  fixed: 21000,
  perUserOp: 18300,
  perUserOpWord: 4,
  zeroByte: 4,
  nonZeroByte: 16,
  bundleSize: 1,
  sigSize: 65
}

export const SCROLL_L1_GAS_PRICE_ORACLE_ADDRESS =
  "0x5300000000000000000000000000000000000002"
export const MORPH_L1_GAS_PRICE_ORACLE_ADDRESS =
  "0x530000000000000000000000000000000000000f"

// Default gas overrides for simulations
export const SIMULATION_PRE_VERIFICATION_GAS = 1_000_000n
export const SIMULATION_VERIFICATION_GAS_LIMIT = 3_000_000n
export const SIMULATION_CALL_GAS_LIMIT = 15_000_000n
