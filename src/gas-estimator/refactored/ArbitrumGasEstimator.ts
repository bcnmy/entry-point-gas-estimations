import { EVMGasEstimator } from "./EVMGasEstimator";
import {
  ARBITRUM_L1_FEE_GAS_PRICE_ORACLE_ABI,
  NODE_INTERFACE_ARBITRUM_ADDRESS,
} from "../entry-point-v6";
import { EntryPointVersion } from "../../entrypoint/shared/types";
import { UserOperation } from "./types";

export class ArbitrumGasEstimator extends EVMGasEstimator {
  override async estimatePreVerificationGas(
    entryPointVersion: EntryPointVersion,
    userOperation: UserOperation,
    baseFeePerGas: bigint
  ): Promise<bigint> {
    if (!baseFeePerGas) {
      throw new Error(`baseFeePerGas not available`);
    }

    let l1PreVerificationGas = await super.estimatePreVerificationGas(
      entryPointVersion,
      userOperation
    );

    const entryPoint = this.entryPoints[entryPointVersion].contract;

    const handleOpsData = entryPoint.encodeHandleOpsFunctionData(
      userOperation,
      userOperation.sender
    );

    const gasEstimateForL1 = await this.rpcClient.readContract({
      address: NODE_INTERFACE_ARBITRUM_ADDRESS,
      abi: ARBITRUM_L1_FEE_GAS_PRICE_ORACLE_ABI,
      functionName: "gasEstimateL1Component" as never,
      args: [entryPoint.address, false, handleOpsData],
    });

    const preVerificationGas =
      l1PreVerificationGas + BigInt((gasEstimateForL1 as any)[0].toString());

    return preVerificationGas;
  }
}
