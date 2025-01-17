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

export class ArbitrumGasEstimator extends EVMGasEstimator {
  override async estimatePreVerificationGas(
    userOperation: UserOperation,
    baseFeePerGas?: bigint
  ): Promise<bigint> {
    userOperation = validateUserOperation(userOperation)

    const l2Fee = await super.estimatePreVerificationGas(userOperation)

    const l1Fee = await this.getL1Fee(userOperation)

    return l2Fee + l1Fee
  }

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
