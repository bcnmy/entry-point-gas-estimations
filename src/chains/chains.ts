import { ENTRYPOINT_V7_ADDRESS } from "../entrypoint/v0.7.0/constants"
import { ChainStack, type SupportedChain } from "./types"

// TODO: Move the constants into the files where they belong
export const DEFAULT_ENTRYPOINT_V6_SPONSORSHIP_PAYMASTER_ADDRESS =
  "0x00000f79b7faf42eebadba19acc07cd08af44789"

export const DEFAULT_ENTRYPOINT_V6_TOKEN_PAYMASTER_ADDRESS =
  "0x00000f7365cA6C59A2C93719ad53d567ed49c14C"

const DEFAULT_ENTRYPOINT_V7_SPONSORSHIP_PAYMASTER_ADDRESS =
  "0x00000072a5f551d6e80b2f6ad4fb256a27841bbc"
const DEFAULT_ENTRYPOINT_V7_SPONSORSHIP_PAYMASTER_DEPOSITS_STATE_KEY =
  "0x354335c2702ea6531294c3a1571e6565fa3ef5f6c44a98e1b0c28dacf8c2a9ba"

const DEFAULT_ENTRYPOINT_V7_TOKEN_PAYMASTER_ADDRESS =
  "0x00000000301515A5410e0d768aF4f53c416edf19"
const DEFAULT_ENTRYPOINT_V7_TOKEN_PAYMASTER_DEPOSITS_STATE_KEY =
  "0xca2edac642186a7c1820b405da08488d91db4bdbbbd4e0b687d2f4f822a383c5"

const BASE_OPTIMISM_V7_SPONSORSHIP_PAYMASTER_ADDRESS =
  "0x0000006087310897e0BFfcb3f0Ed3704f7146852";
const BASE_OPTIMISM_V7_TOKEN_PAYMASTER_ADDRESS =
  "0x00000000301515A5410e0d768aF4f53c416edf19";

const DEFAULT_ENTRYPOINT_V7_DEPOSITS_STATE = {
  [DEFAULT_ENTRYPOINT_V7_SPONSORSHIP_PAYMASTER_ADDRESS]: {
    stateKey: DEFAULT_ENTRYPOINT_V7_SPONSORSHIP_PAYMASTER_DEPOSITS_STATE_KEY
  },
  [DEFAULT_ENTRYPOINT_V7_TOKEN_PAYMASTER_ADDRESS]: {
    stateKey: DEFAULT_ENTRYPOINT_V7_TOKEN_PAYMASTER_DEPOSITS_STATE_KEY
  }
}

const DEFAULT_ENTRYPOINT_V070 = {
  address: ENTRYPOINT_V7_ADDRESS,
  state: {
    deposits: DEFAULT_ENTRYPOINT_V7_DEPOSITS_STATE
  }
}

const DEFAULT_ENTRYPOINTS = {
  v070: DEFAULT_ENTRYPOINT_V070
}

const DEFAULT_EP_V6_SPONSORSHIP_DUMMY_PAYMASTER_DATA =
  "0x00000f79b7faf42eebadba19acc07cd08af44789000000000000000000000000d02329b31d6a7b33173f2197c7b04eaf68f8184a0000000000000000000000000000000000000000000000000000000064ec68050000000000000000000000000000000000000000000000000000000064ec60fd00000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000041cf370ae2342424930fd7187a4c42861c974dbe78d7f99eb3398b24c5c338325c5cc5946685ad489c5a130e68c0154f51413b83178c868b560bbf2c25b8f0e3b71c00000000000000000000000000000000000000000000000000000000000000"

const DEFAULT_ENTRYPOINT_V6_PAYMASTERS = {
  [DEFAULT_ENTRYPOINT_V6_SPONSORSHIP_PAYMASTER_ADDRESS]: {
    type: "sponsorship",
    dummyPaymasterAndData: DEFAULT_EP_V6_SPONSORSHIP_DUMMY_PAYMASTER_DATA
  },
  [DEFAULT_ENTRYPOINT_V6_TOKEN_PAYMASTER_ADDRESS]: {
    type: "token",
    dummyPaymasterAndData:
      "0x00000f7365cA6C59A2C93719ad53d567ed49c14C010000000000000000000000000000000000000000000000000000000064c7adcb0000000000000000000000000000000000000000000000000000000064c7a6c3000000000000000000000000da5289fcaaf71d52a80a254da614a192b693e9770000000000000000000000000000065b8abb967271817555f23945eedf08015c00000000000000000000000000000000000000000000000000000000000ab5d1000000000000000000000000000000000000000000000000000000000010c8e021a75b2144ea22b77bdeea206e69faea1b18c91a08a76de6cd424dc80bea283413fa08519fcee3960203e1d6ebebe7c34ffe27ea47452fd4dca0013e1d36da7f1b"
  }
}

const DEFAULT_EP_V7_SPONSORSHIP_DUMMY_PAYMASTER_DATA =
  "0x2a07706473244bc757e10f2a9e86fb532828afe30000111111000000999999990011170044c67319e37818affd575e3598d3c6cb2075d8bafcb35f5a9e217675c103bac93de0923dae17af2e5ac0f1757eb7dc3426f1f47fb913771b22f4abb373984f931b"

const DEFAULT_ENTRYPOINT_V7_TOKEN_PAYMASTER_DUMMY_PAYMASTER_DATA =
  "0x000000111111000000999999992a07706473244bc757e10f2a9e86fb532828afe30000000000000000000000000000000000000000000000c1f6b98af18ba800000011170044c67319e37818affd575e3598d3c6cb2075d8bafcb35f5a9e217675c103bac93de0923dae17af2e5ac0f1757eb7dc3426f1f47fb913771b22f4abb373984f931b";

const DEFAULT_ENTRYPOINT_V7_PAYMASTERS = {
  [DEFAULT_ENTRYPOINT_V7_SPONSORSHIP_PAYMASTER_ADDRESS]: {
    type: "sponsorship",
    dummyPaymasterData: DEFAULT_EP_V7_SPONSORSHIP_DUMMY_PAYMASTER_DATA,
    postOpGasLimit: 50000n
  },
  [DEFAULT_ENTRYPOINT_V7_TOKEN_PAYMASTER_ADDRESS]: {
    type: "token",
    dummyPaymasterData:
      DEFAULT_ENTRYPOINT_V7_TOKEN_PAYMASTER_DUMMY_PAYMASTER_DATA,
    postOpGasLimit: 95000n
  }
}

const BASE_OPTIMISM_ENTRYPOINT_V7_PAYMASTERS = {
  [BASE_OPTIMISM_V7_SPONSORSHIP_PAYMASTER_ADDRESS]: {
    type: "sponsorship",
    dummyPaymasterData: DEFAULT_EP_V7_SPONSORSHIP_DUMMY_PAYMASTER_DATA,
    postOpGasLimit: 50000n
  },
  [BASE_OPTIMISM_V7_TOKEN_PAYMASTER_ADDRESS]: {
    type: "token",
    dummyPaymasterData:
      DEFAULT_ENTRYPOINT_V7_TOKEN_PAYMASTER_DUMMY_PAYMASTER_DATA,
    postOpGasLimit: 95000n
  }
}

export const DEFAULT_PAYMASTERS = {
  v060: DEFAULT_ENTRYPOINT_V6_PAYMASTERS,
  v070: DEFAULT_ENTRYPOINT_V7_PAYMASTERS
}

export const supportedChains: Record<string, SupportedChain> = {
  "1": {
    chainId: 1,
    name: "Ethereum Mainnet",
    isTestnet: false,
    stack: ChainStack.EVM,
    eip1559: true,
    stateOverrideSupport: {
      balance: true,
      bytecode: true,
      stateDiff: true
    },
    smartAccountSupport: {
      smartAccountsV2: true,
      nexus: true
    },
    entryPoints: DEFAULT_ENTRYPOINTS,
    paymasters: DEFAULT_PAYMASTERS
  },
  "11155111": {
    chainId: 11155111,
    name: "Ethereum Sepolia",
    isTestnet: true,
    stack: ChainStack.EVM,
    eip1559: true,
    stateOverrideSupport: {
      balance: true,
      bytecode: true,
      stateDiff: true
    },
    smartAccountSupport: {
      smartAccountsV2: true,
      nexus: true
    },
    entryPoints: DEFAULT_ENTRYPOINTS,
    paymasters: DEFAULT_PAYMASTERS
  },
  "137": {
    chainId: 137,
    name: "Polygon Mainnet",
    isTestnet: false,
    stack: ChainStack.EVM,
    eip1559: true,
    stateOverrideSupport: {
      balance: true,
      bytecode: true,
      stateDiff: true
    },
    smartAccountSupport: {
      smartAccountsV2: true,
      nexus: true
    },
    entryPoints: DEFAULT_ENTRYPOINTS,
    paymasters: DEFAULT_PAYMASTERS
  },
  "80002": {
    chainId: 80002,
    name: "Polygon Amoy",
    isTestnet: true,
    stack: ChainStack.EVM,
    eip1559: true,
    stateOverrideSupport: {
      balance: true,
      bytecode: true,
      stateDiff: true
    },
    smartAccountSupport: {
      smartAccountsV2: true,
      nexus: true
    },
    entryPoints: DEFAULT_ENTRYPOINTS,
    paymasters: {
      v060: DEFAULT_ENTRYPOINT_V6_PAYMASTERS,
      v070: {
        [DEFAULT_ENTRYPOINT_V7_SPONSORSHIP_PAYMASTER_ADDRESS]: {
          type: "sponsorship",
          dummyPaymasterData: DEFAULT_EP_V7_SPONSORSHIP_DUMMY_PAYMASTER_DATA,
          postOpGasLimit: 50000n
        }
      }
    }
  },
  "56": {
    chainId: 56,
    name: "Binance Smart Chain",
    isTestnet: false,
    stack: ChainStack.EVM,
    eip1559: false,
    stateOverrideSupport: {
      balance: true,
      bytecode: true,
      stateDiff: true
    },
    smartAccountSupport: {
      smartAccountsV2: true,
      nexus: true
    },
    entryPoints: DEFAULT_ENTRYPOINTS,
    paymasters: DEFAULT_PAYMASTERS
  },
  "97": {
    chainId: 97,
    name: "Binance Smart Chain Testnet",
    isTestnet: true,
    stack: ChainStack.EVM,
    eip1559: false,
    stateOverrideSupport: {
      balance: true,
      bytecode: true,
      stateDiff: true
    },
    smartAccountSupport: {
      smartAccountsV2: true,
      nexus: true
    },
    entryPoints: DEFAULT_ENTRYPOINTS,
    paymasters: DEFAULT_PAYMASTERS
  },
  "1101": {
    chainId: 1101,
    name: "Polygon ZK-EVM Mainnet",
    stack: ChainStack.EVM,
    isTestnet: false,
    eip1559: false,
    stateOverrideSupport: {
      balance: true,
      bytecode: false,
      stateDiff: false
    },
    smartAccountSupport: {
      smartAccountsV2: true,
      nexus: false
    },
    paymasters: {
      v060: DEFAULT_ENTRYPOINT_V6_PAYMASTERS
    }
  },
  "2442": {
    chainId: 2442,
    name: "Polygon ZK-EVM Cardona Testnet",
    isTestnet: true,
    stack: ChainStack.EVM,
    eip1559: false,
    stateOverrideSupport: {
      balance: true,
      bytecode: false,
      stateDiff: false
    },
    smartAccountSupport: {
      smartAccountsV2: true,
      nexus: false
    },
    paymasters: {
      v060: DEFAULT_ENTRYPOINT_V6_PAYMASTERS
    }
  },
  "42161": {
    chainId: 42161,
    name: "Arbitrum Mainnet",
    isTestnet: false,
    stack: ChainStack.Arbitrum,
    eip1559: true,
    stateOverrideSupport: {
      balance: true,
      bytecode: true,
      stateDiff: true
    },
    smartAccountSupport: {
      smartAccountsV2: true,
      nexus: true
    },
    entryPoints: DEFAULT_ENTRYPOINTS,
    paymasters: DEFAULT_PAYMASTERS
  },
  "421614": {
    chainId: 421614,
    name: "Arbitrum Sepolia Testnet",
    isTestnet: true,
    stack: ChainStack.Arbitrum,
    eip1559: true,
    stateOverrideSupport: {
      balance: true,
      bytecode: false,
      stateDiff: true
    },
    smartAccountSupport: {
      smartAccountsV2: true,
      nexus: true
    },
    entryPoints: DEFAULT_ENTRYPOINTS,
    paymasters: DEFAULT_PAYMASTERS
  },
  "42170": {
    chainId: 42170,
    name: "Arbitrum Nova",
    isTestnet: false,
    stack: ChainStack.Arbitrum,
    eip1559: true,
    stateOverrideSupport: {
      balance: true,
      bytecode: true,
      stateDiff: true
    },
    smartAccountSupport: {
      smartAccountsV2: true,
      nexus: false
    },
    paymasters: {
      v060: DEFAULT_ENTRYPOINT_V6_PAYMASTERS
    }
  },
  "10": {
    chainId: 10,
    name: "Optimism Mainnet",
    isTestnet: false,
    stack: ChainStack.Optimism,
    eip1559: true,
    stateOverrideSupport: {
      balance: true,
      bytecode: true,
      stateDiff: true
    },
    smartAccountSupport: {
      smartAccountsV2: true,
      nexus: true
    },
    entryPoints: DEFAULT_ENTRYPOINTS,
    paymasters: {
      v060: DEFAULT_ENTRYPOINT_V6_PAYMASTERS,
      v070: BASE_OPTIMISM_ENTRYPOINT_V7_PAYMASTERS
    }
  },
  "11155420": {
    chainId: 11155420,
    name: "Optimism Testnet",
    isTestnet: true,
    stack: ChainStack.Optimism,
    eip1559: true,
    stateOverrideSupport: {
      balance: true,
      bytecode: false,
      stateDiff: true
    },
    smartAccountSupport: {
      smartAccountsV2: true,
      nexus: true
    },
    entryPoints: DEFAULT_ENTRYPOINTS,
    paymasters: {
      v060: DEFAULT_ENTRYPOINT_V6_PAYMASTERS,
      v070: BASE_OPTIMISM_ENTRYPOINT_V7_PAYMASTERS
    }
  },
  "43114": {
    chainId: 43114,
    name: "Avalanche Mainnet",
    isTestnet: false,
    stack: ChainStack.EVM,
    eip1559: true,
    stateOverrideSupport: {
      balance: true,
      bytecode: true,
      stateDiff: true
    },
    smartAccountSupport: {
      smartAccountsV2: true,
      nexus: false
    },
    paymasters: {
      v060: DEFAULT_ENTRYPOINT_V6_PAYMASTERS
    }
  },
  "43113": {
    chainId: 43113,
    name: "Avalanche Fuji Testnet",
    isTestnet: true,
    stack: ChainStack.EVM,
    eip1559: true,
    stateOverrideSupport: {
      balance: true,
      bytecode: false,
      stateDiff: false
    },
    smartAccountSupport: {
      smartAccountsV2: true,
      nexus: false
    },
    paymasters: {
      v060: DEFAULT_ENTRYPOINT_V6_PAYMASTERS
    }
  },
  "8453": {
    chainId: 8453,
    name: "Base Mainnet",
    isTestnet: false,
    stack: ChainStack.Optimism,
    eip1559: true,
    stateOverrideSupport: {
      balance: true,
      bytecode: true,
      stateDiff: true
    },
    smartAccountSupport: {
      smartAccountsV2: true,
      nexus: true
    },
    entryPoints: DEFAULT_ENTRYPOINTS,
    paymasters: {
      v060: DEFAULT_ENTRYPOINT_V6_PAYMASTERS,
      v070: BASE_OPTIMISM_ENTRYPOINT_V7_PAYMASTERS
    }
  },
  "84532": {
    chainId: 84532,
    name: "Base Sepolia Testnet",
    isTestnet: true,
    stack: ChainStack.Optimism,
    eip1559: true,
    stateOverrideSupport: {
      balance: true,
      bytecode: false,
      stateDiff: true
    },
    smartAccountSupport: {
      smartAccountsV2: true,
      nexus: true
    },
    entryPoints: DEFAULT_ENTRYPOINTS,
    paymasters: {
      v060: DEFAULT_ENTRYPOINT_V6_PAYMASTERS,
      v070: BASE_OPTIMISM_ENTRYPOINT_V7_PAYMASTERS
    }
  },
  "59144": {
    chainId: 59144,
    name: "Linea Mainnet",
    isTestnet: false,
    stack: ChainStack.EVM,
    eip1559: true,
    stateOverrideSupport: {
      balance: true,
      bytecode: false,
      stateDiff: true
    },
    smartAccountSupport: {
      smartAccountsV2: true,
      nexus: false
    },
    paymasters: {
      v060: DEFAULT_ENTRYPOINT_V6_PAYMASTERS
    }
  },
  "5000": {
    chainId: 5000,
    name: "Mantle Mainnet",
    isTestnet: false,
    stack: ChainStack.Mantle,
    eip1559: true,
    stateOverrideSupport: {
      balance: true,
      bytecode: true,
      stateDiff: true
    },
    smartAccountSupport: {
      smartAccountsV2: true,
      nexus: false
    },
    paymasters: {
      v060: DEFAULT_ENTRYPOINT_V6_PAYMASTERS
    }
  },
  "5001": {
    chainId: 5001,
    name: "Mantle Testnet",
    isTestnet: true,
    stack: ChainStack.Mantle,
    eip1559: true,
    stateOverrideSupport: {
      balance: true,
      bytecode: true,
      stateDiff: true
    },
    smartAccountSupport: {
      smartAccountsV2: true,
      nexus: false
    },
    paymasters: {
      v060: DEFAULT_ENTRYPOINT_V6_PAYMASTERS
    }
  },
  "204": {
    chainId: 204,
    name: "opBNB Mainnet",
    isTestnet: false,
    stack: ChainStack.Optimism,
    eip1559: false,
    stateOverrideSupport: {
      balance: true,
      bytecode: true,
      stateDiff: true
    },
    smartAccountSupport: {
      smartAccountsV2: true,
      nexus: false
    },
    paymasters: {
      v060: DEFAULT_ENTRYPOINT_V6_PAYMASTERS
    }
  },
  "5611": {
    chainId: 5611,
    name: "opBNB Testnet",
    isTestnet: true,
    stack: ChainStack.Optimism,
    eip1559: false,
    stateOverrideSupport: {
      balance: true,
      bytecode: false,
      stateDiff: false
    },
    smartAccountSupport: {
      smartAccountsV2: true,
      nexus: false
    },
    paymasters: {
      v060: DEFAULT_ENTRYPOINT_V6_PAYMASTERS
    }
  },
  "88888": {
    chainId: 88888,
    name: "Chiliz Mainnet",
    isTestnet: false,
    stack: ChainStack.EVM,
    eip1559: false,
    entryPoints: {
      v060: {
        address: "0x00000061fefce24a79343c27127435286bb7a4e1"
      }
    },
    stateOverrideSupport: {
      balance: true,
      bytecode: false,
      stateDiff: false
    },
    smartAccountSupport: {
      smartAccountsV2: true,
      nexus: false
    },
    paymasters: {
      v060: {
        [DEFAULT_ENTRYPOINT_V6_SPONSORSHIP_PAYMASTER_ADDRESS]: {
          type: "sponsorship",
          dummyPaymasterAndData: DEFAULT_EP_V6_SPONSORSHIP_DUMMY_PAYMASTER_DATA
        }
      }
    }
  },
  "88882": {
    chainId: 88882,
    name: "Chiliz Spicy Testnet",
    isTestnet: true,
    stack: ChainStack.EVM,
    eip1559: false,
    entryPoints: {
      v060: {
        address: "0x00000061fefce24a79343c27127435286bb7a4e1"
      }
    },
    stateOverrideSupport: {
      balance: true,
      bytecode: false,
      stateDiff: false
    },
    smartAccountSupport: {
      smartAccountsV2: true,
      nexus: false
    },
    paymasters: {
      v060: DEFAULT_ENTRYPOINT_V6_PAYMASTERS
    }
  },
  "592": {
    chainId: 592,
    name: "Astar Network",
    isTestnet: false,
    stack: ChainStack.EVM,
    eip1559: true,
    stateOverrideSupport: {
      balance: false,
      bytecode: false,
      stateDiff: false
    },
    smartAccountSupport: {
      smartAccountsV2: true,
      nexus: false
    },
    paymasters: {
      v060: DEFAULT_ENTRYPOINT_V6_PAYMASTERS
    }
  },
  "81": {
    chainId: 81,
    name: "Astar Testnet",
    isTestnet: true,
    stack: ChainStack.EVM,
    eip1559: true,
    stateOverrideSupport: {
      balance: false,
      bytecode: false,
      stateDiff: false
    },
    smartAccountSupport: {
      smartAccountsV2: true,
      nexus: false
    },
    paymasters: {
      v060: DEFAULT_ENTRYPOINT_V6_PAYMASTERS
    }
  },
  "1116": {
    chainId: 1116,
    name: "Core Mainnet",
    isTestnet: false,
    stack: ChainStack.EVM,
    eip1559: true,
    stateOverrideSupport: {
      balance: true,
      bytecode: true,
      stateDiff: true
    },
    smartAccountSupport: {
      smartAccountsV2: true,
      nexus: false
    },
    paymasters: {
      v060: DEFAULT_ENTRYPOINT_V6_PAYMASTERS
    }
  },
  "1115": {
    chainId: 1115,
    name: "Core Testnet",
    isTestnet: true,
    stack: ChainStack.EVM,
    eip1559: true,
    stateOverrideSupport: {
      balance: true,
      bytecode: true,
      stateDiff: true
    },
    smartAccountSupport: {
      smartAccountsV2: true,
      nexus: false
    },
    paymasters: {
      v060: DEFAULT_ENTRYPOINT_V6_PAYMASTERS
    }
  },
  "169": {
    chainId: 169,
    name: "Manta Pacific Testnet",
    isTestnet: true,
    stack: ChainStack.EVM,
    eip1559: true,
    stateOverrideSupport: {
      balance: true,
      bytecode: false,
      stateDiff: false
    },
    smartAccountSupport: {
      smartAccountsV2: true,
      nexus: false
    },
    paymasters: {
      v060: DEFAULT_ENTRYPOINT_V6_PAYMASTERS
    }
  },
  "9980": {
    chainId: 9980,
    name: "Combo Mainnet",
    isTestnet: false,
    stack: ChainStack.Optimism,
    nativeCurrency: "BNB",
    eip1559: true,
    stateOverrideSupport: {
      balance: true,
      bytecode: false,
      stateDiff: false
    },
    smartAccountSupport: {
      smartAccountsV2: true,
      nexus: false
    },
    paymasters: {
      v060: DEFAULT_ENTRYPOINT_V6_PAYMASTERS
    }
  },
  "1715": {
    chainId: 1715,
    name: "Combo Testnet",
    isTestnet: true,
    stack: ChainStack.Optimism,
    nativeCurrency: "BNB",
    eip1559: true,
    stateOverrideSupport: {
      balance: true,
      bytecode: false,
      stateDiff: false
    },
    smartAccountSupport: {
      smartAccountsV2: true,
      nexus: false
    },
    paymasters: {
      v060: DEFAULT_ENTRYPOINT_V6_PAYMASTERS
    }
  },
  "81457": {
    chainId: 81457,
    name: "Blast Mainnet",
    isTestnet: false,
    stack: ChainStack.Optimism,
    eip1559: true,
    stateOverrideSupport: {
      balance: true,
      bytecode: true,
      stateDiff: true
    },
    smartAccountSupport: {
      smartAccountsV2: true,
      nexus: true
    },
    entryPoints: DEFAULT_ENTRYPOINTS,
    paymasters: DEFAULT_PAYMASTERS
  },
  "168587773": {
    chainId: 168587773,
    name: "Blast Sepolia Testnet",
    isTestnet: true,
    stack: ChainStack.Optimism,
    eip1559: true,
    stateOverrideSupport: {
      balance: true,
      bytecode: false,
      stateDiff: true
    },
    smartAccountSupport: {
      smartAccountsV2: true,
      nexus: true
    },
    entryPoints: DEFAULT_ENTRYPOINTS,
    paymasters: DEFAULT_PAYMASTERS
  },
  "534352": {
    chainId: 534352,
    name: "Scroll Mainnet",
    isTestnet: false,
    stack: ChainStack.EVM,
    eip1559: true,
    stateOverrideSupport: {
      balance: true,
      bytecode: true,
      stateDiff: true
    },
    smartAccountSupport: {
      smartAccountsV2: true,
      nexus: false
    },
    paymasters: {
      v060: DEFAULT_ENTRYPOINT_V6_PAYMASTERS
    }
  },
  "534351": {
    chainId: 534351,
    name: "Scroll Sepolia Testnet",
    isTestnet: true,
    stack: ChainStack.EVM,
    eip1559: true,
    stateOverrideSupport: {
      balance: true,
      bytecode: true,
      stateDiff: true
    },
    smartAccountSupport: {
      smartAccountsV2: true,
      nexus: false
    },
    paymasters: {
      v060: DEFAULT_ENTRYPOINT_V6_PAYMASTERS
    }
  },
  "27827": {
    chainId: 27827,
    name: "ZeroOne Mainnet",
    isTestnet: false,
    stack: ChainStack.EVM,
    eip1559: true,
    nativeCurrency: "AVAX",
    stateOverrideSupport: {
      balance: true,
      bytecode: true,
      stateDiff: true
    },
    smartAccountSupport: {
      smartAccountsV2: true,
      nexus: false
    },
    paymasters: {
      v060: DEFAULT_ENTRYPOINT_V6_PAYMASTERS
    }
  },
  "56400": {
    chainId: 56400,
    name: "ZeroOne Testnet",
    isTestnet: true,
    stack: ChainStack.EVM,
    eip1559: true,
    nativeCurrency: "AVAX",
    stateOverrideSupport: {
      balance: true,
      bytecode: true,
      stateDiff: true
    },
    smartAccountSupport: {
      smartAccountsV2: true,
      nexus: false
    },
    paymasters: {
      v060: DEFAULT_ENTRYPOINT_V6_PAYMASTERS
    }
  },
  "7000": {
    chainId: 7000,
    name: "ZetaChain Mainnet",
    isTestnet: false,
    stack: ChainStack.EVM,
    eip1559: true,
    stateOverrideSupport: {
      balance: false,
      bytecode: false,
      stateDiff: false
    },
    smartAccountSupport: {
      smartAccountsV2: true,
      nexus: false
    },
    paymasters: {
      v060: DEFAULT_ENTRYPOINT_V6_PAYMASTERS
    }
  },
  "7001": {
    chainId: 7001,
    name: "ZetaChain Testnet",
    isTestnet: true,
    stack: ChainStack.EVM,
    eip1559: true,
    stateOverrideSupport: {
      balance: false,
      bytecode: false,
      stateDiff: false
    },
    smartAccountSupport: {
      smartAccountsV2: true,
      nexus: false
    },
    paymasters: {
      v060: DEFAULT_ENTRYPOINT_V6_PAYMASTERS
    }
  },
  "4653": {
    chainId: 4653,
    name: "Gold Chain Mainnet",
    isTestnet: false,
    stack: ChainStack.Optimism,
    eip1559: true,
    nativeCurrency: "ETH",
    stateOverrideSupport: {
      balance: true,
      bytecode: true,
      stateDiff: true
    },
    smartAccountSupport: {
      smartAccountsV2: true,
      nexus: false
    },
    paymasters: {
      v060: DEFAULT_ENTRYPOINT_V6_PAYMASTERS
    }
  },
  "8101902": {
    chainId: 8101902,
    name: "Olive Testnet",
    isTestnet: true,
    stack: ChainStack.EVM,
    eip1559: true,
    stateOverrideSupport: {
      balance: false,
      bytecode: false,
      stateDiff: false
    },
    smartAccountSupport: {
      smartAccountsV2: true,
      nexus: false
    },
    paymasters: {
      v060: DEFAULT_ENTRYPOINT_V6_PAYMASTERS
    }
  },
  "666666666": {
    chainId: 666666666,
    name: "Degen Mainnet",
    isTestnet: false,
    stack: ChainStack.EVM,
    eip1559: true,
    stateOverrideSupport: {
      balance: true,
      bytecode: false,
      stateDiff: true
    },
    smartAccountSupport: {
      smartAccountsV2: true,
      nexus: false
    },
    paymasters: {
      v060: DEFAULT_ENTRYPOINT_V6_PAYMASTERS
    }
  },
  "5003": {
    chainId: 5003,
    name: "Mantle Sepolia Testnet",
    isTestnet: true,
    stack: ChainStack.Mantle,
    eip1559: true,
    stateOverrideSupport: {
      balance: true,
      bytecode: true,
      stateDiff: true
    },
    smartAccountSupport: {
      smartAccountsV2: true,
      nexus: false
    },
    paymasters: {
      v060: DEFAULT_ENTRYPOINT_V6_PAYMASTERS
    }
  },
  "100": {
    chainId: 100,
    name: "Gnosis Mainnet",
    isTestnet: false,
    stack: ChainStack.EVM,
    eip1559: true,
    stateOverrideSupport: {
      balance: true,
      bytecode: true,
      stateDiff: true
    },
    smartAccountSupport: {
      smartAccountsV2: true,
      nexus: true
    },
    entryPoints: DEFAULT_ENTRYPOINTS,
    paymasters: DEFAULT_PAYMASTERS
  },
  "10200": {
    chainId: 10200,
    name: "Gnosis Chiado Testnet",
    isTestnet: true,
    stack: ChainStack.EVM,
    eip1559: true,
    stateOverrideSupport: {
      balance: true,
      bytecode: true,
      stateDiff: true
    },
    smartAccountSupport: {
      smartAccountsV2: true,
      nexus: true
    },
    paymasters: DEFAULT_PAYMASTERS
  },
  "195": {
    chainId: 195,
    name: "X Layer Testnet",
    isTestnet: true,
    stack: ChainStack.EVM,
    eip1559: false,
    stateOverrideSupport: {
      balance: false,
      bytecode: false,
      stateDiff: false
    },
    smartAccountSupport: {
      smartAccountsV2: true,
      nexus: false
    },
    paymasters: {
      v060: DEFAULT_ENTRYPOINT_V6_PAYMASTERS
    }
  },
  "196": {
    chainId: 196,
    name: "X Layer Mainnet",
    isTestnet: false,
    stack: ChainStack.EVM,
    eip1559: false,
    stateOverrideSupport: {
      balance: true,
      bytecode: false,
      stateDiff: false
    },
    smartAccountSupport: {
      smartAccountsV2: true,
      nexus: false
    },
    paymasters: {
      v060: DEFAULT_ENTRYPOINT_V6_PAYMASTERS
    }
  },
  "2818": {
    chainId: 2818,
    name: "Morph Mainnet",
    isTestnet: false,
    stack: ChainStack.EVM,
    eip1559: true,
    stateOverrideSupport: {
      balance: true,
      bytecode: true,
      stateDiff: false
    },
    smartAccountSupport: {
      smartAccountsV2: true,
      nexus: false
    },
    paymasters: {
      v060: DEFAULT_ENTRYPOINT_V6_PAYMASTERS
    }
  },
  "2810": {
    chainId: 2810,
    name: "Morph Holesky Testnet",
    isTestnet: true,
    stack: ChainStack.EVM,
    eip1559: true,
    stateOverrideSupport: {
      balance: true,
      bytecode: true,
      stateDiff: true
    },
    smartAccountSupport: {
      smartAccountsV2: true,
      nexus: false
    },
    paymasters: {
      v060: DEFAULT_ENTRYPOINT_V6_PAYMASTERS
    }
  },
  "5845": {
    chainId: 5845,
    name: "Tangle Mainnet",
    isTestnet: false,
    stack: ChainStack.EVM,
    eip1559: true,
    stateOverrideSupport: {
      balance: false,
      bytecode: false,
      stateDiff: false
    },
    smartAccountSupport: {
      smartAccountsV2: true,
      nexus: false
    },
    paymasters: {
      v060: DEFAULT_ENTRYPOINT_V6_PAYMASTERS
    }
  },
  "3799": {
    chainId: 3799,
    name: "Tangle Testnet",
    isTestnet: true,
    stack: ChainStack.EVM,
    eip1559: true,
    stateOverrideSupport: {
      balance: true,
      bytecode: true,
      stateDiff: true
    },
    smartAccountSupport: {
      smartAccountsV2: true,
      nexus: false
    },
    paymasters: {
      v060: DEFAULT_ENTRYPOINT_V6_PAYMASTERS
    }
  },
  "167000": {
    chainId: 167000,
    name: "Taiko Mainnet",
    isTestnet: false,
    stack: ChainStack.EVM,
    eip1559: true,
    stateOverrideSupport: {
      balance: false,
      bytecode: false,
      stateDiff: false
    },
    smartAccountSupport: {
      smartAccountsV2: true,
      nexus: false
    },
    paymasters: {
      v060: DEFAULT_ENTRYPOINT_V6_PAYMASTERS
    }
  },
  "167009": {
    chainId: 167009,
    name: "Taiko Hekla Testnet",
    isTestnet: true,
    stack: ChainStack.EVM,
    eip1559: true,
    stateOverrideSupport: {
      balance: false,
      bytecode: false,
      stateDiff: false
    },
    smartAccountSupport: {
      smartAccountsV2: true,
      nexus: false
    },
    paymasters: {
      v060: DEFAULT_ENTRYPOINT_V6_PAYMASTERS
    }
  },
  "80084": {
    chainId: 80084,
    name: "Berachain bArtio Testnet",
    isTestnet: true,
    stack: ChainStack.EVM,
    eip1559: true,
    stateOverrideSupport: {
      balance: true,
      bytecode: true,
      stateDiff: true
    },
    smartAccountSupport: {
      smartAccountsV2: true,
      nexus: true
    },
    entryPoints: DEFAULT_ENTRYPOINTS,
    paymasters: {
      v060: DEFAULT_ENTRYPOINT_V6_PAYMASTERS,
      v070: {
        [DEFAULT_ENTRYPOINT_V7_SPONSORSHIP_PAYMASTER_ADDRESS]: {
          type: "sponsorship",
          dummyPaymasterData: DEFAULT_EP_V7_SPONSORSHIP_DUMMY_PAYMASTER_DATA,
          postOpGasLimit: 50000n
        }
      }
    }
  },
  "1328": {
    chainId: 1328,
    name: "Sei Atlantic 2 Testnet",
    isTestnet: true,
    stack: ChainStack.EVM,
    eip1559: true,
    stateOverrideSupport: {
      balance: true,
      bytecode: false,
      stateDiff: false
    },
    smartAccountSupport: {
      smartAccountsV2: true,
      nexus: false
    },
    simulation: {
      preVerificationGas: 1000000n,
      callGasLimit: 5000000n,
      verificationGasLimit: 2000000n
    },
    paymasters: {
      v060: DEFAULT_ENTRYPOINT_V6_PAYMASTERS
    }
  },
  "1329": {
    chainId: 1329,
    name: "Sei Mainnet",
    isTestnet: false,
    stack: ChainStack.EVM,
    eip1559: true,
    stateOverrideSupport: {
      balance: true,
      bytecode: false,
      stateDiff: false
    },
    smartAccountSupport: {
      smartAccountsV2: true,
      nexus: false
    },
    simulation: {
      preVerificationGas: 1000000n,
      callGasLimit: 5000000n,
      verificationGasLimit: 2000000n
    },
    paymasters: {
      v060: DEFAULT_ENTRYPOINT_V6_PAYMASTERS
    }
  },
  "995": {
    chainId: 995,
    name: "5ireChain Mainnet",
    isTestnet: false,
    stack: ChainStack.EVM,
    eip1559: true,
    stateOverrideSupport: {
      balance: false,
      bytecode: false,
      stateDiff: false
    },
    smartAccountSupport: {
      smartAccountsV2: true,
      nexus: false
    },
    paymasters: {
      v060: DEFAULT_ENTRYPOINT_V6_PAYMASTERS
    }
  },
  "997": {
    chainId: 995,
    name: "5ireChain Testnet",
    isTestnet: true,
    stack: ChainStack.EVM,
    eip1559: true,
    stateOverrideSupport: {
      balance: false,
      bytecode: false,
      stateDiff: false
    },
    smartAccountSupport: {
      smartAccountsV2: true,
      nexus: false
    },
    paymasters: {
      v060: DEFAULT_ENTRYPOINT_V6_PAYMASTERS
    }
  },
  "288": {
    chainId: 288,
    name: "Boba Mainnet",
    isTestnet: false,
    stack: ChainStack.Optimism,
    eip1559: true,
    stateOverrideSupport: {
      balance: true,
      bytecode: false,
      stateDiff: false
    },
    smartAccountSupport: {
      smartAccountsV2: true,
      nexus: false
    },
    paymasters: {
      v060: DEFAULT_ENTRYPOINT_V6_PAYMASTERS
    }
  },
  "28882": {
    chainId: 28882,
    name: "Boba Sepolia Testnet",
    isTestnet: true,
    stack: ChainStack.Optimism,
    eip1559: true,
    stateOverrideSupport: {
      balance: true,
      bytecode: false,
      stateDiff: false
    },
    smartAccountSupport: {
      smartAccountsV2: true,
      nexus: false
    },
    paymasters: {
      v060: DEFAULT_ENTRYPOINT_V6_PAYMASTERS
    }
  },
  "920637907288165": {
    chainId: 920637907288165,
    name: "Kakarot Starknet Sepolia",
    isTestnet: true,
    stack: ChainStack.EVM,
    eip1559: true,
    stateOverrideSupport: {
      balance: false,
      bytecode: false,
      stateDiff: false
    },
    smartAccountSupport: {
      smartAccountsV2: true,
      nexus: false
    },
    simulation: {
      preVerificationGas: 1000000n,
      callGasLimit: 2000000n,
      verificationGasLimit: 2000000n
    },
    paymasters: {
      v060: DEFAULT_ENTRYPOINT_V6_PAYMASTERS
    }
  },
  "1750": {
    chainId: 1750,
    name: "Metal L2 Mainnet",
    isTestnet: false,
    stack: ChainStack.Optimism,
    eip1559: true,
    nativeCurrency: "ETH",
    stateOverrideSupport: {
      balance: true,
      bytecode: true,
      stateDiff: true
    },
    smartAccountSupport: {
      smartAccountsV2: true,
      nexus: false
    },
    paymasters: {
      v060: DEFAULT_ENTRYPOINT_V6_PAYMASTERS
    }
  },
  "1740": {
    chainId: 1740,
    name: "Metal L2 Testnet",
    isTestnet: true,
    stack: ChainStack.Optimism,
    eip1559: true,
    nativeCurrency: "ETH",
    stateOverrideSupport: {
      balance: true,
      bytecode: true,
      stateDiff: true
    },
    smartAccountSupport: {
      smartAccountsV2: true,
      nexus: false
    },
    paymasters: {
      v060: DEFAULT_ENTRYPOINT_V6_PAYMASTERS
    }
  },
  "1135": {
    chainId: 1135,
    name: "Lisk Mainnet",
    isTestnet: false,
    stack: ChainStack.Optimism,
    eip1559: true,
    stateOverrideSupport: {
      balance: true,
      bytecode: false,
      stateDiff: false
    },
    smartAccountSupport: {
      smartAccountsV2: true,
      nexus: false
    },
    paymasters: {
      v060: DEFAULT_ENTRYPOINT_V6_PAYMASTERS
    }
  },
  "4202": {
    chainId: 4202,
    name: "Lisk Sepolia Testnet",
    isTestnet: true,
    stack: ChainStack.Optimism,
    eip1559: true,
    stateOverrideSupport: {
      balance: true,
      bytecode: false,
      stateDiff: false
    },
    smartAccountSupport: {
      smartAccountsV2: true,
      nexus: false
    },
    paymasters: {
      v060: DEFAULT_ENTRYPOINT_V6_PAYMASTERS
    }
  },
  "57054": {
    chainId: 57054,
    name: "Sonic Blaze Testnet",
    isTestnet: true,
    stack: ChainStack.EVM,
    eip1559: true,
    stateOverrideSupport: {
      balance: true,
      bytecode: true,
      stateDiff: true
    },
    simulation: {
      preVerificationGas: 5_000_000n,
      callGasLimit: 5_000_000n,
      verificationGasLimit: 5_000_000n
    },
    smartAccountSupport: {
      smartAccountsV2: false,
      nexus: true
    },
    paymasters: {
      v070: {
        [DEFAULT_ENTRYPOINT_V7_SPONSORSHIP_PAYMASTER_ADDRESS]: {
          type: "sponsorship",
          dummyPaymasterData: DEFAULT_EP_V7_SPONSORSHIP_DUMMY_PAYMASTER_DATA,
          postOpGasLimit: 50000n
        }
      }
    }
  },
  "146": {
    chainId: 146,
    name: "Sonic Mainnet",
    isTestnet: false,
    stack: ChainStack.EVM,
    eip1559: true,
    stateOverrideSupport: {
      balance: true,
      bytecode: true,
      stateDiff: true
    },
    simulation: {
      preVerificationGas: 5_000_000n,
      callGasLimit: 5_000_000n,
      verificationGasLimit: 5_000_000n
    },
    smartAccountSupport: {
      smartAccountsV2: false,
      nexus: true
    },
    paymasters: DEFAULT_PAYMASTERS
  },
  "10143": {
    chainId: 10143,
    name: "Monad Testnet",
    isTestnet: true,
    stack: ChainStack.EVM,
    eip1559: true,
    stateOverrideSupport: {
      balance: true,
      bytecode: true,
      stateDiff: true
    },
    smartAccountSupport: {
      smartAccountsV2: false,
      nexus: true
    },
    paymasters: {},
    contracts: {
      bootStrapAddress: "0x7052eE73e9e9cA6884eb2146cA5c020492E5bB9D",
      factoryAddress: "0xF8524aB72c688069DfFa8B1Cbb6005929B5Aff58",
      validatorAddress: "0xEbc7f5Cff2cABcFdfD65a37A9342240b39A73fcd",
    }
  }
}
