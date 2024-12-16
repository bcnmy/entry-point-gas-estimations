import { EntryPointVersion } from "../../entrypoint/shared/types";
import { EntryPointV6 } from "../../entrypoint/v0.6.0/EntryPointV6";
import { EntryPointV6Simulations } from "../../entrypoint/v0.6.0/EntryPointV6Simulations";
import { ExecutionResultV6 } from "../../entrypoint/v0.6.0/types";
import { UserOperationV6 } from "../../entrypoint/v0.6.0/UserOperationV6";
import { EntryPointV7Simulations } from "../../entrypoint/v0.7.0/EntryPointV7Simulations";
import { ExecutionResultV7 } from "../../entrypoint/v0.7.0/types";
import { UserOperationV7 } from "../../entrypoint/v0.7.0/UserOperationV7";

export type UserOperation = UserOperationV6 & UserOperationV7;

export type ExecutionResult = ExecutionResultV6 | ExecutionResultV7;

export type EntryPoints = {
  [EntryPointVersion.v060]: {
    contract: EntryPointV6;
    simulations: EntryPointV6Simulations;
  };
  [EntryPointVersion.v070]: {
    contract: EntryPointV7Simulations;
  };
};
