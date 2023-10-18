import { initializeConnector } from "@web3-react/core";
import { EIP1193 } from "@web3-react/eip1193";

const EMPTY_HOOKS = {
  useAccount: () => null
};

export const [metaMask, hooks] = window.lukso ? initializeConnector<EIP1193>(
  (actions) => new EIP1193({ actions, provider: window.lukso })
) : [null, EMPTY_HOOKS];
