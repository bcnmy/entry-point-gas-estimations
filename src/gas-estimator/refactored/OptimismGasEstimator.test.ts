import { optimism } from "viem/chains";
import { EntryPointVersion } from "../../entrypoint/shared/types";
import { EntryPointV6 } from "../../entrypoint/v0.6.0/EntryPointV6";
import { EntryPointV6Simulations } from "../../entrypoint/v0.6.0/EntryPointV6Simulations";
import { EntryPointV7Simulations } from "../../entrypoint/v0.7.0/EntryPointV7Simulations";
import { SimulationOptions } from "./EVMGasEstimator";
import { createGasEstimator } from "./GasEstimator";
import { OptimismGasEstimator } from "./OptimismGasEstimator";
import { EntryPoints, GasEstimatorRpcClient } from "./types";

describe("OptimismGasEstimator", () => {
  const mockRpcClient: GasEstimatorRpcClient = {
    readContract: jest.fn().mockResolvedValue(1n),
    estimateGas: jest.fn().mockResolvedValue(1n),
    chain: optimism,
    request: jest.fn(),
  };

  const mockEntryPoints: EntryPoints = {
    [EntryPointVersion.v060]: {
      contract: {
        encodeHandleOpsFunctionData: jest.fn().mockReturnValue("0x"),
      } as unknown as EntryPointV6,
      simulations: {} as EntryPointV6Simulations,
    },
    [EntryPointVersion.v070]: {
      contract: {} as EntryPointV7Simulations,
    },
  };
  it("should take the L1 fee into account when calculating the pre-verification gas", async () => {
    const opGasEstimator = new OptimismGasEstimator(
      10,
      mockRpcClient,
      mockEntryPoints,
      {} as SimulationOptions
    );

    const pvg = await opGasEstimator.estimatePreVerificationGas(
      EntryPointVersion.v060,
      {
        callData: "0x",
        sender: "0xb7744Ce158A09183F01296bCB262bB9F65E2FFd7",
        preVerificationGas: 1n,
        verificationGasLimit: 1n,
        callGasLimit: 1n,
        maxFeePerGas: 1n,
        maxPriorityFeePerGas: 1n,
        initCode: "0x",
        nonce: 1n,
        paymasterAndData: "0x",
        signature: "0x",
      },
      1n
    );

    expect(pvg).toBeDefined();
    expect(mockRpcClient.readContract).toHaveBeenCalled();
  });

  it("should the L1 fee into account when calculating the pre-verification gas, when created by a factory", async () => {
    const opGasEstimator = createGasEstimator({
      chainId: 10,
      rpcClient: mockRpcClient,
    });

    const pvg = await opGasEstimator.estimatePreVerificationGas(
      EntryPointVersion.v060,
      {
        callData: "0x",
        sender: "0xb7744Ce158A09183F01296bCB262bB9F65E2FFd7",
        preVerificationGas: 1n,
        verificationGasLimit: 1n,
        callGasLimit: 1n,
        maxFeePerGas: 1n,
        maxPriorityFeePerGas: 1n,
        initCode: "0x",
        nonce: 1n,
        paymasterAndData: "0x",
        signature: "0x",
      },
      1n
    );

    expect(pvg).toBeDefined();
    expect(mockRpcClient.readContract).toHaveBeenCalled();
  });
});
