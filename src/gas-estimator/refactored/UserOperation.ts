import {
  UserOperationV6,
  userOperationV6Schema,
} from "../../entrypoint/v0.6.0/UserOperationV6";
import {
  UserOperationV7,
  userOperationV7Schema,
} from "../../entrypoint/v0.7.0/UserOperationV7";

export type UserOperation = UserOperationV6 | UserOperationV7;

export function isUserOperation(
  userOperation: UserOperationV6 | UserOperationV7
): userOperation is UserOperation {
  return isUserOperationV6(userOperation) || isUserOperationV7(userOperation);
}

export function isUserOperationV6(
  userOp: UserOperation
): userOp is UserOperationV6 {
  return "paymasterAndData" in userOp || "initCode" in userOp;
}

export function isUserOperationV7(userOp: any): userOp is UserOperationV7 {
  return (
    "paymaster" in userOp || "factory" in userOp || "factoryData" in userOp
  );
}

export function validateUserOperation(
  userOperation: UserOperation
): UserOperation {
  if (isUserOperationV6(userOperation)) {
    return userOperationV6Schema.parse(userOperation);
  } else if (isUserOperationV7(userOperation)) {
    return userOperationV7Schema.parse(userOperation);
  }

  throw new Error("Invalid UserOperation");
}
