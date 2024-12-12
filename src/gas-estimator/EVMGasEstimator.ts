import { defaultEntryPointContracts } from "../entrypoint/constants";
import {
  createEntryPointContract,
  CreateEntryPointContractParams,
} from "../entrypoint/factory";
import { EntryPointContracts, EntryPointVersion } from "../entrypoint/types";
import {
  EstimateUserOperationGasResult,
  GasEstimatesV6,
  GasEstimatesV7,
} from "./estimates";

export class EVMGasEstimator {
  constructor(public entryPointContracts: EntryPointContracts) {}

  async estimateUserOperationGas<T extends EstimateUserOperationGasResult>(
    version: EntryPointVersion
  ): Promise<T> {
    const callGasLimit = 0n;
    const verificationGasLimit = 0n;
    const preVerificationGas = 0n;
    const validAfter = 0;
    const validUntil = 0;
    const paymasterVerificationGasLimit = 0n;
    const paymasterPostOpGasLimit = 0n;

    switch (version) {
      case EntryPointVersion.V006:
        const estimateV6 = await this.estimateUserOperationGasV6();
        return estimateV6 as T;
      case EntryPointVersion.V007:
        const estimateV7 = await this.estimateUserOperationGasV7();
        return estimateV7 as T;
      default:
        throw new Error(`Unsupported entry point version: ${version}`);
    }
  }

  async estimateUserOperationGasV6(): Promise<GasEstimatesV6> {
    const callGasLimit = 0n;
    const verificationGasLimit = 0n;
    const preVerificationGas = 0n;
    const validAfter = 0;
    const validUntil = 0;

    return {
      callGasLimit,
      verificationGasLimit,
      preVerificationGas,
      validAfter,
      validUntil,
    };
  }

  async estimateUserOperationGasV7(): Promise<GasEstimatesV7> {
    const callGasLimit = 0n;
    const verificationGasLimit = 0n;
    const preVerificationGas = 0n;
    const validAfter = 0;
    const validUntil = 0;
    const paymasterVerificationGasLimit = 0n;
    const paymasterPostOpGasLimit = 0n;

    return {
      callGasLimit,
      verificationGasLimit,
      preVerificationGas,
      validAfter,
      validUntil,
      paymasterVerificationGasLimit,
      paymasterPostOpGasLimit,
    };
  }
}

export function createEVMGasEstimator(params: CreateGasEstimatorParams) {
  let entryPointContracts: EntryPointContracts;
  // If the client didn't provide any entry points, use the default entry points.
  if (params.entryPoints == null) {
    entryPointContracts = defaultEntryPointContracts;
  } else {
    // If the client custom entry addresses, use them.
    entryPointContracts = {} as EntryPointContracts;
    for (const version of Object.keys(params.entryPoints)) {
      const entryPointParams = params.entryPoints[version as EntryPointVersion];
      entryPointContracts[version as EntryPointVersion] = entryPointParams
        ? createEntryPointContract(entryPointParams)
        : defaultEntryPointContracts[version as EntryPointVersion];
    }
  }

  return new EVMGasEstimator(entryPointContracts);
}

interface CreateGasEstimatorParams {
  entryPoints?: Partial<
    Record<EntryPointVersion, CreateEntryPointContractParams>
  >;
}
