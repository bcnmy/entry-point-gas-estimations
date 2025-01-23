import type { Hex } from "viem"
import { z } from "zod"

/**
 * Represents the result of a user operation execution from simulateHandleOp.
 * Contains gas costs, validity window, and target execution details.
 *
 * @example
 * ```typescript
 * const result: ExecutionResultV6 = {
 *   preOpGas: 21000n,
 *   paid: 100000n,
 *   validAfter: 1234567890,
 *   validUntil: 1234567999,
 *   targetSuccess: true,
 *   targetResult: "0x1234..."
 * };
 * ```
 */
export const executionResultSchema = z
  .tuple([
    z.bigint(),
    z.bigint(),
    z.number(),
    z.number(),
    z.boolean(),
    z.string()
  ])
  .transform((val) => ({
    /** Gas consumed before the actual user operation execution */
    preOpGas: val[0],
    /** Total amount paid by the user for the operation */
    paid: val[1],
    /** Timestamp after which the operation becomes valid */
    validAfter: val[2],
    /** Timestamp until which the operation remains valid */
    validUntil: val[3],
    /** Whether the target contract call was successful */
    targetSuccess: val[4],
    /** The return data from the target contract call */
    targetResult: val[5] as Hex
  }))

export type ExecutionResultV6 = z.infer<typeof executionResultSchema>

/**
 * Type guard to check if a value is an ExecutionResultV6.
 *
 * @param data - The value to check
 * @returns True if the value matches the ExecutionResultV6 structure
 *
 * @example
 * ```typescript
 * if (isExecutionResultV6(result)) {
 *   console.log(result.validUntil);
 * }
 * ```
 */
export function isExecutionResultV6(data: unknown): data is ExecutionResultV6 {
  return (
    typeof data === "object" &&
    data !== null &&
    "validUntil" in data &&
    "validAfter" in data
  )
}

/**
 * Schema for errors returned by simulateHandleOp that contain a cause with data.
 * Used for parsing error responses from the RPC.
 *
 * @example
 * ```typescript
 * const error = {
 *   cause: {
 *     data: "0x1234..."
 *   }
 * };
 * const result = errorWithCauseSchema.parse(error);
 * ```
 */
export const errorWithCauseSchema = z.object({
  cause: z.object({
    data: z.string()
  })
})

/**
 * Schema for errors returned by simulateHandleOp that contain a nested cause structure.
 * Some chains return errors with a double-nested cause object.
 *
 * @example
 * ```typescript
 * const error = {
 *   cause: {
 *     cause: {
 *       data: "0x1234..."
 *     }
 *   }
 * };
 * const result = errorWithNestedCauseSchema.parse(error);
 * ```
 */
export const errorWithNestedCauseSchema = z.object({
  cause: z.object({
    cause: z.object({
      data: z.string()
    })
  })
})

/**
 * Error thrown when unable to parse the error returned by simulateHandleOp.
 * Contains the original cause of the error for debugging.
 *
 * @example
 * ```typescript
 * try {
 *   // parsing logic
 * } catch (e) {
 *   throw new ParseError(e);
 * }
 * ```
 */
export class ParseError extends Error {
  /**
   * Creates a new ParseError instance
   * @param cause - The original error that caused the parsing failure
   */
  constructor(public readonly cause: any) {
    super("Failed to parse error:", cause)
  }
}

/**
 * Error thrown when simulateHandleOp fails with an actual error (not an ExecutionResult).
 * Contains the error message from the simulation.
 *
 * @example
 * ```typescript
 * throw new SimulateHandleOpError("AA23 reverted");
 * ```
 */
export class SimulateHandleOpError extends Error {
  /**
   * Creates a new SimulateHandleOpError instance
   * @param message - The error message from the simulation
   */
  constructor(public readonly message: string) {
    super(message)
  }
}
