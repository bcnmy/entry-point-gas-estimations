import { supportedChains } from "./chains";
import { SupportedChainSchema } from "./types";

describe("supportedChains", () => {
  for (const [chainId, chain] of Object.entries(supportedChains)) {
    describe(`${chain.name} (${chain.chainId})`, () => {
      it("format should be valid", () => {
        SupportedChainSchema.parse(chain);
      });
    });
  }
});
