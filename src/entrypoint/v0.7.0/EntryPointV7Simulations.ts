import {
  type Address,
  type Hex,
  decodeErrorResult,
  decodeFunctionResult,
  encodeFunctionData
} from "viem"

import type { StateOverrideSet } from "../../shared/types"
import { type EntryPointRpcClient, EntryPointVersion } from "../shared/types"
import { mergeStateOverrides } from "../shared/utils"
import {
  ParseError,
  errorWithCauseSchema,
  errorWithNestedCauseSchema
} from "../v0.6.0/types"
import {
  type UserOperationV7,
  toPackedUserOperation,
  userOperationV7Schema
} from "./UserOperationV7"
import { ENTRYPOINT_V7_SIMULATIONS_ABI } from "./abi"
import { ENTRYPOINT_V7_SIMULATIONS_BYTECODE } from "./bytecode"
import { ENTRYPOINT_V7_ADDRESS } from "./constants"
import type { ExecutionResultV7 } from "./types"

export interface SimulateHandleOpParams {
  userOperation: UserOperationV7
  targetAddress: Address
  targetCallData: Hex
  stateOverrides?: StateOverrideSet
}

/**
 * Implementation of EntryPoint v0.7.0 simulations for user operations.
 * Provides methods for simulating operation execution and handling operation results.
 *
 * @example
 * ```typescript
 * const simulator = new EntryPointV7Simulations(rpcClient);
 * const result = await simulator.simulateHandleOp({
 *   userOperation: userOp,
 *   targetAddress: '0x123...',
 *   targetCallData: '0x456...'
 * });
 * ```
 */
export class EntryPointV7Simulations {
  public version = EntryPointVersion.v070
  public abi = ENTRYPOINT_V7_SIMULATIONS_ABI

  /**
   * Creates a new EntryPointV7Simulations instance
   *
   * @param client - The RPC client used for blockchain interactions
   * @param address - The EntryPoint contract address, defaults to {@link ENTRYPOINT_V7_ADDRESS}
   */
  constructor(
    protected client: EntryPointRpcClient,
    public address: Address = ENTRYPOINT_V7_ADDRESS
  ) {}

  /**
   * Simulates the execution of a user operation. This method always reverts by design,
   * and the execution result is parsed from the revert data.
   *
   * @param params - The simulation parameters
   * @param params.userOperation - The user operation to simulate
   * @param params.targetAddress - The target contract address for the simulation
   * @param params.targetCallData - The calldata to be executed on the target contract
   * @param params.stateOverrides - Optional state overrides to modify blockchain state during simulation
   *
   * @returns The execution result containing validation and execution details
   * @throws {@link ParseError} if the error data cannot be parsed
   * @throws Error if the simulation fails with an error
   *
   * @example
   * ```typescript
   * const result = await simulator.simulateHandleOp({
   *   userOperation: {
   *     sender: '0x123...',
   *     nonce: '0x1',
   *     // ... other UserOperation fields
   *   },
   *   targetAddress: '0x456...',
   *   targetCallData: '0x789...',
   *   stateOverrides: {
   *     // Optional state modifications
   *   }
   * });
   * ```
   */
  async simulateHandleOp({
    userOperation,
    targetAddress,
    targetCallData,
    stateOverrides
  }: SimulateHandleOpParams): Promise<ExecutionResultV7> {
    userOperation = userOperationV7Schema.parse(userOperation)
    const packedUserOperation = toPackedUserOperation(userOperation)

    const simulateHandleOpParams: any = [
      {
        to: this.address,
        data: encodeFunctionData({
          abi: this.abi,
          functionName: "simulateHandleOp",
          args: [packedUserOperation, targetAddress, targetCallData],
        }),
      },
      "latest"
    ]

    const finalStateOverrideSet = mergeStateOverrides(
      {
        [this.address]: {
          code: ENTRYPOINT_V7_SIMULATIONS_BYTECODE as Hex
        }
      },
      stateOverrides
    )

    simulateHandleOpParams.push(finalStateOverrideSet)

    try {
      const simulateHandleOpResult = await this.client.request({
        method: "eth_call",
        params: simulateHandleOpParams
      })

      const decodedResult = decodeFunctionResult({
        abi: this.abi,
        functionName: "simulateHandleOp",
        data: simulateHandleOpResult
      })

      return decodedResult
    } catch (err: any) {
      const data = this.parseRpcRequestErrorData(err)

      const decodedError = decodeErrorResult({
        abi: this.abi,
        data: data
      })

      throw new Error(decodedError.args[1])
    }
  }

  /**
   * Encodes the function data for handling multiple user operations.
   *
   * @param userOperation - The user operation to encode
   * @param beneficiary - The address that will receive the gas refund
   * @returns The encoded function data as a hex string
   *
   * @example
   * ```typescript
   * const encodedData = simulator.encodeHandleOpsFunctionData(
   *   userOperation,
   *   '0x123...' // beneficiary address
   * );
   * ```
   */
  encodeHandleOpsFunctionData(
    userOperation: UserOperationV7,
    beneficiary: Address
  ): Hex {
    const packed = toPackedUserOperation(userOperation)
    return encodeFunctionData({
      abi: this.abi,
      functionName: "handleOps",
      args: [[packed], beneficiary]
    })
  }

  /**
   * Parses RPC request error data from various error formats observed across different
   * networks and RPC providers.
   *
   * @param err - The unknown error format to parse
   * @returns The parsed error data as a hex string
   * @throws {@link ParseError} if the error cannot be parsed
   *
   * @example
   * ```typescript
   * try {
   *   // ... RPC call
   * } catch (err) {
   *   const data = simulator.parseRpcRequestErrorData(err);
   * }
   * ```
   */
  parseRpcRequestErrorData(err: unknown) {
    let data: Hex = "0x"

    const parseResult = errorWithCauseSchema.safeParse(err)
    if (parseResult.success) {
      const { cause } = parseResult.data
      data = cause.data as Hex
    } else {
      const nestedParseResult = errorWithNestedCauseSchema.safeParse(err)
      if (nestedParseResult.success) {
        const { cause } = nestedParseResult.data
        data = cause.cause.data as Hex
      }
    }

    if (data === "0x") {
      throw new ParseError(err)
    }

    return data
  }
}
