// Default gas overrides for simulations
export const SIMULATION_PRE_VERIFICATION_GAS = 1_000_000n;
export const SIMULATION_VERIFICATION_GAS_LIMIT = 3_000_000n;
export const SIMULATION_CALL_GAS_LIMIT = 15_000_000n;

export const defaultGasOverheads = {
  fixed: 21000,
  perUserOp: 18300,
  perUserOpWord: 4,
  zeroByte: 4,
  nonZeroByte: 16,
  bundleSize: 1,
  sigSize: 65,
};

//https://github.com/eth-infinitism/account-abstraction/blob/6f02f5a28a20e804d0410b4b5b570dd4b076dcf9/contracts/core/EntryPoint.sol#L39
export const INNER_GAS_OVERHEAD = 10000n;
