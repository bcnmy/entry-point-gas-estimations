import type { Hex } from "viem"
import z from "zod"

/**
 * Schema defining the execution result format for EntryPoint v0.7.0.
 * Contains gas costs, validation data, and target execution details.
 *
 * @example
 * ```typescript
 * const result = ExecutionResultV7Schema.parse({
 *   preOpGas: 21000n,
 *   paid: 100000n,
 *   accountValidationData: 0n,
 *   paymasterValidationData: 0n,
 *   targetSuccess: true,
 *   targetResult: "0x1234..."
 * });
 * ```
 */
export const ExecutionResultV7Schema = z
  .object({
    /** Gas consumed before the actual user operation execution */
    preOpGas: z.bigint(),
    /** Total amount paid by the user for the operation */
    paid: z.bigint(),
    /** Validation data returned by the account during verification */
    accountValidationData: z.bigint(),
    /** Validation data returned by the paymaster during verification */
    paymasterValidationData: z.bigint(),
    /** Whether the target contract call was successful */
    targetSuccess: z.boolean(),
    /** The return data from the target contract call */
    targetResult: z.string()
  })
  .transform((data) => ({
    ...data,
    targetResult: data.targetResult as Hex
  }))

export type ExecutionResultV7 = z.infer<typeof ExecutionResultV7Schema>

/**
 * Type guard to check if a value is an ExecutionResultV7.
 *
 * @param data - The value to check
 * @returns True if the value matches the ExecutionResultV7 structure
 *
 * @example
 * ```typescript
 * if (isExecutionResultV7(result)) {
 *   console.log(result.preOpGas);
 *   console.log(result.targetSuccess);
 * }
 * ```
 */
export function isExecutionResultV7(data: unknown): data is ExecutionResultV7 {
  return ExecutionResultV7Schema.safeParse(data).success
}
