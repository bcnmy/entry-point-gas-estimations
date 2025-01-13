import { StateOverrideSet } from "../../shared/types";
import { mergeStateOverrides } from "./utils";
import { describe, it, expect } from "vitest";

describe("mergeStateOverrides", () => {
  it("should return destination when source is undefined", () => {
    const destination: StateOverrideSet = {
      "0x1234": { balance: "0x1" },
    };
    expect(mergeStateOverrides(destination, undefined)).toEqual(destination);
  });

  it("should merge top-level properties", () => {
    const destination: StateOverrideSet = {
      "0x1234": { balance: "0x1" },
    };
    const source: StateOverrideSet = {
      "0x5678": { balance: "0x2" },
    };
    const expected: StateOverrideSet = {
      "0x1234": { balance: "0x1" },
      "0x5678": { balance: "0x2" },
    };
    expect(mergeStateOverrides(destination, source)).toEqual(expected);
  });

  it("should override existing properties", () => {
    const destination: StateOverrideSet = {
      "0x1234": { balance: "0x1" },
    };
    const source: StateOverrideSet = {
      "0x1234": { balance: "0x2" },
    };
    const expected: StateOverrideSet = {
      "0x1234": { balance: "0x2" },
    };
    expect(mergeStateOverrides(destination, source)).toEqual(expected);
  });

  it("should merge nested objects recursively", () => {
    const destination: StateOverrideSet = {
      "0x1234": {
        balance: "0x1",
        storage: {
          "0xabcd": "0x111",
        },
      },
    };
    const source: StateOverrideSet = {
      "0x1234": {
        storage: {
          "0xef12": "0x222",
        },
      },
    };
    const expected: StateOverrideSet = {
      "0x1234": {
        balance: "0x1",
        storage: {
          "0xabcd": "0x111",
          "0xef12": "0x222",
        },
      },
    };
    expect(mergeStateOverrides(destination, source)).toEqual(expected);
  });

  it("should handle complex nested merges", () => {
    const destination: StateOverrideSet = {
      "0x1234": {
        balance: "0x1",
        nonce: "0x0",
        storage: {
          "0xabcd": "0x111",
          "0xef12": "0x222",
        },
      },
      "0x5678": {
        code: "0x1234",
        storage: {
          "0x9999": "0x333",
        },
      },
    };
    const source: StateOverrideSet = {
      "0x1234": {
        nonce: "0x1",
        storage: {
          "0xef12": "0x444",
          "0xaaaa": "0x555",
        },
      },
      "0x5678": {
        storage: {
          "0x8888": "0x666",
        },
      },
    };
    const expected: StateOverrideSet = {
      "0x1234": {
        balance: "0x1",
        nonce: "0x1",
        storage: {
          "0xabcd": "0x111",
          "0xef12": "0x444",
          "0xaaaa": "0x555",
        },
      },
      "0x5678": {
        code: "0x1234",
        storage: {
          "0x9999": "0x333",
          "0x8888": "0x666",
        },
      },
    };
    expect(mergeStateOverrides(destination, source)).toEqual(expected);
  });

  it("should handle empty objects", () => {
    const destination: StateOverrideSet = {};
    const source: StateOverrideSet = {
      "0x1234": { balance: "0x1" },
    };
    expect(mergeStateOverrides(destination, source)).toEqual(source);
  });

  it("should not modify the original objects", () => {
    const destination: StateOverrideSet = {
      "0x1234": { balance: "0x1" },
    };
    const source: StateOverrideSet = {
      "0x1234": { nonce: "0x2" },
    };
    const originalDestination = { ...destination };
    const originalSource = { ...source };

    mergeStateOverrides(destination, source);

    expect(destination).toEqual(originalDestination);
    expect(source).toEqual(originalSource);
  });
});
