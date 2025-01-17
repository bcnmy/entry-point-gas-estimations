# Testing
This document explains how to run, use and extend the test suites for this package.

## How do I run the tests?

### E2E
Here's how to setup & run a E2E for a selected network.

> 💡 For the purpose of this example we will assume we are testing Base Sepolia (84532)

1. **Create a `test.json` file in the `config` directory**: You can use `test-example.json` as a reference.
2. **Get a private RPC URL from one of the providers**: E2E tests require proper private RPC URLs and usually don't work with public RPC URLs because they don't support RPC features such as state overrides or trace calls. **Alchemy** is a good first choice.
3. **Add the private RPC URL to the `test.json` file:** The config should look something like this:
  ```json
  "testChains": {
    "84532": {
      "rpcUrl": "https://base-sepolia.g.alchemy.com/v2/<ALCHEMY_API_KEY>"
    },
  }
  ```
4. 🚀 Run the tests using: `pnpm test`

Useful options:
- `includeInTests`: you can specify chain IDs for chains you want to test so you don't run all tests (takes a long time). By default it's an empty array and that means it will run all of the tests for all chains in the suite.
- `excludeFromTests`: exclude tests that are failing or you just want to skip.

## Running tests

You can run **all tests** by using the `pnpm test` command.

> 💡 If you've used the `includeInTests` property, it will run only the tests for that chain.

Tips:
- You can narrow down on the test tag you want to run, for example `pnpm test -t 'EntryPoint v0.7.0'` will run just the tests for EPv0.7.0.
