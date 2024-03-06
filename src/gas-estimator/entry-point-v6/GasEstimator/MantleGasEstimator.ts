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

    const l1BaseFeePromise = this.publicClient.readContract({
      address: MANTLE_BVM_GAS_PRICE_ORACLE_ADDRESS,
      // @ts-ignore
      abi: MANTLE_BVM_GAS_PRICE_ORACLE_ABI,
      functionName: "l1BaseFee",
      args: [],
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

    const decimalsPromise = this.publicClient.readContract({
      address: MANTLE_BVM_GAS_PRICE_ORACLE_ADDRESS,
      // @ts-ignore
      abi: MANTLE_BVM_GAS_PRICE_ORACLE_ABI,
      functionName: "decimals",
    });

    const [l1BaseFee, overhead, scalar, decimals] = await Promise.all([
      l1BaseFeePromise,
      overheadPromise,
      scalarPromise,
      decimalsPromise
    ]);

    const l1RollupFee =
      ((l1BaseFee as bigint) * (overhead as bigint) * (scalar as bigint)) /
      (BigInt(10 ** Number(decimals)));
      
    const l2MaxFee = BigInt(userOperation.maxFeePerGas);
    const l2Gas = userOperation.paymasterAndData === "0x" ? userOperation.callGasLimit + userOperation.verificationGasLimit : userOperation.callGasLimit + 3n * userOperation.verificationGasLimit;
    const l2TxnFee = (l2Gas * l2MaxFee) / 1000000000n; // converting gwei to ether

    preVerificationGas += l1RollupFee + l2TxnFee;

    return {
      preVerificationGas,
    };
  }
}
