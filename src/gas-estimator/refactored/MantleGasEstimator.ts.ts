import { EVMGasEstimator } from "./EVMGasEstimator";
import {
  MANTLE_BVM_GAS_PRICE_ORACLE_ADDRESS,
  MANTLE_L1_ROLL_UP_FEE_DIVISION_FACTOR,
  MANTLE_BVM_GAS_PRICE_ORACLE_ABI,
} from "../entry-point-v6";
import { Hex, toRlp } from "viem";
import { EntryPointVersion } from "../../entrypoint/shared/types";
import {
  isUserOperationV6,
  UserOperationV6,
} from "../../entrypoint/v0.6.0/UserOperationV6";
import { UserOperationV7 } from "../../entrypoint/v0.7.0/UserOperationV7";
import { EntryPointV6 } from "../../entrypoint/v0.6.0/EntryPointV6";
import { EntryPointV7Simulations } from "../../entrypoint/v0.7.0/EntryPointV7Simulations";

export class MantleGasEstimator extends EVMGasEstimator {
  override async estimatePreVerificationGas(
    entryPointVersion: EntryPointVersion,
    userOperation: UserOperationV6 | UserOperationV7,
    baseFeePerGas: bigint
  ): Promise<bigint> {
    let l2Fee = await super.estimatePreVerificationGas(
      entryPointVersion,
      userOperation
    );

    const l2MaxFee = BigInt(userOperation.maxFeePerGas);

    const l1Fee = await this.getL1Fee(userOperation);

    return l2Fee + l1Fee / l2MaxFee;
  }

  private async getL1Fee(
    userOperation: UserOperationV6 | UserOperationV7
  ): Promise<bigint> {
    let entryPoint: EntryPointV6 | EntryPointV7Simulations;
    let handleOpsData: Hex;

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

    const tokenRatioPromise = this.rpcClient.readContract({
      address: MANTLE_BVM_GAS_PRICE_ORACLE_ADDRESS,
      // @ts-ignore
      abi: MANTLE_BVM_GAS_PRICE_ORACLE_ABI,
      functionName: "tokenRatio",
    });

    const scalarPromise = this.rpcClient.readContract({
      address: MANTLE_BVM_GAS_PRICE_ORACLE_ADDRESS,
      // @ts-ignore
      abi: MANTLE_BVM_GAS_PRICE_ORACLE_ABI,
      functionName: "scalar",
    });

    const rollupDataGasAndOverheadPromise = this.rpcClient.readContract({
      address: MANTLE_BVM_GAS_PRICE_ORACLE_ADDRESS,
      // @ts-ignore
      abi: MANTLE_BVM_GAS_PRICE_ORACLE_ABI,
      functionName: "getL1GasUsed",
      args: [toRlp(handleOpsData)],
    });

    const l1GasPricePromise = this.rpcClient.readContract({
      address: MANTLE_BVM_GAS_PRICE_ORACLE_ADDRESS,
      // @ts-ignore
      abi: MANTLE_BVM_GAS_PRICE_ORACLE_ABI,
      functionName: "l1BaseFee",
    });

    const [rollupDataGasAndOverhead, scalar, tokenRatio, l1GasPrice] =
      await Promise.all([
        rollupDataGasAndOverheadPromise,
        scalarPromise,
        tokenRatioPromise,
        l1GasPricePromise,
      ]);

    const l1RollupFee =
      BigInt(rollupDataGasAndOverhead) *
      BigInt(l1GasPrice) *
      BigInt(tokenRatio) *
      BigInt(scalar);

    return l1RollupFee / MANTLE_L1_ROLL_UP_FEE_DIVISION_FACTOR;
  }
}
