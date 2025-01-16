import z from "zod";
import { EntryPointVersion } from "../entrypoint/shared/types";

export enum ChainStack {
  EVM = "evm",
  Optimism = "optimism",
  Arbitrum = "arbitrum",
  Mantle = "mantle",
}

// TODO: Refactor this schema and move the nested types into separate files with their own schemas
export const SupportedChainSchema = z.object({
  chainId: z.number(),
  name: z.string(),
  isTestnet: z.boolean(),
  stack: z.nativeEnum(ChainStack),
  eip1559: z.boolean(),
  nativeCurrency: z.string().optional(),
  entryPoints: z
    .object({
      [EntryPointVersion.v060]: z
        .object({
          address: z.string(),
        })
        .optional(),
      [EntryPointVersion.v070]: z
        .object({
          address: z.string(),
          state: z
            .object({
              deposits: z.record(
                z.string(),
                z.object({ stateKey: z.string() }),
              ),
            })
            .optional(),
        })
        .optional(),
    })
    .optional(),
  stateOverrideSupport: z.object({
    balance: z.boolean(),
    bytecode: z.boolean(),
    stateDiff: z.boolean(),
  }),
  smartAccountSupport: z.object({
    smartAccountsV2: z.boolean(),
    nexus: z.boolean(),
  }),
  simulation: z
    .object({
      preVerificationGas: z.coerce.bigint(),
      verificationGasLimit: z.coerce.bigint(),
      callGasLimit: z.coerce.bigint(),
    })
    .optional(),
  paymasters: z.object({
    [EntryPointVersion.v060]: z
      .record(
        z.string(),
        z.object({
          dummyPaymasterAndData: z.string(),
          type: z.string(),
        }),
      )
      .optional(),
    [EntryPointVersion.v070]: z
      .record(
        z.string(),
        z.object({
          dummyPaymasterData: z.string(),
          type: z.string(),
        }),
      )
      .optional(),
  }),
});

export type SupportedChain = z.infer<typeof SupportedChainSchema>;
