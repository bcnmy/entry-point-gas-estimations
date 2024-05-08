/* eslint-disable no-await-in-loop */
/* eslint-disable @typescript-eslint/return-await */
import {
  RpcRequestErrorType,
  decodeErrorResult,
  encodeFunctionData,
  toBytes,
  toHex,
  zeroAddress,
} from "viem";
import { z } from "zod";
import {
  Address,
  EstimateCallGasLimitParams,
  EstimateCallGasLimit,
  EstimateUserOperationGasParams,
  EstimateUserOperationGas,
  EstimateVerificationGasLimitParams,
  EstimateVerificationGasLimit,
  ExecutionResult,
  GasEstimatorParams,
  HexData,
  SimulateHandleOpParams,
  SimulateHandleOp,
  executionResultSchema,
  hexDataSchema,
  CalculatePreVerificationGas,
  CalculatePreVerificationGasParams,
  VALIDATION_ERRORS,
  EstimateVerificationGasParams,
  BlockNumberTag,
  StateOverrideSet,
} from "../types";
import {
  CALL_DATA_EXECUTION_AT_MAX_GAS,
  CALL_GAS_ESTIMATION_SIMULATOR_BYTECODE,
  CALL_GAS_LIMIT_OVERRIDE_VALUE,
  CGL_ROUNDING,
  DEFAULT_ENTRY_POINT_ADDRESS,
  INITIAL_CGL_LOWER_BOUND,
  INITIAL_CGL_UPPER_BOUND,
  INITIAL_VGL_LOWER_BOUND,
  INITIAL_VGL_UPPER_BOUND,
  MAX_FEE_PER_GAS_OVERRIDE_VALUE,
  MAX_PRIORITY_FEE_PER_GAS_OVERRIDE_VALUE,
  PRE_VERIFICATION_GAS_OVERRIDE_VALUE,
  VERIFICATION_EXECUTION_AT_MAX_GAS,
  VERIFICATION_GAS_ESTIMATION_SIMUATOR_BYTECODE,
  VERIFICATION_GAS_LIMIT_OVERRIDE_VALUE,
  VGL_ROUNDING,
  defaultGasOverheads,
} from "../constants";
import {
  CALL_GAS_ESTIMATION_SIMULATOR,
  ENTRY_POINT_ABI,
  VERIFICATION_GAS_ESTIMATION_SIMULATOR,
} from "../abis";
import {
  RpcError,
  getCallGasEstimationSimulatorResult,
  getVerificationGasEstimationSimulatorResult,
  handleFailedOp,
  packUserOp,
} from "../utils";
import { IGasEstimator, IRPCClient } from "../interface";

/**
 * @remarks
 * GasEstimator class exposes methods to calculate gas limits for EntryPoint v0.6 compatible userOps
 */
export class GasEstimator implements IGasEstimator {
  /**
   * The publicClient created using viem
   */
  protected publicClient: IRPCClient;

  /**
   * v0.6 entry point address
   * @defaultValue 0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789
   */
  protected entryPointAddress: Address;

  /**
   * the bytecode of the contract that extends the Entry Point contract and
   * implements the binary search logic for call gas estimation
   * @defaultValue is stored in constants.ts
   */
  private callGasEstimationSimulatorByteCode: HexData =
    CALL_GAS_ESTIMATION_SIMULATOR_BYTECODE;

  /**
   * the bytecode of the contract that extends the Entry Point contract and
   * implements the binary search logic for verification gas estimation
   * @defaultValue is stored in constants.ts
   */
  private verificationGasEstimationSimulatorByteCode: HexData =
    VERIFICATION_GAS_ESTIMATION_SIMUATOR_BYTECODE;

  /**
   * Creates a new instance of GasEstimator
   * @param {GasEstimatorParams} params - Configuration options for the gas estimator.
   */
  constructor(params: GasEstimatorParams) {
    this.entryPointAddress = params.entryPointAddress
      ? params.entryPointAddress
      : DEFAULT_ENTRY_POINT_ADDRESS;
    this.publicClient = params.publicClient;
  }

  /**
   * Estimates gas for a user operation.
   *
   * @param {EstimateUserOperationGasArgs} params - Configuration options for gas estimation.
   * @returns {Promise<EstimateUserOperationGas>} A promise that resolves to the estimated gas limits.
   *
   * @throws {Error | RpcError} If there is an issue during gas estimation.
   */
  async estimateUserOperationGas(
    params: EstimateUserOperationGasParams,
  ): Promise<EstimateUserOperationGas> {
    const {
      userOperation,
      supportsEthCallStateOverride = true,
      supportsEthCallByteCodeOverride = true,
      stateOverrideSet,
      baseFeePerGas,
    } = params;

    if (!supportsEthCallStateOverride || !supportsEthCallByteCodeOverride) {
      return await this.estimateUserOperationGasWithoutFullEthCallSupport(
        params,
      );
    }

    const verificationGasLimitPromise = this.estimateVerificationGasLimit({
      userOperation,
      stateOverrideSet,
    });

    const callGasLimitPromise = this.estimateCallGasLimit({
      userOperation,
      stateOverrideSet,
    });

    const preVerificationGasPromise = this.calculatePreVerificationGas({
      userOperation,
      baseFeePerGas,
    });

    const [
      verificationGasLimitResponse,
      callGasLimitResponse,
      preVerficationResponse,
    ] = await Promise.all([
      verificationGasLimitPromise,
      callGasLimitPromise,
      preVerificationGasPromise,
    ]);

    return {
      verificationGasLimit: verificationGasLimitResponse.verificationGasLimit,
      callGasLimit: callGasLimitResponse.callGasLimit,
      preVerificationGas: preVerficationResponse.preVerificationGas,
      validUntil: verificationGasLimitResponse.validUntil,
      validAfter: verificationGasLimitResponse.validAfter,
    };
  }

  /**
   * Estimates gas for a user operation.
   *
   * @param {EstimateVerificationGasLimitParams} params - Configuration options for verificationGasLimit gas estimation.
   * @returns {Promise<EstimateVerificationGasLimit>} A promise that resolves to an object containing the verificationGasLimit
   *
   * @throws {Error | RpcError} If there is an issue during gas estimation.
   */
  async estimateVerificationGasLimit(
    params: EstimateVerificationGasLimitParams,
  ): Promise<EstimateVerificationGasLimit> {
    const {
      userOperation,
      supportsEthCallStateOverride = true,
      supportsEthCallByteCodeOverride = true,
      stateOverrideSet,
    } = params;

    if (!supportsEthCallStateOverride || !supportsEthCallByteCodeOverride) {
      return await this.estimateUserOperationGasWithoutFullEthCallSupport(
        params,
      );
    }

    const error = await this.estimateVerificationGas({
      userOperation,
      stateOverrideSet,
    });

    const result = getVerificationGasEstimationSimulatorResult(error);

    if (result === null) {
      throw new RpcError("Failed to estimate verificationGasLimit");
    }

    const { verificationGasLimit, validAfter, validUntil } = result;

    return {
      verificationGasLimit,
      validAfter,
      validUntil,
    };
  }

  /**
   * Estimates gas for a user operation.
   *
   * @param {EstimateCallGasLimitParams} params - Configuration options for callGasLimit gas estimation.
   * @returns {Promise<EstimateCallGasLimit>} A promise that resolves to the estimated gas limits.
   *
   * @throws {Error | RpcError} If there is an issue during gas estimation.
   */
  async estimateCallGasLimit(
    params: EstimateCallGasLimitParams,
  ): Promise<EstimateCallGasLimit> {
    const {
      userOperation,
      supportsEthCallStateOverride = true,
      supportsEthCallByteCodeOverride = true,
      stateOverrideSet,
    } = params;

    if (!supportsEthCallStateOverride || !supportsEthCallByteCodeOverride) {
      return await this.estimateUserOperationGasWithoutFullEthCallSupport(
        params,
      );
    }

    // Setting callGasLimit to 0 to make sure call data is not executed by the Entry Point code and only
    // done inside the CallGasSimulationExecutor contract
    userOperation.callGasLimit = BigInt(0);

    const targetCallData = encodeFunctionData({
      abi: CALL_GAS_ESTIMATION_SIMULATOR,
      functionName: "estimateCallGas",
      args: [
        {
          sender: userOperation.sender,
          callData: userOperation.callData,
          minGas: INITIAL_CGL_LOWER_BOUND,
          maxGas: INITIAL_CGL_UPPER_BOUND,
          rounding: CGL_ROUNDING,
          isContinuation: CALL_DATA_EXECUTION_AT_MAX_GAS,
        },
      ],
    });

    const error = await this.simulateHandleOp({
      userOperation,
      replacedEntryPoint: true,
      targetAddress: this.entryPointAddress,
      targetCallData,
      stateOverrideSet,
    });

    if (error.result === "failed") {
      throw new RpcError(
        `UserOperation reverted during simulation with reason: ${error.data}`,
        VALIDATION_ERRORS.SIMULATE_VALIDATION_FAILED,
      );
    }

    const result = getCallGasEstimationSimulatorResult(
      error.data as ExecutionResult,
    );

    if (result === null) {
      throw new RpcError("Failed to estimate call gas limit");
    }

    return {
      callGasLimit: result,
    };
  }

  /**
   * Calculates preVerificationGas
   * @param {CalculatePreVerificationGas} params - Configuration options for preVerificationGas
   * @returns {Promise<CalculatePreVerificationGas>} A promise that resolves to an object having the preVerificationGas
   *
   * @throws {Error} If there is an issue during calculating preVerificationGas
   */
  async calculatePreVerificationGas(
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
    return {
      preVerificationGas,
    };
  }

  /**
   * Public method to allow overriding the current entry point address
   * @param {`0x${string}`} entryPointAddress
   */
  public setEntryPointAddress(entryPointAddress: `0x${string}`): void {
    this.entryPointAddress = entryPointAddress;
  }

  /**
   * Makes eth_call to simulateHandleOp
   *
   * @param {SimulateHandleOpArgs} params - Configuration options for simulateHandleOp execution.
   * @returns {Promise<SimulateHandleOp>} A promise that resolves to the result of eth_call to simulateHandleOp
   *
   * @throws {Error} If there is an making eth_call to simulateHandleOp
   */
  private async simulateHandleOp(
    params: SimulateHandleOpParams,
  ): Promise<SimulateHandleOp> {
    const {
      userOperation,
      replacedEntryPoint,
      targetAddress,
      targetCallData,
      supportsEthCallStateOverride = true,
      supportsEthCallByteCodeOverride = true,
      stateOverrideSet,
    } = params;

    let ethCallParmas;
    if (!supportsEthCallStateOverride) {
      ethCallParmas = [
        {
          to: this.entryPointAddress,
          data: encodeFunctionData({
            abi: ENTRY_POINT_ABI,
            functionName: "simulateHandleOp",
            args: [userOperation, targetAddress, targetCallData],
          }),
        },
        BlockNumberTag.LATEST,
      ];
    } else if (!supportsEthCallByteCodeOverride) {
      const ethCallFinalParam = {
        [userOperation.sender]: {
          balance: toHex(100000_000000000000000000n),
        },
        ...stateOverrideSet,
      };

      ethCallParmas = [
        {
          to: this.entryPointAddress,
          data: encodeFunctionData({
            abi: ENTRY_POINT_ABI,
            functionName: "simulateHandleOp",
            args: [userOperation, targetAddress, targetCallData],
          }),
        },
        BlockNumberTag.LATEST,
        // @ts-ignore
        ethCallFinalParam,
      ];
    } else {
      let replaceEntryPointByteCodeStateOverride: StateOverrideSet = {
        [userOperation.sender]: {
          balance: toHex(100000_000000000000000000n),
        },
        [this.entryPointAddress]: {
          code: this.callGasEstimationSimulatorByteCode,
        },
      };

      for (const stateOverrideKey in stateOverrideSet) {
        if (
          stateOverrideKey.toLowerCase() ===
          this.entryPointAddress.toLowerCase()
        ) {
          const { balance, state, stateDiff, nonce } =
            stateOverrideSet[stateOverrideKey];
          replaceEntryPointByteCodeStateOverride[this.entryPointAddress] = {
            code: this.callGasEstimationSimulatorByteCode,
            balance,
            nonce,
            state,
            stateDiff,
          };
        } else {
          replaceEntryPointByteCodeStateOverride[stateOverrideKey] =
            stateOverrideSet[stateOverrideKey];
        }
      }

      const unreplaceEntryPointByteCodeStateOverride = {
        [userOperation.sender]: {
          balance: toHex(100000_000000000000000000n),
        },
        ...stateOverrideSet,
      };

      const ethCallFinalParam = replacedEntryPoint
        ? replaceEntryPointByteCodeStateOverride
        : unreplaceEntryPointByteCodeStateOverride;

      ethCallParmas = [
        {
          to: this.entryPointAddress,
          data: encodeFunctionData({
            abi: ENTRY_POINT_ABI,
            functionName: "simulateHandleOp",
            args: [userOperation, targetAddress, targetCallData],
          }),
        },
        BlockNumberTag.LATEST,
        // @ts-ignore
        ethCallFinalParam,
      ];
    }

    try {
      await this.publicClient.request({
        method: "eth_call",
        // @ts-ignore // ignoring the types error as state overides are not allowed on all networks
        params: ethCallParmas,
      });
    } catch (error) {
      const err = error as RpcRequestErrorType;
      let causeParseResult = z
        .object({
          code: z.literal(3),
          message: z.string().regex(/execution reverted.*/),
          data: hexDataSchema,
        })
        // @ts-ignore
        .safeParse(err.cause);
      if (!causeParseResult.success) {
        // Doing this extra check on causeParseResult as Astar networks return different error
        // @ts-ignore
        causeParseResult = z
          .object({
            code: z.literal(-32603),
            message: z.string().regex(/revert.*/),
            data: hexDataSchema,
          })
          // @ts-ignore
          .safeParse(err.cause.cause);
        if (!causeParseResult.success) {
          // @ts-ignore
          throw new Error(JSON.stringify(err.cause));
        }
      }

      const cause = causeParseResult.data;

      const decodedError = decodeErrorResult({
        abi: ENTRY_POINT_ABI,
        data: cause.data,
      });

      if (decodedError.errorName === "FailedOp") {
        return { result: "failed", data: decodedError.args[1] } as const;
      }

      if (decodedError.errorName === "ExecutionResult") {
        const parsedExecutionResult = executionResultSchema.parse(
          decodedError.args,
        );
        return { result: "execution", data: parsedExecutionResult } as const;
      }
    }

    throw new Error("Unexpected error while calling simulateHandleOp");
  }

  /**
   * Makes eth_call to estimateVerificationGas on the Verification Gas Simulation Executor contract
   * @param {EstimateVerificationGasParams} params - Configuration options for estimateVerificationGas execution.
   * @returns {Promise<EstimateVerificationGas>} A promise that resolves to the result of eth_call to estimateVerificationGas
   *
   * @throws {Error} If there is an making eth_call to estimateVerificationGas
   */
  private async estimateVerificationGas(
    params: EstimateVerificationGasParams,
  ): Promise<`0x${string}`> {
    const { userOperation, stateOverrideSet } = params;

    const ethCallFinalParam: StateOverrideSet = {
      [userOperation.sender]: {
        balance: toHex(100000_000000000000000000n),
      },
      [this.entryPointAddress]: {
        code: this.verificationGasEstimationSimulatorByteCode,
      },
    };

    for (const stateOverrideKey in stateOverrideSet) {
      if (
        stateOverrideKey.toLowerCase() === this.entryPointAddress.toLowerCase()
      ) {
        const { balance, state, stateDiff, nonce } =
          stateOverrideSet[stateOverrideKey];
        ethCallFinalParam[this.entryPointAddress] = {
          code: this.verificationGasEstimationSimulatorByteCode,
          balance,
          nonce,
          state,
          stateDiff,
        };
      } else {
        ethCallFinalParam[stateOverrideKey] =
          stateOverrideSet[stateOverrideKey];
      }
    }

    // first iteration should run at max vgl
    userOperation.verificationGasLimit = INITIAL_VGL_UPPER_BOUND;

    try {
      await this.publicClient.request({
        method: "eth_call",
        params: [
          {
            to: this.entryPointAddress,
            data: encodeFunctionData({
              abi: VERIFICATION_GAS_ESTIMATION_SIMULATOR,
              functionName: "estimateVerificationGas",
              args: [
                {
                  op: userOperation,
                  minGas: INITIAL_VGL_LOWER_BOUND,
                  maxGas: INITIAL_VGL_UPPER_BOUND,
                  rounding: VGL_ROUNDING,
                  isContinuation: VERIFICATION_EXECUTION_AT_MAX_GAS,
                },
              ],
            }),
          },
          BlockNumberTag.LATEST,
          // @ts-ignore
          ethCallFinalParam,
        ],
      });
    } catch (error) {
      console.error("error (log 1): ", error);
      const err = error as RpcRequestErrorType;
      const causeParseResult = z
        .object({
          code: z.literal(3),
          message: z.string().regex(/execution reverted.*/),
          data: hexDataSchema,
        })
        // @ts-ignore
        .safeParse(err.cause);
      console.error("causeParseResult (log 2): ", causeParseResult);
      if (!causeParseResult.success) {
        console.error("!causeParseResult.success (log 3): ", !causeParseResult.success);

        console.error("err.cause (log 4): ", err.cause);
        // @ts-ignore
        throw new Error(JSON.stringify(err.cause));
      }

      const cause = causeParseResult.data;

      return cause.data;
    }

    throw new Error("Unexpected error while calling estimateVerificationGas");
  }

  /**
   * Estimates gas for a user operation for a blockchain whose RPC does not support state overrides or
   * does not give correct response for bytecode state override.
   *
   * @param {EstimateUserOperationGasParams} params - Configuration options for gas estimation.
   * @returns {Promise<EstimateUserOperationGas>} A promise that resolves to the estimated gas limits.
   *
   * @throws {Error} If there is an issue during gas estimation.
   */
  private async estimateUserOperationGasWithoutFullEthCallSupport(
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
    userOperation.preVerificationGas = PRE_VERIFICATION_GAS_OVERRIDE_VALUE;
    userOperation.verificationGasLimit = VERIFICATION_GAS_LIMIT_OVERRIDE_VALUE;
    userOperation.callGasLimit = CALL_GAS_LIMIT_OVERRIDE_VALUE;

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
