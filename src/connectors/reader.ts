import { initializeConnector } from "@web3-react/core";
import { Network } from "@web3-react/network";

const chains = {
  42: ["https://rpc.mainnet.lukso.network"],
};

export const [reader, hooks] = initializeConnector<Network>(
  (actions) => new Network({ actions, defaultChainId: 42, urlMap: chains }),
);
