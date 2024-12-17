import z from "zod";
import { EntryPointVersion } from "../entrypoint/shared/types";
import { ChainStack } from "./types";

export const SupportedChainSchema = z.object({
  chainId: z.number(),
  name: z.string(),
  stack: z.nativeEnum(ChainStack),
  eip1559: z.boolean(),
  nativeCurrency: z.string().optional(),
  entryPoints: z
    .object({
      [EntryPointVersion.v060]: z.object({
        address: z.string().optional(),
        existingSmartAccountAddress: z.string().optional(),
      }),
      [EntryPointVersion.v070]: z
        .object({
          address: z.string(),
          existingSmartAccountAddress: z.string().optional(),
        })
        .optional(),
    })
    .optional(),
  stateOverrideSupport: z.object({
    balance: z.boolean(),
    bytecode: z.boolean(),
  }),
  smartAccountSupport: z.object({
    smartAccountsV2: z.boolean(),
    nexus: z.boolean(),
  }),
  simulation: z
    .object({
      preVerificationGas: z.number(),
      verificationGasLimit: z.number(),
      callGasLimit: z.number(),
    })
    .optional(),
  rpcUrl: z.string().optional(),
});

export type SupportedChain = z.infer<typeof SupportedChainSchema>;
