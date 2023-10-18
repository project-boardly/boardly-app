import { Contract, BrowserProvider, FunctionFragment, TransactionRequest, Interface } from 'ethers';

import { abi as ProfileABI } from '@lukso/lsp-smart-contracts/artifacts/UniversalProfile.json';
import { abi as KeyManagerABI } from '@lukso/lsp-smart-contracts/artifacts/LSP6KeyManager.json';
import { useToasts } from 'react-toast-notifications';

export const ProfileInterface = new Interface(ProfileABI);
export const KeyManagerInterfae = new Interface(KeyManagerABI);

class MuseboardError extends Error {
  constructor(name: string) {
    super();

    this.name = name;
  }
}

function parseTransactionError (error: any) {
  console.error(error);

  if (!error.data) {
    return error;
  }

  // const parsedError = ExtensionInterface.parseError(error.data);
  // const placeholderError = PlaceholderInterface.parseError(error.data);
  // const assetError = AssetInterface.parseError(error.data);
  // const profileError = ProfileInterface.parseError(error.data);
  // const keyManagerError = KeyManagerInterfae.parseError(error.data);

  const MatchingInterface = [ProfileInterface, KeyManagerInterfae].find((_interface) => {
    return _interface.parseError(error.data) !== null
  });
  
  const parsedError = MatchingInterface?.parseError(error.data);

  if (!parsedError) {
    return error;
  }

  return new MuseboardError(parsedError.name);
}

export function useTransactionSender () {
  const provider = new BrowserProvider(window.lukso);
  const { addToast } = useToasts();

  async function sendTransaction (contract: Contract, functionName: string | FunctionFragment, args: unknown[]) {
    const signer = await provider.getSigner();

    return contract.connect(signer).getFunction(functionName)(...args);
  }

  async function executeTransactionRequest (transactionReq: TransactionRequest) {
    const signer = await provider.getSigner();

    addToast('sending transaction', { appearance: 'info', autoDismiss: true });

    try {
      const txnResponse = await signer.sendTransaction(transactionReq);

      addToast('sent transaction', { appearance: 'info', autoDismiss: true });

      return txnResponse
    }
    catch (_err) {
      const error =  parseTransactionError(_err);

      addToast(`transaction failed: ${error.name}`);

      throw error;
    }
  }

  return { sendTransaction, executeTransactionRequest }
}

export function useTransactionWatcher (txnHash: string) {
  console.log(txnHash);
}