/* eslint-disable no-await-in-loop */
/* eslint-disable @typescript-eslint/return-await */
import {
  PublicClient,
  RpcRequestErrorType,
  createPublicClient,
  decodeErrorResult,
  encodeFunctionData,
  http,
  toHex,
  zeroAddress,
} from "viem";
import { z } from "zod";
import {
  Address,
  EstimateCallGasLimitArgs,
  EstimateCallGasLimit,
  EstimateUserOperationGasArgs,
  EstimateUserOperationGas,
  EstimateVerificationGasLimitArgs,
  EstimateVerificationGasLimit,
  ExecutionResult,
  GasEstimatorArgs,
  HexData,
  SimulateHandleOpArgs,
  SimulateHandleOp,
  ValidationErrors,
  executionResultSchema,
  hexDataSchema,
} from "./types";
import {
  CALL_GAS_ESTIMATION_SIMULATOR_BYTE_CODE,
  DEFAULT_ENTRY_POINT_ADDRESS,
} from "./constants";
import { CALL_GAS_ESTIMATION_SIMULATOR, ENTRY_POINT_ABI } from "./abi";
import {
  RpcError,
  getCallGasEstimationSimulatorResult,
  getSimulationResult,
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
   * @param {GasEstimatorArgs} args - Configuration options for the gas estimator.
   * @param {string} args.rpcUrl  - The URL of the RPC (Remote Procedure Call) endpoint.
   * @param {Address} args.entryPointAddress (optional) - v0.6 entry point address to be passed if not deployed at 0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789
   */
  constructor(args: GasEstimatorArgs) {
    this.rpcUrl = args.rpcUrl;
    this.entryPointAddress = args.entryPointAddress
      ? args.entryPointAddress
      : DEFAULT_ENTRY_POINT_ADDRESS;
    this.publicClient = createPublicClient({
      transport: http(this.rpcUrl),
    });
  }

  /**
   * Estimates gas for a user operation.
   *
   * @param {EstimateUserOperationGasArgs} args - Configuration options for gas estimation.
   * @param {UserOperation} args.userOperation - A full user operation
   * @param {boolean} args.supportsEthCallStateOverride (optional) - @defaultValue true
   *    A boolean value that needs to be passed false if the RPC provider does not support state overrides.
   * @param {bigint} args.initialVglLowerBound (optional) - @defaultValue 0
   *    The initial lower bound that will be used in the first iteration of binary search for verificationGasLimit
   * @param {bigint} args.initialVglUpperBound (optional) - @defaultValue 10_000_00
   *    The initial upper bound that will be used in the first iteration of binary search for verificationGasLimit
   * @param {bigint} args.vglCutOff (optional) - @defaultValue 20_000
   *    The cutoff value which will determine when to terminate the binary search for verificationGasLimit
   * @param {bigint} args.vglUpperBoundMultiplier (optional) - @defaultValue 6
   *    The multipler that will be used to find the upper value after the first simulateHandleOp call for verificationGasLimit
   * @param {bigint} args.initalCglLowerBound (optional) - @defaultValue 0
   *    The initial lower bound that will be used in the first interation of binary search for call gas limit
   * @param {bigint} args.initialCglUpperBound (optional) - @defaultValue 30_000_000
   *    The initial upper bound that will be used in the first interation of binary search for call gas limit
   * @param {bigint} args.cglRounding (optional) - @defaultValue 1
   *    A rounding value which rounds all guesses and the final result to a multiple of that parameter
   * @param {boolean} args.callDataExecutionAtMaxGas (optional) - @defaultValue false
   *    If true, contract will calculate a gas value to use in binary search
   *    If false, contract makes a call to execute the callData and get the gas
   * @returns {Promise<EstimateUserOperationGas>} A promise that resolves to the estimated gas limits.
   *
   * @throws {RpcError} If there is an issue during gas estimation.
   */
  async estimateUserOperationGas(
    args: EstimateUserOperationGasArgs,
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
    } = args;

    if (!supportsEthCallStateOverride) {
      return await this.esitmateUserOperationGasWithNoEthCallStateOverrideSupport(
        args,
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

    const [verificationGasLimitResponse, callGasLimitResponse] =
      await Promise.all([verificationGasLimitPromise, callGasLimitPromise]);

    return {
      verificationGasLimit: verificationGasLimitResponse.verificationGasLimit,
      callGasLimit: callGasLimitResponse.callGasLimit,
    };
  }

  /**
   * Estimates gas for a user operation.
   *
   * @param {EstimateVerificationGasLimitArgs} args - Configuration options for verificationGasLimit gas estimation.
   * @param {UserOperation} args.userOperation - A full user operation
   * @param {boolean} args.supportsEthCallStateOverride (optional) - @defaultValue true
   *    A boolean value that needs to be passed false if the RPC provider does not support state overrides.
   * @param {bigint} args.initialVglLowerBound (optional) - @defaultValue 0
   *    The initial lower bound that will be used in the first iteration of binary search for verificationGasLimit
   * @param {bigint} args.initialVglUpperBound (optional) - @defaultValue 10_000_00
   *    The initial upper bound that will be used in the first iteration of binary search for verificationGasLimit
   * @param {bigint} args.vglCutOff (optional) - @defaultValue 20_000
   *    The cutoff value which will determine when to terminate the binary search for verificationGasLimit
   * @param {bigint} args.vglUpperBoundMultiplier (optional) - @defaultValue 6
   *    The multipler that will be used to find the upper value after the first simulateHandleOp call for verificationGasLimit
   * @returns {Promise<EstimateVerificationGasLimit>} A promise that resolves to an object containing the verificationGasLimit
   *
   * @throws {RpcError} If there is an issue during gas estimation.
   */
  async estimateVerificationGasLimit(
    this: GasEstimator,
    args: EstimateVerificationGasLimitArgs,
  ): Promise<EstimateVerificationGasLimit> {
    const {
      userOperation,
      supportsEthCallStateOverride,
      initialVglLowerBound,
      initialVglUpperBound,
      vglCutOff,
      vglUpperBoundMultiplier,
      stateOverrideSet,
    } = args;

    if (!supportsEthCallStateOverride) {
      const estimationResponse =
        await this.esitmateUserOperationGasWithNoEthCallStateOverrideSupport(
          args,
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
   * @param {EstimateCallGasLimitArgs} args - Configuration options for callGasLimit gas estimation.
   * @param {UserOperation} args.userOperation - A full user operation
   * @param {boolean} args.supportsEthCallStateOverride (optional) - @defaultValue true
   *    A boolean value that needs to be passed false if the RPC provider does not support state overrides.
   * @param {bigint} args.initalCglLowerBound (optional) - @defaultValue 0
   *    The initial lower bound that will be used in the first interation of binary search for callGasLimit
   * @param {bigint} args.initialCglUpperBound (optional) - @defaultValue 30_000_000
   *    The initial upper bound that will be used in the first interation of binary search for callGasLimit
   * @param {bigint} args.cglRounding (optional) - @defaultValue 1
   *    A rounding value which rounds all guesses and the final result to a multiple of that parameter
   * @param {boolean} args.callDataExecutionAtMaxGas (optional) - @defaultValue false
   *    If true, contract will calculate a gas value to use in binary search
   *    If false, contract makes a call to execute the callData and get the gas
   * @returns {Promise<EstimateCallGasLimit>} A promise that resolves to the estimated gas limits.
   *
   * @throws {RpcError} If there is an issue during gas estimation.
   */
  async estimateCallGasLimit(
    args: EstimateCallGasLimitArgs,
  ): Promise<EstimateCallGasLimit> {
    const {
      userOperation,
      supportsEthCallStateOverride,
      initalCglLowerBound,
      initialCglUpperBound,
      cglRounding,
      callDataExecutionAtMaxGas,
      stateOverrideSet,
    } = args;

    if (!supportsEthCallStateOverride) {
      const estimationResponse =
        await this.esitmateUserOperationGasWithNoEthCallStateOverrideSupport(
          args,
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
   * @param {SimulateHandleOpArgs} args - Configuration options for simulateHandleOp execution.
   * @param {UserOperation} args.userOperation - A full user operation
   * @param {boolean} args.replacedEntryPoint
   *    A boolean value that decides if to state override the bytecode at the entry point address
   * @param {Address} args.targetAddress
   *    target address to be passed in the simulateHandleOp call
   * @param {HexData} args.targetCallData
   *    target call data to be passed in the simulateHandleOp call
   * @param {StateOverrideSet} args.stateOverrideSet (optional)
   *    A state override that might be required while making eth_call to simulateHandleOp
   * @returns {Promise<SimulateHandleOp>} A promise that resolves to the result of eth_call to simulateHandleOp
   *
   * @throws {Error} If there is an making eth_call to simulateHandleOp
   */
  private async simulateHandleOp(
    args: SimulateHandleOpArgs,
  ): Promise<SimulateHandleOp> {
    const {
      userOperation,
      replacedEntryPoint,
      targetAddress,
      targetCallData,
      stateOverrideSet,
    } = args;

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
   * Estimates gas for a user operation for a blockchain whose RPC does not support state overrides.
   *
   * @param {EstimateUserOperationGasArgs} args - Configuration options for gas estimation.
   * @param {UserOperation} args.userOperation - A full user operation
   * @returns {Promise<EstimateUserOperationGas>} A promise that resolves to the estimated gas limits.
   *
   * @throws {Error} If there is an issue during gas estimation.
   */
  private async esitmateUserOperationGasWithNoEthCallStateOverrideSupport(
    args: EstimateUserOperationGasArgs,
  ): Promise<EstimateUserOperationGas> {
    const { userOperation } = args;

    const inMemoryUserOperation = userOperation;

    inMemoryUserOperation.maxFeePerGas = 1_000_000n;
    inMemoryUserOperation.maxPriorityFeePerGas = 1_000_000n;
    inMemoryUserOperation.preVerificationGas = 1_000_000n;
    inMemoryUserOperation.verificationGasLimit = 10_000_000n;
    inMemoryUserOperation.callGasLimit = 30_000_000n;

    const ethCallResult = await this.publicClient.request({
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

    const errorResult = decodeErrorResult({
      abi: ENTRY_POINT_ABI,
      data: ethCallResult,
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
    };
  }
}
