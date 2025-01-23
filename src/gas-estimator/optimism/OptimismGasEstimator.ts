import type { Hex } from "viem"
import z from "zod"
import { EntryPointVersion } from "../../entrypoint/shared/types"
import {
  type UserOperation,
  isUserOperationV6,
  validateUserOperation
} from "../UserOperation"
import { EVMGasEstimator } from "../evm/EVMGasEstimator"
import { OPTIMISM_L1_GAS_PRICE_ORACLE_ABI } from "./abi"
import { OPTIMISM_L1_GAS_PRICE_ORACLE_ADDRESS } from "./constants"

/**
 * Gas estimator implementation for Optimism networks.
 * Extends {@link EVMGasEstimator} to handle Optimism's specific L1/L2 fee calculations.
 *
 * @example
 * ```typescript
 * const estimator = new OptimismGasEstimator(rpcClient, {
 *   [EntryPointVersion.v060]: entryPointV6,
 *   [EntryPointVersion.v070]: entryPointV7
 * });
 *
 * const gas = await estimator.estimatePreVerificationGas(userOperation, 1000000000n);
 * ```
 */
export class OptimismGasEstimator extends EVMGasEstimator {
  /**
   * Estimates the pre-verification gas for a user operation on Optimism.
   * Includes both L2 execution gas and L1 data posting costs, adjusted by the L2 price.
   *
   * @param userOperation - The {@link UserOperation} to estimate gas for
   * @param baseFeePerGas - The current base fee per gas, required for Optimism calculations
   * @returns The total pre-verification gas estimate as a bigint
   * @throws Error if baseFeePerGas is not provided
   *
   * @example
   * ```typescript
   * const gas = await estimator.estimatePreVerificationGas(
   *   {
   *     sender: "0x123...",
   *     nonce: 1n,
   *     maxFeePerGas: 1000000000n,
   *     maxPriorityFeePerGas: 100000000n,
   *     // ... other UserOperation fields
   *   },
   *   1000000000n // baseFeePerGas
   * );
   * ```
   */
  override async estimatePreVerificationGas(
    userOperation: UserOperation,
    baseFeePerGas: bigint
  ): Promise<bigint> {
    if (!baseFeePerGas) {
      throw new Error(
        "baseFeePerGas is required to estimate Optimism pre-verification gas"
      )
    }
    baseFeePerGas = z.coerce.bigint().parse(baseFeePerGas)
    userOperation = validateUserOperation(userOperation)

    const l2Fee = await super.estimatePreVerificationGas(userOperation)

    const l1Fee = await this.getL1Fee(userOperation)

    const l2MaxFee = userOperation.maxFeePerGas

    const l2PriorityFee = baseFeePerGas + userOperation.maxPriorityFeePerGas

    const l2Price = l2MaxFee < l2PriorityFee ? l2MaxFee : l2PriorityFee

    const pvg = l2Fee + l1Fee / l2Price

    return pvg
  }

  /**
   * Calculates the L1 data posting fee for a user operation.
   * Uses Optimism's Gas Price Oracle to estimate L1 calldata costs.
   *
   * @param userOperation - The {@link UserOperation} to calculate L1 fee for
   * @returns The L1 fee as a bigint
   * @throws Error if the Gas Price Oracle call fails
   *
   * @example
   * ```typescript
   * const l1Fee = await estimator.getL1Fee({
   *   sender: "0x123...",
   *   nonce: 1n,
   *   // ... other UserOperation fields
   * });
   * ```
   *
   * @see {@link OPTIMISM_L1_GAS_PRICE_ORACLE_ADDRESS} for the oracle contract address
   *
   * @internal
   */
  private async getL1Fee(userOperation: UserOperation): Promise<bigint> {
    let handleOpsData: Hex
    if (isUserOperationV6(userOperation)) {
      const entryPoint = this.entryPoints[EntryPointVersion.v060].contract
      handleOpsData = entryPoint.encodeHandleOpsFunctionData(
        userOperation,
        userOperation.sender
      )
    } else {
      const entryPoint = this.entryPoints[EntryPointVersion.v070].contract
      handleOpsData = entryPoint.encodeHandleOpsFunctionData(
        userOperation,
        userOperation.sender
      )
    }

    return this.rpcClient.readContract({
      address: OPTIMISM_L1_GAS_PRICE_ORACLE_ADDRESS,
      abi: OPTIMISM_L1_GAS_PRICE_ORACLE_ABI,
      functionName: "getL1Fee",
      args: [handleOpsData]
    })
  }
}
