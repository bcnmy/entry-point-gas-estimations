import { EVMGasEstimator } from "./EVMGasEstimator";
import { EntryPointVersion } from "../entrypoint/shared/types";
import { Hex } from "viem";
import { EntryPointV6 } from "../entrypoint/v0.6.0/EntryPointV6";
import { EntryPointV7Simulations } from "../entrypoint/v0.7.0/EntryPointV7Simulations";
import {
  isUserOperationV6,
  UserOperation,
  validateUserOperation,
} from "./UserOperation";
import z from "zod";
import { NODE_INTERFACE_ARBITRUM_ADDRESS } from "./constants";
import { ARBITRUM_L1_FEE_GAS_PRICE_ORACLE_ABI } from "./abi";

export class ArbitrumGasEstimator extends EVMGasEstimator {
  override async estimatePreVerificationGas(
    userOperation: UserOperation,
    baseFeePerGas?: bigint
  ): Promise<bigint> {
    userOperation = validateUserOperation(userOperation);

    const l2Fee = await super.estimatePreVerificationGas(userOperation);

    const l1Fee = await this.getL1Fee(userOperation);

    return l2Fee + l1Fee;
  }

  private async getL1Fee(userOperation: UserOperation): Promise<bigint> {
    let handleOpsData: Hex;
    let entryPoint: EntryPointV6 | EntryPointV7Simulations;
    if (isUserOperationV6(userOperation)) {
      entryPoint = this.entryPoints[EntryPointVersion.v060].contract;
      handleOpsData = entryPoint.encodeHandleOpsFunctionData(
        userOperation,
        userOperation.sender
      );
    } else {
      entryPoint = this.entryPoints[EntryPointVersion.v070].contract;
      handleOpsData = entryPoint.encodeHandleOpsFunctionData(
        userOperation,
        userOperation.sender
      );
    }

    const gasEstimateL1ComponentResult: unknown =
      await this.rpcClient.readContract({
        address: NODE_INTERFACE_ARBITRUM_ADDRESS,
        abi: ARBITRUM_L1_FEE_GAS_PRICE_ORACLE_ABI,
        functionName: "gasEstimateL1Component",
        args: [entryPoint.address, false, handleOpsData],
      });

    if (
      gasEstimateL1ComponentResult != null &&
      Array.isArray(gasEstimateL1ComponentResult) &&
      gasEstimateL1ComponentResult.length > 0
    ) {
      return z.coerce.bigint().parse(gasEstimateL1ComponentResult[0]);
    }

    throw new Error("gasEstimateL1Component result is not valid");
  }
}
