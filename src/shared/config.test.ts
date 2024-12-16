import config from "config";
import { SupportedChain, SupportedChainSchema } from "./config";

describe("config-test", () => {
  const supportedChains =
    config.get<Record<string, SupportedChain>>("supportedChains");

  const chains = Object.values(supportedChains);

  for (const chain of chains) {
    describe(`${chain.name} (${chain.chainId})`, () => {
      it("config should be valid", () => {
        SupportedChainSchema.parse(chain);
      });
    });
  }
});
