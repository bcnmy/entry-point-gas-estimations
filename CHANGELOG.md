# @biconomy/gas-estimations

## 0.2.72

### Patch Changes

- Changed the way how we're estimating callGasLimit for EPv7.

## 0.2.71

### Patch Changes

- Fixed the Nexus TPM flow (tpm address format). Removed custom contracts from the monad testnet chain. Ignoring gold chain in tests - their infra is down.

## 0.2.70

### Patch Changes

- Fixed paymaster addresses for Base & Optimism.

## 0.2.69

### Patch Changes

- Fix arguments for simulateHandleOp

## 0.2.68

### Patch Changes

- Revert the callGasLimit change for Monad now that their RPCs behave in the same way as other RPCs

## 0.2.67

### Patch Changes

- Remove the Sonic gas estimator after they have released a fix to their RPC

## 0.2.66

### Patch Changes

- Set sender for estimateGas to undefined for Monad only, use EP address for other chains

## 0.2.65

### Patch Changes

- Fix Monad Testnet gas estimation & add support for custom SA contract addresses

## 0.2.64

### Patch Changes

- chore: add files to npm build

## 0.2.63

### Patch Changes

- Add RPCs for e2e tests for Sonic, disable Monad tests

## 0.2.62

### Patch Changes

- Add Monad testnet to supported chains

## 0.2.61

### Patch Changes

- Add support for Sonic Blaze Testnet & Sonic Mainnet

## 0.2.57

### Patch Changes

- Modernized development tooling:

  - Migrated to Bun for package management and running scripts
  - Replaced ESLint with Biome for linting
  - Added changesets for version management
  - Moved viem to peer dependencies
  - Added ESM + CJS builds

- Improved CI/CD:

  - Added GitHub Actions workflows for:
    - Build verification
    - PR title linting
    - E2E testing
    - Bundle size reporting
    - Automated documentation deployment
  - Added code coverage reporting with Codecov

- Enhanced Documentation:

  - Added automated API documentation generation
  - Improved testing documentation
  - Added PR-Codex for better PR descriptions

- Development Experience:
  - Added E2E test suite
  - Improved test configuration management
  - Added bundle size limits
