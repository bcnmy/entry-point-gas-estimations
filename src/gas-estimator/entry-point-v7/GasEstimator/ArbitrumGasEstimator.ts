import { toBytes, encodeFunctionData } from "viem";
import { ENTRY_POINT_ABI, ARBITRUM_L1_FEE_GAS_PRICE_ORACLE_ABI } from "../abis";
import {
  defaultGasOverheads,
  NODE_INTERFACE_ARBITRUM_ADDRESS,
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
 * ArbitrumGasEstimator class that extends GasEstimator and has estimation logic specefic to Arbitrum
 */
export class ArbitrumGasEstimator
  extends GasEstimator
  implements IGasEstimator
{
  /**
   * Overrides the calculatePreVerificationGas method from GasEstimator for Arbitrum Networks.
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
    const gasEstimateForL1 = await this.publicClient.readContract({
      address: NODE_INTERFACE_ARBITRUM_ADDRESS,
      abi: ARBITRUM_L1_FEE_GAS_PRICE_ORACLE_ABI,
      functionName: "gasEstimateL1Component" as never,
      args: [this.entryPointAddress, false, handleOpsData],
    });
    preVerificationGas += BigInt((gasEstimateForL1 as any)[0].toString());
    return {
      preVerificationGas,
    };
  }
}
