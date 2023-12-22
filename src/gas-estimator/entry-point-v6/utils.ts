/* eslint-disable @typescript-eslint/no-shadow */
import { decodeErrorResult } from "viem";
import { EXECUTE_SIMULATOR_ABI } from "./abi";
import { ExecutionResult } from "./types";

export class RpcError extends Error {
  code?: number;

  data?: any;

  // error codes from: https://eips.ethereum.org/EIPS/eip-1474
  constructor(msg: string, code?: number, data: any = undefined) {
      super(msg);

      this.code = code;
      this.data = data;
  }
}

export function tooLow(error: string) {
  return (
      error === "AA40 over verificationGasLimit" ||
      error === "AA41 too little verificationGas" ||
      error === "AA51 prefund below actualGasCost" ||
      error === "AA13 initCode failed or OOG" ||
      error === "AA21 didn't pay prefund" ||
      error === "AA23 reverted (or OOG)" ||
      error === "AA33 reverted (or OOG)" ||
      error === "return data out of bounds" ||
      error === "validation OOG"
  );
}

export function getCallExecuteResult(data: ExecutionResult) {
  const callExecuteResult = decodeErrorResult({
    abi: EXECUTE_SIMULATOR_ABI,
    data: data.targetResult
  });

  const success = callExecuteResult.args[0];
  const revertData = callExecuteResult.args[1];
  const gasUsed = callExecuteResult.args[2];

  return {
    success,
    revertData,
    gasUsed
  };
}