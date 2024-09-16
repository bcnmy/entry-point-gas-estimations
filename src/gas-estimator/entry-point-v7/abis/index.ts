import { AbiFunction } from "viem";

export const ENTRY_POINT_ABI = [
  {
    inputs: [
      { internalType: "bool", name: "success", type: "bool" },
      { internalType: "bytes", name: "ret", type: "bytes" },
    ],
    name: "DelegateAndRevert",
    type: "error",
  },
  {
    inputs: [
      { internalType: "uint256", name: "opIndex", type: "uint256" },
      { internalType: "string", name: "reason", type: "string" },
    ],
    name: "FailedOp",
    type: "error",
  },
  {
    inputs: [
      { internalType: "uint256", name: "opIndex", type: "uint256" },
      { internalType: "string", name: "reason", type: "string" },
      { internalType: "bytes", name: "inner", type: "bytes" },
    ],
    name: "FailedOpWithRevert",
    type: "error",
  },
  {
    inputs: [{ internalType: "bytes", name: "returnData", type: "bytes" }],
    name: "PostOpReverted",
    type: "error",
  },
  { inputs: [], name: "ReentrancyGuardReentrantCall", type: "error" },
  {
    inputs: [{ internalType: "address", name: "sender", type: "address" }],
    name: "SenderAddressResult",
    type: "error",
  },
  {
    inputs: [{ internalType: "address", name: "aggregator", type: "address" }],
    name: "SignatureValidationFailed",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "userOpHash",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "address",
        name: "sender",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "factory",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "paymaster",
        type: "address",
      },
    ],
    name: "AccountDeployed",
    type: "event",
  },
  { anonymous: false, inputs: [], name: "BeforeExecution", type: "event" },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "totalDeposit",
        type: "uint256",
      },
    ],
    name: "Deposited",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "userOpHash",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "address",
        name: "sender",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "nonce",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "bytes",
        name: "revertReason",
        type: "bytes",
      },
    ],
    name: "PostOpRevertReason",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "aggregator",
        type: "address",
      },
    ],
    name: "SignatureAggregatorChanged",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "totalStaked",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "unstakeDelaySec",
        type: "uint256",
      },
    ],
    name: "StakeLocked",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "withdrawTime",
        type: "uint256",
      },
    ],
    name: "StakeUnlocked",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "withdrawAddress",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "StakeWithdrawn",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "userOpHash",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "address",
        name: "sender",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "paymaster",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "nonce",
        type: "uint256",
      },
      { indexed: false, internalType: "bool", name: "success", type: "bool" },
      {
        indexed: false,
        internalType: "uint256",
        name: "actualGasCost",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "actualGasUsed",
        type: "uint256",
      },
    ],
    name: "UserOperationEvent",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "userOpHash",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "address",
        name: "sender",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "nonce",
        type: "uint256",
      },
    ],
    name: "UserOperationPrefundTooLow",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "userOpHash",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "address",
        name: "sender",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "nonce",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "bytes",
        name: "revertReason",
        type: "bytes",
      },
    ],
    name: "UserOperationRevertReason",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "withdrawAddress",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "Withdrawn",
    type: "event",
  },
  {
    inputs: [
      { internalType: "uint32", name: "unstakeDelaySec", type: "uint32" },
    ],
    name: "addStake",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "target", type: "address" },
      { internalType: "bytes", name: "data", type: "bytes" },
    ],
    name: "delegateAndRevert",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "account", type: "address" }],
    name: "depositTo",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "deposits",
    outputs: [
      { internalType: "uint256", name: "deposit", type: "uint256" },
      { internalType: "bool", name: "staked", type: "bool" },
      { internalType: "uint112", name: "stake", type: "uint112" },
      { internalType: "uint32", name: "unstakeDelaySec", type: "uint32" },
      { internalType: "uint48", name: "withdrawTime", type: "uint48" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "account", type: "address" }],
    name: "getDepositInfo",
    outputs: [
      {
        components: [
          { internalType: "uint256", name: "deposit", type: "uint256" },
          { internalType: "bool", name: "staked", type: "bool" },
          { internalType: "uint112", name: "stake", type: "uint112" },
          { internalType: "uint32", name: "unstakeDelaySec", type: "uint32" },
          { internalType: "uint48", name: "withdrawTime", type: "uint48" },
        ],
        internalType: "struct IStakeManager.DepositInfo",
        name: "info",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "sender", type: "address" },
      { internalType: "uint192", name: "key", type: "uint192" },
    ],
    name: "getNonce",
    outputs: [{ internalType: "uint256", name: "nonce", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "bytes", name: "initCode", type: "bytes" }],
    name: "getSenderAddress",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          { internalType: "address", name: "sender", type: "address" },
          { internalType: "uint256", name: "nonce", type: "uint256" },
          { internalType: "bytes", name: "initCode", type: "bytes" },
          { internalType: "bytes", name: "callData", type: "bytes" },
          {
            internalType: "bytes32",
            name: "accountGasLimits",
            type: "bytes32",
          },
          {
            internalType: "uint256",
            name: "preVerificationGas",
            type: "uint256",
          },
          { internalType: "bytes32", name: "gasFees", type: "bytes32" },
          { internalType: "bytes", name: "paymasterAndData", type: "bytes" },
          { internalType: "bytes", name: "signature", type: "bytes" },
        ],
        internalType: "struct PackedUserOperation",
        name: "userOp",
        type: "tuple",
      },
    ],
    name: "getUserOpHash",
    outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            components: [
              { internalType: "address", name: "sender", type: "address" },
              { internalType: "uint256", name: "nonce", type: "uint256" },
              { internalType: "bytes", name: "initCode", type: "bytes" },
              { internalType: "bytes", name: "callData", type: "bytes" },
              {
                internalType: "bytes32",
                name: "accountGasLimits",
                type: "bytes32",
              },
              {
                internalType: "uint256",
                name: "preVerificationGas",
                type: "uint256",
              },
              { internalType: "bytes32", name: "gasFees", type: "bytes32" },
              {
                internalType: "bytes",
                name: "paymasterAndData",
                type: "bytes",
              },
              { internalType: "bytes", name: "signature", type: "bytes" },
            ],
            internalType: "struct PackedUserOperation[]",
            name: "userOps",
            type: "tuple[]",
          },
          {
            internalType: "contract IAggregator",
            name: "aggregator",
            type: "address",
          },
          { internalType: "bytes", name: "signature", type: "bytes" },
        ],
        internalType: "struct IEntryPoint.UserOpsPerAggregator[]",
        name: "opsPerAggregator",
        type: "tuple[]",
      },
      { internalType: "address payable", name: "beneficiary", type: "address" },
    ],
    name: "handleAggregatedOps",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          { internalType: "address", name: "sender", type: "address" },
          { internalType: "uint256", name: "nonce", type: "uint256" },
          { internalType: "bytes", name: "initCode", type: "bytes" },
          { internalType: "bytes", name: "callData", type: "bytes" },
          {
            internalType: "bytes32",
            name: "accountGasLimits",
            type: "bytes32",
          },
          {
            internalType: "uint256",
            name: "preVerificationGas",
            type: "uint256",
          },
          { internalType: "bytes32", name: "gasFees", type: "bytes32" },
          { internalType: "bytes", name: "paymasterAndData", type: "bytes" },
          { internalType: "bytes", name: "signature", type: "bytes" },
        ],
        internalType: "struct PackedUserOperation[]",
        name: "ops",
        type: "tuple[]",
      },
      { internalType: "address payable", name: "beneficiary", type: "address" },
    ],
    name: "handleOps",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint192", name: "key", type: "uint192" }],
    name: "incrementNonce",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "bytes", name: "callData", type: "bytes" },
      {
        components: [
          {
            components: [
              { internalType: "address", name: "sender", type: "address" },
              { internalType: "uint256", name: "nonce", type: "uint256" },
              {
                internalType: "uint256",
                name: "verificationGasLimit",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "callGasLimit",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "paymasterVerificationGasLimit",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "paymasterPostOpGasLimit",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "preVerificationGas",
                type: "uint256",
              },
              { internalType: "address", name: "paymaster", type: "address" },
              {
                internalType: "uint256",
                name: "maxFeePerGas",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "maxPriorityFeePerGas",
                type: "uint256",
              },
            ],
            internalType: "struct EntryPoint.MemoryUserOp",
            name: "mUserOp",
            type: "tuple",
          },
          { internalType: "bytes32", name: "userOpHash", type: "bytes32" },
          { internalType: "uint256", name: "prefund", type: "uint256" },
          { internalType: "uint256", name: "contextOffset", type: "uint256" },
          { internalType: "uint256", name: "preOpGas", type: "uint256" },
        ],
        internalType: "struct EntryPoint.UserOpInfo",
        name: "opInfo",
        type: "tuple",
      },
      { internalType: "bytes", name: "context", type: "bytes" },
    ],
    name: "innerHandleOp",
    outputs: [
      { internalType: "uint256", name: "actualGasCost", type: "uint256" },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "", type: "address" },
      { internalType: "uint192", name: "", type: "uint192" },
    ],
    name: "nonceSequenceNumber",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "bytes4", name: "interfaceId", type: "bytes4" }],
    name: "supportsInterface",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "unlockStake",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address payable",
        name: "withdrawAddress",
        type: "address",
      },
    ],
    name: "withdrawStake",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address payable",
        name: "withdrawAddress",
        type: "address",
      },
      { internalType: "uint256", name: "withdrawAmount", type: "uint256" },
    ],
    name: "withdrawTo",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  { stateMutability: "payable", type: "receive" },
] as const;

export const ENTRY_POINT_SIMULATIONS_ABI_ONE = [
  {
    type: "constructor",
    inputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "receive",
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "addStake",
    inputs: [
      {
        name: "unstakeDelaySec",
        type: "uint32",
        internalType: "uint32",
      },
    ],
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "balanceOf",
    inputs: [
      {
        name: "account",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "depositTo",
    inputs: [
      {
        name: "account",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "deposits",
    inputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "deposit",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "staked",
        type: "bool",
        internalType: "bool",
      },
      {
        name: "stake",
        type: "uint112",
        internalType: "uint112",
      },
      {
        name: "unstakeDelaySec",
        type: "uint32",
        internalType: "uint32",
      },
      {
        name: "withdrawTime",
        type: "uint48",
        internalType: "uint48",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getDepositInfo",
    inputs: [
      {
        name: "account",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "info",
        type: "tuple",
        internalType: "struct IStakeManager.DepositInfo",
        components: [
          {
            name: "deposit",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "staked",
            type: "bool",
            internalType: "bool",
          },
          {
            name: "stake",
            type: "uint112",
            internalType: "uint112",
          },
          {
            name: "unstakeDelaySec",
            type: "uint32",
            internalType: "uint32",
          },
          {
            name: "withdrawTime",
            type: "uint48",
            internalType: "uint48",
          },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getNonce",
    inputs: [
      {
        name: "sender",
        type: "address",
        internalType: "address",
      },
      {
        name: "key",
        type: "uint192",
        internalType: "uint192",
      },
    ],
    outputs: [
      {
        name: "nonce",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getUserOpHash",
    inputs: [
      {
        name: "userOp",
        type: "tuple",
        internalType: "struct PackedUserOperation",
        components: [
          {
            name: "sender",
            type: "address",
            internalType: "address",
          },
          {
            name: "nonce",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "initCode",
            type: "bytes",
            internalType: "bytes",
          },
          {
            name: "callData",
            type: "bytes",
            internalType: "bytes",
          },
          {
            name: "accountGasLimits",
            type: "bytes32",
            internalType: "bytes32",
          },
          {
            name: "preVerificationGas",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "gasFees",
            type: "bytes32",
            internalType: "bytes32",
          },
          {
            name: "paymasterAndData",
            type: "bytes",
            internalType: "bytes",
          },
          {
            name: "signature",
            type: "bytes",
            internalType: "bytes",
          },
        ],
      },
    ],
    outputs: [
      {
        name: "",
        type: "bytes32",
        internalType: "bytes32",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "incrementNonce",
    inputs: [
      {
        name: "key",
        type: "uint192",
        internalType: "uint192",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "innerHandleOp",
    inputs: [
      {
        name: "callData",
        type: "bytes",
        internalType: "bytes",
      },
      {
        name: "opInfo",
        type: "tuple",
        internalType: "struct EntryPoint.UserOpInfo",
        components: [
          {
            name: "mUserOp",
            type: "tuple",
            internalType: "struct EntryPoint.MemoryUserOp",
            components: [
              {
                name: "sender",
                type: "address",
                internalType: "address",
              },
              {
                name: "nonce",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "verificationGasLimit",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "callGasLimit",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "paymasterVerificationGasLimit",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "paymasterPostOpGasLimit",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "preVerificationGas",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "paymaster",
                type: "address",
                internalType: "address",
              },
              {
                name: "maxFeePerGas",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "maxPriorityFeePerGas",
                type: "uint256",
                internalType: "uint256",
              },
            ],
          },
          {
            name: "userOpHash",
            type: "bytes32",
            internalType: "bytes32",
          },
          {
            name: "prefund",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "contextOffset",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "preOpGas",
            type: "uint256",
            internalType: "uint256",
          },
        ],
      },
      {
        name: "context",
        type: "bytes",
        internalType: "bytes",
      },
      {
        name: "preGas",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [
      {
        name: "actualGasCost",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "paymasterPostOpGasLimit",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "nonceSequenceNumber",
    inputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
      {
        name: "",
        type: "uint192",
        internalType: "uint192",
      },
    ],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "simulateCallData",
    inputs: [
      {
        name: "op",
        type: "tuple",
        internalType: "struct PackedUserOperation",
        components: [
          {
            name: "sender",
            type: "address",
            internalType: "address",
          },
          {
            name: "nonce",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "initCode",
            type: "bytes",
            internalType: "bytes",
          },
          {
            name: "callData",
            type: "bytes",
            internalType: "bytes",
          },
          {
            name: "accountGasLimits",
            type: "bytes32",
            internalType: "bytes32",
          },
          {
            name: "preVerificationGas",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "gasFees",
            type: "bytes32",
            internalType: "bytes32",
          },
          {
            name: "paymasterAndData",
            type: "bytes",
            internalType: "bytes",
          },
          {
            name: "signature",
            type: "bytes",
            internalType: "bytes",
          },
        ],
      },
      {
        name: "target",
        type: "address",
        internalType: "address",
      },
      {
        name: "targetCallData",
        type: "bytes",
        internalType: "bytes",
      },
    ],
    outputs: [
      {
        name: "",
        type: "tuple",
        internalType: "struct IEntryPointSimulations.TargetCallResult",
        components: [
          {
            name: "gasUsed",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "success",
            type: "bool",
            internalType: "bool",
          },
          {
            name: "returnData",
            type: "bytes",
            internalType: "bytes",
          },
        ],
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "simulateCallDataBulk",
    inputs: [
      {
        name: "ops",
        type: "tuple[]",
        internalType: "struct PackedUserOperation[]",
        components: [
          {
            name: "sender",
            type: "address",
            internalType: "address",
          },
          {
            name: "nonce",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "initCode",
            type: "bytes",
            internalType: "bytes",
          },
          {
            name: "callData",
            type: "bytes",
            internalType: "bytes",
          },
          {
            name: "accountGasLimits",
            type: "bytes32",
            internalType: "bytes32",
          },
          {
            name: "preVerificationGas",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "gasFees",
            type: "bytes32",
            internalType: "bytes32",
          },
          {
            name: "paymasterAndData",
            type: "bytes",
            internalType: "bytes",
          },
          {
            name: "signature",
            type: "bytes",
            internalType: "bytes",
          },
        ],
      },
      {
        name: "targets",
        type: "address[]",
        internalType: "address[]",
      },
      {
        name: "targetCallData",
        type: "bytes[]",
        internalType: "bytes[]",
      },
    ],
    outputs: [
      {
        name: "",
        type: "tuple[]",
        internalType: "struct IEntryPointSimulations.TargetCallResult[]",
        components: [
          {
            name: "gasUsed",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "success",
            type: "bool",
            internalType: "bool",
          },
          {
            name: "returnData",
            type: "bytes",
            internalType: "bytes",
          },
        ],
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "simulateCallDataLast",
    inputs: [
      {
        name: "ops",
        type: "tuple[]",
        internalType: "struct PackedUserOperation[]",
        components: [
          {
            name: "sender",
            type: "address",
            internalType: "address",
          },
          {
            name: "nonce",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "initCode",
            type: "bytes",
            internalType: "bytes",
          },
          {
            name: "callData",
            type: "bytes",
            internalType: "bytes",
          },
          {
            name: "accountGasLimits",
            type: "bytes32",
            internalType: "bytes32",
          },
          {
            name: "preVerificationGas",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "gasFees",
            type: "bytes32",
            internalType: "bytes32",
          },
          {
            name: "paymasterAndData",
            type: "bytes",
            internalType: "bytes",
          },
          {
            name: "signature",
            type: "bytes",
            internalType: "bytes",
          },
        ],
      },
      {
        name: "targets",
        type: "address[]",
        internalType: "address[]",
      },
      {
        name: "targetCallData",
        type: "bytes[]",
        internalType: "bytes[]",
      },
    ],
    outputs: [
      {
        name: "",
        type: "tuple",
        internalType: "struct IEntryPointSimulations.TargetCallResult",
        components: [
          {
            name: "gasUsed",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "success",
            type: "bool",
            internalType: "bool",
          },
          {
            name: "returnData",
            type: "bytes",
            internalType: "bytes",
          },
        ],
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "simulateHandleOp",
    inputs: [
      {
        name: "op",
        type: "tuple",
        internalType: "struct PackedUserOperation",
        components: [
          {
            name: "sender",
            type: "address",
            internalType: "address",
          },
          {
            name: "nonce",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "initCode",
            type: "bytes",
            internalType: "bytes",
          },
          {
            name: "callData",
            type: "bytes",
            internalType: "bytes",
          },
          {
            name: "accountGasLimits",
            type: "bytes32",
            internalType: "bytes32",
          },
          {
            name: "preVerificationGas",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "gasFees",
            type: "bytes32",
            internalType: "bytes32",
          },
          {
            name: "paymasterAndData",
            type: "bytes",
            internalType: "bytes",
          },
          {
            name: "signature",
            type: "bytes",
            internalType: "bytes",
          },
        ],
      },
    ],
    outputs: [
      {
        name: "",
        type: "tuple",
        internalType: "struct IEntryPointSimulations.ExecutionResult",
        components: [
          {
            name: "preOpGas",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "paid",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "accountValidationData",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "paymasterValidationData",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "paymasterVerificationGasLimit",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "paymasterPostOpGasLimit",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "targetSuccess",
            type: "bool",
            internalType: "bool",
          },
          {
            name: "targetResult",
            type: "bytes",
            internalType: "bytes",
          },
        ],
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "simulateHandleOpBulk",
    inputs: [
      {
        name: "ops",
        type: "tuple[]",
        internalType: "struct PackedUserOperation[]",
        components: [
          {
            name: "sender",
            type: "address",
            internalType: "address",
          },
          {
            name: "nonce",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "initCode",
            type: "bytes",
            internalType: "bytes",
          },
          {
            name: "callData",
            type: "bytes",
            internalType: "bytes",
          },
          {
            name: "accountGasLimits",
            type: "bytes32",
            internalType: "bytes32",
          },
          {
            name: "preVerificationGas",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "gasFees",
            type: "bytes32",
            internalType: "bytes32",
          },
          {
            name: "paymasterAndData",
            type: "bytes",
            internalType: "bytes",
          },
          {
            name: "signature",
            type: "bytes",
            internalType: "bytes",
          },
        ],
      },
    ],
    outputs: [
      {
        name: "",
        type: "tuple[]",
        internalType: "struct IEntryPointSimulations.ExecutionResult[]",
        components: [
          {
            name: "preOpGas",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "paid",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "accountValidationData",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "paymasterValidationData",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "paymasterVerificationGasLimit",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "paymasterPostOpGasLimit",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "targetSuccess",
            type: "bool",
            internalType: "bool",
          },
          {
            name: "targetResult",
            type: "bytes",
            internalType: "bytes",
          },
        ],
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "simulateHandleOpLast",
    inputs: [
      {
        name: "ops",
        type: "tuple[]",
        internalType: "struct PackedUserOperation[]",
        components: [
          {
            name: "sender",
            type: "address",
            internalType: "address",
          },
          {
            name: "nonce",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "initCode",
            type: "bytes",
            internalType: "bytes",
          },
          {
            name: "callData",
            type: "bytes",
            internalType: "bytes",
          },
          {
            name: "accountGasLimits",
            type: "bytes32",
            internalType: "bytes32",
          },
          {
            name: "preVerificationGas",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "gasFees",
            type: "bytes32",
            internalType: "bytes32",
          },
          {
            name: "paymasterAndData",
            type: "bytes",
            internalType: "bytes",
          },
          {
            name: "signature",
            type: "bytes",
            internalType: "bytes",
          },
        ],
      },
    ],
    outputs: [
      {
        name: "",
        type: "tuple",
        internalType: "struct IEntryPointSimulations.ExecutionResult",
        components: [
          {
            name: "preOpGas",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "paid",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "accountValidationData",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "paymasterValidationData",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "paymasterVerificationGasLimit",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "paymasterPostOpGasLimit",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "targetSuccess",
            type: "bool",
            internalType: "bool",
          },
          {
            name: "targetResult",
            type: "bytes",
            internalType: "bytes",
          },
        ],
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "simulateValidation",
    inputs: [
      {
        name: "userOp",
        type: "tuple",
        internalType: "struct PackedUserOperation",
        components: [
          {
            name: "sender",
            type: "address",
            internalType: "address",
          },
          {
            name: "nonce",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "initCode",
            type: "bytes",
            internalType: "bytes",
          },
          {
            name: "callData",
            type: "bytes",
            internalType: "bytes",
          },
          {
            name: "accountGasLimits",
            type: "bytes32",
            internalType: "bytes32",
          },
          {
            name: "preVerificationGas",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "gasFees",
            type: "bytes32",
            internalType: "bytes32",
          },
          {
            name: "paymasterAndData",
            type: "bytes",
            internalType: "bytes",
          },
          {
            name: "signature",
            type: "bytes",
            internalType: "bytes",
          },
        ],
      },
    ],
    outputs: [
      {
        name: "",
        type: "tuple",
        internalType: "struct IEntryPointSimulations.ValidationResult",
        components: [
          {
            name: "returnInfo",
            type: "tuple",
            internalType: "struct IEntryPoint.ReturnInfo",
            components: [
              {
                name: "preOpGas",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "prefund",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "accountValidationData",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "paymasterValidationData",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "paymasterContext",
                type: "bytes",
                internalType: "bytes",
              },
            ],
          },
          {
            name: "senderInfo",
            type: "tuple",
            internalType: "struct IStakeManager.StakeInfo",
            components: [
              {
                name: "stake",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "unstakeDelaySec",
                type: "uint256",
                internalType: "uint256",
              },
            ],
          },
          {
            name: "factoryInfo",
            type: "tuple",
            internalType: "struct IStakeManager.StakeInfo",
            components: [
              {
                name: "stake",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "unstakeDelaySec",
                type: "uint256",
                internalType: "uint256",
              },
            ],
          },
          {
            name: "paymasterInfo",
            type: "tuple",
            internalType: "struct IStakeManager.StakeInfo",
            components: [
              {
                name: "stake",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "unstakeDelaySec",
                type: "uint256",
                internalType: "uint256",
              },
            ],
          },
          {
            name: "aggregatorInfo",
            type: "tuple",
            internalType: "struct IEntryPoint.AggregatorStakeInfo",
            components: [
              {
                name: "aggregator",
                type: "address",
                internalType: "address",
              },
              {
                name: "stakeInfo",
                type: "tuple",
                internalType: "struct IStakeManager.StakeInfo",
                components: [
                  {
                    name: "stake",
                    type: "uint256",
                    internalType: "uint256",
                  },
                  {
                    name: "unstakeDelaySec",
                    type: "uint256",
                    internalType: "uint256",
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "simulateValidationBulk",
    inputs: [
      {
        name: "userOps",
        type: "tuple[]",
        internalType: "struct PackedUserOperation[]",
        components: [
          {
            name: "sender",
            type: "address",
            internalType: "address",
          },
          {
            name: "nonce",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "initCode",
            type: "bytes",
            internalType: "bytes",
          },
          {
            name: "callData",
            type: "bytes",
            internalType: "bytes",
          },
          {
            name: "accountGasLimits",
            type: "bytes32",
            internalType: "bytes32",
          },
          {
            name: "preVerificationGas",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "gasFees",
            type: "bytes32",
            internalType: "bytes32",
          },
          {
            name: "paymasterAndData",
            type: "bytes",
            internalType: "bytes",
          },
          {
            name: "signature",
            type: "bytes",
            internalType: "bytes",
          },
        ],
      },
    ],
    outputs: [
      {
        name: "",
        type: "tuple[]",
        internalType: "struct IEntryPointSimulations.ValidationResult[]",
        components: [
          {
            name: "returnInfo",
            type: "tuple",
            internalType: "struct IEntryPoint.ReturnInfo",
            components: [
              {
                name: "preOpGas",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "prefund",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "accountValidationData",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "paymasterValidationData",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "paymasterContext",
                type: "bytes",
                internalType: "bytes",
              },
            ],
          },
          {
            name: "senderInfo",
            type: "tuple",
            internalType: "struct IStakeManager.StakeInfo",
            components: [
              {
                name: "stake",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "unstakeDelaySec",
                type: "uint256",
                internalType: "uint256",
              },
            ],
          },
          {
            name: "factoryInfo",
            type: "tuple",
            internalType: "struct IStakeManager.StakeInfo",
            components: [
              {
                name: "stake",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "unstakeDelaySec",
                type: "uint256",
                internalType: "uint256",
              },
            ],
          },
          {
            name: "paymasterInfo",
            type: "tuple",
            internalType: "struct IStakeManager.StakeInfo",
            components: [
              {
                name: "stake",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "unstakeDelaySec",
                type: "uint256",
                internalType: "uint256",
              },
            ],
          },
          {
            name: "aggregatorInfo",
            type: "tuple",
            internalType: "struct IEntryPoint.AggregatorStakeInfo",
            components: [
              {
                name: "aggregator",
                type: "address",
                internalType: "address",
              },
              {
                name: "stakeInfo",
                type: "tuple",
                internalType: "struct IStakeManager.StakeInfo",
                components: [
                  {
                    name: "stake",
                    type: "uint256",
                    internalType: "uint256",
                  },
                  {
                    name: "unstakeDelaySec",
                    type: "uint256",
                    internalType: "uint256",
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "simulateValidationLast",
    inputs: [
      {
        name: "userOps",
        type: "tuple[]",
        internalType: "struct PackedUserOperation[]",
        components: [
          {
            name: "sender",
            type: "address",
            internalType: "address",
          },
          {
            name: "nonce",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "initCode",
            type: "bytes",
            internalType: "bytes",
          },
          {
            name: "callData",
            type: "bytes",
            internalType: "bytes",
          },
          {
            name: "accountGasLimits",
            type: "bytes32",
            internalType: "bytes32",
          },
          {
            name: "preVerificationGas",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "gasFees",
            type: "bytes32",
            internalType: "bytes32",
          },
          {
            name: "paymasterAndData",
            type: "bytes",
            internalType: "bytes",
          },
          {
            name: "signature",
            type: "bytes",
            internalType: "bytes",
          },
        ],
      },
    ],
    outputs: [
      {
        name: "",
        type: "tuple",
        internalType: "struct IEntryPointSimulations.ValidationResult",
        components: [
          {
            name: "returnInfo",
            type: "tuple",
            internalType: "struct IEntryPoint.ReturnInfo",
            components: [
              {
                name: "preOpGas",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "prefund",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "accountValidationData",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "paymasterValidationData",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "paymasterContext",
                type: "bytes",
                internalType: "bytes",
              },
            ],
          },
          {
            name: "senderInfo",
            type: "tuple",
            internalType: "struct IStakeManager.StakeInfo",
            components: [
              {
                name: "stake",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "unstakeDelaySec",
                type: "uint256",
                internalType: "uint256",
              },
            ],
          },
          {
            name: "factoryInfo",
            type: "tuple",
            internalType: "struct IStakeManager.StakeInfo",
            components: [
              {
                name: "stake",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "unstakeDelaySec",
                type: "uint256",
                internalType: "uint256",
              },
            ],
          },
          {
            name: "paymasterInfo",
            type: "tuple",
            internalType: "struct IStakeManager.StakeInfo",
            components: [
              {
                name: "stake",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "unstakeDelaySec",
                type: "uint256",
                internalType: "uint256",
              },
            ],
          },
          {
            name: "aggregatorInfo",
            type: "tuple",
            internalType: "struct IEntryPoint.AggregatorStakeInfo",
            components: [
              {
                name: "aggregator",
                type: "address",
                internalType: "address",
              },
              {
                name: "stakeInfo",
                type: "tuple",
                internalType: "struct IStakeManager.StakeInfo",
                components: [
                  {
                    name: "stake",
                    type: "uint256",
                    internalType: "uint256",
                  },
                  {
                    name: "unstakeDelaySec",
                    type: "uint256",
                    internalType: "uint256",
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "unlockStake",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "withdrawStake",
    inputs: [
      {
        name: "withdrawAddress",
        type: "address",
        internalType: "address payable",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "withdrawTo",
    inputs: [
      {
        name: "withdrawAddress",
        type: "address",
        internalType: "address payable",
      },
      {
        name: "withdrawAmount",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "event",
    name: "AccountDeployed",
    inputs: [
      {
        name: "userOpHash",
        type: "bytes32",
        indexed: true,
        internalType: "bytes32",
      },
      {
        name: "sender",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "factory",
        type: "address",
        indexed: false,
        internalType: "address",
      },
      {
        name: "paymaster",
        type: "address",
        indexed: false,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "BeforeExecution",
    inputs: [],
    anonymous: false,
  },
  {
    type: "event",
    name: "Deposited",
    inputs: [
      {
        name: "account",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "totalDeposit",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "PostOpRevertReason",
    inputs: [
      {
        name: "userOpHash",
        type: "bytes32",
        indexed: true,
        internalType: "bytes32",
      },
      {
        name: "sender",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "nonce",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "revertReason",
        type: "bytes",
        indexed: false,
        internalType: "bytes",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "SignatureAggregatorChanged",
    inputs: [
      {
        name: "aggregator",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "StakeLocked",
    inputs: [
      {
        name: "account",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "totalStaked",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "unstakeDelaySec",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "StakeUnlocked",
    inputs: [
      {
        name: "account",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "withdrawTime",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "StakeWithdrawn",
    inputs: [
      {
        name: "account",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "withdrawAddress",
        type: "address",
        indexed: false,
        internalType: "address",
      },
      {
        name: "amount",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "UserOperationEvent",
    inputs: [
      {
        name: "userOpHash",
        type: "bytes32",
        indexed: true,
        internalType: "bytes32",
      },
      {
        name: "sender",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "paymaster",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "nonce",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "success",
        type: "bool",
        indexed: false,
        internalType: "bool",
      },
      {
        name: "actualGasCost",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "actualGasUsed",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "UserOperationPrefundTooLow",
    inputs: [
      {
        name: "userOpHash",
        type: "bytes32",
        indexed: true,
        internalType: "bytes32",
      },
      {
        name: "sender",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "nonce",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "UserOperationRevertReason",
    inputs: [
      {
        name: "userOpHash",
        type: "bytes32",
        indexed: true,
        internalType: "bytes32",
      },
      {
        name: "sender",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "nonce",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "revertReason",
        type: "bytes",
        indexed: false,
        internalType: "bytes",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "Withdrawn",
    inputs: [
      {
        name: "account",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "withdrawAddress",
        type: "address",
        indexed: false,
        internalType: "address",
      },
      {
        name: "amount",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "error",
    name: "FailedOp",
    inputs: [
      {
        name: "opIndex",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "reason",
        type: "string",
        internalType: "string",
      },
    ],
  },
  {
    type: "error",
    name: "FailedOpWithRevert",
    inputs: [
      {
        name: "opIndex",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "reason",
        type: "string",
        internalType: "string",
      },
      {
        name: "inner",
        type: "bytes",
        internalType: "bytes",
      },
    ],
  },
  {
    type: "error",
    name: "PostOpReverted",
    inputs: [
      {
        name: "returnData",
        type: "bytes",
        internalType: "bytes",
      },
    ],
  },
  {
    type: "error",
    name: "ReentrancyGuardReentrantCall",
    inputs: [],
  },
  {
    type: "error",
    name: "SenderAddressResult",
    inputs: [
      {
        name: "sender",
        type: "address",
        internalType: "address",
      },
    ],
  },
  {
    type: "error",
    name: "SignatureValidationFailed",
    inputs: [
      {
        name: "aggregator",
        type: "address",
        internalType: "address",
      },
    ],
  },
] as const;

export const EXECUTE_USER_OP_ABI: AbiFunction[] = [
  {
    inputs: [
      {
        components: [
          {
            internalType: "address",
            name: "sender",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "nonce",
            type: "uint256",
          },
          {
            internalType: "bytes",
            name: "initCode",
            type: "bytes",
          },
          {
            internalType: "bytes",
            name: "callData",
            type: "bytes",
          },
          {
            internalType: "bytes32",
            name: "accountGasLimits",
            type: "bytes32",
          },
          {
            internalType: "uint256",
            name: "preVerificationGas",
            type: "uint256",
          },
          {
            internalType: "bytes32",
            name: "gasFees",
            type: "bytes32",
          },
          {
            internalType: "bytes",
            name: "paymasterAndData",
            type: "bytes",
          },
          {
            internalType: "bytes",
            name: "signature",
            type: "bytes",
          },
        ],
        internalType: "struct PackedUserOperation",
        name: "userOp",
        type: "tuple",
      },
      {
        internalType: "bytes32",
        name: "userOpHash",
        type: "bytes32",
      },
    ],
    name: "executeUserOp",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

export const ENTRY_POINT_SIMULATIONS_ABI_TWO = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [
      {
        internalType: "address payable",
        name: "ep",
        type: "address",
      },
      {
        internalType: "bytes[]",
        name: "data",
        type: "bytes[]",
      },
    ],
    name: "simulateEntryPoint",
    outputs: [
      {
        internalType: "bytes[]",
        name: "",
        type: "bytes[]",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
];

export const OPTIMISM_L1_GAS_PRICE_ORACLE_ABI = [
  {
    inputs: [],
    name: "decimals",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "gasPrice",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes",
        name: "_data",
        type: "bytes",
      },
    ],
    name: "getL1Fee",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes",
        name: "_data",
        type: "bytes",
      },
    ],
    name: "getL1GasUsed",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "l1BaseFee",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "overhead",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "scalar",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

export const MANTLE_BVM_GAS_PRICE_ORACLE_ABI = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOperator",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOperator",
        type: "address",
      },
    ],
    name: "OperatorUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "previousTokenRatio",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "newTokenRatio",
        type: "uint256",
      },
    ],
    name: "TokenRatioUpdated",
    type: "event",
  },
  {
    inputs: [],
    name: "DECIMALS",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "baseFee",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [],
    name: "gasPrice",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes",
        name: "_data",
        type: "bytes",
      },
    ],
    name: "getL1Fee",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes",
        name: "_data",
        type: "bytes",
      },
    ],
    name: "getL1GasUsed",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "l1BaseFee",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "operator",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "overhead",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "scalar",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_operator",
        type: "address",
      },
    ],
    name: "setOperator",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_tokenRatio",
        type: "uint256",
      },
    ],
    name: "setTokenRatio",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "tokenRatio",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_owner",
        type: "address",
      },
    ],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "version",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

export const ARBITRUM_L1_FEE_GAS_PRICE_ORACLE_ABI = [
  {
    inputs: [
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "bool",
        name: "contractCreation",
        type: "bool",
      },
      {
        internalType: "bytes",
        name: "data",
        type: "bytes",
      },
    ],
    name: "gasEstimateL1Component",
    outputs: [
      {
        internalType: "uint64",
        name: "gasEstimateForL1",
        type: "uint64",
      },
      {
        internalType: "uint256",
        name: "baseFee",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "l1BaseFeeEstimate",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

export const SCROLL_L1_GAS_PRICE_ORACLE_ABI = [
  {
    name: "getL1Fee",
    type: "function",
    stateMutability: "view",
    inputs: [
      {
        name: "data",
        internalType: "bytes",
        type: "bytes",
      },
    ],
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
  },
] as const;

export const MORPH_L1_GAS_PRICE_ORACLE_ABI = [
  {
    inputs: [
      {
        internalType: "address",
        name: "owner_",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        indexed: false,
        internalType: "bool",
        name: "val",
        type: "bool",
      },
    ],
    name: "AllowListAddressSet",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "bool",
        name: "isEnabled",
        type: "bool",
      },
    ],
    name: "AllowListEnabledUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "L1BaseFeeUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "OverheadUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "ScalarUpdated",
    type: "event",
  },
  {
    inputs: [],
    name: "allowListEnabled",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes",
        name: "_data",
        type: "bytes",
      },
    ],
    name: "getL1Fee",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes",
        name: "_data",
        type: "bytes",
      },
    ],
    name: "getL1GasUsed",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "isAllowed",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "l1BaseFee",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "overhead",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "scalar",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address[]",
        name: "user",
        type: "address[]",
      },
      {
        internalType: "bool[]",
        name: "val",
        type: "bool[]",
      },
    ],
    name: "setAllowList",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bool",
        name: "_allowListEnabled",
        type: "bool",
      },
    ],
    name: "setAllowListEnabled",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_baseFee",
        type: "uint256",
      },
    ],
    name: "setL1BaseFee",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_overhead",
        type: "uint256",
      },
    ],
    name: "setOverhead",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_scalar",
        type: "uint256",
      },
    ],
    name: "setScalar",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;
