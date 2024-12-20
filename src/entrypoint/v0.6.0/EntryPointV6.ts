import { Address, decodeErrorResult, encodeFunctionData, Hex } from "viem";

import {
  SimulateHandleOpError,
  errorWithCauseSchema,
  errorWithNestedCauseSchema,
  ExecutionResultV6,
  executionResultSchema,
  ParseError,
} from "./types";
import { ENTRYPOINT_V6_ABI } from "./abi";
import { ENTRYPOINT_V6_ADDRESS } from "./constants";
import { UserOperationV6, userOperationV6Schema } from "./UserOperationV6";
import { EntryPointRpcClient, EntryPointVersion } from "../shared/types";
import { StateOverrideSet } from "../../shared/types";

export class EntryPointV6 {
  public version = EntryPointVersion.v060;
  public abi = ENTRYPOINT_V6_ABI;

  constructor(
    protected client: EntryPointRpcClient,
    public address: Address = ENTRYPOINT_V6_ADDRESS
  ) {}

  /**
   * SimulateHandleOp always reverts
   * When it's successful it reverts with an "ExecutionResult" error that we need to parse.
   * @param SimulateHandleOpParams
   * @returns ExecutionResult
   * @throws ParseError if the error data can't be parsed
   * @throws EntryPointError if the error data is not an ExecutionResult
   */
  async simulateHandleOp({
    userOperation,
    targetAddress,
    targetCallData,
    stateOverrides,
  }: SimulateHandleOpParams): Promise<ExecutionResultV6> {
    userOperation = userOperationV6Schema.parse(userOperation);

    const simulateHandleOpParams: any = [
      {
        to: this.address,
        data: encodeFunctionData({
          abi: this.abi,
          functionName: "simulateHandleOp",
          args: [userOperation, targetAddress, targetCallData],
        }),
      },
      "latest",
    ];

    if (stateOverrides) {
      simulateHandleOpParams.push(stateOverrides);
    }

    try {
      await this.client.request({
        method: "eth_call",
        params: simulateHandleOpParams,
      });
      throw new Error("SimulateHandleOp should always revert");
    } catch (err: any) {
      const data = this.parseRpcRequestErrorData(err);
      return this.parseSimulateHandleOpExecutionResult(data);
    }
  }

  async getNonce(smartAccountAddress: Address, key = 0n): Promise<bigint> {
    return await this.client.readContract({
      address: this.address,
      abi: this.abi,
      functionName: "getNonce",
      args: [smartAccountAddress, key],
    });
  }

  encodeHandleOpsFunctionData(
    userOperation: UserOperationV6,
    beneficiary: Address
  ): Hex {
    userOperation = userOperationV6Schema.parse(userOperation);

    return encodeFunctionData({
      abi: this.abi,
      functionName: "handleOps",
      args: [[userOperation], beneficiary],
    });
  }

  /**
   * Parse the error data to get the ExecutionResult using various error formats
   * observed by testing on different networks & RPC providers
   * @param err Unknown error format that we try to parse safely
   * @returns
   */
  protected parseRpcRequestErrorData(err: unknown) {
    let data: Hex = "0x";

    // parse error.cause
    const parseResult = errorWithCauseSchema.safeParse(err);
    if (parseResult.success) {
      const { cause } = parseResult.data;
      data = cause.data as Hex;
    } else {
      // otherwise try to parse error.cause.cause
      const nestedParseResult = errorWithNestedCauseSchema.safeParse(err);
      if (nestedParseResult.success) {
        const { cause } = nestedParseResult.data;
        data = cause.cause.data as Hex;
      }
    }

    // If we couldn't parse the error, throw a ParseError
    if (data === "0x") {
      throw new ParseError(err);
    }

    return data;
  }

  /**
   * Try and parse the ExecutionResult returned by simulateHandleOp
   * @param data revert data from simulateHandleOp
   * @returns ExecutionResult
   */
  protected parseSimulateHandleOpExecutionResult(data: Hex): ExecutionResultV6 {
    if (data.includes("Incorrect parameters count")) {
      throw new SimulateHandleOpError(
        `RPC failed to perform a state override with message: ${data}. This is likely temporary, try again later.`
      );
    }

    const decodedError = decodeErrorResult({
      abi: this.abi,
      data: data as Hex,
    });

    if (decodedError.args == null) {
      throw new ParseError(decodedError);
    }

    if (decodedError.errorName !== "ExecutionResult") {
      throw new SimulateHandleOpError(
        decodedError.args
          ? (decodedError.args[1] as string)
          : decodedError.errorName
      );
    }

    const parseResult = executionResultSchema.safeParse(decodedError.args);
    if (!parseResult.success) {
      throw new ParseError(decodedError.args);
    }

    return parseResult.data;
  }
}

interface SimulateHandleOpParams {
  userOperation: UserOperationV6;
  targetAddress: Address;
  targetCallData: Hex;
  stateOverrides?: StateOverrideSet;
}
