import { EVMGasEstimator } from "./EVMGasEstimator";
import {
  ARBITRUM_L1_FEE_GAS_PRICE_ORACLE_ABI,
  NODE_INTERFACE_ARBITRUM_ADDRESS,
} from "../entry-point-v6";
import { EntryPointVersion } from "../../entrypoint/shared/types";
import {
  isUserOperationV6,
  UserOperationV6,
} from "../../entrypoint/v0.6.0/UserOperationV6";
import { UserOperationV7 } from "../../entrypoint/v0.7.0/UserOperationV7";
import { Hex } from "viem";
import { EntryPointV6 } from "../../entrypoint/v0.6.0/EntryPointV6";
import { EntryPointV7Simulations } from "../../entrypoint/v0.7.0/EntryPointV7Simulations";

export class ArbitrumGasEstimator extends EVMGasEstimator {
  override async estimatePreVerificationGas(
    entryPointVersion: EntryPointVersion,
    userOperation: UserOperationV6 | UserOperationV7,
    baseFeePerGas?: bigint
  ): Promise<bigint> {
    let l2Fee = await super.estimatePreVerificationGas(
      entryPointVersion,
      userOperation
    );

    const l1Fee = await this.getL1Fee(userOperation);

    return l2Fee + l1Fee;
  }

  private async getL1Fee(
    userOperation: UserOperationV6 | UserOperationV7
  ): Promise<bigint> {
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

    const [l1Fee] = await this.rpcClient.readContract({
      address: NODE_INTERFACE_ARBITRUM_ADDRESS,
      abi: ARBITRUM_L1_FEE_GAS_PRICE_ORACLE_ABI,
      functionName: "gasEstimateL1Component" as never,
      args: [entryPoint.address, false, handleOpsData],
    });

    return BigInt(l1Fee);
  }
}
