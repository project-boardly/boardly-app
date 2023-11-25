import { createContext } from "react";

import { Mnemonic, Wallet } from "ethers";

import { LitNodeClient, encryptString, decryptToString } from "@lit-protocol/lit-node-client";

import { createSiweMessage } from "../utils/siwe";

const client = new LitNodeClient({
  litNetwork: 'cayenne',
});

const evmContractConditions = [
  {
    contractAddress: "0x1C2cB0d53251FC7C438E91D899Ea6E00A4b5620B",
    functionName: "checkPermission",
    functionParams: ["0xD6435952286512A7E77ffB101F8938ace0f42989", ":userAddress", "0x0000000000000000000000000000000000000000000000000000000000100000"],
    functionAbi: {
      constant: true,
      inputs: [
        {
          name: "up",
          type: "address"
        },
        {
          name: "actor",
          type: "address"
        },
        {
          name: "permissions",
          type: "bytes32"
        }
      ],
      name: "checkPermission",
      outputs: [
        {
          name: "",
          type: "bool"
        }
      ],
      payable: false,
      stateMutability: "view",
      type: "function",
    },
    chain: "luksoTestnet",
    returnValueTest: {
      key: "",
      comparator: "=",
      value: "true",
    },
  },
];

const constructAuthSig = (sig: string, hashString: string, address: string) => {
  return {
    sig,
    derivedVia: "web3.eth.personal.sign",
    address,
    signedMessage: hashString,
  };
}

async function getAuthSig() {
  const nonce = localStorage.getItem('encryption-nonce');
  const secret = Mnemonic.fromEntropy(nonce as string);
  const wallet = Wallet.fromPhrase(secret.phrase);

  const siweMessage = createSiweMessage(wallet.address);
  const sig = await wallet.signMessage(siweMessage);

  return constructAuthSig(sig, siweMessage, wallet.address);
}

async function encrypt(message: string) {
  await client.connect();
  const authSig = await getAuthSig();

  const { ciphertext, dataToEncryptHash } = await encryptString({
    evmContractConditions,
    authSig,
    chain: 'luksoTestnet',
    dataToEncrypt: message,
  }, client);

  return { ciphertext, hash: dataToEncryptHash };
}

async function decrypt(ciphertext: string, dataHash: string) {
  const authSig = await getAuthSig();

  const decryptedString = await decryptToString(
    {
      evmContractConditions,
      ciphertext,
      dataToEncryptHash: dataHash,
      authSig,
      chain: 'luksoTestnet',
    },
    client,
  );

  return decryptedString;
}

const LitNetworkContext = createContext({ client, encrypt, decrypt });

export function LitProvider({ children }: any) {
  return <LitNetworkContext.Provider value={{ client, encrypt, decrypt }}>
    {children}
  </LitNetworkContext.Provider>
}

export default LitNetworkContext;