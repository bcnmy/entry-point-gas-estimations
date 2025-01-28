# @biconomy/gas-estimations

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
