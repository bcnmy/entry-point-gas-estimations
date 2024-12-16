import { getAddress, Hash, Hex } from "viem";
import z from "zod";

const hexDataPattern = /^0x[0-9A-Fa-f]*$/;
const addressPattern = /^0x[0-9,a-f,A-F]{40}$/;
export const hexData32Pattern = /^0x([0-9a-fA-F][0-9a-fA-F]){0,32}$/;

export const addressSchema = z
  .string()
  .regex(addressPattern, { message: "not a valid hex address" })
  .transform((val: any) => getAddress(val));

export const hexNumberSchema = z
  .string()
  .regex(hexDataPattern)
  .or(z.number())
  .or(z.bigint())
  .transform((val: any) => BigInt(val));

export const hexDataSchema = z
  .string()
  .regex(hexDataPattern, { message: "not valid hex data" })
  .transform((val: any) => val.toLowerCase() as Hex);

export const hexData32Schema = z
  .string()
  .regex(hexData32Pattern, { message: "not valid 32-byte hex data" })
  .transform((val) => val as Hash);

export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [P in K]?: T[P];
};

export enum ChainStack {
  EVM = "evm",
  Optimism = "optimism",
  Arbitrum = "arbitrum",
  Mantle = "mantle",
}
