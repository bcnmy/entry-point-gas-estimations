import config from "config";
import { SupportedChain, SupportedChainSchema } from "./config";

describe("config-test", () => {
  const networksNotSupportingEthCallBytecodeStateOverrides = [
    1, 59144, 84532, 421614, 168587773, 43113, 11155111, 1101, 88882, 88888,
    81457, 167009, 713715, 167000, 1328, 1329, 997, 995, 28882, 288,
    920637907288165, 4202, 1135,
  ];

  const EIP1559SupportedNetworks = [
    1, 137, 42161, 10, 43114, 43113, 8453, 59144, 204, 5611, 421614, 11155111,
    84532, 168587773, 81457, 42170, 169, 56400, 11155420, 80002, 27827, 4653,
    100, 10200, 997, 713715, 3799, 167009, 80084, 5845, 167000, 1328, 1329,
    1715, 995, 28882, 288, 920637907288165, 1740, 1750, 4202, 1135, 2818,
  ];

  const supportedChains =
    config.get<Record<string, SupportedChain>>("supportedChains");

  const chains = Object.values(supportedChains);

  for (const chain of chains) {
    describe(`${chain.name} (${chain.chainId})`, () => {
      it("config should be valid", () => {
        SupportedChainSchema.parse(chain);

        if (
          networksNotSupportingEthCallBytecodeStateOverrides.includes(
            chain.chainId
          )
        ) {
          expect(chain.stateOverrideSupport.bytecode).toBe(false);
        }

        if (EIP1559SupportedNetworks.includes(chain.chainId)) {
          expect(chain.eip1559).toBe(true);
        }
      });
    });
  }
});
