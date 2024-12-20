import { ChainStack, SupportedChain } from "./types";

export const supportedChains: Record<string, SupportedChain> = {
  "1": {
    chainId: 1,
    name: "Ethereum Mainnet",
    isTestnet: false,
    stack: ChainStack.EVM,
    eip1559: true,
    stateOverrideSupport: {
      balance: true,
      bytecode: false,
    },
    smartAccountSupport: {
      smartAccountsV2: true,
      nexus: true,
    },
  },
  "11155111": {
    chainId: 11155111,
    name: "Ethereum Sepolia",
    isTestnet: true,
    stack: ChainStack.EVM,
    eip1559: true,
    stateOverrideSupport: {
      balance: true,
      bytecode: false,
    },
    smartAccountSupport: {
      smartAccountsV2: true,
      nexus: true,
    },
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
    },
    smartAccountSupport: {
      smartAccountsV2: true,
      nexus: true,
    },
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
    },
    smartAccountSupport: {
      smartAccountsV2: true,
      nexus: true,
    },
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
    },
    smartAccountSupport: {
      smartAccountsV2: true,
      nexus: true,
    },
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
    },
    smartAccountSupport: {
      smartAccountsV2: true,
      nexus: true,
    },
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
    },
    smartAccountSupport: {
      smartAccountsV2: true,
      nexus: false,
    },
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
    },
    smartAccountSupport: {
      smartAccountsV2: true,
      nexus: false,
    },
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
    },
    smartAccountSupport: {
      smartAccountsV2: true,
      nexus: true,
    },
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
    },
    smartAccountSupport: {
      smartAccountsV2: true,
      nexus: true,
    },
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
    },
    smartAccountSupport: {
      smartAccountsV2: true,
      nexus: false,
    },
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
    },
    smartAccountSupport: {
      smartAccountsV2: true,
      nexus: true,
    },
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
    },
    smartAccountSupport: {
      smartAccountsV2: true,
      nexus: false,
    },
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
    },
    smartAccountSupport: {
      smartAccountsV2: true,
      nexus: false,
    },
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
    },
    smartAccountSupport: {
      smartAccountsV2: true,
      nexus: false,
    },
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
    },
    smartAccountSupport: {
      smartAccountsV2: true,
      nexus: true,
    },
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
    },
    smartAccountSupport: {
      smartAccountsV2: true,
      nexus: false,
    },
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
    },
    smartAccountSupport: {
      smartAccountsV2: true,
      nexus: false,
    },
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
    },
    smartAccountSupport: {
      smartAccountsV2: true,
      nexus: false,
    },
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
    },
    smartAccountSupport: {
      smartAccountsV2: true,
      nexus: false,
    },
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
    },
    smartAccountSupport: {
      smartAccountsV2: true,
      nexus: false,
    },
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
    },
    smartAccountSupport: {
      smartAccountsV2: true,
      nexus: false,
    },
  },
  "88888": {
    chainId: 88888,
    name: "Chiliz Mainnet",
    isTestnet: false,
    stack: ChainStack.EVM,
    eip1559: false,
    entryPoints: {
      v060: {
        address: "0x00000061fefce24a79343c27127435286bb7a4e1",
      },
    },
    stateOverrideSupport: {
      balance: true,
      bytecode: false,
    },
    smartAccountSupport: {
      smartAccountsV2: true,
      nexus: false,
    },
  },
  "88882": {
    chainId: 88882,
    name: "Chiliz Spicy Testnet",
    isTestnet: true,
    stack: ChainStack.EVM,
    eip1559: false,
    entryPoints: {
      v060: {
        address: "0x00000061fefce24a79343c27127435286bb7a4e1",
      },
    },
    stateOverrideSupport: {
      balance: true,
      bytecode: false,
    },
    smartAccountSupport: {
      smartAccountsV2: true,
      nexus: false,
    },
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
    },
    smartAccountSupport: {
      smartAccountsV2: true,
      nexus: false,
    },
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
    },
    smartAccountSupport: {
      smartAccountsV2: true,
      nexus: false,
    },
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
    },
    smartAccountSupport: {
      smartAccountsV2: true,
      nexus: false,
    },
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
    },
    smartAccountSupport: {
      smartAccountsV2: true,
      nexus: false,
    },
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
    },
    smartAccountSupport: {
      smartAccountsV2: true,
      nexus: false,
    },
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
    },
    smartAccountSupport: {
      smartAccountsV2: true,
      nexus: false,
    },
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
    },
    smartAccountSupport: {
      smartAccountsV2: true,
      nexus: false,
    },
  },
  "81457": {
    chainId: 81457,
    name: "Blast Mainnet",
    isTestnet: false,
    stack: ChainStack.EVM,
    eip1559: true,
    stateOverrideSupport: {
      balance: true,
      bytecode: false,
    },
    smartAccountSupport: {
      smartAccountsV2: true,
      nexus: false,
    },
  },
  "168587773": {
    chainId: 168587773,
    name: "Blast Sepolia Testnet",
    isTestnet: true,
    stack: ChainStack.EVM,
    eip1559: true,
    stateOverrideSupport: {
      balance: true,
      bytecode: false,
    },
    smartAccountSupport: {
      smartAccountsV2: true,
      nexus: false,
    },
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
    },
    smartAccountSupport: {
      smartAccountsV2: true,
      nexus: false,
    },
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
    },
    smartAccountSupport: {
      smartAccountsV2: true,
      nexus: false,
    },
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
    },
    smartAccountSupport: {
      smartAccountsV2: true,
      nexus: false,
    },
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
    },
    smartAccountSupport: {
      smartAccountsV2: true,
      nexus: false,
    },
  },
  "7000": {
    chainId: 7000,
    name: "ZetaChain Mainnet",
    isTestnet: false,
    stack: ChainStack.EVM,
    eip1559: true,
    stateOverrideSupport: {
      balance: false,
      bytecode: true,
    },
    smartAccountSupport: {
      smartAccountsV2: true,
      nexus: false,
    },
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
    },
    smartAccountSupport: {
      smartAccountsV2: true,
      nexus: false,
    },
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
    },
    smartAccountSupport: {
      smartAccountsV2: true,
      nexus: false,
    },
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
    },
    smartAccountSupport: {
      smartAccountsV2: true,
      nexus: false,
    },
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
    },
    smartAccountSupport: {
      smartAccountsV2: true,
      nexus: false,
    },
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
    },
    smartAccountSupport: {
      smartAccountsV2: true,
      nexus: false,
    },
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
    },
    smartAccountSupport: {
      smartAccountsV2: true,
      nexus: true,
    },
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
    },
    smartAccountSupport: {
      smartAccountsV2: true,
      nexus: true,
    },
  },
  "195": {
    chainId: 195,
    name: "X Layer Testnet",
    isTestnet: true,
    stack: ChainStack.EVM,
    eip1559: true,
    stateOverrideSupport: {
      balance: false,
      bytecode: false,
    },
    smartAccountSupport: {
      smartAccountsV2: true,
      nexus: false,
    },
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
    },
    smartAccountSupport: {
      smartAccountsV2: true,
      nexus: false,
    },
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
    },
    smartAccountSupport: {
      smartAccountsV2: true,
      nexus: false,
    },
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
    },
    smartAccountSupport: {
      smartAccountsV2: true,
      nexus: false,
    },
  },
  "5845": {
    chainId: 5845,
    name: "Tangle Mainnet",
    isTestnet: false,
    stack: ChainStack.EVM,
    eip1559: true,
    stateOverrideSupport: {
      balance: false,
      bytecode: true,
    },
    smartAccountSupport: {
      smartAccountsV2: true,
      nexus: false,
    },
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
    },
    smartAccountSupport: {
      smartAccountsV2: true,
      nexus: false,
    },
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
    },
    smartAccountSupport: {
      smartAccountsV2: true,
      nexus: false,
    },
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
    },
    smartAccountSupport: {
      smartAccountsV2: true,
      nexus: false,
    },
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
    },
    smartAccountSupport: {
      smartAccountsV2: true,
      nexus: true,
    },
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
    },
    smartAccountSupport: {
      smartAccountsV2: true,
      nexus: false,
    },
    simulation: {
      preVerificationGas: 1000000n,
      callGasLimit: 5000000n,
      verificationGasLimit: 2000000n,
    },
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
    },
    smartAccountSupport: {
      smartAccountsV2: true,
      nexus: false,
    },
    simulation: {
      preVerificationGas: 1000000n,
      callGasLimit: 5000000n,
      verificationGasLimit: 2000000n,
    },
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
    },
    smartAccountSupport: {
      smartAccountsV2: true,
      nexus: false,
    },
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
    },
    smartAccountSupport: {
      smartAccountsV2: true,
      nexus: false,
    },
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
    },
    smartAccountSupport: {
      smartAccountsV2: true,
      nexus: false,
    },
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
    },
    smartAccountSupport: {
      smartAccountsV2: true,
      nexus: false,
    },
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
    },
    smartAccountSupport: {
      smartAccountsV2: true,
      nexus: false,
    },
    simulation: {
      preVerificationGas: 1000000n,
      callGasLimit: 2000000n,
      verificationGasLimit: 2000000n,
    },
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
    },
    smartAccountSupport: {
      smartAccountsV2: true,
      nexus: false,
    },
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
    },
    smartAccountSupport: {
      smartAccountsV2: true,
      nexus: false,
    },
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
    },
    smartAccountSupport: {
      smartAccountsV2: true,
      nexus: false,
    },
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
    },
    smartAccountSupport: {
      smartAccountsV2: true,
      nexus: false,
    },
  },
};
