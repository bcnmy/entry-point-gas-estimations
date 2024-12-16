import { Hex } from "viem";
import z from "zod";

export const ExecutionResultV7Schema = z
  .object({
    preOpGas: z.bigint(),
    paid: z.bigint(),
    accountValidationData: z.bigint(),
    paymasterValidationData: z.bigint(),
    targetSuccess: z.boolean(),
    targetResult: z.string(),
  })
  .transform((data) => ({
    ...data,
    targetResult: data.targetResult as Hex,
  }));

export type ExecutionResultV7 = z.infer<typeof ExecutionResultV7Schema>;

export function isExecutionResultV7(data: unknown): data is ExecutionResultV7 {
  return ExecutionResultV7Schema.safeParse(data).success;
}
