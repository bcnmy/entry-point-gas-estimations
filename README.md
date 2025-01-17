# Biconomy Gas Estimations

A utility package that performs simulation and estimations of all ERC-4337 User Operation gas limits.

## Usage
### Create a Gas Estimator
You can create the gas estimator for you chain of choice in multiple ways.

> ❌ Don't use public RPC URLs because they often don't support more advanced features like state overrides and `debug_traceCall`

Using a **chainId** and a **rpcUrl**:
```ts
import { mainnet } from "viem/chains"

const gasEstimator = createGasEstimator({
  chainId: mainnet.id,
  rpc: "https://rpc.url",
});
```
Using a **viem public client**:
```ts
import { mainnet } from "viem/chains"

const viemClient = createPublicClient({
  chain: miannet,
  transport: http("https://rpc.url"),
});

const gasEstimator = createGasEstimator({
  chainId: testChain.chainId,
  rpc: viemClient,
});
```
Or using a **full chain specification** (useful for new chains not supported by default by this package):
```ts
const customChain: SupportedChain = {
  chainId: 4337,
  name: "Biconomy Mainnet",
  isTestnet: false,
  stack: ChainStack.Optimism,
  eip1559: true,
  entryPoints: {
    [EntryPointVersion.v060]: {
      address: "0x006",
    },
    [EntryPointVersion.v070]: {
      address: "0x007",
    },
  },
  stateOverrideSupport: {
    balance: true,
    bytecode: true,
    stateDiff: true,
  },
  smartAccountSupport: {
    smartAccountsV2: true,
    nexus: true,
  },
  simulation: {
    preVerificationGas: 1n,
    verificationGasLimit: 2n,
    callGasLimit: 3n,
  },
  paymasters: DEFAULT_PAYMASTERS,
};

const gasEstimator = createGasEstimator({
  chainId: customChain.chainId,
  rpc: rpcUrl,
  chain: customChain,
});
```
### Estimating User Operation gas limits

By default the gas estimator tries to be as flexible as possible and return the gas estimates, even if the sender (or the paymaster) doesn't have funds to pay for gas.

> 💡 If the target chain (or your RPC provider) doesn't support state overrides, the estimation will fail if the on-chain requirements (such as sender and paymaster balance) are not met and there's not much we can do.

```ts
const gasEstimate =
  await gasEstimator.estimateUserOperationGas({
    unEstimatedUserOperation: userOperation,
    baseFeePerGas,
  });
```

### Simulation mode
In case you don't want the package to perform any state overrides by default you can use the **simulation mode** and the package will throw an appropriate error if the sender doesn't have enough balance or any other on-chain requirement is not met.
```ts
await gasEstimator.estimateUserOperationGas({
  unEstimatedUserOperation: userOperation,
  baseFeePerGas,
  options: {
    simulation: true
  }
});
```
### Passing custom state overrides
You can pass additional state overrides when estimating, there's a helper `StateOverrideBuilder` you can use:
```ts
await gasEstimator.estimateUserOperationGas({
  unEstimatedUserOperation: userOperation,
  baseFeePerGas,
  stateOverrides: new StateOverrideBuilder().
    .overrideBalance(
      address,
      parseEther("100"),
    )
    .overridePaymasterDeposit(
      entryPointAddress,
      paymasterAddress
    )
    .build()
});
```

## API Reference

For detailed documentation and API reference, visit our [api documentation here](https://bcnmy.github.io/entry-point-gas-estimations).

## Building 

To build the project do `bun run build`

## Publishing

### Production Release
To publish a new production version:

1. Create a new changeset (documents your changes):
```sh
bun run changeset
```

2. Version the package (updates package.json and changelog):
```sh
bun run changeset:version
```

3. Publish to npm:
```sh
bun run changeset:release
```

### Canary Release
To publish a canary (preview) version:
```sh
bun run changeset:release:canary
```

This will publish a canary version to npm with a temporary version number. The original package.json will be restored automatically after publishing.

[Canary Release](https://www.npmjs.com/package/@biconomy/gas-estimations-canary)

**Note:** You need to have appropriate npm permissions to publish the package.
