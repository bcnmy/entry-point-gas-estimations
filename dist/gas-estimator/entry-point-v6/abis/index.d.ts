export declare const ENTRY_POINT_ABI: readonly [{
    readonly inputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "preOpGas";
        readonly type: "uint256";
    }, {
        readonly internalType: "uint256";
        readonly name: "paid";
        readonly type: "uint256";
    }, {
        readonly internalType: "uint48";
        readonly name: "validAfter";
        readonly type: "uint48";
    }, {
        readonly internalType: "uint48";
        readonly name: "validUntil";
        readonly type: "uint48";
    }, {
        readonly internalType: "bool";
        readonly name: "targetSuccess";
        readonly type: "bool";
    }, {
        readonly internalType: "bytes";
        readonly name: "targetResult";
        readonly type: "bytes";
    }];
    readonly name: "ExecutionResult";
    readonly type: "error";
}, {
    readonly inputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "opIndex";
        readonly type: "uint256";
    }, {
        readonly internalType: "string";
        readonly name: "reason";
        readonly type: "string";
    }];
    readonly name: "FailedOp";
    readonly type: "error";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "sender";
        readonly type: "address";
    }];
    readonly name: "SenderAddressResult";
    readonly type: "error";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "aggregator";
        readonly type: "address";
    }];
    readonly name: "SignatureValidationFailed";
    readonly type: "error";
}, {
    readonly inputs: readonly [{
        readonly components: readonly [{
            readonly internalType: "uint256";
            readonly name: "preOpGas";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "prefund";
            readonly type: "uint256";
        }, {
            readonly internalType: "bool";
            readonly name: "sigFailed";
            readonly type: "bool";
        }, {
            readonly internalType: "uint48";
            readonly name: "validAfter";
            readonly type: "uint48";
        }, {
            readonly internalType: "uint48";
            readonly name: "validUntil";
            readonly type: "uint48";
        }, {
            readonly internalType: "bytes";
            readonly name: "paymasterContext";
            readonly type: "bytes";
        }];
        readonly internalType: "struct IEntryPoint.ReturnInfo";
        readonly name: "returnInfo";
        readonly type: "tuple";
    }, {
        readonly components: readonly [{
            readonly internalType: "uint256";
            readonly name: "stake";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "unstakeDelaySec";
            readonly type: "uint256";
        }];
        readonly internalType: "struct IStakeManager.StakeInfo";
        readonly name: "senderInfo";
        readonly type: "tuple";
    }, {
        readonly components: readonly [{
            readonly internalType: "uint256";
            readonly name: "stake";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "unstakeDelaySec";
            readonly type: "uint256";
        }];
        readonly internalType: "struct IStakeManager.StakeInfo";
        readonly name: "factoryInfo";
        readonly type: "tuple";
    }, {
        readonly components: readonly [{
            readonly internalType: "uint256";
            readonly name: "stake";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "unstakeDelaySec";
            readonly type: "uint256";
        }];
        readonly internalType: "struct IStakeManager.StakeInfo";
        readonly name: "paymasterInfo";
        readonly type: "tuple";
    }];
    readonly name: "ValidationResult";
    readonly type: "error";
}, {
    readonly inputs: readonly [{
        readonly components: readonly [{
            readonly internalType: "uint256";
            readonly name: "preOpGas";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "prefund";
            readonly type: "uint256";
        }, {
            readonly internalType: "bool";
            readonly name: "sigFailed";
            readonly type: "bool";
        }, {
            readonly internalType: "uint48";
            readonly name: "validAfter";
            readonly type: "uint48";
        }, {
            readonly internalType: "uint48";
            readonly name: "validUntil";
            readonly type: "uint48";
        }, {
            readonly internalType: "bytes";
            readonly name: "paymasterContext";
            readonly type: "bytes";
        }];
        readonly internalType: "struct IEntryPoint.ReturnInfo";
        readonly name: "returnInfo";
        readonly type: "tuple";
    }, {
        readonly components: readonly [{
            readonly internalType: "uint256";
            readonly name: "stake";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "unstakeDelaySec";
            readonly type: "uint256";
        }];
        readonly internalType: "struct IStakeManager.StakeInfo";
        readonly name: "senderInfo";
        readonly type: "tuple";
    }, {
        readonly components: readonly [{
            readonly internalType: "uint256";
            readonly name: "stake";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "unstakeDelaySec";
            readonly type: "uint256";
        }];
        readonly internalType: "struct IStakeManager.StakeInfo";
        readonly name: "factoryInfo";
        readonly type: "tuple";
    }, {
        readonly components: readonly [{
            readonly internalType: "uint256";
            readonly name: "stake";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "unstakeDelaySec";
            readonly type: "uint256";
        }];
        readonly internalType: "struct IStakeManager.StakeInfo";
        readonly name: "paymasterInfo";
        readonly type: "tuple";
    }, {
        readonly components: readonly [{
            readonly internalType: "address";
            readonly name: "aggregator";
            readonly type: "address";
        }, {
            readonly components: readonly [{
                readonly internalType: "uint256";
                readonly name: "stake";
                readonly type: "uint256";
            }, {
                readonly internalType: "uint256";
                readonly name: "unstakeDelaySec";
                readonly type: "uint256";
            }];
            readonly internalType: "struct IStakeManager.StakeInfo";
            readonly name: "stakeInfo";
            readonly type: "tuple";
        }];
        readonly internalType: "struct IEntryPoint.AggregatorStakeInfo";
        readonly name: "aggregatorInfo";
        readonly type: "tuple";
    }];
    readonly name: "ValidationResultWithAggregation";
    readonly type: "error";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: true;
        readonly internalType: "bytes32";
        readonly name: "userOpHash";
        readonly type: "bytes32";
    }, {
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "sender";
        readonly type: "address";
    }, {
        readonly indexed: false;
        readonly internalType: "address";
        readonly name: "factory";
        readonly type: "address";
    }, {
        readonly indexed: false;
        readonly internalType: "address";
        readonly name: "paymaster";
        readonly type: "address";
    }];
    readonly name: "AccountDeployed";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [];
    readonly name: "BeforeExecution";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "account";
        readonly type: "address";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "totalDeposit";
        readonly type: "uint256";
    }];
    readonly name: "Deposited";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "aggregator";
        readonly type: "address";
    }];
    readonly name: "SignatureAggregatorChanged";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "account";
        readonly type: "address";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "totalStaked";
        readonly type: "uint256";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "unstakeDelaySec";
        readonly type: "uint256";
    }];
    readonly name: "StakeLocked";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "account";
        readonly type: "address";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "withdrawTime";
        readonly type: "uint256";
    }];
    readonly name: "StakeUnlocked";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "account";
        readonly type: "address";
    }, {
        readonly indexed: false;
        readonly internalType: "address";
        readonly name: "withdrawAddress";
        readonly type: "address";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "amount";
        readonly type: "uint256";
    }];
    readonly name: "StakeWithdrawn";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: true;
        readonly internalType: "bytes32";
        readonly name: "userOpHash";
        readonly type: "bytes32";
    }, {
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "sender";
        readonly type: "address";
    }, {
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "paymaster";
        readonly type: "address";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "nonce";
        readonly type: "uint256";
    }, {
        readonly indexed: false;
        readonly internalType: "bool";
        readonly name: "success";
        readonly type: "bool";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "actualGasCost";
        readonly type: "uint256";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "actualGasUsed";
        readonly type: "uint256";
    }];
    readonly name: "UserOperationEvent";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: true;
        readonly internalType: "bytes32";
        readonly name: "userOpHash";
        readonly type: "bytes32";
    }, {
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "sender";
        readonly type: "address";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "nonce";
        readonly type: "uint256";
    }, {
        readonly indexed: false;
        readonly internalType: "bytes";
        readonly name: "revertReason";
        readonly type: "bytes";
    }];
    readonly name: "UserOperationRevertReason";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "account";
        readonly type: "address";
    }, {
        readonly indexed: false;
        readonly internalType: "address";
        readonly name: "withdrawAddress";
        readonly type: "address";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "amount";
        readonly type: "uint256";
    }];
    readonly name: "Withdrawn";
    readonly type: "event";
}, {
    readonly inputs: readonly [];
    readonly name: "SIG_VALIDATION_FAILED";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "bytes";
        readonly name: "initCode";
        readonly type: "bytes";
    }, {
        readonly internalType: "address";
        readonly name: "sender";
        readonly type: "address";
    }, {
        readonly internalType: "bytes";
        readonly name: "paymasterAndData";
        readonly type: "bytes";
    }];
    readonly name: "_validateSenderAndPaymaster";
    readonly outputs: readonly [];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "uint32";
        readonly name: "unstakeDelaySec";
        readonly type: "uint32";
    }];
    readonly name: "addStake";
    readonly outputs: readonly [];
    readonly stateMutability: "payable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "account";
        readonly type: "address";
    }];
    readonly name: "balanceOf";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "account";
        readonly type: "address";
    }];
    readonly name: "depositTo";
    readonly outputs: readonly [];
    readonly stateMutability: "payable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "";
        readonly type: "address";
    }];
    readonly name: "deposits";
    readonly outputs: readonly [{
        readonly internalType: "uint112";
        readonly name: "deposit";
        readonly type: "uint112";
    }, {
        readonly internalType: "bool";
        readonly name: "staked";
        readonly type: "bool";
    }, {
        readonly internalType: "uint112";
        readonly name: "stake";
        readonly type: "uint112";
    }, {
        readonly internalType: "uint32";
        readonly name: "unstakeDelaySec";
        readonly type: "uint32";
    }, {
        readonly internalType: "uint48";
        readonly name: "withdrawTime";
        readonly type: "uint48";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "account";
        readonly type: "address";
    }];
    readonly name: "getDepositInfo";
    readonly outputs: readonly [{
        readonly components: readonly [{
            readonly internalType: "uint112";
            readonly name: "deposit";
            readonly type: "uint112";
        }, {
            readonly internalType: "bool";
            readonly name: "staked";
            readonly type: "bool";
        }, {
            readonly internalType: "uint112";
            readonly name: "stake";
            readonly type: "uint112";
        }, {
            readonly internalType: "uint32";
            readonly name: "unstakeDelaySec";
            readonly type: "uint32";
        }, {
            readonly internalType: "uint48";
            readonly name: "withdrawTime";
            readonly type: "uint48";
        }];
        readonly internalType: "struct IStakeManager.DepositInfo";
        readonly name: "info";
        readonly type: "tuple";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "sender";
        readonly type: "address";
    }, {
        readonly internalType: "uint192";
        readonly name: "key";
        readonly type: "uint192";
    }];
    readonly name: "getNonce";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "nonce";
        readonly type: "uint256";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "bytes";
        readonly name: "initCode";
        readonly type: "bytes";
    }];
    readonly name: "getSenderAddress";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly components: readonly [{
            readonly internalType: "address";
            readonly name: "sender";
            readonly type: "address";
        }, {
            readonly internalType: "uint256";
            readonly name: "nonce";
            readonly type: "uint256";
        }, {
            readonly internalType: "bytes";
            readonly name: "initCode";
            readonly type: "bytes";
        }, {
            readonly internalType: "bytes";
            readonly name: "callData";
            readonly type: "bytes";
        }, {
            readonly internalType: "uint256";
            readonly name: "callGasLimit";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "verificationGasLimit";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "preVerificationGas";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "maxFeePerGas";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "maxPriorityFeePerGas";
            readonly type: "uint256";
        }, {
            readonly internalType: "bytes";
            readonly name: "paymasterAndData";
            readonly type: "bytes";
        }, {
            readonly internalType: "bytes";
            readonly name: "signature";
            readonly type: "bytes";
        }];
        readonly internalType: "struct UserOperation";
        readonly name: "userOp";
        readonly type: "tuple";
    }];
    readonly name: "getUserOpHash";
    readonly outputs: readonly [{
        readonly internalType: "bytes32";
        readonly name: "";
        readonly type: "bytes32";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly components: readonly [{
            readonly components: readonly [{
                readonly internalType: "address";
                readonly name: "sender";
                readonly type: "address";
            }, {
                readonly internalType: "uint256";
                readonly name: "nonce";
                readonly type: "uint256";
            }, {
                readonly internalType: "bytes";
                readonly name: "initCode";
                readonly type: "bytes";
            }, {
                readonly internalType: "bytes";
                readonly name: "callData";
                readonly type: "bytes";
            }, {
                readonly internalType: "uint256";
                readonly name: "callGasLimit";
                readonly type: "uint256";
            }, {
                readonly internalType: "uint256";
                readonly name: "verificationGasLimit";
                readonly type: "uint256";
            }, {
                readonly internalType: "uint256";
                readonly name: "preVerificationGas";
                readonly type: "uint256";
            }, {
                readonly internalType: "uint256";
                readonly name: "maxFeePerGas";
                readonly type: "uint256";
            }, {
                readonly internalType: "uint256";
                readonly name: "maxPriorityFeePerGas";
                readonly type: "uint256";
            }, {
                readonly internalType: "bytes";
                readonly name: "paymasterAndData";
                readonly type: "bytes";
            }, {
                readonly internalType: "bytes";
                readonly name: "signature";
                readonly type: "bytes";
            }];
            readonly internalType: "struct UserOperation[]";
            readonly name: "userOps";
            readonly type: "tuple[]";
        }, {
            readonly internalType: "contract IAggregator";
            readonly name: "aggregator";
            readonly type: "address";
        }, {
            readonly internalType: "bytes";
            readonly name: "signature";
            readonly type: "bytes";
        }];
        readonly internalType: "struct IEntryPoint.UserOpsPerAggregator[]";
        readonly name: "opsPerAggregator";
        readonly type: "tuple[]";
    }, {
        readonly internalType: "address payable";
        readonly name: "beneficiary";
        readonly type: "address";
    }];
    readonly name: "handleAggregatedOps";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly components: readonly [{
            readonly internalType: "address";
            readonly name: "sender";
            readonly type: "address";
        }, {
            readonly internalType: "uint256";
            readonly name: "nonce";
            readonly type: "uint256";
        }, {
            readonly internalType: "bytes";
            readonly name: "initCode";
            readonly type: "bytes";
        }, {
            readonly internalType: "bytes";
            readonly name: "callData";
            readonly type: "bytes";
        }, {
            readonly internalType: "uint256";
            readonly name: "callGasLimit";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "verificationGasLimit";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "preVerificationGas";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "maxFeePerGas";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "maxPriorityFeePerGas";
            readonly type: "uint256";
        }, {
            readonly internalType: "bytes";
            readonly name: "paymasterAndData";
            readonly type: "bytes";
        }, {
            readonly internalType: "bytes";
            readonly name: "signature";
            readonly type: "bytes";
        }];
        readonly internalType: "struct UserOperation[]";
        readonly name: "ops";
        readonly type: "tuple[]";
    }, {
        readonly internalType: "address payable";
        readonly name: "beneficiary";
        readonly type: "address";
    }];
    readonly name: "handleOps";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "uint192";
        readonly name: "key";
        readonly type: "uint192";
    }];
    readonly name: "incrementNonce";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "bytes";
        readonly name: "callData";
        readonly type: "bytes";
    }, {
        readonly components: readonly [{
            readonly components: readonly [{
                readonly internalType: "address";
                readonly name: "sender";
                readonly type: "address";
            }, {
                readonly internalType: "uint256";
                readonly name: "nonce";
                readonly type: "uint256";
            }, {
                readonly internalType: "uint256";
                readonly name: "callGasLimit";
                readonly type: "uint256";
            }, {
                readonly internalType: "uint256";
                readonly name: "verificationGasLimit";
                readonly type: "uint256";
            }, {
                readonly internalType: "uint256";
                readonly name: "preVerificationGas";
                readonly type: "uint256";
            }, {
                readonly internalType: "address";
                readonly name: "paymaster";
                readonly type: "address";
            }, {
                readonly internalType: "uint256";
                readonly name: "maxFeePerGas";
                readonly type: "uint256";
            }, {
                readonly internalType: "uint256";
                readonly name: "maxPriorityFeePerGas";
                readonly type: "uint256";
            }];
            readonly internalType: "struct EntryPoint.MemoryUserOp";
            readonly name: "mUserOp";
            readonly type: "tuple";
        }, {
            readonly internalType: "bytes32";
            readonly name: "userOpHash";
            readonly type: "bytes32";
        }, {
            readonly internalType: "uint256";
            readonly name: "prefund";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "contextOffset";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "preOpGas";
            readonly type: "uint256";
        }];
        readonly internalType: "struct EntryPoint.UserOpInfo";
        readonly name: "opInfo";
        readonly type: "tuple";
    }, {
        readonly internalType: "bytes";
        readonly name: "context";
        readonly type: "bytes";
    }];
    readonly name: "innerHandleOp";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "actualGasCost";
        readonly type: "uint256";
    }];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "";
        readonly type: "address";
    }, {
        readonly internalType: "uint192";
        readonly name: "";
        readonly type: "uint192";
    }];
    readonly name: "nonceSequenceNumber";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly components: readonly [{
            readonly internalType: "address";
            readonly name: "sender";
            readonly type: "address";
        }, {
            readonly internalType: "uint256";
            readonly name: "nonce";
            readonly type: "uint256";
        }, {
            readonly internalType: "bytes";
            readonly name: "initCode";
            readonly type: "bytes";
        }, {
            readonly internalType: "bytes";
            readonly name: "callData";
            readonly type: "bytes";
        }, {
            readonly internalType: "uint256";
            readonly name: "callGasLimit";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "verificationGasLimit";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "preVerificationGas";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "maxFeePerGas";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "maxPriorityFeePerGas";
            readonly type: "uint256";
        }, {
            readonly internalType: "bytes";
            readonly name: "paymasterAndData";
            readonly type: "bytes";
        }, {
            readonly internalType: "bytes";
            readonly name: "signature";
            readonly type: "bytes";
        }];
        readonly internalType: "struct UserOperation";
        readonly name: "op";
        readonly type: "tuple";
    }, {
        readonly internalType: "address";
        readonly name: "target";
        readonly type: "address";
    }, {
        readonly internalType: "bytes";
        readonly name: "targetCallData";
        readonly type: "bytes";
    }];
    readonly name: "simulateHandleOp";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly components: readonly [{
            readonly internalType: "address";
            readonly name: "sender";
            readonly type: "address";
        }, {
            readonly internalType: "uint256";
            readonly name: "nonce";
            readonly type: "uint256";
        }, {
            readonly internalType: "bytes";
            readonly name: "initCode";
            readonly type: "bytes";
        }, {
            readonly internalType: "bytes";
            readonly name: "callData";
            readonly type: "bytes";
        }, {
            readonly internalType: "uint256";
            readonly name: "callGasLimit";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "verificationGasLimit";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "preVerificationGas";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "maxFeePerGas";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "maxPriorityFeePerGas";
            readonly type: "uint256";
        }, {
            readonly internalType: "bytes";
            readonly name: "paymasterAndData";
            readonly type: "bytes";
        }, {
            readonly internalType: "bytes";
            readonly name: "signature";
            readonly type: "bytes";
        }];
        readonly internalType: "struct UserOperation";
        readonly name: "userOp";
        readonly type: "tuple";
    }];
    readonly name: "simulateValidation";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "unlockStake";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address payable";
        readonly name: "withdrawAddress";
        readonly type: "address";
    }];
    readonly name: "withdrawStake";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address payable";
        readonly name: "withdrawAddress";
        readonly type: "address";
    }, {
        readonly internalType: "uint256";
        readonly name: "withdrawAmount";
        readonly type: "uint256";
    }];
    readonly name: "withdrawTo";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly stateMutability: "payable";
    readonly type: "receive";
}];
export declare const CALL_GAS_ESTIMATION_SIMULATOR: readonly [{
    readonly inputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "minGas";
        readonly type: "uint256";
    }, {
        readonly internalType: "uint256";
        readonly name: "maxGas";
        readonly type: "uint256";
    }, {
        readonly internalType: "uint256";
        readonly name: "numRounds";
        readonly type: "uint256";
    }];
    readonly name: "EstimateCallGasContinuation";
    readonly type: "error";
}, {
    readonly inputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "gasEstimate";
        readonly type: "uint256";
    }, {
        readonly internalType: "uint256";
        readonly name: "numRounds";
        readonly type: "uint256";
    }];
    readonly name: "EstimateCallGasResult";
    readonly type: "error";
}, {
    readonly inputs: readonly [{
        readonly internalType: "bytes";
        readonly name: "revertData";
        readonly type: "bytes";
    }];
    readonly name: "EstimateCallGasRevertAtMax";
    readonly type: "error";
}, {
    readonly inputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "preOpGas";
        readonly type: "uint256";
    }, {
        readonly internalType: "uint256";
        readonly name: "paid";
        readonly type: "uint256";
    }, {
        readonly internalType: "uint48";
        readonly name: "validAfter";
        readonly type: "uint48";
    }, {
        readonly internalType: "uint48";
        readonly name: "validUntil";
        readonly type: "uint48";
    }, {
        readonly internalType: "bool";
        readonly name: "targetSuccess";
        readonly type: "bool";
    }, {
        readonly internalType: "bytes";
        readonly name: "targetResult";
        readonly type: "bytes";
    }];
    readonly name: "ExecutionResult";
    readonly type: "error";
}, {
    readonly inputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "opIndex";
        readonly type: "uint256";
    }, {
        readonly internalType: "string";
        readonly name: "reason";
        readonly type: "string";
    }];
    readonly name: "FailedOp";
    readonly type: "error";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "sender";
        readonly type: "address";
    }];
    readonly name: "SenderAddressResult";
    readonly type: "error";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "aggregator";
        readonly type: "address";
    }];
    readonly name: "SignatureValidationFailed";
    readonly type: "error";
}, {
    readonly inputs: readonly [{
        readonly components: readonly [{
            readonly internalType: "uint256";
            readonly name: "preOpGas";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "prefund";
            readonly type: "uint256";
        }, {
            readonly internalType: "bool";
            readonly name: "sigFailed";
            readonly type: "bool";
        }, {
            readonly internalType: "uint48";
            readonly name: "validAfter";
            readonly type: "uint48";
        }, {
            readonly internalType: "uint48";
            readonly name: "validUntil";
            readonly type: "uint48";
        }, {
            readonly internalType: "bytes";
            readonly name: "paymasterContext";
            readonly type: "bytes";
        }];
        readonly internalType: "struct IEntryPoint.ReturnInfo";
        readonly name: "returnInfo";
        readonly type: "tuple";
    }, {
        readonly components: readonly [{
            readonly internalType: "uint256";
            readonly name: "stake";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "unstakeDelaySec";
            readonly type: "uint256";
        }];
        readonly internalType: "struct IStakeManager.StakeInfo";
        readonly name: "senderInfo";
        readonly type: "tuple";
    }, {
        readonly components: readonly [{
            readonly internalType: "uint256";
            readonly name: "stake";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "unstakeDelaySec";
            readonly type: "uint256";
        }];
        readonly internalType: "struct IStakeManager.StakeInfo";
        readonly name: "factoryInfo";
        readonly type: "tuple";
    }, {
        readonly components: readonly [{
            readonly internalType: "uint256";
            readonly name: "stake";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "unstakeDelaySec";
            readonly type: "uint256";
        }];
        readonly internalType: "struct IStakeManager.StakeInfo";
        readonly name: "paymasterInfo";
        readonly type: "tuple";
    }];
    readonly name: "ValidationResult";
    readonly type: "error";
}, {
    readonly inputs: readonly [{
        readonly components: readonly [{
            readonly internalType: "uint256";
            readonly name: "preOpGas";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "prefund";
            readonly type: "uint256";
        }, {
            readonly internalType: "bool";
            readonly name: "sigFailed";
            readonly type: "bool";
        }, {
            readonly internalType: "uint48";
            readonly name: "validAfter";
            readonly type: "uint48";
        }, {
            readonly internalType: "uint48";
            readonly name: "validUntil";
            readonly type: "uint48";
        }, {
            readonly internalType: "bytes";
            readonly name: "paymasterContext";
            readonly type: "bytes";
        }];
        readonly internalType: "struct IEntryPoint.ReturnInfo";
        readonly name: "returnInfo";
        readonly type: "tuple";
    }, {
        readonly components: readonly [{
            readonly internalType: "uint256";
            readonly name: "stake";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "unstakeDelaySec";
            readonly type: "uint256";
        }];
        readonly internalType: "struct IStakeManager.StakeInfo";
        readonly name: "senderInfo";
        readonly type: "tuple";
    }, {
        readonly components: readonly [{
            readonly internalType: "uint256";
            readonly name: "stake";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "unstakeDelaySec";
            readonly type: "uint256";
        }];
        readonly internalType: "struct IStakeManager.StakeInfo";
        readonly name: "factoryInfo";
        readonly type: "tuple";
    }, {
        readonly components: readonly [{
            readonly internalType: "uint256";
            readonly name: "stake";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "unstakeDelaySec";
            readonly type: "uint256";
        }];
        readonly internalType: "struct IStakeManager.StakeInfo";
        readonly name: "paymasterInfo";
        readonly type: "tuple";
    }, {
        readonly components: readonly [{
            readonly internalType: "address";
            readonly name: "aggregator";
            readonly type: "address";
        }, {
            readonly components: readonly [{
                readonly internalType: "uint256";
                readonly name: "stake";
                readonly type: "uint256";
            }, {
                readonly internalType: "uint256";
                readonly name: "unstakeDelaySec";
                readonly type: "uint256";
            }];
            readonly internalType: "struct IStakeManager.StakeInfo";
            readonly name: "stakeInfo";
            readonly type: "tuple";
        }];
        readonly internalType: "struct IEntryPoint.AggregatorStakeInfo";
        readonly name: "aggregatorInfo";
        readonly type: "tuple";
    }];
    readonly name: "ValidationResultWithAggregation";
    readonly type: "error";
}, {
    readonly inputs: readonly [{
        readonly internalType: "bool";
        readonly name: "success";
        readonly type: "bool";
    }, {
        readonly internalType: "uint256";
        readonly name: "gasUsed";
        readonly type: "uint256";
    }, {
        readonly internalType: "bytes";
        readonly name: "revertData";
        readonly type: "bytes";
    }];
    readonly name: "_InnerCallResult";
    readonly type: "error";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: true;
        readonly internalType: "bytes32";
        readonly name: "userOpHash";
        readonly type: "bytes32";
    }, {
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "sender";
        readonly type: "address";
    }, {
        readonly indexed: false;
        readonly internalType: "address";
        readonly name: "factory";
        readonly type: "address";
    }, {
        readonly indexed: false;
        readonly internalType: "address";
        readonly name: "paymaster";
        readonly type: "address";
    }];
    readonly name: "AccountDeployed";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [];
    readonly name: "BeforeExecution";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "account";
        readonly type: "address";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "totalDeposit";
        readonly type: "uint256";
    }];
    readonly name: "Deposited";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "aggregator";
        readonly type: "address";
    }];
    readonly name: "SignatureAggregatorChanged";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "account";
        readonly type: "address";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "totalStaked";
        readonly type: "uint256";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "unstakeDelaySec";
        readonly type: "uint256";
    }];
    readonly name: "StakeLocked";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "account";
        readonly type: "address";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "withdrawTime";
        readonly type: "uint256";
    }];
    readonly name: "StakeUnlocked";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "account";
        readonly type: "address";
    }, {
        readonly indexed: false;
        readonly internalType: "address";
        readonly name: "withdrawAddress";
        readonly type: "address";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "amount";
        readonly type: "uint256";
    }];
    readonly name: "StakeWithdrawn";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: true;
        readonly internalType: "bytes32";
        readonly name: "userOpHash";
        readonly type: "bytes32";
    }, {
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "sender";
        readonly type: "address";
    }, {
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "paymaster";
        readonly type: "address";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "nonce";
        readonly type: "uint256";
    }, {
        readonly indexed: false;
        readonly internalType: "bool";
        readonly name: "success";
        readonly type: "bool";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "actualGasCost";
        readonly type: "uint256";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "actualGasUsed";
        readonly type: "uint256";
    }];
    readonly name: "UserOperationEvent";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: true;
        readonly internalType: "bytes32";
        readonly name: "userOpHash";
        readonly type: "bytes32";
    }, {
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "sender";
        readonly type: "address";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "nonce";
        readonly type: "uint256";
    }, {
        readonly indexed: false;
        readonly internalType: "bytes";
        readonly name: "revertReason";
        readonly type: "bytes";
    }];
    readonly name: "UserOperationRevertReason";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "account";
        readonly type: "address";
    }, {
        readonly indexed: false;
        readonly internalType: "address";
        readonly name: "withdrawAddress";
        readonly type: "address";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "amount";
        readonly type: "uint256";
    }];
    readonly name: "Withdrawn";
    readonly type: "event";
}, {
    readonly inputs: readonly [];
    readonly name: "SIG_VALIDATION_FAILED";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "sender";
        readonly type: "address";
    }, {
        readonly internalType: "bytes";
        readonly name: "callData";
        readonly type: "bytes";
    }, {
        readonly internalType: "uint256";
        readonly name: "gas";
        readonly type: "uint256";
    }];
    readonly name: "_innerCall";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "bytes";
        readonly name: "initCode";
        readonly type: "bytes";
    }, {
        readonly internalType: "address";
        readonly name: "sender";
        readonly type: "address";
    }, {
        readonly internalType: "bytes";
        readonly name: "paymasterAndData";
        readonly type: "bytes";
    }];
    readonly name: "_validateSenderAndPaymaster";
    readonly outputs: readonly [];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "uint32";
        readonly name: "unstakeDelaySec";
        readonly type: "uint32";
    }];
    readonly name: "addStake";
    readonly outputs: readonly [];
    readonly stateMutability: "payable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "account";
        readonly type: "address";
    }];
    readonly name: "balanceOf";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "account";
        readonly type: "address";
    }];
    readonly name: "depositTo";
    readonly outputs: readonly [];
    readonly stateMutability: "payable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "";
        readonly type: "address";
    }];
    readonly name: "deposits";
    readonly outputs: readonly [{
        readonly internalType: "uint112";
        readonly name: "deposit";
        readonly type: "uint112";
    }, {
        readonly internalType: "bool";
        readonly name: "staked";
        readonly type: "bool";
    }, {
        readonly internalType: "uint112";
        readonly name: "stake";
        readonly type: "uint112";
    }, {
        readonly internalType: "uint32";
        readonly name: "unstakeDelaySec";
        readonly type: "uint32";
    }, {
        readonly internalType: "uint48";
        readonly name: "withdrawTime";
        readonly type: "uint48";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly components: readonly [{
            readonly internalType: "address";
            readonly name: "sender";
            readonly type: "address";
        }, {
            readonly internalType: "bytes";
            readonly name: "callData";
            readonly type: "bytes";
        }, {
            readonly internalType: "uint256";
            readonly name: "minGas";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "maxGas";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "rounding";
            readonly type: "uint256";
        }, {
            readonly internalType: "bool";
            readonly name: "isContinuation";
            readonly type: "bool";
        }];
        readonly internalType: "struct CallGasEstimationSimulator.EstimateCallGasArgs";
        readonly name: "args";
        readonly type: "tuple";
    }];
    readonly name: "estimateCallGas";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "account";
        readonly type: "address";
    }];
    readonly name: "getDepositInfo";
    readonly outputs: readonly [{
        readonly components: readonly [{
            readonly internalType: "uint112";
            readonly name: "deposit";
            readonly type: "uint112";
        }, {
            readonly internalType: "bool";
            readonly name: "staked";
            readonly type: "bool";
        }, {
            readonly internalType: "uint112";
            readonly name: "stake";
            readonly type: "uint112";
        }, {
            readonly internalType: "uint32";
            readonly name: "unstakeDelaySec";
            readonly type: "uint32";
        }, {
            readonly internalType: "uint48";
            readonly name: "withdrawTime";
            readonly type: "uint48";
        }];
        readonly internalType: "struct IStakeManager.DepositInfo";
        readonly name: "info";
        readonly type: "tuple";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "sender";
        readonly type: "address";
    }, {
        readonly internalType: "uint192";
        readonly name: "key";
        readonly type: "uint192";
    }];
    readonly name: "getNonce";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "nonce";
        readonly type: "uint256";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "bytes";
        readonly name: "initCode";
        readonly type: "bytes";
    }];
    readonly name: "getSenderAddress";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly components: readonly [{
            readonly internalType: "address";
            readonly name: "sender";
            readonly type: "address";
        }, {
            readonly internalType: "uint256";
            readonly name: "nonce";
            readonly type: "uint256";
        }, {
            readonly internalType: "bytes";
            readonly name: "initCode";
            readonly type: "bytes";
        }, {
            readonly internalType: "bytes";
            readonly name: "callData";
            readonly type: "bytes";
        }, {
            readonly internalType: "uint256";
            readonly name: "callGasLimit";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "verificationGasLimit";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "preVerificationGas";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "maxFeePerGas";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "maxPriorityFeePerGas";
            readonly type: "uint256";
        }, {
            readonly internalType: "bytes";
            readonly name: "paymasterAndData";
            readonly type: "bytes";
        }, {
            readonly internalType: "bytes";
            readonly name: "signature";
            readonly type: "bytes";
        }];
        readonly internalType: "struct UserOperation";
        readonly name: "userOp";
        readonly type: "tuple";
    }];
    readonly name: "getUserOpHash";
    readonly outputs: readonly [{
        readonly internalType: "bytes32";
        readonly name: "";
        readonly type: "bytes32";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly components: readonly [{
            readonly components: readonly [{
                readonly internalType: "address";
                readonly name: "sender";
                readonly type: "address";
            }, {
                readonly internalType: "uint256";
                readonly name: "nonce";
                readonly type: "uint256";
            }, {
                readonly internalType: "bytes";
                readonly name: "initCode";
                readonly type: "bytes";
            }, {
                readonly internalType: "bytes";
                readonly name: "callData";
                readonly type: "bytes";
            }, {
                readonly internalType: "uint256";
                readonly name: "callGasLimit";
                readonly type: "uint256";
            }, {
                readonly internalType: "uint256";
                readonly name: "verificationGasLimit";
                readonly type: "uint256";
            }, {
                readonly internalType: "uint256";
                readonly name: "preVerificationGas";
                readonly type: "uint256";
            }, {
                readonly internalType: "uint256";
                readonly name: "maxFeePerGas";
                readonly type: "uint256";
            }, {
                readonly internalType: "uint256";
                readonly name: "maxPriorityFeePerGas";
                readonly type: "uint256";
            }, {
                readonly internalType: "bytes";
                readonly name: "paymasterAndData";
                readonly type: "bytes";
            }, {
                readonly internalType: "bytes";
                readonly name: "signature";
                readonly type: "bytes";
            }];
            readonly internalType: "struct UserOperation[]";
            readonly name: "userOps";
            readonly type: "tuple[]";
        }, {
            readonly internalType: "contract IAggregator";
            readonly name: "aggregator";
            readonly type: "address";
        }, {
            readonly internalType: "bytes";
            readonly name: "signature";
            readonly type: "bytes";
        }];
        readonly internalType: "struct IEntryPoint.UserOpsPerAggregator[]";
        readonly name: "opsPerAggregator";
        readonly type: "tuple[]";
    }, {
        readonly internalType: "address payable";
        readonly name: "beneficiary";
        readonly type: "address";
    }];
    readonly name: "handleAggregatedOps";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly components: readonly [{
            readonly internalType: "address";
            readonly name: "sender";
            readonly type: "address";
        }, {
            readonly internalType: "uint256";
            readonly name: "nonce";
            readonly type: "uint256";
        }, {
            readonly internalType: "bytes";
            readonly name: "initCode";
            readonly type: "bytes";
        }, {
            readonly internalType: "bytes";
            readonly name: "callData";
            readonly type: "bytes";
        }, {
            readonly internalType: "uint256";
            readonly name: "callGasLimit";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "verificationGasLimit";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "preVerificationGas";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "maxFeePerGas";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "maxPriorityFeePerGas";
            readonly type: "uint256";
        }, {
            readonly internalType: "bytes";
            readonly name: "paymasterAndData";
            readonly type: "bytes";
        }, {
            readonly internalType: "bytes";
            readonly name: "signature";
            readonly type: "bytes";
        }];
        readonly internalType: "struct UserOperation[]";
        readonly name: "ops";
        readonly type: "tuple[]";
    }, {
        readonly internalType: "address payable";
        readonly name: "beneficiary";
        readonly type: "address";
    }];
    readonly name: "handleOps";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "uint192";
        readonly name: "key";
        readonly type: "uint192";
    }];
    readonly name: "incrementNonce";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "bytes";
        readonly name: "callData";
        readonly type: "bytes";
    }, {
        readonly components: readonly [{
            readonly components: readonly [{
                readonly internalType: "address";
                readonly name: "sender";
                readonly type: "address";
            }, {
                readonly internalType: "uint256";
                readonly name: "nonce";
                readonly type: "uint256";
            }, {
                readonly internalType: "uint256";
                readonly name: "callGasLimit";
                readonly type: "uint256";
            }, {
                readonly internalType: "uint256";
                readonly name: "verificationGasLimit";
                readonly type: "uint256";
            }, {
                readonly internalType: "uint256";
                readonly name: "preVerificationGas";
                readonly type: "uint256";
            }, {
                readonly internalType: "address";
                readonly name: "paymaster";
                readonly type: "address";
            }, {
                readonly internalType: "uint256";
                readonly name: "maxFeePerGas";
                readonly type: "uint256";
            }, {
                readonly internalType: "uint256";
                readonly name: "maxPriorityFeePerGas";
                readonly type: "uint256";
            }];
            readonly internalType: "struct EntryPoint.MemoryUserOp";
            readonly name: "mUserOp";
            readonly type: "tuple";
        }, {
            readonly internalType: "bytes32";
            readonly name: "userOpHash";
            readonly type: "bytes32";
        }, {
            readonly internalType: "uint256";
            readonly name: "prefund";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "contextOffset";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "preOpGas";
            readonly type: "uint256";
        }];
        readonly internalType: "struct EntryPoint.UserOpInfo";
        readonly name: "opInfo";
        readonly type: "tuple";
    }, {
        readonly internalType: "bytes";
        readonly name: "context";
        readonly type: "bytes";
    }];
    readonly name: "innerHandleOp";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "actualGasCost";
        readonly type: "uint256";
    }];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "";
        readonly type: "address";
    }, {
        readonly internalType: "uint192";
        readonly name: "";
        readonly type: "uint192";
    }];
    readonly name: "nonceSequenceNumber";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly components: readonly [{
            readonly internalType: "address";
            readonly name: "sender";
            readonly type: "address";
        }, {
            readonly internalType: "uint256";
            readonly name: "nonce";
            readonly type: "uint256";
        }, {
            readonly internalType: "bytes";
            readonly name: "initCode";
            readonly type: "bytes";
        }, {
            readonly internalType: "bytes";
            readonly name: "callData";
            readonly type: "bytes";
        }, {
            readonly internalType: "uint256";
            readonly name: "callGasLimit";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "verificationGasLimit";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "preVerificationGas";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "maxFeePerGas";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "maxPriorityFeePerGas";
            readonly type: "uint256";
        }, {
            readonly internalType: "bytes";
            readonly name: "paymasterAndData";
            readonly type: "bytes";
        }, {
            readonly internalType: "bytes";
            readonly name: "signature";
            readonly type: "bytes";
        }];
        readonly internalType: "struct UserOperation";
        readonly name: "op";
        readonly type: "tuple";
    }, {
        readonly internalType: "address";
        readonly name: "target";
        readonly type: "address";
    }, {
        readonly internalType: "bytes";
        readonly name: "targetCallData";
        readonly type: "bytes";
    }];
    readonly name: "simulateHandleOp";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly components: readonly [{
            readonly internalType: "address";
            readonly name: "sender";
            readonly type: "address";
        }, {
            readonly internalType: "uint256";
            readonly name: "nonce";
            readonly type: "uint256";
        }, {
            readonly internalType: "bytes";
            readonly name: "initCode";
            readonly type: "bytes";
        }, {
            readonly internalType: "bytes";
            readonly name: "callData";
            readonly type: "bytes";
        }, {
            readonly internalType: "uint256";
            readonly name: "callGasLimit";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "verificationGasLimit";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "preVerificationGas";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "maxFeePerGas";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "maxPriorityFeePerGas";
            readonly type: "uint256";
        }, {
            readonly internalType: "bytes";
            readonly name: "paymasterAndData";
            readonly type: "bytes";
        }, {
            readonly internalType: "bytes";
            readonly name: "signature";
            readonly type: "bytes";
        }];
        readonly internalType: "struct UserOperation";
        readonly name: "userOp";
        readonly type: "tuple";
    }];
    readonly name: "simulateValidation";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "unlockStake";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address payable";
        readonly name: "withdrawAddress";
        readonly type: "address";
    }];
    readonly name: "withdrawStake";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address payable";
        readonly name: "withdrawAddress";
        readonly type: "address";
    }, {
        readonly internalType: "uint256";
        readonly name: "withdrawAmount";
        readonly type: "uint256";
    }];
    readonly name: "withdrawTo";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly stateMutability: "payable";
    readonly type: "receive";
}];
export declare const OPTIMISM_L1_GAS_PRICE_ORACLE_ABI: readonly [{
    readonly inputs: readonly [];
    readonly name: "decimals";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "gasPrice";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "bytes";
        readonly name: "_data";
        readonly type: "bytes";
    }];
    readonly name: "getL1Fee";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "bytes";
        readonly name: "_data";
        readonly type: "bytes";
    }];
    readonly name: "getL1GasUsed";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "l1BaseFee";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "overhead";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "scalar";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}];
export declare const MANTLE_BVM_GAS_PRICE_ORACLE_ABI: readonly [{
    readonly inputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "constructor";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "previousOperator";
        readonly type: "address";
    }, {
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "newOperator";
        readonly type: "address";
    }];
    readonly name: "OperatorUpdated";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "previousOwner";
        readonly type: "address";
    }, {
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "newOwner";
        readonly type: "address";
    }];
    readonly name: "OwnershipTransferred";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: true;
        readonly internalType: "uint256";
        readonly name: "previousTokenRatio";
        readonly type: "uint256";
    }, {
        readonly indexed: true;
        readonly internalType: "uint256";
        readonly name: "newTokenRatio";
        readonly type: "uint256";
    }];
    readonly name: "TokenRatioUpdated";
    readonly type: "event";
}, {
    readonly inputs: readonly [];
    readonly name: "DECIMALS";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "baseFee";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "decimals";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly stateMutability: "pure";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "gasPrice";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "bytes";
        readonly name: "_data";
        readonly type: "bytes";
    }];
    readonly name: "getL1Fee";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "bytes";
        readonly name: "_data";
        readonly type: "bytes";
    }];
    readonly name: "getL1GasUsed";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "l1BaseFee";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "operator";
    readonly outputs: readonly [{
        readonly internalType: "address";
        readonly name: "";
        readonly type: "address";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "overhead";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "owner";
    readonly outputs: readonly [{
        readonly internalType: "address";
        readonly name: "";
        readonly type: "address";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "scalar";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "_operator";
        readonly type: "address";
    }];
    readonly name: "setOperator";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "_tokenRatio";
        readonly type: "uint256";
    }];
    readonly name: "setTokenRatio";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "tokenRatio";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "_owner";
        readonly type: "address";
    }];
    readonly name: "transferOwnership";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "version";
    readonly outputs: readonly [{
        readonly internalType: "string";
        readonly name: "";
        readonly type: "string";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}];
export declare const ARBITRUM_L1_FEE_GAS_PRICE_ORACLE_ABI: readonly [{
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "to";
        readonly type: "address";
    }, {
        readonly internalType: "bool";
        readonly name: "contractCreation";
        readonly type: "bool";
    }, {
        readonly internalType: "bytes";
        readonly name: "data";
        readonly type: "bytes";
    }];
    readonly name: "gasEstimateL1Component";
    readonly outputs: readonly [{
        readonly internalType: "uint64";
        readonly name: "gasEstimateForL1";
        readonly type: "uint64";
    }, {
        readonly internalType: "uint256";
        readonly name: "baseFee";
        readonly type: "uint256";
    }, {
        readonly internalType: "uint256";
        readonly name: "l1BaseFeeEstimate";
        readonly type: "uint256";
    }];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}];
export declare const SCROLL_L1_GAS_PRICE_ORACLE_ABI: readonly [{
    readonly name: "getL1Fee";
    readonly type: "function";
    readonly stateMutability: "view";
    readonly inputs: readonly [{
        readonly name: "data";
        readonly internalType: "bytes";
        readonly type: "bytes";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly internalType: "uint256";
        readonly type: "uint256";
    }];
}];
export declare const VERIFICATION_GAS_ESTIMATION_SIMULATOR: readonly [{
    readonly inputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "minGas";
        readonly type: "uint256";
    }, {
        readonly internalType: "uint256";
        readonly name: "maxGas";
        readonly type: "uint256";
    }, {
        readonly internalType: "uint48";
        readonly name: "validAfter";
        readonly type: "uint48";
    }, {
        readonly internalType: "uint48";
        readonly name: "validUntil";
        readonly type: "uint48";
    }, {
        readonly internalType: "uint256";
        readonly name: "numRounds";
        readonly type: "uint256";
    }];
    readonly name: "EstimateVerificationGasContinuation";
    readonly type: "error";
}, {
    readonly inputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "gasEstimate";
        readonly type: "uint256";
    }, {
        readonly internalType: "uint48";
        readonly name: "validAfter";
        readonly type: "uint48";
    }, {
        readonly internalType: "uint48";
        readonly name: "validUntil";
        readonly type: "uint48";
    }, {
        readonly internalType: "uint256";
        readonly name: "numRounds";
        readonly type: "uint256";
    }];
    readonly name: "EstimateVerificationGasResult";
    readonly type: "error";
}, {
    readonly inputs: readonly [{
        readonly internalType: "bytes";
        readonly name: "revertData";
        readonly type: "bytes";
    }];
    readonly name: "EstimateVerificationGasRevertAtMax";
    readonly type: "error";
}, {
    readonly inputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "preOpGas";
        readonly type: "uint256";
    }, {
        readonly internalType: "uint256";
        readonly name: "paid";
        readonly type: "uint256";
    }, {
        readonly internalType: "uint48";
        readonly name: "validAfter";
        readonly type: "uint48";
    }, {
        readonly internalType: "uint48";
        readonly name: "validUntil";
        readonly type: "uint48";
    }, {
        readonly internalType: "bool";
        readonly name: "targetSuccess";
        readonly type: "bool";
    }, {
        readonly internalType: "bytes";
        readonly name: "targetResult";
        readonly type: "bytes";
    }];
    readonly name: "ExecutionResult";
    readonly type: "error";
}, {
    readonly inputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "opIndex";
        readonly type: "uint256";
    }, {
        readonly internalType: "string";
        readonly name: "reason";
        readonly type: "string";
    }];
    readonly name: "FailedOp";
    readonly type: "error";
}, {
    readonly inputs: readonly [{
        readonly internalType: "bytes";
        readonly name: "reason";
        readonly type: "bytes";
    }];
    readonly name: "FailedOpError";
    readonly type: "error";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "sender";
        readonly type: "address";
    }];
    readonly name: "SenderAddressResult";
    readonly type: "error";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "aggregator";
        readonly type: "address";
    }];
    readonly name: "SignatureValidationFailed";
    readonly type: "error";
}, {
    readonly inputs: readonly [{
        readonly internalType: "bytes";
        readonly name: "oogMsg";
        readonly type: "bytes";
    }];
    readonly name: "SimulateOnlyValidationOOG";
    readonly type: "error";
}, {
    readonly inputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "simulateOnlyValidationGasUsed";
        readonly type: "uint256";
    }, {
        readonly internalType: "uint48";
        readonly name: "validAfter";
        readonly type: "uint48";
    }, {
        readonly internalType: "uint48";
        readonly name: "validUntil";
        readonly type: "uint48";
    }];
    readonly name: "SimulateOnlyValidationRevert";
    readonly type: "error";
}, {
    readonly inputs: readonly [{
        readonly components: readonly [{
            readonly internalType: "uint256";
            readonly name: "preOpGas";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "prefund";
            readonly type: "uint256";
        }, {
            readonly internalType: "bool";
            readonly name: "sigFailed";
            readonly type: "bool";
        }, {
            readonly internalType: "uint48";
            readonly name: "validAfter";
            readonly type: "uint48";
        }, {
            readonly internalType: "uint48";
            readonly name: "validUntil";
            readonly type: "uint48";
        }, {
            readonly internalType: "bytes";
            readonly name: "paymasterContext";
            readonly type: "bytes";
        }];
        readonly internalType: "struct IEntryPoint.ReturnInfo";
        readonly name: "returnInfo";
        readonly type: "tuple";
    }, {
        readonly components: readonly [{
            readonly internalType: "uint256";
            readonly name: "stake";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "unstakeDelaySec";
            readonly type: "uint256";
        }];
        readonly internalType: "struct IStakeManager.StakeInfo";
        readonly name: "senderInfo";
        readonly type: "tuple";
    }, {
        readonly components: readonly [{
            readonly internalType: "uint256";
            readonly name: "stake";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "unstakeDelaySec";
            readonly type: "uint256";
        }];
        readonly internalType: "struct IStakeManager.StakeInfo";
        readonly name: "factoryInfo";
        readonly type: "tuple";
    }, {
        readonly components: readonly [{
            readonly internalType: "uint256";
            readonly name: "stake";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "unstakeDelaySec";
            readonly type: "uint256";
        }];
        readonly internalType: "struct IStakeManager.StakeInfo";
        readonly name: "paymasterInfo";
        readonly type: "tuple";
    }];
    readonly name: "ValidationResult";
    readonly type: "error";
}, {
    readonly inputs: readonly [{
        readonly components: readonly [{
            readonly internalType: "uint256";
            readonly name: "preOpGas";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "prefund";
            readonly type: "uint256";
        }, {
            readonly internalType: "bool";
            readonly name: "sigFailed";
            readonly type: "bool";
        }, {
            readonly internalType: "uint48";
            readonly name: "validAfter";
            readonly type: "uint48";
        }, {
            readonly internalType: "uint48";
            readonly name: "validUntil";
            readonly type: "uint48";
        }, {
            readonly internalType: "bytes";
            readonly name: "paymasterContext";
            readonly type: "bytes";
        }];
        readonly internalType: "struct IEntryPoint.ReturnInfo";
        readonly name: "returnInfo";
        readonly type: "tuple";
    }, {
        readonly components: readonly [{
            readonly internalType: "uint256";
            readonly name: "stake";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "unstakeDelaySec";
            readonly type: "uint256";
        }];
        readonly internalType: "struct IStakeManager.StakeInfo";
        readonly name: "senderInfo";
        readonly type: "tuple";
    }, {
        readonly components: readonly [{
            readonly internalType: "uint256";
            readonly name: "stake";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "unstakeDelaySec";
            readonly type: "uint256";
        }];
        readonly internalType: "struct IStakeManager.StakeInfo";
        readonly name: "factoryInfo";
        readonly type: "tuple";
    }, {
        readonly components: readonly [{
            readonly internalType: "uint256";
            readonly name: "stake";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "unstakeDelaySec";
            readonly type: "uint256";
        }];
        readonly internalType: "struct IStakeManager.StakeInfo";
        readonly name: "paymasterInfo";
        readonly type: "tuple";
    }, {
        readonly components: readonly [{
            readonly internalType: "address";
            readonly name: "aggregator";
            readonly type: "address";
        }, {
            readonly components: readonly [{
                readonly internalType: "uint256";
                readonly name: "stake";
                readonly type: "uint256";
            }, {
                readonly internalType: "uint256";
                readonly name: "unstakeDelaySec";
                readonly type: "uint256";
            }];
            readonly internalType: "struct IStakeManager.StakeInfo";
            readonly name: "stakeInfo";
            readonly type: "tuple";
        }];
        readonly internalType: "struct IEntryPoint.AggregatorStakeInfo";
        readonly name: "aggregatorInfo";
        readonly type: "tuple";
    }];
    readonly name: "ValidationResultWithAggregation";
    readonly type: "error";
}, {
    readonly inputs: readonly [{
        readonly internalType: "bool";
        readonly name: "success";
        readonly type: "bool";
    }, {
        readonly internalType: "uint256";
        readonly name: "gasUsed";
        readonly type: "uint256";
    }, {
        readonly internalType: "bytes";
        readonly name: "revertData";
        readonly type: "bytes";
    }];
    readonly name: "_InnerCallResult";
    readonly type: "error";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: true;
        readonly internalType: "bytes32";
        readonly name: "userOpHash";
        readonly type: "bytes32";
    }, {
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "sender";
        readonly type: "address";
    }, {
        readonly indexed: false;
        readonly internalType: "address";
        readonly name: "factory";
        readonly type: "address";
    }, {
        readonly indexed: false;
        readonly internalType: "address";
        readonly name: "paymaster";
        readonly type: "address";
    }];
    readonly name: "AccountDeployed";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [];
    readonly name: "BeforeExecution";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "account";
        readonly type: "address";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "totalDeposit";
        readonly type: "uint256";
    }];
    readonly name: "Deposited";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "aggregator";
        readonly type: "address";
    }];
    readonly name: "SignatureAggregatorChanged";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "account";
        readonly type: "address";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "totalStaked";
        readonly type: "uint256";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "unstakeDelaySec";
        readonly type: "uint256";
    }];
    readonly name: "StakeLocked";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "account";
        readonly type: "address";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "withdrawTime";
        readonly type: "uint256";
    }];
    readonly name: "StakeUnlocked";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "account";
        readonly type: "address";
    }, {
        readonly indexed: false;
        readonly internalType: "address";
        readonly name: "withdrawAddress";
        readonly type: "address";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "amount";
        readonly type: "uint256";
    }];
    readonly name: "StakeWithdrawn";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: true;
        readonly internalType: "bytes32";
        readonly name: "userOpHash";
        readonly type: "bytes32";
    }, {
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "sender";
        readonly type: "address";
    }, {
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "paymaster";
        readonly type: "address";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "nonce";
        readonly type: "uint256";
    }, {
        readonly indexed: false;
        readonly internalType: "bool";
        readonly name: "success";
        readonly type: "bool";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "actualGasCost";
        readonly type: "uint256";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "actualGasUsed";
        readonly type: "uint256";
    }];
    readonly name: "UserOperationEvent";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: true;
        readonly internalType: "bytes32";
        readonly name: "userOpHash";
        readonly type: "bytes32";
    }, {
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "sender";
        readonly type: "address";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "nonce";
        readonly type: "uint256";
    }, {
        readonly indexed: false;
        readonly internalType: "bytes";
        readonly name: "revertReason";
        readonly type: "bytes";
    }];
    readonly name: "UserOperationRevertReason";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "account";
        readonly type: "address";
    }, {
        readonly indexed: false;
        readonly internalType: "address";
        readonly name: "withdrawAddress";
        readonly type: "address";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "amount";
        readonly type: "uint256";
    }];
    readonly name: "Withdrawn";
    readonly type: "event";
}, {
    readonly inputs: readonly [];
    readonly name: "SIG_VALIDATION_FAILED";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "opIndex";
        readonly type: "uint256";
    }, {
        readonly components: readonly [{
            readonly internalType: "address";
            readonly name: "sender";
            readonly type: "address";
        }, {
            readonly internalType: "uint256";
            readonly name: "nonce";
            readonly type: "uint256";
        }, {
            readonly internalType: "bytes";
            readonly name: "initCode";
            readonly type: "bytes";
        }, {
            readonly internalType: "bytes";
            readonly name: "callData";
            readonly type: "bytes";
        }, {
            readonly internalType: "uint256";
            readonly name: "callGasLimit";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "verificationGasLimit";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "preVerificationGas";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "maxFeePerGas";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "maxPriorityFeePerGas";
            readonly type: "uint256";
        }, {
            readonly internalType: "bytes";
            readonly name: "paymasterAndData";
            readonly type: "bytes";
        }, {
            readonly internalType: "bytes";
            readonly name: "signature";
            readonly type: "bytes";
        }];
        readonly internalType: "struct UserOperation";
        readonly name: "userOp";
        readonly type: "tuple";
    }, {
        readonly components: readonly [{
            readonly components: readonly [{
                readonly internalType: "address";
                readonly name: "sender";
                readonly type: "address";
            }, {
                readonly internalType: "uint256";
                readonly name: "nonce";
                readonly type: "uint256";
            }, {
                readonly internalType: "uint256";
                readonly name: "callGasLimit";
                readonly type: "uint256";
            }, {
                readonly internalType: "uint256";
                readonly name: "verificationGasLimit";
                readonly type: "uint256";
            }, {
                readonly internalType: "uint256";
                readonly name: "preVerificationGas";
                readonly type: "uint256";
            }, {
                readonly internalType: "address";
                readonly name: "paymaster";
                readonly type: "address";
            }, {
                readonly internalType: "uint256";
                readonly name: "maxFeePerGas";
                readonly type: "uint256";
            }, {
                readonly internalType: "uint256";
                readonly name: "maxPriorityFeePerGas";
                readonly type: "uint256";
            }];
            readonly internalType: "struct EntryPoint.MemoryUserOp";
            readonly name: "mUserOp";
            readonly type: "tuple";
        }, {
            readonly internalType: "bytes32";
            readonly name: "userOpHash";
            readonly type: "bytes32";
        }, {
            readonly internalType: "uint256";
            readonly name: "prefund";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "contextOffset";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "preOpGas";
            readonly type: "uint256";
        }];
        readonly internalType: "struct EntryPoint.UserOpInfo";
        readonly name: "outOpInfo";
        readonly type: "tuple";
    }];
    readonly name: "_validatePrepayment";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "validationData";
        readonly type: "uint256";
    }, {
        readonly internalType: "uint256";
        readonly name: "paymasterValidationData";
        readonly type: "uint256";
    }];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "bytes";
        readonly name: "initCode";
        readonly type: "bytes";
    }, {
        readonly internalType: "address";
        readonly name: "sender";
        readonly type: "address";
    }, {
        readonly internalType: "bytes";
        readonly name: "paymasterAndData";
        readonly type: "bytes";
    }];
    readonly name: "_validateSenderAndPaymaster";
    readonly outputs: readonly [];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "uint32";
        readonly name: "unstakeDelaySec";
        readonly type: "uint32";
    }];
    readonly name: "addStake";
    readonly outputs: readonly [];
    readonly stateMutability: "payable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "account";
        readonly type: "address";
    }];
    readonly name: "balanceOf";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "account";
        readonly type: "address";
    }];
    readonly name: "depositTo";
    readonly outputs: readonly [];
    readonly stateMutability: "payable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "";
        readonly type: "address";
    }];
    readonly name: "deposits";
    readonly outputs: readonly [{
        readonly internalType: "uint112";
        readonly name: "deposit";
        readonly type: "uint112";
    }, {
        readonly internalType: "bool";
        readonly name: "staked";
        readonly type: "bool";
    }, {
        readonly internalType: "uint112";
        readonly name: "stake";
        readonly type: "uint112";
    }, {
        readonly internalType: "uint32";
        readonly name: "unstakeDelaySec";
        readonly type: "uint32";
    }, {
        readonly internalType: "uint48";
        readonly name: "withdrawTime";
        readonly type: "uint48";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly components: readonly [{
            readonly components: readonly [{
                readonly internalType: "address";
                readonly name: "sender";
                readonly type: "address";
            }, {
                readonly internalType: "uint256";
                readonly name: "nonce";
                readonly type: "uint256";
            }, {
                readonly internalType: "bytes";
                readonly name: "initCode";
                readonly type: "bytes";
            }, {
                readonly internalType: "bytes";
                readonly name: "callData";
                readonly type: "bytes";
            }, {
                readonly internalType: "uint256";
                readonly name: "callGasLimit";
                readonly type: "uint256";
            }, {
                readonly internalType: "uint256";
                readonly name: "verificationGasLimit";
                readonly type: "uint256";
            }, {
                readonly internalType: "uint256";
                readonly name: "preVerificationGas";
                readonly type: "uint256";
            }, {
                readonly internalType: "uint256";
                readonly name: "maxFeePerGas";
                readonly type: "uint256";
            }, {
                readonly internalType: "uint256";
                readonly name: "maxPriorityFeePerGas";
                readonly type: "uint256";
            }, {
                readonly internalType: "bytes";
                readonly name: "paymasterAndData";
                readonly type: "bytes";
            }, {
                readonly internalType: "bytes";
                readonly name: "signature";
                readonly type: "bytes";
            }];
            readonly internalType: "struct UserOperation";
            readonly name: "op";
            readonly type: "tuple";
        }, {
            readonly internalType: "uint256";
            readonly name: "minGas";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "maxGas";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "rounding";
            readonly type: "uint256";
        }, {
            readonly internalType: "bool";
            readonly name: "isContinuation";
            readonly type: "bool";
        }];
        readonly internalType: "struct VerificationGasEstimationSimulator.EstimateVerificationGasArgs";
        readonly name: "args";
        readonly type: "tuple";
    }];
    readonly name: "estimateVerificationGas";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "account";
        readonly type: "address";
    }];
    readonly name: "getDepositInfo";
    readonly outputs: readonly [{
        readonly components: readonly [{
            readonly internalType: "uint112";
            readonly name: "deposit";
            readonly type: "uint112";
        }, {
            readonly internalType: "bool";
            readonly name: "staked";
            readonly type: "bool";
        }, {
            readonly internalType: "uint112";
            readonly name: "stake";
            readonly type: "uint112";
        }, {
            readonly internalType: "uint32";
            readonly name: "unstakeDelaySec";
            readonly type: "uint32";
        }, {
            readonly internalType: "uint48";
            readonly name: "withdrawTime";
            readonly type: "uint48";
        }];
        readonly internalType: "struct IStakeManager.DepositInfo";
        readonly name: "info";
        readonly type: "tuple";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "sender";
        readonly type: "address";
    }, {
        readonly internalType: "uint192";
        readonly name: "key";
        readonly type: "uint192";
    }];
    readonly name: "getNonce";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "nonce";
        readonly type: "uint256";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "bytes";
        readonly name: "initCode";
        readonly type: "bytes";
    }];
    readonly name: "getSenderAddress";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly components: readonly [{
            readonly internalType: "address";
            readonly name: "sender";
            readonly type: "address";
        }, {
            readonly internalType: "uint256";
            readonly name: "nonce";
            readonly type: "uint256";
        }, {
            readonly internalType: "bytes";
            readonly name: "initCode";
            readonly type: "bytes";
        }, {
            readonly internalType: "bytes";
            readonly name: "callData";
            readonly type: "bytes";
        }, {
            readonly internalType: "uint256";
            readonly name: "callGasLimit";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "verificationGasLimit";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "preVerificationGas";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "maxFeePerGas";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "maxPriorityFeePerGas";
            readonly type: "uint256";
        }, {
            readonly internalType: "bytes";
            readonly name: "paymasterAndData";
            readonly type: "bytes";
        }, {
            readonly internalType: "bytes";
            readonly name: "signature";
            readonly type: "bytes";
        }];
        readonly internalType: "struct UserOperation";
        readonly name: "userOp";
        readonly type: "tuple";
    }];
    readonly name: "getUserOpHash";
    readonly outputs: readonly [{
        readonly internalType: "bytes32";
        readonly name: "";
        readonly type: "bytes32";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly components: readonly [{
            readonly components: readonly [{
                readonly internalType: "address";
                readonly name: "sender";
                readonly type: "address";
            }, {
                readonly internalType: "uint256";
                readonly name: "nonce";
                readonly type: "uint256";
            }, {
                readonly internalType: "bytes";
                readonly name: "initCode";
                readonly type: "bytes";
            }, {
                readonly internalType: "bytes";
                readonly name: "callData";
                readonly type: "bytes";
            }, {
                readonly internalType: "uint256";
                readonly name: "callGasLimit";
                readonly type: "uint256";
            }, {
                readonly internalType: "uint256";
                readonly name: "verificationGasLimit";
                readonly type: "uint256";
            }, {
                readonly internalType: "uint256";
                readonly name: "preVerificationGas";
                readonly type: "uint256";
            }, {
                readonly internalType: "uint256";
                readonly name: "maxFeePerGas";
                readonly type: "uint256";
            }, {
                readonly internalType: "uint256";
                readonly name: "maxPriorityFeePerGas";
                readonly type: "uint256";
            }, {
                readonly internalType: "bytes";
                readonly name: "paymasterAndData";
                readonly type: "bytes";
            }, {
                readonly internalType: "bytes";
                readonly name: "signature";
                readonly type: "bytes";
            }];
            readonly internalType: "struct UserOperation[]";
            readonly name: "userOps";
            readonly type: "tuple[]";
        }, {
            readonly internalType: "contract IAggregator";
            readonly name: "aggregator";
            readonly type: "address";
        }, {
            readonly internalType: "bytes";
            readonly name: "signature";
            readonly type: "bytes";
        }];
        readonly internalType: "struct IEntryPoint.UserOpsPerAggregator[]";
        readonly name: "opsPerAggregator";
        readonly type: "tuple[]";
    }, {
        readonly internalType: "address payable";
        readonly name: "beneficiary";
        readonly type: "address";
    }];
    readonly name: "handleAggregatedOps";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly components: readonly [{
            readonly internalType: "address";
            readonly name: "sender";
            readonly type: "address";
        }, {
            readonly internalType: "uint256";
            readonly name: "nonce";
            readonly type: "uint256";
        }, {
            readonly internalType: "bytes";
            readonly name: "initCode";
            readonly type: "bytes";
        }, {
            readonly internalType: "bytes";
            readonly name: "callData";
            readonly type: "bytes";
        }, {
            readonly internalType: "uint256";
            readonly name: "callGasLimit";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "verificationGasLimit";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "preVerificationGas";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "maxFeePerGas";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "maxPriorityFeePerGas";
            readonly type: "uint256";
        }, {
            readonly internalType: "bytes";
            readonly name: "paymasterAndData";
            readonly type: "bytes";
        }, {
            readonly internalType: "bytes";
            readonly name: "signature";
            readonly type: "bytes";
        }];
        readonly internalType: "struct UserOperation[]";
        readonly name: "ops";
        readonly type: "tuple[]";
    }, {
        readonly internalType: "address payable";
        readonly name: "beneficiary";
        readonly type: "address";
    }];
    readonly name: "handleOps";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "uint192";
        readonly name: "key";
        readonly type: "uint192";
    }];
    readonly name: "incrementNonce";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "bytes";
        readonly name: "callData";
        readonly type: "bytes";
    }, {
        readonly components: readonly [{
            readonly components: readonly [{
                readonly internalType: "address";
                readonly name: "sender";
                readonly type: "address";
            }, {
                readonly internalType: "uint256";
                readonly name: "nonce";
                readonly type: "uint256";
            }, {
                readonly internalType: "uint256";
                readonly name: "callGasLimit";
                readonly type: "uint256";
            }, {
                readonly internalType: "uint256";
                readonly name: "verificationGasLimit";
                readonly type: "uint256";
            }, {
                readonly internalType: "uint256";
                readonly name: "preVerificationGas";
                readonly type: "uint256";
            }, {
                readonly internalType: "address";
                readonly name: "paymaster";
                readonly type: "address";
            }, {
                readonly internalType: "uint256";
                readonly name: "maxFeePerGas";
                readonly type: "uint256";
            }, {
                readonly internalType: "uint256";
                readonly name: "maxPriorityFeePerGas";
                readonly type: "uint256";
            }];
            readonly internalType: "struct EntryPoint.MemoryUserOp";
            readonly name: "mUserOp";
            readonly type: "tuple";
        }, {
            readonly internalType: "bytes32";
            readonly name: "userOpHash";
            readonly type: "bytes32";
        }, {
            readonly internalType: "uint256";
            readonly name: "prefund";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "contextOffset";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "preOpGas";
            readonly type: "uint256";
        }];
        readonly internalType: "struct EntryPoint.UserOpInfo";
        readonly name: "opInfo";
        readonly type: "tuple";
    }, {
        readonly internalType: "bytes";
        readonly name: "context";
        readonly type: "bytes";
    }];
    readonly name: "innerHandleOp";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "actualGasCost";
        readonly type: "uint256";
    }];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "";
        readonly type: "address";
    }, {
        readonly internalType: "uint192";
        readonly name: "";
        readonly type: "uint192";
    }];
    readonly name: "nonceSequenceNumber";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly components: readonly [{
            readonly internalType: "address";
            readonly name: "sender";
            readonly type: "address";
        }, {
            readonly internalType: "uint256";
            readonly name: "nonce";
            readonly type: "uint256";
        }, {
            readonly internalType: "bytes";
            readonly name: "initCode";
            readonly type: "bytes";
        }, {
            readonly internalType: "bytes";
            readonly name: "callData";
            readonly type: "bytes";
        }, {
            readonly internalType: "uint256";
            readonly name: "callGasLimit";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "verificationGasLimit";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "preVerificationGas";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "maxFeePerGas";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "maxPriorityFeePerGas";
            readonly type: "uint256";
        }, {
            readonly internalType: "bytes";
            readonly name: "paymasterAndData";
            readonly type: "bytes";
        }, {
            readonly internalType: "bytes";
            readonly name: "signature";
            readonly type: "bytes";
        }];
        readonly internalType: "struct UserOperation";
        readonly name: "op";
        readonly type: "tuple";
    }, {
        readonly internalType: "address";
        readonly name: "target";
        readonly type: "address";
    }, {
        readonly internalType: "bytes";
        readonly name: "targetCallData";
        readonly type: "bytes";
    }];
    readonly name: "simulateHandleOp";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "preOpGas";
        readonly type: "uint256";
    }, {
        readonly internalType: "uint256";
        readonly name: "paid";
        readonly type: "uint256";
    }, {
        readonly internalType: "uint48";
        readonly name: "validAfter";
        readonly type: "uint48";
    }, {
        readonly internalType: "uint48";
        readonly name: "validUntil";
        readonly type: "uint48";
    }, {
        readonly internalType: "bool";
        readonly name: "targetSuccess";
        readonly type: "bool";
    }, {
        readonly internalType: "bytes";
        readonly name: "targetResult";
        readonly type: "bytes";
    }];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly components: readonly [{
            readonly internalType: "address";
            readonly name: "sender";
            readonly type: "address";
        }, {
            readonly internalType: "uint256";
            readonly name: "nonce";
            readonly type: "uint256";
        }, {
            readonly internalType: "bytes";
            readonly name: "initCode";
            readonly type: "bytes";
        }, {
            readonly internalType: "bytes";
            readonly name: "callData";
            readonly type: "bytes";
        }, {
            readonly internalType: "uint256";
            readonly name: "callGasLimit";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "verificationGasLimit";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "preVerificationGas";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "maxFeePerGas";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "maxPriorityFeePerGas";
            readonly type: "uint256";
        }, {
            readonly internalType: "bytes";
            readonly name: "paymasterAndData";
            readonly type: "bytes";
        }, {
            readonly internalType: "bytes";
            readonly name: "signature";
            readonly type: "bytes";
        }];
        readonly internalType: "struct UserOperation";
        readonly name: "op";
        readonly type: "tuple";
    }, {
        readonly internalType: "uint256";
        readonly name: "gas";
        readonly type: "uint256";
    }];
    readonly name: "simulateOnlyValidation";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly components: readonly [{
            readonly internalType: "address";
            readonly name: "sender";
            readonly type: "address";
        }, {
            readonly internalType: "uint256";
            readonly name: "nonce";
            readonly type: "uint256";
        }, {
            readonly internalType: "bytes";
            readonly name: "initCode";
            readonly type: "bytes";
        }, {
            readonly internalType: "bytes";
            readonly name: "callData";
            readonly type: "bytes";
        }, {
            readonly internalType: "uint256";
            readonly name: "callGasLimit";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "verificationGasLimit";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "preVerificationGas";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "maxFeePerGas";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "maxPriorityFeePerGas";
            readonly type: "uint256";
        }, {
            readonly internalType: "bytes";
            readonly name: "paymasterAndData";
            readonly type: "bytes";
        }, {
            readonly internalType: "bytes";
            readonly name: "signature";
            readonly type: "bytes";
        }];
        readonly internalType: "struct UserOperation";
        readonly name: "userOp";
        readonly type: "tuple";
    }];
    readonly name: "simulateValidation";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "unlockStake";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address payable";
        readonly name: "withdrawAddress";
        readonly type: "address";
    }];
    readonly name: "withdrawStake";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address payable";
        readonly name: "withdrawAddress";
        readonly type: "address";
    }, {
        readonly internalType: "uint256";
        readonly name: "withdrawAmount";
        readonly type: "uint256";
    }];
    readonly name: "withdrawTo";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly stateMutability: "payable";
    readonly type: "receive";
}];
//# sourceMappingURL=index.d.ts.map