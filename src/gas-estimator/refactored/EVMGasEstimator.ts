import config from "config";
import {
  isExecutionResultV6,
  StateOverrideSet,
} from "../../entrypoint/v0.6.0/types";
import {
  packUserOpV6,
  UserOperationV6,
} from "../../entrypoint/v0.6.0/UserOperationV6";
import { ByteArray, parseEther, toBytes, toHex } from "viem";

import {
  packUserOpV7,
  toPackedUserOperation,
  UserOperationV7,
} from "../../entrypoint/v0.7.0/UserOperationV7";
import { MakeOptional } from "../../shared/types";
import { bumpBigIntPercent } from "../../shared/utils";
import {
  EntryPoints,
  EstimateUserOperationGasResult,
  ExecutionResult,
  GasEstimatorRpcClient,
} from "./types";
import { EntryPointVersion } from "../../entrypoint/shared/types";
import { defaultGasOverheads, INNER_GAS_OVERHEAD } from "./constants";
import {
  validateUserOperation,
  UserOperation,
  isUserOperationV6,
} from "./UserOperation";

export class EVMGasEstimator {
  constructor(
    public chainId: number,
    protected rpcClient: GasEstimatorRpcClient,
    public entryPoints: EntryPoints,
    public simulationOptions: SimulationOptions
  ) {}

  async estimateUserOperationGas({
    unEstimatedUserOperation,
    baseFeePerGas,
    stateOverrides,
    options = getDefaultOptions(this.chainId),
  }: EstimateUserOperationGasParams): Promise<EstimateUserOperationGasResult> {
    const userOperation = validateUserOperation(
      this.overrideUserOperationForSimulation(unEstimatedUserOperation)
    );

    let estimates: EstimateUserOperationGasResult;
    if (
      isUserOperationV6(userOperation) &&
      userOperation.initCode === "0x" &&
      options.useBinarySearch
    ) {
      estimates = await this.useBinarySearch(
        userOperation,
        baseFeePerGas,
        options
      );
    } else {
      estimates = await this.useSimulateHandleOp(
        userOperation,
        baseFeePerGas,
        options
      );
    }

    return estimates;
  }

  private overrideUserOperationForSimulation(
    unEstimatedUserOperation: UnEstimatedUserOperation
  ): UserOperation {
    const userOperation: UserOperation = {
      ...unEstimatedUserOperation,
      preVerificationGas: this.simulationOptions.preVerificationGas,
      verificationGasLimit: this.simulationOptions.verificationGasLimit,
      callGasLimit: this.simulationOptions.callGasLimit,
    };

    return userOperation;
  }

  async useSimulateHandleOp(
    userOperation: UserOperation,
    baseFeePerGas: bigint,
    options: Partial<EstimateUserOperationGasOptions>
  ): Promise<EstimateUserOperationGasResult> {
    userOperation = validateUserOperation(userOperation);

    let stateOverrides: StateOverrideSet | undefined;
    if (options.overrideSenderBalance) {
      stateOverrides = {
        [userOperation.sender]: {
          balance: toHex(parseEther("1000000")),
        },
      };
    }

    userOperation.maxPriorityFeePerGas = userOperation.maxFeePerGas;

    if (isUserOperationV6(userOperation)) {
      return await this.estimateUserOperationGasV6(
        userOperation,
        stateOverrides,
        baseFeePerGas
      );
    }
    return await this.estimateUserOperationGasV7(
      userOperation,
      stateOverrides,
      baseFeePerGas
    );
  }

  private async estimateUserOperationGasV7(
    userOperation: UserOperationV7,
    stateOverrides: StateOverrideSet | undefined,
    baseFeePerGas: bigint
  ) {
    const entryPoint = this.entryPoints[EntryPointVersion.v070].contract;

    const [executionResult, preVerificationGas, executionGas] =
      await Promise.all([
        entryPoint.simulateHandleOp({
          userOperation,
          targetAddress: entryPoint.address,
          targetCallData: "0x",
          stateOverrides,
        }),
        this.estimatePreVerificationGas(userOperation, baseFeePerGas),
        this.rpcClient.estimateGas({
          account: entryPoint.address,
          to: userOperation.sender,
          data: userOperation.callData,
        }),
      ]);

    let { verificationGasLimit } = this.estimateVerificationAndCallGasLimits(
      userOperation,
      executionResult
    );

    let callGasLimit = executionGas;

    const paymasterVerificationGasLimit = userOperation.paymaster
      ? verificationGasLimit
      : 0n;
    const paymasterPostOpGasLimit = userOperation.paymaster
      ? verificationGasLimit
      : 0n;

    callGasLimit -= 21000n; // 21000 is the gas cost of the call from EOA, we can remove it
    callGasLimit += INNER_GAS_OVERHEAD;
    callGasLimit += paymasterPostOpGasLimit;

    return {
      callGasLimit: bumpBigIntPercent(callGasLimit, 10), // markup to cover the 63/64 problem,
      verificationGasLimit: bumpBigIntPercent(verificationGasLimit, 10), // observed verification overhead
      preVerificationGas,
      paymasterVerificationGasLimit,
      paymasterPostOpGasLimit,
    };
  }

  private async estimateUserOperationGasV6(
    userOperation: UserOperationV6,
    stateOverrides: StateOverrideSet | undefined,
    baseFeePerGas: bigint
  ) {
    const entryPoint = this.entryPoints[EntryPointVersion.v060].contract;

    const [executionResult, preVerificationGas] = await Promise.all([
      entryPoint.simulateHandleOp({
        userOperation,
        targetAddress: entryPoint.address,
        targetCallData: "0x",
        stateOverrides,
      }),
      this.estimatePreVerificationGas(userOperation, baseFeePerGas),
    ]);

    let { callGasLimit, verificationGasLimit, validAfter, validUntil } =
      this.estimateVerificationAndCallGasLimits(userOperation, executionResult);

    return {
      callGasLimit: bumpBigIntPercent(callGasLimit, 10),
      verificationGasLimit: bumpBigIntPercent(verificationGasLimit, 10),
      preVerificationGas,
      validAfter,
      validUntil,
    };
  }

  async useBinarySearch(
    userOperation: UserOperationV6,
    baseFeePerGas: bigint,
    options: Partial<EstimateUserOperationGasOptions>
  ): Promise<EstimateUserOperationGasResult> {
    const entryPoint = this.entryPoints[EntryPointVersion.v060].simulations;

    const [verificationGasLimitResult, callGasLimit, preVerificationGas] =
      await Promise.all([
        entryPoint.estimateVerificationGasLimit({
          userOperation: userOperation,
        }),
        entryPoint.estimateCallGasLimit({
          userOperation: userOperation,
        }),
        this.estimatePreVerificationGas(userOperation, baseFeePerGas),
      ]);

    const { verificationGasLimit, validAfter, validUntil } =
      verificationGasLimitResult;

    return {
      callGasLimit,
      verificationGasLimit,
      preVerificationGas,
      validAfter,
      validUntil,
    };
  }

  estimateVerificationAndCallGasLimits(
    userOperation: UserOperation,
    executionResult: ExecutionResult
  ) {
    const { preOpGas, paid } = executionResult;

    let validAfter = 0;
    let validUntil = 0;
    if (isExecutionResultV6(executionResult)) {
      validAfter = executionResult.validAfter;
      validUntil = executionResult.validUntil;
    }

    const verificationGasLimit = preOpGas - userOperation.preVerificationGas;

    const callGasLimit = paid / userOperation.maxFeePerGas - preOpGas;

    return {
      callGasLimit,
      verificationGasLimit,
      validAfter,
      validUntil,
    };
  }

  async estimatePreVerificationGas(
    userOperation: UserOperation,
    baseFeePerGas?: bigint
  ): Promise<bigint> {
    userOperation = validateUserOperation(userOperation);

    let packed: ByteArray;
    if (isUserOperationV6(userOperation)) {
      packed = toBytes(packUserOpV6(userOperation, true));
    } else {
      const packedUserOperation = toPackedUserOperation(userOperation);
      packed = toBytes(packUserOpV7(packedUserOperation));
    }

    const callDataCost = packed
      .map((x: number) =>
        x === 0 ? defaultGasOverheads.zeroByte : defaultGasOverheads.nonZeroByte
      )
      .reduce((sum: any, x: any) => sum + x);

    let preVerificationGas = BigInt(
      Math.round(
        callDataCost +
          defaultGasOverheads.fixed / defaultGasOverheads.bundleSize +
          defaultGasOverheads.perUserOp +
          defaultGasOverheads.perUserOpWord * packed.length
      )
    );

    return preVerificationGas;
  }
}

function getDefaultOptions(chainId: number): EstimateUserOperationGasOptions {
  return {
    useBinarySearch: config.has(
      `supportedChains.${chainId}.stateOverrideSupport.bytecode`
    )
      ? config.get<boolean>(
          `supportedChains.${chainId}.stateOverrideSupport.bytecode`
        )
      : false,
    overrideSenderBalance: config.has(
      `supportedChains.${chainId}.stateOverrideSupport.balance`
    )
      ? config.get<boolean>(
          `supportedChains.${chainId}.stateOverrideSupport.balance`
        )
      : true,
  };
}

export type UnEstimatedUserOperation =
  | UnEstimatedUserOperationV6
  | UnEstimatedUserOperationV7;

export type UnEstimatedUserOperationV6 = MakeOptional<
  UserOperationV6,
  "callGasLimit" | "verificationGasLimit" | "preVerificationGas"
>;

export type UnEstimatedUserOperationV7 = MakeOptional<
  UserOperationV7,
  | "callGasLimit"
  | "verificationGasLimit"
  | "preVerificationGas"
  | "paymasterVerificationGasLimit"
  | "paymasterPostOpGasLimit"
>;

export interface EstimateUserOperationGasParams {
  unEstimatedUserOperation: UnEstimatedUserOperation;
  baseFeePerGas: bigint;
  stateOverrides?: StateOverrideSet;
  options?: Partial<EstimateUserOperationGasOptions>;
}

export interface EstimateUserOperationGasOptions {
  useBinarySearch: boolean;
  overrideSenderBalance: boolean;
}

export interface SimulationOptions {
  preVerificationGas: bigint;
  verificationGasLimit: bigint;
  callGasLimit: bigint;
}
