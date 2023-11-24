import Web3Container from './Web3Container';
import NiceModal from '@ebay/nice-modal-react';

import Router from './Router';
import AddToMuseboard from './modals/AddToMuseboard';
import CreateMuseboard from './modals/CreateMuseboard';
import FollowingListModal from './modals/FollowingListModal';

NiceModal.register('add-to-museboard', AddToMuseboard);
NiceModal.register('create-museboard', CreateMuseboard);
NiceModal.register('list-following', FollowingListModal);

function App() {
  return (
    <Web3Container>
      <Router />
    </Web3Container>
  )
}

export default App
