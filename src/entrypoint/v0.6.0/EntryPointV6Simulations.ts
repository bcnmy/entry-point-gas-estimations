import {
  type Address,
  type Hex,
  RpcError,
  type RpcStateOverride,
  decodeErrorResult,
  encodeFunctionData
} from "viem"
import type { StateOverrideSet } from "../../shared/types"
import type { EntryPointRpcClient } from "../shared/types"
import { cleanUpRevertReason, mergeStateOverrides } from "../shared/utils"
import { EntryPointV6 } from "./EntryPointV6"
import { type UserOperationV6, userOperationV6Schema } from "./UserOperationV6"
import {
  CALL_GAS_ESTIMATION_SIMULATOR,
  VERIFICATION_GAS_ESTIMATION_SIMULATOR
} from "./abi"
import {
  CALL_GAS_LIMIT_BINARY_SEARCH_BYTECODE,
  VERIFICATION_GAS_LIMIT_BINARY_SEARCH_BYTECODE
} from "./bytecode"
import {
  CALL_DATA_EXECUTION_AT_MAX_GAS,
  CGL_ROUNDING,
  ENTRYPOINT_V6_ADDRESS,
  INITIAL_CGL_LOWER_BOUND,
  INITIAL_CGL_UPPER_BOUND,
  INITIAL_VGL_LOWER_BOUND,
  INITIAL_VGL_UPPER_BOUND,
  VALIDATION_ERRORS,
  VERIFICATION_EXECUTION_AT_MAX_GAS,
  VGL_ROUNDING
} from "./constants"
import { type ExecutionResultV6, SimulateHandleOpError } from "./types"

/**
 * Extension of EntryPointV6 that provides gas estimation simulations for user operations.
 * Implements binary search algorithms for estimating verification and call gas limits.
 *
 * @extends EntryPointV6
 *
 * @example
 * ```typescript
 * const simulator = new EntryPointV6Simulations(rpcClient);
 * const gasEstimate = await simulator.estimateVerificationGasLimit({
 *   userOperation: userOp,
 *   stateOverrides: overrides
 * });
 * ```
 */
export class EntryPointV6Simulations extends EntryPointV6 {
  /**
   * Creates a new EntryPointV6Simulations instance
   *
   * @param client - The RPC client used for blockchain interactions
   * @param address - The EntryPoint contract address, defaults to {@link ENTRYPOINT_V6_ADDRESS}
   * @param verificationGasEstimationSimulatorByteCode - Bytecode for verification gas estimation simulator
   * @param callGasEstimationSimulatorByteCode - Bytecode for call gas estimation simulator
   */
  constructor(
    client: EntryPointRpcClient,
    public address: Address = ENTRYPOINT_V6_ADDRESS,
    /**
     * the bytecode of the contract that extends the Entry Point contract and
     * implements the binary search logic for Verification Gas Limit estimation
     * @defaultValue is stored in bytecode.ts
     */
    private verificationGasEstimationSimulatorByteCode: Hex = VERIFICATION_GAS_LIMIT_BINARY_SEARCH_BYTECODE,
    /**
     * the bytecode of the contract that extends the Entry Point contract and
     * implements the binary search logic for Call Gas Limit estimation
     * @defaultValue is stored in bytecode.ts
     */
    private callGasEstimationSimulatorByteCode: Hex = CALL_GAS_LIMIT_BINARY_SEARCH_BYTECODE
  ) {
    super(client, address)
  }

  /**
   * Estimates the verification gas limit for a user operation using binary search.
   * Also returns the valid time window for the operation.
   *
   * @param params - The estimation parameters
   * @param params.userOperation - The user operation to estimate gas for
   * @param params.stateOverrides - Optional state overrides for the simulation
   * @param params.entryPointAddress - Optional custom entry point address
   *
   * @returns Object containing verification gas limit and validity window
   * @throws {Error} If initCode is not empty (unsupported for non-deployed accounts)
   * @throws {SimulateHandleOpError} If simulation fails
   * @throws {UnknownError} If an unexpected error occurs
   *
   * @example
   * ```typescript
   * const estimate = await simulator.estimateVerificationGasLimit({
   *   userOperation: {
   *     sender: '0x123...',
   *     nonce: '0x1',
   *     // ... other fields
   *   },
   *   stateOverrides: {
   *     // Optional state modifications
   *   }
   * });
   * ```
   */
  async estimateVerificationGasLimit({
    userOperation,
    stateOverrides,
    entryPointAddress
  }: EstimateVerificationGasLimitParams): Promise<EstimateVerificationGasLimitResult> {
    if (userOperation.initCode !== "0x") {
      throw new Error(
        "binary search is not supported when initCode is not 0x, because it will throw AA20 account not deployed"
      )
    }
    // check if userOperation is valid
    userOperation = userOperationV6Schema.parse(userOperation)

    // Allow custom entry point address passed by the client
    const targetEntryPointAddress = entryPointAddress || this.address

    // first iteration should run at max vgl
    userOperation.verificationGasLimit = INITIAL_VGL_UPPER_BOUND

    // encode the function data for eth_call of our custom verification gas limit (VGL) binary search contract
    const data = encodeFunctionData({
      abi: VERIFICATION_GAS_ESTIMATION_SIMULATOR,
      functionName: "estimateVerificationGas",
      args: [
        {
          op: userOperation,
          minGas: INITIAL_VGL_LOWER_BOUND,
          maxGas: INITIAL_VGL_UPPER_BOUND,
          rounding: VGL_ROUNDING,
          isContinuation: VERIFICATION_EXECUTION_AT_MAX_GAS
        }
      ]
    })

    // Allow custom state overrides passed by the client
    const finalStateOverrideSet = mergeStateOverrides(
      // Override the entry point code with the VGL simulator code
      {
        [targetEntryPointAddress]: {
          code: this.verificationGasEstimationSimulatorByteCode
        }
      },
      stateOverrides
    )

    try {
      await this.client.request({
        method: "eth_call",
        params: [
          { to: targetEntryPointAddress, data },
          "latest",
          finalStateOverrideSet as RpcStateOverride
        ]
      })

      throw new Error("EstimateVerificationGasLimit should always revert")
    } catch (err) {
      const data = this.parseRpcRequestErrorData(err)
      return this.parseEstimateVerificationGasLimitResult(data)
    }
  }

  /**
   * Estimates the call gas limit for a user operation using binary search.
   *
   * @param params - The estimation parameters
   * @param params.userOperation - The user operation to estimate gas for
   * @param params.stateOverrides - Optional state overrides for the simulation
   * @param params.entryPointAddress - Optional custom entry point address
   *
   * @returns The estimated call gas limit as a bigint
   * @throws {Error} If initCode is not empty (unsupported for non-deployed accounts)
   * @throws {RpcError} If the user operation reverts during execution
   *
   * @example
   * ```typescript
   * const callGas = await simulator.estimateCallGasLimit({
   *   userOperation: userOp,
   *   stateOverrides: {
   *     // Optional state modifications
   *   }
   * });
   * ```
   */
  async estimateCallGasLimit({
    userOperation,
    stateOverrides,
    entryPointAddress
  }: EstimateVerificationGasLimitParams): Promise<bigint> {
    if (userOperation.initCode !== "0x") {
      throw new Error(
        "binary search is not supported for non-deployed smart accounts"
      )
    }

    // Allow custom entry point address passed by the client
    const targetEntryPointAddress = entryPointAddress || this.address

    // Setting callGasLimit to 0 to make sure call data is not executed by the Entry Point code and only
    // done inside the CallGasSimulationExecutor contract
    userOperation.callGasLimit = BigInt(0)

    // encode the function data for eth_call of our custom call gas limit (CGL) binary search contract
    const estimateCallGasLimitCallData = encodeFunctionData({
      abi: CALL_GAS_ESTIMATION_SIMULATOR,
      functionName: "estimateCallGas",
      args: [
        {
          sender: userOperation.sender,
          callData: userOperation.callData,
          minGas: INITIAL_CGL_LOWER_BOUND,
          maxGas: INITIAL_CGL_UPPER_BOUND,
          rounding: CGL_ROUNDING,
          isContinuation: CALL_DATA_EXECUTION_AT_MAX_GAS
        }
      ]
    })

    // Allow custom state overrides passed by the client
    const finalStateOverrideSet = mergeStateOverrides(
      // Override the entry point code with the CGL simulator code
      {
        [targetEntryPointAddress]: {
          code: this.callGasEstimationSimulatorByteCode
        }
      },
      stateOverrides
    )

    const executionResult = await this.simulateHandleOp({
      userOperation,
      targetAddress: targetEntryPointAddress,
      targetCallData: estimateCallGasLimitCallData,
      stateOverrides: finalStateOverrideSet
    })

    return this.parseEstimateCallGasLimitResult(executionResult)
  }

  /**
   * Parses the result from call gas limit estimation.
   *
   * @param data - The execution result from the simulation
   * @returns The estimated call gas limit
   * @throws {RpcError} If the estimation fails or returns an unknown error
   *
   * @internal
   */
  parseEstimateCallGasLimitResult(data: ExecutionResultV6) {
    const result = decodeErrorResult({
      abi: CALL_GAS_ESTIMATION_SIMULATOR,
      data: data.targetResult
    })

    if (result.errorName === "EstimateCallGasRevertAtMax") {
      throw new RpcError(
        new Error("UserOperation reverted during execution phase"),
        {
          code: VALIDATION_ERRORS.SIMULATE_VALIDATION_FAILED,
          shortMessage: "UserOperation reverted during execution phase"
        }
      )
    }

    if (result.errorName === "EstimateCallGasContinuation") {
      return (result.args[0] + result.args[1]) / 2n
    }

    if (result.errorName === "EstimateCallGasResult") {
      return result.args[0]
    }

    throw new RpcError(new Error("Unknown estimateCallGas error"), {
      code: VALIDATION_ERRORS.SIMULATE_VALIDATION_FAILED,
      shortMessage: result.errorName
    })
  }

  /**
   * Parses the result from verification gas limit estimation.
   *
   * @param data - The hex data from the simulation revert
   * @returns Object containing verification gas limit and validity window
   * @throws {SimulateHandleOpError} If RPC fails to perform state override
   * @throws {RpcError} If operation validation fails
   * @throws {UnknownError} If an unexpected error occurs
   *
   * @internal
   */
  parseEstimateVerificationGasLimitResult(
    data: Hex
  ): EstimateVerificationGasLimitResult {
    // This was observed on Gnosis (sometimes), most of the time it works fine
    if (data.includes("Incorrect parameters count")) {
      throw new SimulateHandleOpError(
        `RPC failed to perform a state override with message: ${data}`
      )
    }

    const decodedError = decodeErrorResult({
      abi: VERIFICATION_GAS_ESTIMATION_SIMULATOR,
      data
    })

    if (
      decodedError.errorName === "FailedOp" ||
      decodedError.errorName === "FailedOpError"
    ) {
      const data =
        typeof decodedError.args[0] === "string"
          ? (decodedError.args[0] as Hex)
          : (decodedError.args[0].toString(16) as Hex)

      const secondDecode = decodeErrorResult({
        abi: VERIFICATION_GAS_ESTIMATION_SIMULATOR,
        data
      })

      this.handleFailedOp(secondDecode.args[1] as string)
    }

    if (decodedError.errorName === "EstimateVerificationGasResult") {
      return {
        verificationGasLimit: decodedError.args[0],
        validAfter: decodedError.args[1],
        validUntil: decodedError.args[2]
      }
    }

    if (decodedError.errorName === "EstimateVerificationGasContinuation") {
      return {
        verificationGasLimit:
          (decodedError.args[0] + decodedError.args[1]) / 2n,
        validAfter: decodedError.args[2],
        validUntil: decodedError.args[3]
      }
    }

    throw new UnknownError(
      decodedError.errorName,
      decodedError.args?.toString()
    )
  }

  /**
   * Handles failed operation errors and throws appropriate exceptions.
   *
   * @param revertReason - The revert reason string
   * @throws {RpcError} With appropriate error code based on the AA error type
   *
   * @internal
   */
  private handleFailedOp(revertReason: string) {
    revertReason = cleanUpRevertReason(revertReason)
    if (revertReason.includes("AA1") || revertReason.includes("AA2")) {
      throw new RpcError(new Error(revertReason), {
        code: VALIDATION_ERRORS.SIMULATE_VALIDATION_FAILED,
        shortMessage: revertReason
      })
    }
    if (revertReason.includes("AA3")) {
      throw new RpcError(new Error(revertReason), {
        code: VALIDATION_ERRORS.SIMULATE_PAYMASTER_VALIDATION_FAILED,
        shortMessage: revertReason
      })
    }
    if (revertReason.includes("AA9")) {
      throw new RpcError(new Error(revertReason), {
        code: VALIDATION_ERRORS.WALLET_TRANSACTION_REVERTED,
        shortMessage: revertReason
      })
    }
    if (revertReason.includes("AA4")) {
      throw new RpcError(new Error(revertReason), {
        code: VALIDATION_ERRORS.SIMULATE_VALIDATION_FAILED,
        shortMessage: revertReason
      })
    }
    if (revertReason.includes("AA")) {
      throw new RpcError(new Error(revertReason), {
        code: VALIDATION_ERRORS.SIMULATE_VALIDATION_FAILED,
        shortMessage: revertReason
      })
    }
    throw new RpcError(new Error(revertReason), {
      code: VALIDATION_ERRORS.SIMULATE_VALIDATION_FAILED,
      shortMessage: revertReason
    })
  }
}

/**
 * Custom error class for unknown estimation errors
 */
class UnknownError extends Error {
  constructor(
    public errorName: string,
    public errorReason: string
  ) {
    super(`Unknown error: ${errorName} - ${errorReason}`)
  }
}

/**
 * Parameters for gas estimation methods
 */
export interface EstimateVerificationGasLimitParams {
  /** The user operation to estimate gas for */
  userOperation: UserOperationV6
  /** Optional state overrides for the simulation */
  stateOverrides?: StateOverrideSet
  /** Optional custom entry point address */
  entryPointAddress?: Address
}

/**
 * Result of verification gas limit estimation
 */
export interface EstimateVerificationGasLimitResult {
  /** The estimated verification gas limit */
  verificationGasLimit: bigint
  /** Timestamp after which the operation becomes valid */
  validAfter: number
  /** Timestamp until which the operation remains valid */
  validUntil: number
}
