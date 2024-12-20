import { getRequiredPrefundV6 } from "../entrypoint/v0.6.0/utils";
import { getRequiredPrefundV7 } from "../entrypoint/v0.7.0/utils";
import {
  isUserOperationV6,
  UserOperation,
} from "../gas-estimator/UserOperation";

export function getRequiredPrefund(userOperation: UserOperation) {
  if (isUserOperationV6(userOperation)) {
    return getRequiredPrefundV6(userOperation);
  }

  return getRequiredPrefundV7(userOperation);
}

export function bumpBigIntPercent(big: bigint, percent: number) {
  return big + (big * BigInt(percent)) / BigInt(100);
}
