import { initializeConnector } from "@web3-react/core";
import { EIP1193 } from "@web3-react/eip1193";

export const [metaMask, hooks] = initializeConnector<EIP1193>(
  (actions) => new EIP1193({ actions, provider: window.ethereum })
);
