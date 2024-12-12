import { createPublicClient, http } from "viem";
import { defaultEntryPointAddresses } from "./constants";
import { createEntryPointContract } from "./factory";
import { EntryPointVersion } from "./types";
import { optimism } from "viem/chains";

describe("entrypoint", () => {
  describe("createEntryPointContract", () => {
    const rpcClient = createPublicClient({
      chain: optimism,
      transport: http(),
    });

    it("creates a default EPv0.6.0 contract correctly", () => {
      const ep = createEntryPointContract({
        entryPointVersion: EntryPointVersion.V006,
        rpcClient,
      });

      // check version and default address
      expect(ep.version).toBe(EntryPointVersion.V006);
      expect(ep.address).toBe("0x5ff137d4b0fdcd49dca30c7cf57e578a026d2789");

      // Check ABI
      const handleOps = ep.abi.find((a) => a.name === "handleOps");
      expect(handleOps).toBeDefined();

      const userOpInput = handleOps?.inputs?.find((i) => i.name === "ops");
      expect(userOpInput).toBeDefined();

      // EPv0.6.0 handleOps accepts a plain, unpacked UserOperation
      expect(userOpInput?.internalType).toMatch(/UserOperation/);
    });

    it("creates an EPv0.6.0 contract with a custom address", () => {
      const ep = createEntryPointContract({
        entryPointVersion: EntryPointVersion.V006,
        entryPointAddress: "0xdeadbeef" as any,
        rpcClient,
      });

      expect(ep.address).toBe("0xdeadbeef");
    });

    it("creates a default EPv0.7.0 contract correctly", () => {
      const ep = createEntryPointContract({
        entryPointVersion: EntryPointVersion.V007,
        rpcClient,
      });

      // check version and default address
      expect(ep.version).toBe(EntryPointVersion.V007);
      expect(ep.address).toBe("0x0000000071727de22e5e9d8baf0edac6f37da032");

      // check abi
      const handleOps = ep.abi.find((a) => a.name === "handleOps");
      expect(handleOps).toBeDefined();

      const userOpInput = handleOps?.inputs?.find((i) => i.name === "ops");
      expect(userOpInput).toBeDefined();

      // EPv0.7.0 handleOps accepts a packed UserOperation
      expect(userOpInput?.internalType).toMatch(/PackedUserOperation/);
    });

    it("creates an EPv0.7.0 contract with a custom address", () => {
      const ep = createEntryPointContract({
        entryPointVersion: EntryPointVersion.V007,
        rpcClient,
        entryPointAddress: "0xdeadbeef" as any,
      });

      expect(ep.address).toBe("0xdeadbeef");
    });
  });
});
