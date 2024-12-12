import { Address } from "viem";

export interface SupportedChain {
  chainId: number;
  supportsBalanceOverride: boolean;
  supportsBytecodeOverride: boolean;
  entryPointV6Address?: Address;
  callGasLimitOverride?: number;
  verificationGasLimitOverride?: number;
  rpcUrl?: string;
  deployedSmartAccountAddress?: Address;
}
