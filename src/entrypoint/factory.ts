import { Address } from "viem";
import { EntryPointVersion } from "./types";
import { defaultEntryPointAddresses } from "./constants";
import { EntryPointV6, RpcClient } from "./EntryPointV6";

/**
 * Creates an EntryPointContract object with the specified version and optional address.
 *
 * @param version - The version of the EntryPoint.
 * @param address - (Optional) The address of the EntryPoint. If not provided, the default address for the specified version will be used.
 * @returns An EntryPointContract object containing the version, address, and ABI.
 */
export function createEntryPointContract({
  entryPointVersion,
  rpcClient,
  entryPointAddress,
}: CreateEntryPointContractParams): EntryPointV6 {
  return new EntryPointV6(
    rpcClient,
    entryPointAddress || defaultEntryPointAddresses[entryPointVersion]
  );
}

export type CreateEntryPointContractParams = {
  entryPointVersion: EntryPointVersion;
  rpcClient: RpcClient;
  entryPointAddress?: Address;
};
