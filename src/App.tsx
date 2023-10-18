import Web3Container from './Web3Container';
// import NiceModal from '@ebay/nice-modal-react';

import Router from './Router';
// import AuthModal from './modals/AuthModal';

// NiceModal.register('museboard-auth', AuthModal);

function App() {
  return (
    <Web3Container>
      <Router />
    </Web3Container>
  )
}

export default App
