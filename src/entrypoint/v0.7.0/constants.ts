import type { Address } from "viem"

export const ENTRYPOINT_V7_ADDRESS: Address =
  "0x0000000071727De22E5E9d8BAf0edAc6f37da032"

export const ENTRYPOINT_V7_PAYMASTER_BALANCE_STATE_DIFF_KEY =
  "0x354335c2702ea6531294c3a1571e6565fa3ef5f6c44a98e1b0c28dacf8c2a9ba"

//https://github.com/eth-infinitism/account-abstraction/blob/6f02f5a28a20e804d0410b4b5b570dd4b076dcf9/contracts/core/EntryPoint.sol#L39
export const INNER_GAS_OVERHEAD = 10000n
