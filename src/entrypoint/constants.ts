import { Address } from "viem";
import { EntryPointContracts, EntryPointVersion } from "./types";
import { entryPointAbis } from "./abi";

export const defaultEntryPointAddresses: Record<EntryPointVersion, Address> = {
  [EntryPointVersion.V006]: "0x5ff137d4b0fdcd49dca30c7cf57e578a026d2789",
  [EntryPointVersion.V007]: "0x0000000071727de22e5e9d8baf0edac6f37da032",
};

export const defaultEntryPointContracts: EntryPointContracts = {
  [EntryPointVersion.V006]: {
    version: EntryPointVersion.V006,
    address: defaultEntryPointAddresses[EntryPointVersion.V006],
    abi: entryPointAbis[EntryPointVersion.V006],
  },
  [EntryPointVersion.V007]: {
    version: EntryPointVersion.V007,
    address: defaultEntryPointAddresses[EntryPointVersion.V007],
    abi: entryPointAbis[EntryPointVersion.V007],
  },
};

export const INITIAL_VGL_LOWER_BOUND = 0n;
export const INITIAL_VGL_UPPER_BOUND = 30_000_000n;
export const VGL_ROUNDING = 1n;
export const VERIFICATION_EXECUTION_AT_MAX_GAS = false;

export const VALIDATION_ERRORS = {
  INVALID_USER_OP_FIELDS: -32602,
  SIMULATE_VALIDATION_FAILED: -32500,
  SIMULATE_PAYMASTER_VALIDATION_FAILED: -32501,
  OP_CODE_VALIDATION_FAILED: -32502,
  USER_OP_EXPIRES_SHORTLY: -32503,
  ENTITY_IS_THROTTLED: -32504,
  ENTITY_INSUFFICIENT_STAKE: -32505,
  UNSUPPORTED_AGGREGATOR: -32506,
  INVALID_WALLET_SIGNATURE: -32507,
  WALLET_TRANSACTION_REVERTED: -32000,
  UNAUTHORIZED_REQUEST: -32001,
  INTERNAL_SERVER_ERROR: -32002,
  BAD_REQUEST: -32003,
  USER_OP_HASH_NOT_FOUND: -32004,
  UNABLE_TO_PROCESS_USER_OP: -32005,
  METHOD_NOT_FOUND: -32601,
};

export const INITIAL_CGL_LOWER_BOUND = 0n;
export const INITIAL_CGL_UPPER_BOUND = 30_000_000n;
export const CGL_ROUNDING = 1n;
export const CALL_DATA_EXECUTION_AT_MAX_GAS = false;
