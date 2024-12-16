import { ChainStack } from "../chain/types";
import { EntryPointVersion } from "../entrypoint/v0.6.0/types";
import z from "zod";

export const SupportedChainSchema = z.object({
  chainId: z.number(),
  name: z.string().optional(),
  stack: z.nativeEnum(ChainStack),
  eip1559: z.boolean(),
  entryPoints: z
    .object({
      [EntryPointVersion.V006]: z.object({
        address: z.string().optional(),
        existingSmartAccountAddress: z.string().optional(),
      }),
      [EntryPointVersion.V007]: z
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
