import {
  type Address,
  type Hex,
  decodeErrorResult,
  encodeFunctionData
} from "viem"

import type { StateOverrideSet } from "../../shared/types"
import { type EntryPointRpcClient, EntryPointVersion } from "../shared/types"
import { type UserOperationV6, userOperationV6Schema } from "./UserOperationV6"
import { ENTRYPOINT_V6_ABI } from "./abi"
import { ENTRYPOINT_V6_ADDRESS } from "./constants"
import {
  type ExecutionResultV6,
  ParseError,
  SimulateHandleOpError,
  errorWithCauseSchema,
  errorWithNestedCauseSchema,
  executionResultSchema
} from "./types"

/**
 * Implementation of the EntryPoint v0.6.0 contract interface.
 * Handles user operations, simulation, and interaction with ERC-4337 compatible smart accounts.
 *
 * @example
 * ```typescript
 * const entryPoint = new EntryPointV6(rpcClient);
 * const result = await entryPoint.simulateHandleOp({
 *   userOperation,
 *   targetAddress: '0x123...',
 *   targetCallData: '0x456...'
 * });
 * ```
 */
export class EntryPointV6 {
  public version = EntryPointVersion.v060
  public abi = ENTRYPOINT_V6_ABI

  /**
   * Creates a new EntryPointV6 instance
   * @param client - The RPC client used to interact with the blockchain
   * @param address - The EntryPoint contract address, defaults to {@link ENTRYPOINT_V6_ADDRESS}
   */
  constructor(
    protected client: EntryPointRpcClient,
    public address: Address = ENTRYPOINT_V6_ADDRESS
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
   * @throws {@link SimulateHandleOpError} if the simulation fails with an error
   *
   * @example
   * ```typescript
   * const result = await entryPoint.simulateHandleOp({
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
  }: SimulateHandleOpParamsV6): Promise<ExecutionResultV6> {
    userOperation = userOperationV6Schema.parse(userOperation)

    const simulateHandleOpParams: any = [
      {
        to: this.address,
        data: encodeFunctionData({
          abi: this.abi,
          functionName: "simulateHandleOp",
          args: [userOperation, targetAddress, targetCallData]
        })
      },
      "latest"
    ]

    if (stateOverrides) {
      simulateHandleOpParams.push(stateOverrides)
    }

    try {
      await this.client.request({
        method: "eth_call",
        params: simulateHandleOpParams
      })
      throw new Error("SimulateHandleOp should always revert")
    } catch (err: any) {
      const data = this.parseRpcRequestErrorData(err)
      return this.parseSimulateHandleOpExecutionResult(data)
    }
  }

  /**
   * Retrieves the nonce for a smart account at the specified key.
   *
   * @param smartAccountAddress - The address of the smart account
   * @param key - Optional key for the nonce, defaults to 0n
   * @returns The current nonce value as a bigint
   *
   * @example
   * ```typescript
   * const nonce = await entryPoint.getNonce('0x123...');
   * const nonceAtKey = await entryPoint.getNonce('0x123...', 1n);
   * ```
   */
  async getNonce(smartAccountAddress: Address, key = 0n): Promise<bigint> {
    return await this.client.readContract({
      address: this.address,
      abi: this.abi,
      functionName: "getNonce",
      args: [smartAccountAddress, key]
    })
  }

  /**
   * Encodes the function data for handling user operations.
   *
   * @param userOperation - The user operation to encode
   * @param beneficiary - The address that will receive the gas refund
   * @returns The encoded function data as a hex string
   *
   * @example
   * ```typescript
   * const encodedData = entryPoint.encodeHandleOpsFunctionData(
   *   userOperation,
   *   '0x123...' // beneficiary address
   * );
   * ```
   */
  encodeHandleOpsFunctionData(
    userOperation: UserOperationV6,
    beneficiary: Address
  ): Hex {
    userOperation = userOperationV6Schema.parse(userOperation)

    return encodeFunctionData({
      abi: this.abi,
      functionName: "handleOps",
      args: [[userOperation], beneficiary]
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
   *   const data = entryPoint.parseRpcRequestErrorData(err);
   * }
   * ```
   */
  protected parseRpcRequestErrorData(err: unknown) {
    let data: Hex = "0x"

    // parse error.cause
    const parseResult = errorWithCauseSchema.safeParse(err)
    if (parseResult.success) {
      const { cause } = parseResult.data
      data = cause.data as Hex
    } else {
      // otherwise try to parse error.cause.cause
      const nestedParseResult = errorWithNestedCauseSchema.safeParse(err)
      if (nestedParseResult.success) {
        const { cause } = nestedParseResult.data
        data = cause.cause.data as Hex
      }
    }

    // If we couldn't parse the error, throw a ParseError
    if (data === "0x") {
      throw new ParseError(err)
    }

    return data
  }

  /**
   * Parses the execution result from simulateHandleOp's revert data.
   *
   * @param data - The revert data from simulateHandleOp
   * @returns The parsed execution result
   * @throws {@link SimulateHandleOpError} if the simulation failed with an error
   * @throws {@link ParseError} if the result cannot be parsed
   *
   * @example
   * ```typescript
   * const result = entryPoint.parseSimulateHandleOpExecutionResult('0x...');
   * ```
   */
  protected parseSimulateHandleOpExecutionResult(data: Hex): ExecutionResultV6 {
    if (data.includes("Incorrect parameters count")) {
      throw new SimulateHandleOpError(
        `RPC failed to perform a state override with message: ${data}. This is likely temporary, try again later.`
      )
    }

    const decodedError = decodeErrorResult({
      abi: this.abi,
      data: data as Hex
    })

    if (decodedError.args == null) {
      throw new ParseError(decodedError)
    }

    if (decodedError.errorName !== "ExecutionResult") {
      throw new SimulateHandleOpError(
        decodedError.args
          ? (decodedError.args[1] as string)
          : decodedError.errorName
      )
    }

    const parseResult = executionResultSchema.safeParse(decodedError.args)
    if (!parseResult.success) {
      throw new ParseError(decodedError.args)
    }

    return parseResult.data
  }
}

/**
 * Parameters for the simulateHandleOp method
 */
export interface SimulateHandleOpParamsV6 {
  /** The user operation to simulate */
  userOperation: UserOperationV6
  /** The target contract address for the simulation */
  targetAddress: Address
  /** The calldata to be executed on the target contract */
  targetCallData: Hex
  /** Optional state overrides to modify blockchain state during simulation */
  stateOverrides?: StateOverrideSet
}
