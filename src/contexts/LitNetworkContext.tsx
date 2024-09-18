import { createContext } from "react";

import {
  BrowserProvider,
  Mnemonic,
  Wallet,
  keccak256,
  verifyMessage,
  zeroPadValue,
} from "ethers";

import {
  LitNodeClient,
  encryptString,
  decryptToString,
  uint8arrayToString,
  uint8arrayFromString,
} from "@lit-protocol/lit-node-client";

import { SiweMessage } from "siwe";

const client = new LitNodeClient({
  litNetwork: "cayenne",
});

export function getFollowerOnlyBoardConditions(owner: string) {
  const targetAddr = zeroPadValue(owner, 32);

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
    {
      operator: "or",
    },
    [
      {
        contractAddress: "0x1C2cB0d53251FC7C438E91D899Ea6E00A4b5620B",
        standardContractType: "SIWE",
        functionName: "checkPermission",
        functionParams: [
          ":litParam:upAddress",
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
      {
        operator: "and",
      },
      {
        contractAddress: "0xC79fb40EE0FCfdF0A4301d7CDA9A72F7921E4ECd",
        standardContractType: "SIWE",
        functionName: "isFollowingTarget",
        functionParams: [
          "0xc194f5Edde2616D4BDA8d56b3B0Fd1F091d7eFEb",
          targetAddr,
          ":litParam:upAddress",
        ],
        functionAbi: {
          constant: true,
          inputs: [
            {
              name: "target",
              type: "address",
            },
            {
              name: "data",
              type: "bytes32",
            },
            {
              name: "follower",
              type: "address",
            },
          ],
          name: "isFollowingTarget",
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
    ],
  ];
}

export function getPrivateBoardConditions(owner: string) {
  return [
    {
      contractAddress: "0x1C2cB0d53251FC7C438E91D899Ea6E00A4b5620B",
      standardContractType: "SIWE",
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

function createLitSiweMessage(address: string, upAddress: string) {
  const domain = window.location.host;
  const origin = window.location.origin;
  const encodedUpAddress = uint8arrayToString(
    uint8arrayFromString(upAddress, "utf8"),
    "base64url",
  );

  const message = new SiweMessage({
    domain,
    address,
    statement: "Login to museboard",
    uri: origin + "/",
    nonce: "lWnXtPjsqVSuDOkmS",
    version: "1",
    issuedAt: new Date(Date.parse("2023-11-26T10:13:51.151Z")).toISOString(),
    chainId: 42,
    resources: [`litParam:upAddress:${encodedUpAddress}`],
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
      verifyMessage(message, sign),
    );
  }

  const secret = Mnemonic.fromEntropy(nonce);
  const wallet = Wallet.fromPhrase(secret.phrase);

  return wallet;
}

async function getAuthSig(upAddress: string) {
  const wallet = await getEncryptionWallet();
  const siweMessage = createLitSiweMessage(wallet.address, upAddress);
  const sig = await wallet.signMessage(siweMessage);

  return constructAuthSig(sig, siweMessage, wallet.address);
}

async function encrypt(message: string, conditions: any[], upAddress: string) {
  await client.connect();
  const authSig = await getAuthSig(upAddress);

  const { ciphertext, dataToEncryptHash } = await encryptString(
    {
      evmContractConditions: conditions,
      authSig,
      chain: "luksoTestnet",
      dataToEncrypt: message,
    },
    client,
  );

  return { ciphertext, hash: dataToEncryptHash };
}

async function decrypt(
  ciphertext: string,
  dataHash: string,
  conditions: any[],
  upAddress: string,
) {
  await client.connect();
  const authSig = await getAuthSig(upAddress);

  const decryptedString = await decryptToString(
    {
      evmContractConditions: conditions,
      ciphertext,
      dataToEncryptHash: dataHash,
      authSig,
      chain: "luksoTestnet",
    },
    client,
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
