/* eslint-disable no-await-in-loop */
/* eslint-disable @typescript-eslint/return-await */
import {
  BaseError,
  ContractFunctionExecutionError,
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
import { fromZodError } from "zod-validation-error";
import {
  Address,
  EstimateCallGasLimitArgs,
  EstimateCallGasLimitReturn,
  EstimateUserOperationGasArgs,
  EstimateUserOperationGasReturn,
  EstimateVerificationGasLimitArgs,
  EstimateVerificationGasLimitReturn,
  ExecutionResult,
  GasEstimatorArgs,
  HexData,
  SimulateHandleOpArgs,
  SimulateHandleOpReturn,
  ValidationErrors,
  entryPointExecutionErrorSchema,
  executionResultSchema,
  hexDataSchema,
} from "./types";
import {
  DEFAULT_CALL_GAS_ESTIMATION_SIMULATOR_BYTE_CODE,
  DEFAULT_ENTRY_POINT_ADDRESS,
} from "./constants";
import { CALL_GAS_ESTIMATION_SIMULATOR, ENTRY_POINT_ABI } from "./abi";
import { RpcError, getCallGasEstimationSimulatorResult, tooLow } from "./utils";

export class GasEstimator {
  publicClient: PublicClient;

  rpcUrl: string;

  entryPointAddress: Address;

  callGasEstimationSimulatorByteCode: HexData;

  constructor(args: GasEstimatorArgs) {
    this.rpcUrl = args.rpcUrl;
    this.entryPointAddress = args.entryPointAddress
      ? args.entryPointAddress
      : DEFAULT_ENTRY_POINT_ADDRESS;
    this.callGasEstimationSimulatorByteCode =
      args.callGasEstimationSimulatorByteCode
        ? args.callGasEstimationSimulatorByteCode
        : DEFAULT_CALL_GAS_ESTIMATION_SIMULATOR_BYTE_CODE;
    this.publicClient = createPublicClient({
      transport: http(this.rpcUrl),
    });
  }

  async estimateUserOperationGas(
    args: EstimateUserOperationGasArgs,
  ): Promise<EstimateUserOperationGasReturn> {
    const { userOperation, supportsEthCallStateOverride = true } = args;

    if (!supportsEthCallStateOverride) {
      return await this.esitmateUserOperationGasWithNoEthCallStateOverrideSupport(
        args,
      );
    }

    const verificationGasLimitPromise = this.estimateVerificationGasLimit({
      userOperation,
    });

    const callGasLimitPromise = this.estimateCallGasLimit({
      userOperation,
    });

    const [verificationGasLimitResponse, callGasLimitResponse] =
      await Promise.all([verificationGasLimitPromise, callGasLimitPromise]);

    return {
      verificationGasLimit: verificationGasLimitResponse.verificationGasLimit,
      callGasLimit: callGasLimitResponse.callGasLimit,
    };
  }

  async estimateVerificationGasLimit(
    this: GasEstimator,
    args: EstimateVerificationGasLimitArgs,
  ): Promise<EstimateVerificationGasLimitReturn> {
    const { userOperation } = args;

    userOperation.maxFeePerGas = 0n;
    userOperation.maxPriorityFeePerGas = 0n;
    userOperation.callGasLimit = 0n;

    let lower = 0n;
    let upper = 10_000_000n;
    let final: bigint | null = null;

    const cutoff = 20_000n;

    userOperation.verificationGasLimit = upper;
    userOperation.callGasLimit = 0n;

    const initial = await this.simulateHandleOp({
      userOperation,
      replacedEntryPoint: false,
      targetAddress: zeroAddress,
      targetCallData: "0x",
    });

    if (initial.result === "execution" && typeof initial.data !== "string") {
      upper = 6n * (initial.data.preOpGas - userOperation.preVerificationGas);
    } else {
      throw new RpcError(
        `UserOperation reverted during simulation with reason: ${initial.data}`,
        ValidationErrors.SimulateValidation,
      );
    }

    // binary search
    while (upper - lower > cutoff) {
      const mid = (upper + lower) / 2n;

      userOperation.verificationGasLimit = mid;
      userOperation.callGasLimit = 0n;

      const error = await this.simulateHandleOp({
        userOperation,
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
      throw new RpcError("Failed to estimate verification gas limit");
    }

    if (userOperation.paymasterAndData === "0x") {
      final += 30_000n;
    }

    return {
      verificationGasLimit: final,
    };
  }

  async estimateCallGasLimit(
    args: EstimateCallGasLimitArgs,
  ): Promise<EstimateCallGasLimitReturn> {
    const { userOperation } = args;

    userOperation.callGasLimit = 0n;
    userOperation.verificationGasLimit = 10_000_000n;

    const targetCallData = encodeFunctionData({
      abi: CALL_GAS_ESTIMATION_SIMULATOR,
      functionName: "estimateCallGas",
      args: [
        {
          sender: userOperation.sender,
          callData: userOperation.callData,
          minGas: 0n,
          maxGas: 30_000_000n,
          rounding: 1n,
          isContinuation: false,
        },
      ],
    });

    const error = await this.simulateHandleOp({
      userOperation,
      replacedEntryPoint: true,
      targetAddress: this.entryPointAddress,
      targetCallData,
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

  async simulateHandleOp(
    args: SimulateHandleOpArgs,
  ): Promise<SimulateHandleOpReturn> {
    const { userOperation, replacedEntryPoint, targetAddress, targetCallData } =
      args;

    const ethCallFinalParam = replacedEntryPoint
      ? {
          [userOperation.sender]: {
            balance: toHex(100000_000000000000000000n),
          },
          [this.entryPointAddress]: {
            code: this.callGasEstimationSimulatorByteCode,
          },
        }
      : {
          [userOperation.sender]: {
            balance: toHex(100000_000000000000000000n),
          },
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

  async esitmateUserOperationGasWithNoEthCallStateOverrideSupport(
    args: EstimateUserOperationGasArgs,
  ): Promise<EstimateUserOperationGasReturn> {
    const { userOperation } = args;

    userOperation.preVerificationGas = 1_000_000n;
    userOperation.verificationGasLimit = 10_000_000n;
    userOperation.callGasLimit = 20_000_000n;

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

    const executionResult = this.getSimulationResult(
      errorResult,
      "execution",
    ) as ExecutionResult;

    const verificationGasLimit =
      ((executionResult.preOpGas - userOperation.preVerificationGas) * 6n) / 5n;
    const calculatedCallGasLimit =
      executionResult.paid / userOperation.maxFeePerGas -
      executionResult.preOpGas +
      21000n +
      50000n;

    const callGasLimit =
      calculatedCallGasLimit > 9000n ? calculatedCallGasLimit : 9000n;

    return {
      callGasLimit,
      verificationGasLimit,
    };
  }

  // eslint-disable-next-line class-methods-use-this
  getSimulationResult(
    errorResult: unknown,
    simulationType: "validation" | "execution",
  ) {
    const entryPointErrorSchemaParsing =
      entryPointExecutionErrorSchema.safeParse(errorResult);

    if (!entryPointErrorSchemaParsing.success) {
      try {
        const err = fromZodError(entryPointErrorSchemaParsing.error);
        err.message = `User Operation simulation returned unexpected invalid response: ${err.message}`;
        throw err;
      } catch {
        if (errorResult instanceof BaseError) {
          const revertError = errorResult.walk(
            (err: any) => err instanceof ContractFunctionExecutionError,
          );
          throw new RpcError(
            // @ts-ignore
            `UserOperation reverted during simulation with reason: ${(revertError?.cause as any)?.reason}`,
            ValidationErrors.SimulateValidation,
          );
        }
        throw new Error(
          `User Operation simulation returned unexpected invalid response: ${errorResult}`,
        );
      }
    }

    const errorData = entryPointErrorSchemaParsing.data;

    if (errorData.errorName === "FailedOp") {
      const { reason } = errorData.args;
      throw new RpcError(
        `UserOperation reverted during simulation with reason: ${reason}`,
        ValidationErrors.SimulateValidation,
      );
    }

    if (simulationType === "validation") {
      if (
        errorData.errorName !== "ValidationResult" &&
        errorData.errorName !== "ValidationResultWithAggregation"
      ) {
        throw new Error(
          "Unexpected error - errorName is not ValidationResult or ValidationResultWithAggregation",
        );
      }
    } else if (errorData.errorName !== "ExecutionResult") {
      throw new Error("Unexpected error - errorName is not ExecutionResult");
    }

    const simulationResult = errorData.args;

    return simulationResult;
  }
}
