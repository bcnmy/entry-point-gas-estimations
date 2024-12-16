import { EVMGasEstimator } from "./EVMGasEstimator";
import {
  MANTLE_BVM_GAS_PRICE_ORACLE_ADDRESS,
  MANTLE_L1_ROLL_UP_FEE_DIVISION_FACTOR,
  MANTLE_BVM_GAS_PRICE_ORACLE_ABI,
} from "../entry-point-v6";
import { toRlp } from "viem";
import { EntryPointVersion } from "../../entrypoint/shared/types";
import { UserOperation } from "./types";

export class MantleGasEstimator extends EVMGasEstimator {
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
      ((rollupDataGasAndOverhead as bigint) *
        (l1GasPrice as bigint) *
        (tokenRatio as bigint) *
        (scalar as bigint)) /
      MANTLE_L1_ROLL_UP_FEE_DIVISION_FACTOR;
    const l2MaxFee = BigInt(userOperation.maxFeePerGas);

    const preVerificationGas = l1PreVerificationGas + l1RollupFee / l2MaxFee;
    return preVerificationGas;
  }
}
