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

export class OptimismGasEstimator extends EVMGasEstimator {
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
