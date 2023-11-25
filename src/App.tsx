import { useEffect } from 'react';

import NiceModal from '@ebay/nice-modal-react';

import Web3Container from './Web3Container';
import Router from './Router';
import AddToMuseboard from './modals/AddToMuseboard';
import CreateMuseboard from './modals/CreateMuseboard';
import FollowingListModal from './modals/FollowingListModal';
import FollowersListModal from './modals/FollowersListModal';

import { LitProvider } from './contexts/LitNetworkContext';

NiceModal.register('add-to-museboard', AddToMuseboard);
NiceModal.register('create-museboard', CreateMuseboard);
NiceModal.register('list-following', FollowingListModal);
NiceModal.register('list-followers', FollowersListModal);

function App() {
  useEffect(() => {
    document.addEventListener(
      "lit-ready",
      function (e) {
        console.log("LIT network is ready");
      },
      false
    );

    return () => {
      document.removeEventListener(
        "lit-ready",
        function (e) {
          console.log("Remove listner for LIT network");
        },
        false
      );
    }
  }, []);

  return (
    <LitProvider>
      <Web3Container>
        <Router />
      </Web3Container>
    </LitProvider>
  )
}

export default App
