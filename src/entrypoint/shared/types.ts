import { PublicClient } from "viem";

/**
 * Supported versions of the entry point contract
 */
export enum EntryPointVersion {
  v060 = "v060",
  v070 = "v070",
}

export type EntryPointRpcClient = Pick<
  PublicClient,
  "request" | "chain" | "readContract"
>;
