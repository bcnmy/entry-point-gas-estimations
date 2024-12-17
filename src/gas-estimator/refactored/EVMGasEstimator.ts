import config from "config";
import {
  isExecutionResultV6,
  StateOverrideSet,
} from "../../entrypoint/v0.6.0/types";
import {
  packUserOpV6,
  UserOperationV6,
} from "../../entrypoint/v0.6.0/UserOperationV6";
import { ByteArray, parseEther, PublicClient, toBytes, toHex } from "viem";

import {
  packUserOpV7,
  toPackedUserOperation,
} from "../../entrypoint/v0.7.0/UserOperationV7";
import { MakeOptional } from "../../shared/types";
import { bumpBigIntPercent } from "../../shared/utils";
import { EntryPoints, ExecutionResult, UserOperation } from "./types";
import { EntryPointVersion } from "../../entrypoint/shared/types";
import { defaultGasOverheads } from "./constants";

export class EVMGasEstimator {
  constructor(
    public chainId: number,
    protected rpcClient: PublicClient,
    public entryPoints: EntryPoints,
    public simulationOptions: SimulationOptions
  ) {}

  async estimateUserOperationGas({
    userOperation,
    baseFeePerGas,
    entryPointVersion,
    stateOverrides,
    options = getDefaultOptions(this.chainId),
  }: EstimateUserOperationGasParams): Promise<EstimateUserOperationGasResult> {
    userOperation.preVerificationGas =
      this.simulationOptions.preVerificationGas;
    userOperation.verificationGasLimit =
      this.simulationOptions.verificationGasLimit;
    userOperation.callGasLimit = this.simulationOptions.callGasLimit;

    let estimates: EstimateUserOperationGasResult;

    if (
      entryPointVersion === EntryPointVersion.v060 &&
      userOperation.initCode === "0x" &&
      options.useBinarySearch
    ) {
      estimates = await this.useBinarySearch(
        entryPointVersion,
        userOperation as UserOperation,
        baseFeePerGas,
        options
      );
    } else {
      estimates = await this.useSimulateHandleOp(
        entryPointVersion,
        userOperation as UserOperation,
        baseFeePerGas,
        options
      );
    }

    const { verificationGasLimit } = estimates;

    return {
      ...estimates,
      verificationGasLimit: bumpBigIntPercent(verificationGasLimit, 10),
    };
  }

  async useSimulateHandleOp(
    entryPointVersion: EntryPointVersion,
    userOperation: UserOperation,
    baseFeePerGas: bigint,
    options: Partial<EstimateUserOperationGasOptions>
  ): Promise<EstimateUserOperationGasResult> {
    let stateOverrides: StateOverrideSet | undefined;
    if (options.overrideSenderBalance) {
      stateOverrides = {
        [userOperation.sender]: {
          balance: toHex(parseEther("1000000")),
        },
      };
    }

    userOperation.maxPriorityFeePerGas = userOperation.maxFeePerGas;

    const entryPoint =
      entryPointVersion === EntryPointVersion.v060
        ? this.entryPoints[EntryPointVersion.v060].contract
        : this.entryPoints[EntryPointVersion.v070].contract;

    const [executionResult, preVerificationGas] = await Promise.all([
      entryPoint.simulateHandleOp({
        userOperation,
        targetAddress: entryPoint.address,
        targetCallData: "0x",
        stateOverrides,
      }),
      this.estimatePreVerificationGas(
        entryPointVersion,
        userOperation,
        baseFeePerGas
      ),
    ]);

    const { callGasLimit, verificationGasLimit, validAfter, validUntil } =
      this.estimateVerificationAndCallGasLimits(userOperation, executionResult);

    let paymasterVerificationGasLimit: bigint | undefined;
    let paymasterPostOpGasLimit: bigint | undefined;

    if (entryPointVersion === EntryPointVersion.v070) {
      paymasterVerificationGasLimit = userOperation.paymaster
        ? verificationGasLimit
        : 0n;
      paymasterPostOpGasLimit = userOperation.paymaster
        ? verificationGasLimit
        : 0n;
    }

    return {
      callGasLimit,
      verificationGasLimit,
      preVerificationGas,
      validAfter,
      validUntil,
      paymasterVerificationGasLimit,
      paymasterPostOpGasLimit,
    };
  }

  async useBinarySearch(
    entryPointVersion: EntryPointVersion,
    userOperation: UserOperation,
    baseFeePerGas: bigint,
    options: Partial<EstimateUserOperationGasOptions>
  ): Promise<EstimateUserOperationGasResult> {
    if (entryPointVersion === EntryPointVersion.v070) {
      throw new Error("Binary search not supported yet for v0.7.0");
    }

    const entryPoint = this.entryPoints[EntryPointVersion.v060].simulations;

    const [verificationGasLimitResult, callGasLimit, preVerificationGas] =
      await Promise.all([
        entryPoint.estimateVerificationGasLimit({
          userOperation: userOperation as UserOperationV6,
        }),
        entryPoint.estimateCallGasLimit({
          userOperation: userOperation as UserOperationV6,
        }),
        this.estimatePreVerificationGas(
          entryPointVersion,
          userOperation,
          baseFeePerGas
        ),
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
    let validAfter = 0;
    let validUntil = 0;

    const { preOpGas, paid } = executionResult;

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
    entryPointVersion: EntryPointVersion,
    userOperation: UserOperation,
    baseFeePerGas?: bigint
  ): Promise<bigint> {
    let packed: ByteArray;

    if (entryPointVersion === EntryPointVersion.v060) {
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

export interface EstimateUserOperationGasResult {
  callGasLimit: bigint;
  verificationGasLimit: bigint;
  preVerificationGas: bigint;
  paymasterVerificationGasLimit?: bigint;
  paymasterPostOpGasLimit?: bigint;
  validAfter: number;
  validUntil: number;
}

export type UnEstimatedUserOperation = MakeOptional<
  UserOperation,
  | "callGasLimit"
  | "verificationGasLimit"
  | "preVerificationGas"
  | "factory"
  | "factoryData"
>;

export interface EstimateUserOperationGasParams {
  entryPointVersion: EntryPointVersion;
  userOperation: UnEstimatedUserOperation;
  baseFeePerGas: bigint;
  stateOverrides?: StateOverrideSet;
  options?: Partial<EstimateUserOperationGasOptions>;
}

interface EstimateUserOperationGasOptions {
  useBinarySearch: boolean;
  overrideSenderBalance: boolean;
}

export interface SimulationOptions {
  preVerificationGas: bigint;
  verificationGasLimit: bigint;
  callGasLimit: bigint;
}
