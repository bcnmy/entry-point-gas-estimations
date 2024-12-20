import { StateOverrideSet } from "../../shared/types";

export function cleanUpRevertReason(revertReason: string): string {
  const match = revertReason.match(/AA(\d+)\s(.+)/);

  if (match) {
    const errorCode = match[1]; // e.g., "25"
    const errorMessage = match[2]; // e.g., "invalid account nonce"
    const newMatch = `AA${errorCode} ${errorMessage}`.match(
      // eslint-disable-next-line no-control-regex
      /AA.*?(?=\\u|\u0000)/
    );
    if (newMatch) {
      const extractedString = newMatch[0];
      return extractedString;
    }
    return `AA${errorCode} ${errorMessage}`;
  }
  return revertReason;
}

export function mergeStateOverrides(
  destination: StateOverrideSet,
  source?: StateOverrideSet
): StateOverrideSet {
  return {
    ...destination,
    ...source,
  };
}
