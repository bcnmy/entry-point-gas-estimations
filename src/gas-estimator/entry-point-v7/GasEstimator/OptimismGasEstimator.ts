import { toBytes, encodeFunctionData } from "viem";
import { ENTRY_POINT_ABI, OPTIMISM_L1_GAS_PRICE_ORACLE_ABI } from "../abis";
import {
  defaultGasOverheads,
  OPTIMISM_L1_GAS_PRICE_ORACLE_ADDRESS,
} from "../constants";
import { IGasEstimator } from "../interface";
import {
  CalculatePreVerificationGasParams,
  CalculatePreVerificationGas,
} from "../types";
import { RpcError, packUserOp, toPackedUserOperation } from "../utils";
import { GasEstimator } from "./GasEstimator";

/**
 * @remarks
 * OptimismGasEstimator class that extends GasEstimator and has estimation logic specefic to Optimism
 */
export class OptimismGasEstimator
  extends GasEstimator
  implements IGasEstimator
{
  /**
   * Overrides the calculatePreVerificationGas method from GasEstimator for Optimism Networks.
   *
   * @param {CalculatePreVerificationGasParams} params - Configuration options for preVerificationGas.
   * @returns {Promise<CalculatePreVerificationGas>} A promise that resolves to an object having the preVerificationGas.
   *
   * @throws {Error} If there is an issue during calculating preVerificationGas.
   */
  override async calculatePreVerificationGas(
    params: CalculatePreVerificationGasParams,
  ): Promise<CalculatePreVerificationGas> {
    const { userOperation, baseFeePerGas } = params;
    const packed = toBytes(packUserOp(toPackedUserOperation(userOperation)));
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

    if (!baseFeePerGas) {
      throw new RpcError(`baseFeePerGas not available`);
    }
    const handleOpsData = encodeFunctionData({
      abi: ENTRY_POINT_ABI,
      functionName: "handleOps",
      args: [[toPackedUserOperation(userOperation)], userOperation.sender],
    });

    const l1Fee = (await this.publicClient.readContract({
      address: OPTIMISM_L1_GAS_PRICE_ORACLE_ADDRESS,
      abi: OPTIMISM_L1_GAS_PRICE_ORACLE_ABI,
      functionName: "getL1Fee",
      args: [handleOpsData],
    })) as bigint;
    // extraPvg = l1Cost / l2Price
    const l2MaxFee = BigInt(userOperation.maxFeePerGas);
    const l2PriorityFee =
      baseFeePerGas + BigInt(userOperation.maxPriorityFeePerGas);
    const l2Price = l2MaxFee < l2PriorityFee ? l2MaxFee : l2PriorityFee;
    preVerificationGas += l1Fee / l2Price;
    return {
      preVerificationGas,
    };
  }
}
