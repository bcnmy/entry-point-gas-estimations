import { createPublicClient, http } from "viem";
import { GasEstimator } from "./GasEstimator";
import { CreateGasEstimatorParams } from "../types";
import { OptimismGasEstimator } from "./OptimismGasEstimator";
import { ViemGasEstimatorClient } from "../clients";

/**
 * factory method to create the general gas estimator instance
 * @param {CreateGasEstimatorParams} params config for creating the gas estimator client
 * @returns {GasEstimator} returns the general gas estimator client
 */
export function createGasEstimator(
  params: CreateGasEstimatorParams,
): GasEstimator {
  const { rpcUrl, ...rest } = params;
  const publicClient = new ViemGasEstimatorClient(
    createPublicClient({
      transport: http(rpcUrl),
    }),
  );
  return new GasEstimator({
    publicClient,
    ...rest,
  });
}

/**
 * factory method to create the optimism gas estimator instance
 * @param {CreateGasEstimatorParams} params config for creating the gas estimator client
 * @returns {GasEstimator} returns the optimism gas estimator client
 */
export function createOptimismGasEstimator(
  params: CreateGasEstimatorParams,
): OptimismGasEstimator {
  const { rpcUrl, ...rest } = params;
  const publicClient = new ViemGasEstimatorClient(
    createPublicClient({
      transport: http(rpcUrl),
    }),
  );
  return new OptimismGasEstimator({
    publicClient,
    ...rest,
  });
}

const estimateGas = async () => {
  const gasEstimator = createGasEstimator({
    rpcUrl:
      "https://base-sepolia.g.alchemy.com/v2/Z2-eyli928EaKYt1L_2nFEtwpzVWtE67",
    chainId: 84532,
  });

  const gasEstimates = await gasEstimator.estimateUserOperationGas({
    userOperation: {
      sender: "0xc2Ea50cF2a8a40b9141486250c3Fa7881a41ABAe",
      nonce:
        20767540048312205797316740691846339261291072112028043001101084000257n,
      factory: "0x",
      factoryData: "0x",
      callData:
        "0xe9ae5c53000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000034ec42e6f640998f800aca666b6775f68852f053a00000000000000000000000000000000000000000000000000000000000000001000000000000000000000000",
      maxFeePerGas: 11441827n,
      maxPriorityFeePerGas: 1000000n,
      verificationGasLimit: 1000000n,
      callGasLimit: 1000000n,
      preVerificationGas: 1000000n,
      paymaster: "0x4688606914bF4C0595B443dB3d6822791Fec0A97",
      paymasterData:
        "0xc1a9a8d0f6448e61d3500262ce3ce857b02f1d0f000066e7fcf2000066e7f5ea000f4240a2dc5bd57a7a57993d781bde8886b89e1d4918aeb9608df36d2a2cf5d499c4d1623f67ce1e41e9fba5addcf10f6170bfdaeaa4dfd23b29dea26d1e61e4f4203b1b",
      paymasterPostOpGasLimit: 1000000n,
      paymasterVerificationGasLimit: 1000000n,
      signature:
        "0x1f09e02d10505123276ede9dc12d7fe94e8ae4822664fbf6d050304cd8ba19ec7b43c7f767b90a2a18834636c59667e4dfa7752b6dd4588161f5e4a5f2672e291b",
    },
  });
  console.log("callGasLimit", gasEstimates.callGasLimit);
  console.log("preVerificationGas", gasEstimates.preVerificationGas);
  console.log("verificationGasLimit", gasEstimates.verificationGasLimit);
  console.log("paymasterPostOpGasLimit", gasEstimates.paymasterPostOpGasLimit);
  console.log(
    "paymasterVerificationGasLimit",
    gasEstimates.paymasterVerificationGasLimit,
  );
};

estimateGas();
