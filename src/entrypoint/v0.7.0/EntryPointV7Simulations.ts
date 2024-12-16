import {
  Address,
  decodeErrorResult,
  decodeFunctionResult,
  encodeFunctionData,
  Hex,
  PublicClient,
} from "viem";

import {
  errorWithCauseSchema,
  errorWithNestedCauseSchema,
  ParseError,
  StateOverrideSet,
} from "../v0.6.0/types";
import { ENTRYPOINT_V7_SIMULATIONS_ABI } from "./abi";
import { toPackedUserOperation, UserOperationV7 } from "./UserOperationV7";
import { ENTRYPOINT_V7_SIMULATIONS_BYTECODE } from "./bytecode";
import { ENTRYPOINT_V7_ADDRESS } from "./constants";
import { z } from "zod";
import { ExecutionResultV7 } from "./types";
import { EntryPointVersion } from "../shared/types";

interface SimulateHandleOpParams {
  userOperation: UserOperationV7;
  targetAddress: Address;
  targetCallData: Hex;
  stateOverrides?: StateOverrideSet;
}

export class EntryPointV7Simulations {
  public version = EntryPointVersion.v070;
  public abi = ENTRYPOINT_V7_SIMULATIONS_ABI;

  constructor(
    protected client: RpcClient,
    public address: Address = ENTRYPOINT_V7_ADDRESS
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
    targetAddress,
    targetCallData,
    stateOverrides,
  }: SimulateHandleOpParams): Promise<ExecutionResultV7> {
    const packedUserOperation = toPackedUserOperation(userOperation);

    const simulateHandleOpParams: any = [
      {
        to: this.address,
        data: encodeFunctionData({
          abi: this.abi,
          functionName: "simulateHandleOp",
          args: [packedUserOperation, targetAddress, targetCallData],
        }),
      },
      "latest",
    ];

    let finalStateOverrideSet: StateOverrideSet = {};

    const simulationsBytecodeStateOverride = {
      [this.address]: {
        code: ENTRYPOINT_V7_SIMULATIONS_BYTECODE as Hex,
      },
    };

    if (stateOverrides) {
      finalStateOverrideSet = {
        ...simulationsBytecodeStateOverride,
        ...stateOverrides,
      };
    } else {
      finalStateOverrideSet = { ...simulationsBytecodeStateOverride };
    }

    simulateHandleOpParams.push(finalStateOverrideSet);

    try {
      const simulateHandleOpResult = await this.client.request({
        method: "eth_call",
        params: simulateHandleOpParams,
      });

      const decodedResult = decodeFunctionResult({
        abi: this.abi,
        functionName: "simulateHandleOp",
        data: simulateHandleOpResult,
      });

      return decodedResult;
    } catch (err: any) {
      // TODO: Handle AA23 reverted by writing a test without a balance override
      const data = this.parseRpcRequestErrorData(err);

      const decodedError = decodeErrorResult({
        abi: this.abi,
        data: data,
      });

      throw new Error(decodedError.args[1]);
    }
  }

  encodeHandleOpsFunctionData(
    userOperation: UserOperationV7,
    beneficiary: Address
  ): Hex {
    const packed = toPackedUserOperation(userOperation);
    return encodeFunctionData({
      abi: this.abi,
      functionName: "handleOps",
      args: [[packed], beneficiary],
    });
  }

  /**
   * Parse the error data to get the ExecutionResult using various error formats
   * observed by testing on different networks & RPC providers
   * @param err Unknown error format that we try to parse safely
   * @returns
   */
  parseRpcRequestErrorData(err: unknown) {
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
}

export type RpcClient = Pick<PublicClient, "request" | "chain">;
