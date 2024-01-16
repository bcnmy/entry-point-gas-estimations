/* eslint-disable no-await-in-loop */
/* eslint-disable @typescript-eslint/return-await */
import {
  PublicClient,
  RpcRequestErrorType,
  createPublicClient,
  decodeErrorResult,
  encodeFunctionData,
  http,
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
  ValidationErrors,
  executionResultSchema,
  hexDataSchema,
  CalculatePreVerificationGas,
  CalculatePreVerificationGasParams,
} from "./types";
import {
  ArbitrumNetworks,
  CALL_GAS_ESTIMATION_SIMULATOR_BYTE_CODE,
  DEFAULT_ENTRY_POINT_ADDRESS,
  NODE_INTERFACE_ARBITRUM_ADDRESS,
  OPTIMISM_L1_GAS_PRICE_ORACLE_ADDRESS,
  OptimismNetworks,
  defaultGasOverheads,
} from "./constants";
import {
  ARBITRUM_L1_FEE_GAS_PRICE_ORACLE_ABI,
  CALL_GAS_ESTIMATION_SIMULATOR,
  ENTRY_POINT_ABI,
  OPTIMISM_L1_GAS_PRICE_ORACLE_ABI,
} from "./abi";
import {
  RpcError,
  getCallGasEstimationSimulatorResult,
  getSimulationResult,
  packUserOp,
  tooLow,
} from "./utils";

/**
 * @remarks
 * GasEstimator class exposes methods to calculate gas limits for EntryPoint v0.6 compatible userOps
 */
export class GasEstimator {
  /**
   * The publicClient created using viem
   */
  private publicClient: PublicClient;

  /**
   * The URL of the RPC (Remote Procedure Call) endpoint.
   */
  private rpcUrl: string;

  /**
   * v0.6 entry point address
   * @defaultValue 0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789
   */
  private entryPointAddress: Address;

  /**
   * the bytecode of the contract that extends the Entry Point contract and
   * implements the binary search logic
   * @defaultValue is stored in constants.ts
   */
  private callGasEstimationSimulatorByteCode: HexData =
    CALL_GAS_ESTIMATION_SIMULATOR_BYTE_CODE;

  /**
   * Creates a new instance of GasEstimator
   * @param {GasEstimatorParams} params - Configuration options for the gas estimator.
   */
  constructor(params: GasEstimatorParams) {
    this.rpcUrl = params.rpcUrl;
    this.entryPointAddress = params.entryPointAddress
      ? params.entryPointAddress
      : DEFAULT_ENTRY_POINT_ADDRESS;
    this.publicClient = createPublicClient({
      transport: http(this.rpcUrl),
    });
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
      initialVglLowerBound,
      initialVglUpperBound,
      vglCutOff,
      vglUpperBoundMultiplier,
      initalCglLowerBound,
      initialCglUpperBound,
      cglRounding,
      callDataExecutionAtMaxGas,
      stateOverrideSet,
    } = params;

    if (!supportsEthCallStateOverride) {
      return await this.esitmateUserOperationGasWithNoEthCallStateOverrideSupport(
        params,
      );
    }

    const verificationGasLimitPromise = this.estimateVerificationGasLimit({
      userOperation,
      initialVglLowerBound,
      initialVglUpperBound,
      vglCutOff,
      vglUpperBoundMultiplier,
      stateOverrideSet,
    });

    const callGasLimitPromise = this.estimateCallGasLimit({
      userOperation,
      initalCglLowerBound,
      initialCglUpperBound,
      cglRounding,
      callDataExecutionAtMaxGas,
      stateOverrideSet,
    });

    const preVerificationGasPromise = this.calculatePreVerificationGas({
      userOperation,
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
      supportsEthCallStateOverride,
      initialVglLowerBound,
      initialVglUpperBound,
      vglCutOff,
      vglUpperBoundMultiplier,
      stateOverrideSet,
    } = params;

    if (!supportsEthCallStateOverride) {
      const estimationResponse =
        await this.esitmateUserOperationGasWithNoEthCallStateOverrideSupport(
          params,
        );
      return {
        verificationGasLimit: estimationResponse.verificationGasLimit,
      };
    }

    // Doing this as when calling both estimateVerificationGasLimit and estimateCallGasLimit somehow overrides each others userOperation
    const inMemoryUserOperation = userOperation;

    inMemoryUserOperation.callGasLimit = 0n;

    let lower = initialVglLowerBound || 0n;
    let upper = initialVglUpperBound || 10_000_000n;
    let final: bigint | null = null;

    const cutoff = vglCutOff || 20_000n;

    inMemoryUserOperation.verificationGasLimit = upper;
    inMemoryUserOperation.callGasLimit = 0n;

    const initial = await this.simulateHandleOp({
      userOperation: inMemoryUserOperation,
      replacedEntryPoint: false,
      targetAddress: zeroAddress,
      targetCallData: "0x",
      stateOverrideSet,
    });

    if (initial.result === "execution" && typeof initial.data !== "string") {
      upper =
        (vglUpperBoundMultiplier || 6n) *
        (initial.data.preOpGas - inMemoryUserOperation.preVerificationGas);
    } else {
      throw new RpcError(
        `UserOperation reverted during simulation with reason: ${initial.data}`,
        ValidationErrors.SimulateValidation,
      );
    }

    // binary search
    while (upper - lower > cutoff) {
      const mid = (upper + lower) / 2n;

      inMemoryUserOperation.verificationGasLimit = mid;
      inMemoryUserOperation.callGasLimit = 0n;

      const error = await this.simulateHandleOp({
        userOperation: inMemoryUserOperation,
        replacedEntryPoint: false,
        targetAddress: zeroAddress,
        targetCallData: "0x",
      });

      if (error.result === "execution") {
        upper = mid;
        final = mid;
      } else if (typeof error.data === "string" && tooLow(error.data)) {
        lower = mid;
      } else {
        throw new Error("Unexpected error in estimating verificationGasLimit");
      }
    }

    if (final === null) {
      throw new RpcError("Failed to estimate verificationGasLimit");
    }

    return {
      verificationGasLimit: final,
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
      supportsEthCallStateOverride,
      initalCglLowerBound,
      initialCglUpperBound,
      cglRounding,
      callDataExecutionAtMaxGas,
      stateOverrideSet,
    } = params;

    if (!supportsEthCallStateOverride) {
      const estimationResponse =
        await this.esitmateUserOperationGasWithNoEthCallStateOverrideSupport(
          params,
        );
      return {
        callGasLimit: estimationResponse.callGasLimit,
      };
    }

    // Doing this as when calling both estimateVerificationGasLimit and estimateCallGasLimit somehow overrides each others userOperation
    const inMemoryUserOperation = userOperation;

    inMemoryUserOperation.callGasLimit = 0n;
    inMemoryUserOperation.verificationGasLimit = 10_000_000n;

    const targetCallData = encodeFunctionData({
      abi: CALL_GAS_ESTIMATION_SIMULATOR,
      functionName: "estimateCallGas",
      args: [
        {
          sender: inMemoryUserOperation.sender,
          callData: inMemoryUserOperation.callData,
          minGas: initalCglLowerBound || 0n,
          maxGas: initialCglUpperBound || 30_000_000n,
          rounding: cglRounding || 1n,
          isContinuation: callDataExecutionAtMaxGas || false,
        },
      ],
    });

    const error = await this.simulateHandleOp({
      userOperation: inMemoryUserOperation,
      replacedEntryPoint: true,
      targetAddress: this.entryPointAddress,
      targetCallData,
      stateOverrideSet,
    });

    if (error.result === "failed") {
      throw new RpcError(
        `UserOperation reverted during simulation with reason: ${error.data}`,
        ValidationErrors.SimulateValidation,
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
      stateOverrideSet,
    } = params;

    const ethCallFinalParam = replacedEntryPoint
      ? {
          [userOperation.sender]: {
            balance: toHex(100000_000000000000000000n),
          },
          [this.entryPointAddress]: {
            code: this.callGasEstimationSimulatorByteCode,
          },
          ...stateOverrideSet,
        }
      : {
          [userOperation.sender]: {
            balance: toHex(100000_000000000000000000n),
          },
          ...stateOverrideSet,
        };

    try {
      await this.publicClient.request({
        method: "eth_call",
        params: [
          {
            to: this.entryPointAddress,
            data: encodeFunctionData({
              abi: ENTRY_POINT_ABI,
              functionName: "simulateHandleOp",
              args: [userOperation, targetAddress, targetCallData],
            }),
          },
          "latest",
          // @ts-ignore
          ethCallFinalParam,
        ],
      });
    } catch (error) {
      const err = error as RpcRequestErrorType;
      const causeParseResult = z
        .object({
          code: z.literal(3),
          message: z.string().regex(/execution reverted.*/),
          data: hexDataSchema,
        })
        // @ts-ignore
        .safeParse(err.cause);
      if (!causeParseResult.success) {
        // @ts-ignore
        throw new Error(JSON.stringify(err.cause));
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
   * Calculates preVerificationGas
   * @param {CalculatePreVerificationGas} params - Configuration options for preVerificationGas
   * @returns {Promise<CalculatePreVerificationGas>} A promise that resolves to an object having the preVerificationGas
   *
   * @throws {Error} If there is an issue during calculating preVerificationGas
   */
  async calculatePreVerificationGas(
    params: CalculatePreVerificationGasParams,
  ): Promise<CalculatePreVerificationGas> {
    const { userOperation, baseFeePerGas } = params;
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

    if (ArbitrumNetworks.includes(this.publicClient.chain?.id as number)) {
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
    } else if (
      OptimismNetworks.includes(this.publicClient.chain?.id as number)
    ) {
      if (!baseFeePerGas) {
        throw new RpcError(`baseFeePerGas not available`);
      }
      const handleOpsData = encodeFunctionData({
        abi: ENTRY_POINT_ABI,
        functionName: "handleOps",
        args: [[userOperation], userOperation.sender],
      });

      const l1Fee = await this.publicClient.readContract({
        address: OPTIMISM_L1_GAS_PRICE_ORACLE_ADDRESS,
        abi: OPTIMISM_L1_GAS_PRICE_ORACLE_ABI,
        functionName: "getL1Fee",
        args: [handleOpsData],
      });
      // extraPvg = l1Cost / l2Price
      const l2MaxFee = BigInt(userOperation.maxFeePerGas);
      const l2PriorityFee =
        baseFeePerGas + BigInt(userOperation.maxPriorityFeePerGas);
      const l2Price = l2MaxFee < l2PriorityFee ? l2MaxFee : l2PriorityFee;
      preVerificationGas += l1Fee / l2Price;
    }
    return {
      preVerificationGas,
    };
  }

  /**
   * Estimates gas for a user operation for a blockchain whose RPC does not support state overrides.
   *
   * @param {EstimateUserOperationGasParams} params - Configuration options for gas estimation.
   * @returns {Promise<EstimateUserOperationGas>} A promise that resolves to the estimated gas limits.
   *
   * @throws {Error} If there is an issue during gas estimation.
   */
  private async esitmateUserOperationGasWithNoEthCallStateOverrideSupport(
    params: EstimateUserOperationGasParams,
  ): Promise<EstimateUserOperationGas> {
    const { userOperation } = params;

    const inMemoryUserOperation = userOperation;

    inMemoryUserOperation.maxFeePerGas = 1_000_000n;
    inMemoryUserOperation.maxPriorityFeePerGas = 1_000_000n;
    inMemoryUserOperation.preVerificationGas = 1_000_000n;
    inMemoryUserOperation.verificationGasLimit = 10_000_000n;
    inMemoryUserOperation.callGasLimit = 30_000_000n;

    const ethCallPromise = this.publicClient.request({
      method: "eth_call",
      params: [
        {
          to: this.entryPointAddress,
          data: encodeFunctionData({
            abi: ENTRY_POINT_ABI,
            functionName: "simulateHandleOp",
            args: [userOperation, zeroAddress, "0x"],
          }),
        },
        "latest",
      ],
    });

    const preVerificationGasPromise = this.calculatePreVerificationGas({
      userOperation,
    });

    const [ethCallResponse, preVerficationResponse] = await Promise.all([
      ethCallPromise,
      preVerificationGasPromise,
    ]);

    const errorResult = decodeErrorResult({
      abi: ENTRY_POINT_ABI,
      data: ethCallResponse,
    });

    const executionResult = getSimulationResult(
      errorResult,
      "execution",
    ) as ExecutionResult;

    const verificationGasLimit =
      executionResult.preOpGas - userOperation.preVerificationGas;
    const callGasLimit =
      executionResult.paid / userOperation.maxFeePerGas -
      executionResult.preOpGas;

    return {
      callGasLimit,
      verificationGasLimit,
      preVerificationGas: preVerficationResponse.preVerificationGas,
    };
  }
}
