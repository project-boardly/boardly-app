import { createContext } from "react";

import {
  BrowserProvider,
  Mnemonic,
  Wallet,
  keccak256,
  verifyMessage,
} from "ethers";

import {
  LitNodeClient,
  encryptString,
  decryptToString,
  uint8arrayToString,
  uint8arrayFromString
} from "@lit-protocol/lit-node-client";

import { SiweMessage } from "siwe";

const client = new LitNodeClient({
  litNetwork: "cayenne",
});

export function getPrivateBoardConditions (owner: string) {
  return [
    {
      contractAddress: "0x1C2cB0d53251FC7C438E91D899Ea6E00A4b5620B",
      functionName: "checkPermission",
      functionParams: [
        owner,
        ":userAddress",
        "0x0000000000000000000000000000000000000000000000000000000000100000",
      ],
      functionAbi: {
        constant: true,
        inputs: [
          {
            name: "up",
            type: "address",
          },
          {
            name: "actor",
            type: "address",
          },
          {
            name: "permissions",
            type: "bytes32",
          },
        ],
        name: "checkPermission",
        outputs: [
          {
            name: "",
            type: "bool",
          },
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
}

const constructAuthSig = (sig: string, hashString: string, address: string) => {
  return {
    sig,
    derivedVia: "web3.eth.personal.sign",
    address,
    signedMessage: hashString,
  };
};

function createLitSiweMessage (address: string) {
  const domain = window.location.host;
  const origin = window.location.origin;
  const upAddress = uint8arrayToString(uint8arrayFromString(address, "utf8"), "base64url")

  const message = new SiweMessage({
    domain,
    address,
    statement: 'Login to museboard',
    uri: origin + '/',
    nonce: 'lWnXtPjsqVSuDOkmS',
    version: '1',
    issuedAt: new Date(Date.parse('2023-11-26T10:13:51.151Z')).toISOString(),
    chainId: 4201,
    resources: [
      `upAddress:${upAddress}`
    ]
  });

  return message.prepareMessage();
}

export async function getEncryptionWallet() {
  let nonce = localStorage.getItem("encryption-nonce");

  if (!nonce) {
    const provider = new BrowserProvider(window.lukso);
    const signer = await provider.getSigner();
    const message = "Generate encryption keys";

    const sign = await signer.signMessage(message);
    nonce = keccak256(sign);

    localStorage.setItem("encryption-nonce", nonce);
    localStorage.setItem(
      "encryption-nonce-creator",
      verifyMessage(message, sign)
    );
  }

  const secret = Mnemonic.fromEntropy(nonce);
  const wallet = Wallet.fromPhrase(secret.phrase);

  return wallet;
}

async function getAuthSig() {
  const wallet = await getEncryptionWallet();
  const siweMessage = createLitSiweMessage(wallet.address);
  const sig = await wallet.signMessage(siweMessage);

  return constructAuthSig(sig, siweMessage, wallet.address);
}

async function encrypt(message: string, conditions: any[]) {
  await client.connect();
  const authSig = await getAuthSig();

  const { ciphertext, dataToEncryptHash } = await encryptString(
    {
      evmContractConditions: conditions,
      authSig,
      chain: "luksoTestnet",
      dataToEncrypt: message,
    },
    client
  );

  return { ciphertext, hash: dataToEncryptHash };
}

async function decrypt(ciphertext: string, dataHash: string, conditions: any[]) {
  await client.connect();
  const authSig = await getAuthSig();

  const decryptedString = await decryptToString(
    {
      evmContractConditions: conditions,
      ciphertext,
      dataToEncryptHash: dataHash,
      authSig,
      chain: "luksoTestnet",
    },
    client
  );

  return decryptedString;
}

const LitNetworkContext = createContext({ client, encrypt, decrypt });

export function LitProvider({ children }: any) {
  return (
    <LitNetworkContext.Provider value={{ client, encrypt, decrypt }}>
      {children}
    </LitNetworkContext.Provider>
  );
}

export default LitNetworkContext;
