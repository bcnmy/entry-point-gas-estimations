import { toBytes, encodeFunctionData, toRlp } from "viem";
import { ENTRY_POINT_ABI, MANTLE_BVM_GAS_PRICE_ORACLE_ABI } from "../abis";
import {
  defaultGasOverheads,
  MANTLE_BVM_GAS_PRICE_ORACLE_ADDRESS,
  MANTLE_L1_ROLL_UP_FEE_DIVISION_FACTOR,
} from "../constants";
import { IGasEstimator } from "../interface";
import {
  CalculatePreVerificationGasParams,
  CalculatePreVerificationGas,
} from "../types";
import { packUserOp } from "../utils";
import { GasEstimator } from "./GasEstimator";

/**
 * @remarks
 * MantleGasEstimator class that extends GasEstimator and has estimation logic specefic to Optimism
 */
export class MantleGasEstimator extends GasEstimator implements IGasEstimator {
  /**
   * Overrides the calculatePreVerificationGas method from GasEstimator for Mantle Networks.
   *
   * @param {CalculatePreVerificationGasParams} params - Configuration options for preVerificationGas.
   * @returns {Promise<CalculatePreVerificationGas>} A promise that resolves to an object having the preVerificationGas.
   *
   * @throws {Error} If there is an issue during calculating preVerificationGas.
   */
  override async calculatePreVerificationGas(
    params: CalculatePreVerificationGasParams,
  ): Promise<CalculatePreVerificationGas> {
    const { userOperation } = params;
    const packed = toBytes(packUserOp(userOperation, false));
    const callDataCost = packed
      .map((x: number) =>
        x === 0
          ? defaultGasOverheads.zeroByte
          : defaultGasOverheads.nonZeroByte,
      )
      .reduce((sum: any, x: any) => sum + x);
    let preVerificationGas = BigInt(
      Math.round(
        callDataCost +
          defaultGasOverheads.fixed / defaultGasOverheads.bundleSize +
          defaultGasOverheads.perUserOp +
          defaultGasOverheads.perUserOpWord * packed.length,
      ),
    );

    const handleOpsData = encodeFunctionData({
      abi: ENTRY_POINT_ABI,
      functionName: "handleOps",
      args: [[userOperation], userOperation.sender],
    });

    const tokenRatioPromise = this.publicClient.readContract({
      address: MANTLE_BVM_GAS_PRICE_ORACLE_ADDRESS,
      // @ts-ignore
      abi: MANTLE_BVM_GAS_PRICE_ORACLE_ABI,
      functionName: "tokenRatio",
    });

    const scalarPromise = this.publicClient.readContract({
      address: MANTLE_BVM_GAS_PRICE_ORACLE_ADDRESS,
      // @ts-ignore
      abi: MANTLE_BVM_GAS_PRICE_ORACLE_ABI,
      functionName: "scalar",
    });

    const rollupDataGasAndOverheadPromise = this.publicClient.readContract({
      address: MANTLE_BVM_GAS_PRICE_ORACLE_ADDRESS,
      // @ts-ignore
      abi: MANTLE_BVM_GAS_PRICE_ORACLE_ABI,
      functionName: "getL1GasUsed",
      args: [toRlp(handleOpsData)],
    });

    const l1GasPricePromise = this.publicClient.readContract({
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

    preVerificationGas += l1RollupFee / l2MaxFee;

    return {
      preVerificationGas,
    };
  }
}
