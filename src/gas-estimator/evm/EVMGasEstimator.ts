import { isExecutionResultV6 } from "../../entrypoint/v0.6.0/types";
import {
  packUserOpV6,
  UserOperationV6,
} from "../../entrypoint/v0.6.0/UserOperationV6";
import { ByteArray, parseEther, toBytes } from "viem";

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
  SimulationLimits,
  UnEstimatedUserOperation,
} from "../GasEstimator";
import { INNER_GAS_OVERHEAD } from "../../entrypoint/v0.7.0/constants";
import {
  defaultGasOverheads,
  SIMULATION_CALL_GAS_LIMIT,
  SIMULATION_PRE_VERIFICATION_GAS,
  SIMULATION_VERIFICATION_GAS_LIMIT,
} from "./constants";
import { SupportedChain } from "../../chains/types";
import { StateOverrideBuilder } from "../../entrypoint/shared/stateOverrides";
import { getPaymasterAddressFromPaymasterAndData } from "../../paymaster/utils";

export class EVMGasEstimator implements GasEstimator {
  constructor(
    public chain: SupportedChain,
    protected rpcClient: GasEstimatorRpcClient,
    public entryPoints: EntryPoints,
    public simulationLimits: SimulationLimits = {
      callGasLimit: SIMULATION_CALL_GAS_LIMIT,
      preVerificationGas: SIMULATION_PRE_VERIFICATION_GAS,
      verificationGasLimit: SIMULATION_VERIFICATION_GAS_LIMIT,
    },
  ) {}

  async estimateUserOperationGas({
    unEstimatedUserOperation,
    baseFeePerGas,
    stateOverrides,
    options,
  }: EstimateUserOperationGasParams): Promise<EstimateUserOperationGasResult> {
    // Override the user operation with the simulation options
    const unsafeUserOperation = this.overrideUserOperationForSimulation(
      unEstimatedUserOperation,
    );

    // Then check if it's valid
    const userOperation = validateUserOperation(unsafeUserOperation);

    // Determine the EP version based on the user operation
    let entryPointVersion = this.determineEntryPointVersion(userOperation);

    // Merge the default options with the partial options provided by the user
    const fullOptions = this.mergeEstimateUserOperationGasOptions(
      entryPointVersion,
      options,
    );

    // if the target chain supports state overrides,
    // override the sender balance so simulation doesn't throw balance errors
    if (!fullOptions.simulation && this.chain.stateOverrideSupport.balance) {
      stateOverrides = new StateOverrideBuilder(stateOverrides)
        .overrideBalance(userOperation.sender, parseEther("100000000"))
        .build();
    }

    // Estimate the gas based on the EP version
    if (isUserOperationV6(userOperation)) {
      return this.estimateUserOperationGasV6(
        userOperation,
        stateOverrides,
        baseFeePerGas,
        fullOptions,
      );
    }

    return this.estimateUserOperationGasV7(
      userOperation,
      stateOverrides,
      baseFeePerGas,
      fullOptions,
    );
  }

  private determineEntryPointVersion(
    userOperation: UserOperation,
  ): EntryPointVersion {
    return isUserOperationV6(userOperation)
      ? EntryPointVersion.v060
      : EntryPointVersion.v070;
  }

  private overrideUserOperationForSimulation(
    unEstimatedUserOperation: UnEstimatedUserOperation,
  ): UserOperation {
    const userOperation: UserOperation = {
      ...unEstimatedUserOperation,
      preVerificationGas: this.simulationLimits.preVerificationGas,
      verificationGasLimit: this.simulationLimits.verificationGasLimit,
      callGasLimit: this.simulationLimits.callGasLimit,
    };

    return userOperation;
  }

  private async estimateUserOperationGasV7(
    userOperation: UserOperationV7,
    stateOverrides: StateOverrideSet | undefined,
    baseFeePerGas: bigint,
    options: EstimateUserOperationGasOptions,
  ) {
    const entryPoint = this.entryPoints[EntryPointVersion.v070].contract;

    if (
      !options.simulation &&
      userOperation.paymaster &&
      this.chain.stateOverrideSupport.stateDiff
    ) {
      stateOverrides = new StateOverrideBuilder(stateOverrides)
        .overridePaymasterDeposit(entryPoint.address, userOperation.paymaster)
        .build();
    }

    // // To avoid problems with variable fees per gas
    // const constantGasFeeUserOperation = {
    //   ...userOperation,
    //   maxFeePerGas: 1n,
    //   maxPriorityFeePerGas: 1n,
    // };
    userOperation.maxPriorityFeePerGas = userOperation.maxFeePerGas;

    const [executionResult, preVerificationGas, executionGas] =
      await Promise.all([
        entryPoint.simulateHandleOp({
          // userOperation: constantGasFeeUserOperation,
          userOperation,
          targetAddress: options.entryPointAddress,
          targetCallData: "0x",
          stateOverrides,
        }),
        // use the actual user operation to estimate the preVerificationGas, because it depends on maxFeePerGas
        this.estimatePreVerificationGas(userOperation, baseFeePerGas),
        this.rpcClient.estimateGas({
          account: options.entryPointAddress,
          to: userOperation.sender,
          data: userOperation.callData,
        }),
      ]);

    // userOperation.preVerificationGas = preVerificationGas;

    let { verificationGasLimit } = this.estimateVerificationAndCallGasLimits(
      // constantGasFeeUserOperation,
      userOperation,
      executionResult,
    );

    const paymasterVerificationGasLimit = userOperation.paymaster
      ? verificationGasLimit
      : 0n;

    const paymasterPostOpGasLimit = userOperation.paymaster
      ? this.chain.paymasters?.v070?.[userOperation.paymaster]
          ?.postOpGasLimit || verificationGasLimit
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
    options: EstimateUserOperationGasOptions,
  ) {
    if (options.useBinarySearch && userOperation.initCode === "0x") {
      return this.useBinarySearch(
        userOperation,
        baseFeePerGas,
        options,
        stateOverrides,
      );
    }

    // // To avoid problems with variable baseFeePerGas
    // const constantGasFeeUserOperation = {
    //   ...userOperation,
    //   maxFeePerGas: 1n,
    //   maxPriorityFeePerGas: 1n,
    // };
    userOperation.maxPriorityFeePerGas = userOperation.maxFeePerGas;

    const entryPoint = this.entryPoints[EntryPointVersion.v060].contract;

    if (
      !options.simulation &&
      userOperation.paymasterAndData !== "0x" &&
      this.chain.stateOverrideSupport.stateDiff
    ) {
      stateOverrides = new StateOverrideBuilder(stateOverrides)
        .overridePaymasterDeposit(
          entryPoint.address,
          getPaymasterAddressFromPaymasterAndData(
            userOperation.paymasterAndData,
          ),
        )
        .build();
    }

    const [executionResult, preVerificationGas] = await Promise.all([
      entryPoint.simulateHandleOp({
        // userOperation: constantGasFeeUserOperation,
        userOperation,
        targetAddress: options.entryPointAddress,
        targetCallData: "0x",
        stateOverrides,
      }),
      this.estimatePreVerificationGas(userOperation, baseFeePerGas),
    ]);

    let { callGasLimit, verificationGasLimit, validAfter, validUntil } =
      this.estimateVerificationAndCallGasLimits(
        // constantGasFeeUserOperation,
        userOperation,
        executionResult,
      );

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
    stateOverrides?: StateOverrideSet,
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
    executionResult: ExecutionResult,
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
    baseFeePerGas?: bigint,
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

    return preVerificationGas;
  }

  mergeEstimateUserOperationGasOptions(
    entryPointVersion: EntryPointVersion,
    options?: Partial<EstimateUserOperationGasOptions>,
  ): EstimateUserOperationGasOptions {
    const entryPointAddress =
      options?.entryPointAddress ||
      this.entryPoints[entryPointVersion].contract.address;

    const simulation = options?.simulation || false;

    const useBinarySearch =
      options?.useBinarySearch != null
        ? options.useBinarySearch
        : this.chain.stateOverrideSupport.bytecode;

    return {
      entryPointAddress,
      simulation,
      useBinarySearch,
    };
  }
}
