import { Hex, toRlp } from "viem";
import { EntryPointVersion } from "../../entrypoint/shared/types";
import { EVMGasEstimator } from "../evm/EVMGasEstimator";
import {
  isUserOperationV6,
  UserOperation,
  validateUserOperation,
} from "../UserOperation";
import {
  MANTLE_BVM_GAS_PRICE_ORACLE_ADDRESS,
  MANTLE_L1_ROLL_UP_FEE_DIVISION_FACTOR,
} from "./constants";
import { MANTLE_BVM_GAS_PRICE_ORACLE_ABI } from "./abi";

export class MantleGasEstimator extends EVMGasEstimator {
  override async estimatePreVerificationGas(
    userOperation: UserOperation,
    baseFeePerGas: bigint
  ): Promise<bigint> {
    userOperation = validateUserOperation(userOperation);

    let l2Fee = await super.estimatePreVerificationGas(userOperation);

    const l2MaxFee = BigInt(userOperation.maxFeePerGas);

    const l1Fee = await this.getL1Fee(userOperation);

    return l2Fee + l1Fee / l2MaxFee;
  }

  private async getL1Fee(userOperation: UserOperation): Promise<bigint> {
    let handleOpsData: Hex;

    if (isUserOperationV6(userOperation)) {
      const entryPoint = this.entryPoints[EntryPointVersion.v060].contract;
      handleOpsData = entryPoint.encodeHandleOpsFunctionData(
        userOperation,
        userOperation.sender
      );
    } else {
      const entryPoint = this.entryPoints[EntryPointVersion.v070].contract;
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
