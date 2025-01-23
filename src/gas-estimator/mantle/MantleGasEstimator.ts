import { type Hex, toRlp } from "viem"
import { EntryPointVersion } from "../../entrypoint/shared/types"
import {
  type UserOperation,
  isUserOperationV6,
  validateUserOperation
} from "../UserOperation"
import { EVMGasEstimator } from "../evm/EVMGasEstimator"
import { MANTLE_BVM_GAS_PRICE_ORACLE_ABI } from "./abi"
import {
  MANTLE_BVM_GAS_PRICE_ORACLE_ADDRESS,
  MANTLE_L1_ROLL_UP_FEE_DIVISION_FACTOR
} from "./constants"

/**
 * Gas estimator implementation for Mantle networks.
 * Extends {@link EVMGasEstimator} to handle Mantle's specific L1/L2 fee calculations.
 *
 * @example
 * ```typescript
 * const estimator = new MantleGasEstimator(rpcClient, {
 *   [EntryPointVersion.v060]: entryPointV6,
 *   [EntryPointVersion.v070]: entryPointV7
 * });
 *
 * const gas = await estimator.estimatePreVerificationGas(userOperation, 1000000000n);
 * ```
 */
export class MantleGasEstimator extends EVMGasEstimator {
  /**
   * Estimates the pre-verification gas for a user operation on Mantle.
   * Includes both L2 execution gas and L1 data posting costs, adjusted by the L2 max fee.
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
   *   maxFeePerGas: 1000000000n,
   *   // ... other UserOperation fields
   * });
   * ```
   */
  override async estimatePreVerificationGas(
    userOperation: UserOperation,
    baseFeePerGas: bigint
  ): Promise<bigint> {
    userOperation = validateUserOperation(userOperation)

    const l2Fee = await super.estimatePreVerificationGas(userOperation)

    const l2MaxFee = BigInt(userOperation.maxFeePerGas)

    const l1Fee = await this.getL1Fee(userOperation)

    return l2Fee + l1Fee / l2MaxFee
  }

  /**
   * Calculates the L1 data posting fee for a user operation.
   * Uses Mantle's BVM Gas Price Oracle to estimate L1 calldata costs.
   *
   * @param userOperation - The {@link UserOperation} to calculate L1 fee for
   * @returns The L1 fee as a bigint
   * @throws Error if any of the required contract calls fail
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
   * @remarks
   * The L1 fee calculation involves multiple contract calls to get:
   * - Token ratio
   * - Scalar value
   * - L1 gas used
   * - L1 base fee
   * These values are then combined to calculate the final L1 fee.
   *
   * @see {@link MANTLE_BVM_GAS_PRICE_ORACLE_ADDRESS} for the oracle contract address
   * @see {@link MANTLE_L1_ROLL_UP_FEE_DIVISION_FACTOR} for the fee division factor
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

    const tokenRatioPromise = this.rpcClient.readContract({
      address: MANTLE_BVM_GAS_PRICE_ORACLE_ADDRESS,
      // @ts-ignore
      abi: MANTLE_BVM_GAS_PRICE_ORACLE_ABI,
      functionName: "tokenRatio"
    })

    const scalarPromise = this.rpcClient.readContract({
      address: MANTLE_BVM_GAS_PRICE_ORACLE_ADDRESS,
      // @ts-ignore
      abi: MANTLE_BVM_GAS_PRICE_ORACLE_ABI,
      functionName: "scalar"
    })

    const rollupDataGasAndOverheadPromise = this.rpcClient.readContract({
      address: MANTLE_BVM_GAS_PRICE_ORACLE_ADDRESS,
      // @ts-ignore
      abi: MANTLE_BVM_GAS_PRICE_ORACLE_ABI,
      functionName: "getL1GasUsed",
      args: [toRlp(handleOpsData)]
    })

    const l1GasPricePromise = this.rpcClient.readContract({
      address: MANTLE_BVM_GAS_PRICE_ORACLE_ADDRESS,
      // @ts-ignore
      abi: MANTLE_BVM_GAS_PRICE_ORACLE_ABI,
      functionName: "l1BaseFee"
    })

    const [rollupDataGasAndOverhead, scalar, tokenRatio, l1GasPrice] =
      await Promise.all([
        rollupDataGasAndOverheadPromise,
        scalarPromise,
        tokenRatioPromise,
        l1GasPricePromise
      ])

    const l1RollupFee =
      BigInt(rollupDataGasAndOverhead) *
      BigInt(l1GasPrice) *
      BigInt(tokenRatio) *
      BigInt(scalar)

    return l1RollupFee / MANTLE_L1_ROLL_UP_FEE_DIVISION_FACTOR
  }
}
