import {
  type UserOperationV6,
  userOperationV6Schema
} from "../entrypoint/v0.6.0/UserOperationV6"
import {
  type UserOperationV7,
  userOperationV7Schema
} from "../entrypoint/v0.7.0/UserOperationV7"

export type UserOperation = UserOperationV6 | UserOperationV7

/**
 * Type guard to check if a user operation is a v0.6.0 operation.
 * Checks for the presence of paymasterAndData and initCode fields which are specific to v0.6.0.
 *
 * @param userOp - The {@link UserOperation} to check
 * @returns True if the operation is a v0.6.0 operation
 *
 * @example
 * ```typescript
 * if (isUserOperationV6(userOp)) {
 *   // Access v0.6.0 specific fields
 *   console.log(userOp.paymasterAndData);
 *   console.log(userOp.initCode);
 * }
 * ```
 */
export function isUserOperationV6(
  userOp: UserOperation
): userOp is UserOperationV6 {
  return "paymasterAndData" in userOp || "initCode" in userOp
}

/**
 * Type guard to check if a user operation is a v0.7.0 operation.
 * Checks for the presence of paymaster, factory, or factoryData fields which are specific to v0.7.0.
 *
 * @param userOp - The user operation to check
 * @returns True if the operation is a v0.7.0 operation
 *
 * @example
 * ```typescript
 * if (isUserOperationV7(userOp)) {
 *   // Access v0.7.0 specific fields
 *   console.log(userOp.paymaster);
 *   console.log(userOp.factory);
 *   console.log(userOp.factoryData);
 * }
 * ```
 */
export function isUserOperationV7(userOp: any): userOp is UserOperationV7 {
  return "paymaster" in userOp || "factory" in userOp || "factoryData" in userOp
}

/**
 * Validates a user operation against the appropriate schema based on its version.
 * Uses Zod schemas to ensure all required fields are present and have the correct types.
 *
 * @param userOperation - The {@link UserOperation} to validate
 * @returns The validated user operation with correct types
 * @throws Error if validation fails or if the operation format is invalid
 *
 * @example
 * ```typescript
 * // Validate a v0.6.0 operation
 * const validatedV6 = validateUserOperation({
 *   sender: "0x123...",
 *   nonce: 1n,
 *   paymasterAndData: "0x456...",
 *   // ... other v0.6.0 fields
 * });
 *
 * // Validate a v0.7.0 operation
 * const validatedV7 = validateUserOperation({
 *   sender: "0x123...",
 *   nonce: 1n,
 *   paymaster: "0x456...",
 *   // ... other v0.7.0 fields
 * });
 * ```
 */
export function validateUserOperation(
  userOperation: UserOperation
): UserOperation {
  if (isUserOperationV6(userOperation)) {
    return userOperationV6Schema.parse(userOperation)
  }
  if (isUserOperationV7(userOperation)) {
    return userOperationV7Schema.parse(userOperation)
  }

  throw new Error("Invalid UserOperation")
}
