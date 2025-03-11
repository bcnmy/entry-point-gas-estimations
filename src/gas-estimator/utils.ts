import type { EntryPointVersion } from "../entrypoint/shared/types"

export type BenchmarkResults = Record<
  EntryPointVersion,
  Record<
    string,
    {
      smartAccountDeployment: string
      nativeTransfer: string
    }
  >
>
