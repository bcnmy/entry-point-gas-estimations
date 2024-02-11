import { toBytes, encodeFunctionData } from "viem";
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

    const l1FeePromise = this.publicClient.readContract({
      address: MANTLE_BVM_GAS_PRICE_ORACLE_ADDRESS,
      // @ts-ignore
      abi: MANTLE_BVM_GAS_PRICE_ORACLE_ABI,
      functionName: "getL1Fee",
      args: [handleOpsData],
    });

    const overheadPromise = this.publicClient.readContract({
      address: MANTLE_BVM_GAS_PRICE_ORACLE_ADDRESS,
      // @ts-ignore
      abi: MANTLE_BVM_GAS_PRICE_ORACLE_ABI,
      functionName: "overhead",
    });

    const scalarPromise = this.publicClient.readContract({
      address: MANTLE_BVM_GAS_PRICE_ORACLE_ADDRESS,
      // @ts-ignore
      abi: MANTLE_BVM_GAS_PRICE_ORACLE_ABI,
      functionName: "scalar",
    });

    const [l1Fee, overhead, scalar] = await Promise.all([
      l1FeePromise,
      overheadPromise,
      scalarPromise,
    ]);

    const l1RollupFee =
      ((l1Fee as bigint) * (overhead as bigint) * (scalar as bigint)) /
      MANTLE_L1_ROLL_UP_FEE_DIVISION_FACTOR;
    const l2MaxFee = BigInt(userOperation.maxFeePerGas);

    preVerificationGas += l1RollupFee / l2MaxFee;

    return {
      preVerificationGas,
    };
  }
}
