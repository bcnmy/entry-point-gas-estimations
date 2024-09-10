import { zeroAddress } from "viem";
import {
  SEI_CALL_GAS_LIMIT_OVERRIDE_VALUE,
  MAX_FEE_PER_GAS_OVERRIDE_VALUE,
  MAX_PRIORITY_FEE_PER_GAS_OVERRIDE_VALUE,
  SEI_PRE_VERIFICATION_GAS_OVERRIDE_VALUE,
  SEI_VERIFICATION_GAS_LIMIT_OVERRIDE_VALUE,
} from "../constants";
import { IGasEstimator } from "../interface";
import {
  EstimateUserOperationGas,
  EstimateUserOperationGasParams,
} from "../types";
import { handleFailedOp } from "../utils";
import { GasEstimator } from "./GasEstimator";

/**
 * @remarks
 * SeiGasEstimator class that extends GasEstimator and has estimation logic specefic to Morph
 */
export class SeiGasEstimator extends GasEstimator implements IGasEstimator {
  /**
   * Estimates gas for a user operation for a blockchain whose RPC does not support state overrides or
   * does not give correct response for bytecode state override.
   *
   * @param {EstimateUserOperationGasParams} params - Configuration options for gas estimation.
   * @returns {Promise<EstimateUserOperationGas>} A promise that resolves to the estimated gas limits.
   *
   * @throws {Error} If there is an issue during gas estimation.
   */
  async estimateUserOperationGasWithoutFullEthCallSupport(
    params: EstimateUserOperationGasParams,
  ): Promise<EstimateUserOperationGas> {
    const {
      userOperation,
      supportsEthCallByteCodeOverride,
      supportsEthCallStateOverride,
      baseFeePerGas,
    } = params;

    userOperation.maxFeePerGas = MAX_FEE_PER_GAS_OVERRIDE_VALUE;
    userOperation.maxPriorityFeePerGas =
      MAX_PRIORITY_FEE_PER_GAS_OVERRIDE_VALUE;
    userOperation.preVerificationGas = SEI_PRE_VERIFICATION_GAS_OVERRIDE_VALUE;
    userOperation.verificationGasLimit =
      SEI_VERIFICATION_GAS_LIMIT_OVERRIDE_VALUE;
    userOperation.callGasLimit = SEI_CALL_GAS_LIMIT_OVERRIDE_VALUE;

    const simulateHandleOpResponse = await this.simulateHandleOp({
      userOperation,
      replacedEntryPoint: false,
      targetAddress: zeroAddress,
      targetCallData: "0x",
      supportsEthCallStateOverride,
      supportsEthCallByteCodeOverride,
    });

    if (
      simulateHandleOpResponse.result === "failed" ||
      typeof simulateHandleOpResponse.data === "string"
    ) {
      handleFailedOp(simulateHandleOpResponse.data as `0x${string}`);
    }

    const { preVerificationGas } = await this.calculatePreVerificationGas({
      userOperation,
      baseFeePerGas,
    });

    // @ts-ignore
    const { preOpGas, paid, validAfter, validUntil } =
      simulateHandleOpResponse.data;

    const verificationGasLimit = preOpGas - userOperation.preVerificationGas;
    const callGasLimit = paid / userOperation.maxFeePerGas - preOpGas;

    return {
      callGasLimit,
      verificationGasLimit,
      preVerificationGas,
      validUntil,
      validAfter,
    };
  }
}
