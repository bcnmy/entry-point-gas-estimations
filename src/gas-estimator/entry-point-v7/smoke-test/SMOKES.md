# 🚬 Smoke Tests

### What are smoke tests?
Smoke tests are used to test gas estimations without actually sending any transactions or checking if the estimates are correct.

They differ from **unit tests** because they have some dependencies: a network connection for example, you can't run them offline or in CI/CD (easily).

### Why do we need them?
The idea is just to check if we have any obvious problems with smart contracts, SDK or our gas estimation logic that would cause exceptions to be thrown.

### How to run them
All smoke-tests should have a describe tag of `smoke-test` so we can filter them out when running jest.

To run all smoke tests use the following `package.json` script:
- `yarn test:smoke`
