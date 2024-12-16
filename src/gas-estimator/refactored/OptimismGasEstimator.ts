import { EVMGasEstimator } from "./EVMGasEstimator";
import {
  OPTIMISM_L1_GAS_PRICE_ORACLE_ABI,
  OPTIMISM_L1_GAS_PRICE_ORACLE_ADDRESS,
} from "../entry-point-v6";
import { UserOperation } from "./types";
import { EntryPointVersion } from "../../entrypoint/shared/types";

export class OptimismGasEstimator extends EVMGasEstimator {
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

    const l1Fee = (await this.rpcClient.readContract({
      address: OPTIMISM_L1_GAS_PRICE_ORACLE_ADDRESS,
      abi: OPTIMISM_L1_GAS_PRICE_ORACLE_ABI,
      functionName: "getL1Fee",
      args: [handleOpsData],
    })) as bigint;

    const l2MaxFee = userOperation.maxFeePerGas;
    const l2PriorityFee = baseFeePerGas + userOperation.maxPriorityFeePerGas;

    const l2Price = l2MaxFee < l2PriorityFee ? l2MaxFee : l2PriorityFee;

    const optimismPreVerificationGas = l1PreVerificationGas + l1Fee / l2Price;

    return optimismPreVerificationGas;
  }
}
