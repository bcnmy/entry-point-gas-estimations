import { Address, Hex } from "viem";
import { EntryPointV6 } from "./EntryPointV6";
import { z } from "zod";

/**
 * Supported versions of the entry point contract
 */
export enum EntryPointVersion {
  V006 = "v0.6.0",
  V007 = "v0.7.0",
}

/**
 * A record of entry point contracts by version
 */
export type EntryPointContracts = Record<EntryPointVersion, EntryPointV6>;

/**
 * An Execution result returned by simulateHandleOp call
 */
export const executionResultSchema = z
  .tuple([
    z.bigint(),
    z.bigint(),
    z.number(),
    z.number(),
    z.boolean(),
    z.string(),
  ])
  .transform((val) => ({
    preOpGas: val[0],
    paid: val[1],
    validAfter: val[2],
    validUntil: val[3],
    targetSuccess: val[4],
    targetResult: val[5] as Hex,
  }));
export type ExecutionResult = z.infer<typeof executionResultSchema>;

/**
 * An error returned by simulateHandleOp call containing a cause
 */
export const errorWithCauseSchema = z.object({
  cause: z.object({
    data: z.string(),
  }),
});

/**
 * An error returned by simulateHandleOp on some chains contains a nested
 * error.cause.cause object for whatever reason 🤷🏻‍♂️
 */
export const errorWithNestedCauseSchema = z.object({
  cause: z.object({
    cause: z.object({
      data: z.string(),
    }),
  }),
});

/**
 * An error that we throw when we're unable to parse the error returned by simulateHandleOp
 */
export class ParseError extends Error {
  constructor(public readonly cause: unknown) {
    super("Failed to parse error");
  }
}

/**
 * An actual error returned by simulateHandleOp that is not the ExecutionResult
 */
export class SimulateHandleOpError extends Error {
  constructor(public readonly message: string) {
    super(message);
  }
}

export type StateOverrideSet = {
  [key: Address]: {
    balance?: Hex;
    nonce?: Hex;
    code?: Hex;
    state?: object;
    stateDiff?: object;
  };
};
