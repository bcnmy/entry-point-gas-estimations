import type { Hex } from "viem"
import z from "zod"
import { EntryPointVersion } from "../../entrypoint/shared/types"
import {
  type UserOperation,
  isUserOperationV6,
  validateUserOperation
} from "../UserOperation"
import { EVMGasEstimator } from "../evm/EVMGasEstimator"
import type { IEntryPointV6, IEntryPointV7Simulations } from "../types"
import { ARBITRUM_L1_FEE_GAS_PRICE_ORACLE_ABI } from "./abi"
import { NODE_INTERFACE_ARBITRUM_ADDRESS } from "./constants"

/**
 * Gas estimator implementation for Arbitrum networks.
 * Extends {@link EVMGasEstimator} to handle Arbitrum's specific L1/L2 fee calculations.
 *
 * @example
 * ```typescript
 * const estimator = new ArbitrumGasEstimator(rpcClient, {
 *   [EntryPointVersion.v060]: entryPointV6,
 *   [EntryPointVersion.v070]: entryPointV7
 * });
 *
 * const gas = await estimator.estimatePreVerificationGas(userOperation);
 * ```
 */
export class ArbitrumGasEstimator extends EVMGasEstimator {
  /**
   * Estimates the pre-verification gas for a user operation on Arbitrum.
   * Includes both L2 execution gas and L1 data posting costs.
   *
   * @param userOperation - The {@link UserOperation} to estimate gas for
   * @param baseFeePerGas - Optional base fee per gas to use for estimation
   * @returns The total pre-verification gas estimate as a bigint
   * @throws Error if the L1 fee estimation fails
   *
   * @example
   * ```typescript
   * const gas = await estimator.estimatePreVerificationGas({
   *   sender: "0x123...",
   *   nonce: 1n,
   *   // ... other UserOperation fields
   * });
   * ```
   */
  override async estimatePreVerificationGas(
    userOperation: UserOperation,
    baseFeePerGas?: bigint
  ): Promise<bigint> {
    userOperation = validateUserOperation(userOperation)

    const l2Fee = await super.estimatePreVerificationGas(userOperation)

    const l1Fee = await this.getL1Fee(userOperation)

    return l2Fee + l1Fee
  }

  /**
   * Calculates the L1 data posting fee for a user operation.
   * Uses Arbitrum's gasEstimateL1Component method to estimate L1 calldata costs.
   *
   * @param userOperation - The {@link UserOperation} to calculate L1 fee for
   * @returns The L1 fee as a bigint
   * @throws Error if the gasEstimateL1Component call fails or returns invalid data
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
   * @internal
   */
  private async getL1Fee(userOperation: UserOperation): Promise<bigint> {
    let handleOpsData: Hex
    let entryPoint: IEntryPointV6 | IEntryPointV7Simulations
    if (isUserOperationV6(userOperation)) {
      entryPoint = this.entryPoints[EntryPointVersion.v060].contract
      handleOpsData = entryPoint.encodeHandleOpsFunctionData(
        userOperation,
        userOperation.sender
      )
    } else {
      entryPoint = this.entryPoints[EntryPointVersion.v070].contract
      handleOpsData = entryPoint.encodeHandleOpsFunctionData(
        userOperation,
        userOperation.sender
      )
    }

    const gasEstimateL1ComponentResult: unknown =
      await this.rpcClient.readContract({
        address: NODE_INTERFACE_ARBITRUM_ADDRESS,
        abi: ARBITRUM_L1_FEE_GAS_PRICE_ORACLE_ABI,
        functionName: "gasEstimateL1Component",
        args: [entryPoint.address, false, handleOpsData]
      })

    if (
      gasEstimateL1ComponentResult != null &&
      Array.isArray(gasEstimateL1ComponentResult) &&
      gasEstimateL1ComponentResult.length > 0
    ) {
      return z.coerce.bigint().parse(gasEstimateL1ComponentResult[0])
    }

    throw new Error("gasEstimateL1Component result is not valid")
  }
}
