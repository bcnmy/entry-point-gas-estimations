import type { EstimateUserOperationGasOptions } from "../.."
import { EntryPointVersion } from "../../entrypoint"
import { StateOverrideBuilder } from "../../entrypoint/shared"
import type { UserOperationV7 } from "../../entrypoint/v0.7.0"
import type { StateOverrideSet } from "../../shared/types"
import { bumpBigIntPercent } from "../../shared/utils"
import { EVMGasEstimator } from "../evm"

export class SonicGasEstimator extends EVMGasEstimator {
  /**
   * Estimates gas parameters for v0.7.0 user operations.
   *
   * @param userOperation - The {@link UserOperationV7} to estimate for
   * @param stateOverrides - Optional state overrides for simulation
   * @param baseFeePerGas - Current base fee per gas
   * @param options - Additional estimation options
   *
   * @returns Gas estimation results
   * @throws Error if simulation fails
   *
   * @internal
   */
  async estimateUserOperationGasV7(
    userOperation: UserOperationV7,
    stateOverrides: StateOverrideSet | undefined,
    baseFeePerGas: bigint,
    options: EstimateUserOperationGasOptions
  ) {
    const entryPoint = this.entryPoints[EntryPointVersion.v070].contract

    if (
      !options.simulation &&
      userOperation.paymaster &&
      this.chain.stateOverrideSupport.stateDiff
    ) {
      stateOverrides = new StateOverrideBuilder(stateOverrides)
        .overridePaymasterDeposit(entryPoint.address, userOperation.paymaster)
        .build()
    }

    // To avoid problems with variable fees per gas
    const constantGasFeeUserOperation = {
      ...userOperation,
      maxFeePerGas: 1n,
      maxPriorityFeePerGas: 1n
    }

    const [executionResult, preVerificationGas] = await Promise.all([
      entryPoint.simulateHandleOp({
        userOperation: constantGasFeeUserOperation,
        // userOperation,
        targetAddress: options.entryPointAddress,
        targetCallData: "0x",
        stateOverrides
      }),
      // use the actual user operation to estimate the preVerificationGas, because it depends on maxFeePerGas
      this.estimatePreVerificationGas(userOperation, baseFeePerGas)
    ])

    const { verificationGasLimit, callGasLimit } =
      this.estimateVerificationAndCallGasLimits(
        constantGasFeeUserOperation,
        executionResult
      )

    const paymasterVerificationGasLimit = userOperation.paymaster
      ? verificationGasLimit
      : 0n

    const paymasterPostOpGasLimit = userOperation.paymaster
      ? this.chain.paymasters?.v070?.[userOperation.paymaster]
          ?.postOpGasLimit || verificationGasLimit
      : 0n

    return {
      callGasLimit,
      verificationGasLimit: bumpBigIntPercent(verificationGasLimit, 10), // observed verification overhead
      preVerificationGas,
      paymasterVerificationGasLimit,
      paymasterPostOpGasLimit
    }
  }
}
