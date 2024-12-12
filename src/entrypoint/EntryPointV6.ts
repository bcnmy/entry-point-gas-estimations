import {
  Address,
  decodeErrorResult,
  encodeFunctionData,
  Hex,
  PublicClient,
} from "viem";

import { entryPointAbis } from "./abi";
import {
  SimulateHandleOpError,
  EntryPointVersion,
  errorWithCauseSchema,
  errorWithNestedCauseSchema,
  ExecutionResult,
  executionResultSchema,
  ParseError,
  BalanceStateOverride,
  EntryPointStateOverride,
} from "./types";
import { UserOperation as UserOperationV6 } from "../gas-estimator/entry-point-v6";
import { defaultEntryPointAddresses } from "./constants";

export class EntryPointV6 {
  public version = EntryPointVersion.V006;
  public abi = entryPointAbis[EntryPointVersion.V006];

  constructor(
    protected client: RpcClient,
    public address: Address = defaultEntryPointAddresses[EntryPointVersion.V006]
  ) {}

  // TODO: Add support for additional state overrides provided by the user
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
    balanceStateOverride,
    entryPointStateOverride,
  }: SimulateHandleOpParams): Promise<ExecutionResult> {
    // We call simulate handle op with the user operation data
    const data = encodeFunctionData({
      abi: this.abi,
      functionName: "simulateHandleOp",
      args: [userOperation, userOperation.sender, userOperation.callData],
    });

    const ethCallParams: any = [
      {
        to: this.address,
        data,
      },
      "latest",
    ];

    if (balanceStateOverride) {
      ethCallParams.push(balanceStateOverride);
    }

    if (entryPointStateOverride) {
      ethCallParams.push(entryPointStateOverride);
    }

    try {
      await this.client.request({
        method: "eth_call",
        params: ethCallParams,
      });
      throw new Error("SimulateHandleOp should always revert");
    } catch (err) {
      return this.parseSimulateHandleOpError(err);
    }
  }

  /**
   * Since simulateHandleOp always reverts, we need to parse the error data to get the ExecutionResult
   * @param err Unknown error format that we try to parse safely
   * @returns ExecutionResult
   */
  parseSimulateHandleOpError(err: unknown): ExecutionResult {
    const data = this.parseErrorData(err);
    return this.parseExecutionResult(data);
  }

  /**
   * Parse the error data to get the ExecutionResult using various error formats
   * observed by testing on different networks & RPC providers
   * @param err Unknown error format that we try to parse safely
   * @returns
   */
  parseErrorData(err: unknown) {
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
  parseExecutionResult(data: Hex): ExecutionResult {
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
  balanceStateOverride?: BalanceStateOverride;
  entryPointStateOverride?: EntryPointStateOverride;
}

export type RpcClient = Pick<PublicClient, "request" | "chain">;
