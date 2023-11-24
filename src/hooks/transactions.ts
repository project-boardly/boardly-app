import { Contract, BrowserProvider, FunctionFragment, TransactionRequest, Interface } from 'ethers';

import { abi as ProfileABI } from '@lukso/lsp-smart-contracts/artifacts/UniversalProfile.json';
import { abi as KeyManagerABI } from '@lukso/lsp-smart-contracts/artifacts/LSP6KeyManager.json';
import toast from 'react-hot-toast';

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

  async function sendTransaction (contract: Contract, functionName: string | FunctionFragment, args: unknown[]) {
    const signer = await provider.getSigner();

    const txn = contract.connect(signer).getFunction(functionName)(...args);

    toast.promise(txn, {
      loading: 'Sending transaction',
      error: 'Failed to send transaction',
      success: 'Transaction Sent'
    });

    return txn;
  }

  async function executeTransactionRequest (transactionReq: TransactionRequest) {
    const signer = await provider.getSigner();

    try {
      const txn = signer.sendTransaction(transactionReq);

      toast.promise(txn, {
        loading: 'Sending transaction',
        error: 'Failed to send transaction',
        success: 'Transaction Sent'
      });
  
      return txn;
    }
    catch (_err) {
      const error = parseTransactionError(_err);

      console.log(_err);
      toast.error(`transaction failed: ${error.name}`);
      throw error;
    }
  }

  return { sendTransaction, executeTransactionRequest, getSigner: () => provider.getSigner() }
}

export function useTransactionWatcher (txnHash: string) {
  console.log(txnHash);
}