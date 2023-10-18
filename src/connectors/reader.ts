import { initializeConnector } from "@web3-react/core";
import { Network } from "@web3-react/network";

const chains = {
  4201: ['https://rpc.testnet.lukso.network']
};

export const [reader, hooks] = initializeConnector<Network>(
  (actions) => new Network({ actions, defaultChainId: 4201, urlMap: chains })
);