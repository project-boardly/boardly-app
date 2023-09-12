import { useEffect } from "react";
import { metaMask } from './connectors/default';
import { reader } from "./connectors/reader";

import { init as initWeb3Onboard } from "./connectors/web3onboard";
import { getAuth, onAuthStateChanged } from "firebase/auth";

initWeb3Onboard();

interface ReactChildren {
  children: JSX.Element
}

export default function Web3Container ({ children } : ReactChildren) {
  useEffect(() => {
    const connectedWallet = localStorage.getItem('family:connected:wallet');

    connectedWallet && metaMask.connectEagerly()
    reader.activate().then(() => console.log('Reader Connected'));
  }, []);

  useEffect(() => {
    onAuthStateChanged(getAuth(), (user) => {
      if (user) { return; }

      localStorage.clearItem('family:connected:wallet');
    });
  }, []);

  return children;
}
