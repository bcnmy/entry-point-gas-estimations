import { isExecutionResultV6 } from "../../entrypoint/v0.6.0/types";
import {
  packUserOpV6,
  UserOperationV6,
} from "../../entrypoint/v0.6.0/UserOperationV6";
import { Address, ByteArray, parseEther, toBytes, toHex } from "viem";

import {
  packUserOpV7,
  toPackedUserOperation,
  UserOperationV7,
} from "../../entrypoint/v0.7.0/UserOperationV7";
import { StateOverrideSet } from "../../shared/types";
import { bumpBigIntPercent } from "../../shared/utils";
import {
  EntryPoints,
  EstimateUserOperationGasResult,
  ExecutionResult,
} from "../types";
import { EntryPointVersion } from "../../entrypoint/shared/types";
import {
  validateUserOperation,
  UserOperation,
  isUserOperationV6,
} from "../UserOperation";
import {
  EstimateUserOperationGasOptions,
  EstimateUserOperationGasParams,
  GasEstimator,
  GasEstimatorRpcClient,
  SimulationOptions,
  UnEstimatedUserOperation,
} from "../GasEstimator";
import { INNER_GAS_OVERHEAD } from "../../entrypoint/v0.7.0/constants";
import {
  defaultGasOverheads,
  SIMULATION_CALL_GAS_LIMIT,
  SIMULATION_PRE_VERIFICATION_GAS,
  SIMULATION_VERIFICATION_GAS_LIMIT,
} from "./constants";
import { supportedChains } from "../../chains/chains";

export class EVMGasEstimator implements GasEstimator {
  constructor(
    public chainId: number,
    protected rpcClient: GasEstimatorRpcClient,
    public entryPoints: EntryPoints,
    public simulationOptions: SimulationOptions = {
      callGasLimit: SIMULATION_CALL_GAS_LIMIT,
      preVerificationGas: SIMULATION_PRE_VERIFICATION_GAS,
      verificationGasLimit: SIMULATION_VERIFICATION_GAS_LIMIT,
    }
  ) {}

  async estimateUserOperationGas({
    unEstimatedUserOperation,
    baseFeePerGas,
    stateOverrides,
    partialOptions,
  }: EstimateUserOperationGasParams): Promise<EstimateUserOperationGasResult> {
    // Override the user operation with the simulation options
    const unsafeUserOperation = this.overrideUserOperationForSimulation(
      unEstimatedUserOperation
    );

    // Then check if it's valid
    const userOperation = validateUserOperation(unsafeUserOperation);

    // Determine the EP version based on the user operation
    let entryPointVersion = this.determineEntryPointVersion(userOperation);

    // Merge the default options with the partial options provided by the user
    const options = this.mergeEstimateUserOperationGasOptions(
      entryPointVersion,
      partialOptions
    );

    // if the target chain supports state overrides,
    // override the sender balance so simulation doesn't throw balance errors
    if (options.overrideSenderBalance) {
      stateOverrides = this.overrideSenderBalance(
        stateOverrides,
        userOperation.sender,
        parseEther("100000000")
      );
    }

    // Estimate the gas based on the EP version
    if (isUserOperationV6(userOperation)) {
      return this.estimateUserOperationGasV6(
        userOperation,
        stateOverrides,
        baseFeePerGas,
        options
      );
    }

    return this.estimateUserOperationGasV7(
      userOperation,
      stateOverrides,
      baseFeePerGas,
      options
    );
  }

  private overrideSenderBalance(
    stateOverrides: StateOverrideSet | undefined,
    senderAddress: Address,
    balance: bigint
  ) {
    const balanceOverride = {
      [senderAddress]: {
        balance: toHex(balance),
      },
    };

    return stateOverrides
      ? {
          ...stateOverrides,
          ...balanceOverride,
        }
      : balanceOverride;
  }

  private determineEntryPointVersion(
    userOperation: UserOperation
  ): EntryPointVersion {
    return isUserOperationV6(userOperation)
      ? EntryPointVersion.v060
      : EntryPointVersion.v070;
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

  private async estimateUserOperationGasV7(
    userOperation: UserOperationV7,
    stateOverrides: StateOverrideSet | undefined,
    baseFeePerGas: bigint,
    options: EstimateUserOperationGasOptions
  ) {
    const entryPoint = this.entryPoints[EntryPointVersion.v070].contract;

    const [executionResult, preVerificationGas, executionGas] =
      await Promise.all([
        entryPoint.simulateHandleOp({
          userOperation,
          targetAddress: options.entryPointAddress,
          targetCallData: "0x",
          stateOverrides,
        }),
        this.estimatePreVerificationGas(userOperation, baseFeePerGas),
        this.rpcClient.estimateGas({
          account: options.entryPointAddress,
          to: userOperation.sender,
          data: userOperation.callData,
        }),
      ]);

    let { verificationGasLimit } = this.estimateVerificationAndCallGasLimits(
      userOperation,
      executionResult
    );

    const paymasterVerificationGasLimit = userOperation.paymaster
      ? verificationGasLimit
      : 0n;

    const paymasterPostOpGasLimit = userOperation.paymaster
      ? verificationGasLimit
      : 0n;

    let callGasLimit = executionGas;

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
    baseFeePerGas: bigint,
    options: EstimateUserOperationGasOptions
  ) {
    if (options.useBinarySearch && userOperation.initCode === "0x") {
      return this.useBinarySearch(
        userOperation,
        baseFeePerGas,
        options,
        stateOverrides
      );
    }

    userOperation.maxPriorityFeePerGas = userOperation.maxFeePerGas;

    const entryPoint = this.entryPoints[EntryPointVersion.v060].contract;

    const [executionResult, preVerificationGas] = await Promise.all([
      entryPoint.simulateHandleOp({
        userOperation,
        targetAddress: options.entryPointAddress,
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
    options: EstimateUserOperationGasOptions,
    stateOverrides?: StateOverrideSet
  ): Promise<EstimateUserOperationGasResult> {
    const entryPoint = this.entryPoints[EntryPointVersion.v060].simulations;

    const [verificationGasLimitResult, callGasLimit, preVerificationGas] =
      await Promise.all([
        entryPoint.estimateVerificationGasLimit({
          userOperation: userOperation,
          stateOverrides,
          entryPointAddress: options.entryPointAddress,
        }),
        entryPoint.estimateCallGasLimit({
          userOperation: userOperation,
          stateOverrides,
          entryPointAddress: options.entryPointAddress,
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

  mergeEstimateUserOperationGasOptions(
    entryPointVersion: EntryPointVersion,
    options?: Partial<EstimateUserOperationGasOptions>
  ): EstimateUserOperationGasOptions {
    const chain = supportedChains[this.chainId];

    const entryPointAddress =
      options?.entryPointAddress ||
      this.entryPoints[entryPointVersion].contract.address;

    const useBinarySearch =
      options?.useBinarySearch ||
      (chain.stateOverrideSupport.balance &&
        chain.stateOverrideSupport.bytecode);

    const overrideSenderBalance =
      options?.overrideSenderBalance || chain.stateOverrideSupport.balance;

    return {
      entryPointAddress,
      useBinarySearch,
      overrideSenderBalance,
    };
  }
}
