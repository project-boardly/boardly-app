import { createContext, useContext } from "react";

import {
  Mnemonic,
  Wallet,
  getAddress,
  isAddress,
  keccak256,
  verifyMessage
} from "ethers";

import {
  LitNodeClient,
  uint8arrayToString,
  uint8arrayFromString,
} from "@lit-protocol/lit-node-client";

import { type AuthSig } from '@lit-protocol/types';

import { encryptString, decryptToString } from '@lit-protocol/encryption';

import { SiweMessage } from "siwe";

import { LIT_NETWORK } from "@lit-protocol/constants";
import { LuksoContext } from "../providers/LuksoProvider";
import ERC725 from "@erc725/erc725.js";

import UniversalProfileContract from "@lukso/universalprofile-contracts/artifacts/UniversalProfile.json";
import { encodeFunctionData } from "viem";
import { luksoTestnet } from "viem/chains";

const client = new LitNodeClient({
  litNetwork: LIT_NETWORK.DatilDev
});

export function getFollowerOnlyBoardConditions(owner: string) {
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
        // payable: false,
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
          // payable: false,
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
        contractAddress: "0xf01103E5a9909Fc0DBe8166dA7085e0285daDDcA",
        functionName: "isFollowing",
        functionParams: [
          ":litParam:upAddress",
          owner
        ],
        functionAbi: {
          inputs: [
            {
              internalType: "address",
              name: "follower",
              type: "address"
            },
            {
              internalType: "address",
              name: "addr",
              type: "address"
            }
          ],
          name: "isFollowing",
          outputs: [
            {
              internalType: "bool",
              name: "",
              type: "bool"
            }
          ],
          stateMutability: "view",
          type: "function"
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
      // standardContractType: "SIWE",
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
        // payable: false,
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
    statement: "Login to boardly",
    uri: origin + "/",
    nonce: "lWnXtPjsqVSuDOkmS",
    version: "1",
    issuedAt: new Date(Date.now()).toISOString(),
    expirationTime: new Date(Date.now() + 60 * 10).toISOString(),
    chainId: 4201,
    resources: [`litParam:upAddress:${encodedUpAddress}`],
  });

  return message.prepareMessage();
}

export function useEncryptionWallet() {
  const luksoContext = useContext(LuksoContext);

  return async () => {
    if (!luksoContext || !luksoContext.clients.public || !luksoContext.clients.wallet) { return; }

    let nonce = localStorage.getItem("encryption-nonce");

    const walletAddresses = await luksoContext.clients.wallet.getAddresses(),
      nonceAccount = walletAddresses[0],
      storedNonceAccount = localStorage.getItem('encryption-nonce-account');

    if (!nonce || !isAddress(storedNonceAccount) || getAddress(storedNonceAccount) !== getAddress(nonceAccount)) {
      const message = "Generate encryption keys";

      let sign;

      if (!(window as any).encKeySignReq) {
        (window as any).encKeySignReq = luksoContext.clients.wallet.signMessage({
          message: message,
          account: walletAddresses[0]
        });
      }

      sign = await (window as any).encKeySignReq;
      nonce = keccak256(sign);

      localStorage.setItem("encryption-nonce", nonce);
      localStorage.setItem(
        "encryption-nonce-creator",
        verifyMessage(message, sign),
      );
      localStorage.setItem(
        'encryption-nonce-account',
        getAddress(nonceAccount)
      );
    }

    const secret = Mnemonic.fromEntropy(nonce);
    const wallet = Wallet.fromPhrase(secret.phrase);

    return wallet;
  };
}

async function encryptMessage(message: string, conditions: any[]) {
  await client.connect();

  const { ciphertext, dataToEncryptHash } = await encryptString(
    {
      evmContractConditions: conditions,
      dataToEncrypt: message,
    },
    client,
  );

  return { ciphertext, hash: dataToEncryptHash };
}

async function decryptString(
  ciphertext: string,
  dataHash: string,
  conditions: any[],
  authSign: AuthSig
) {
  await client.connect();

  const decryptedString = await decryptToString(
    {
      evmContractConditions: conditions,
      ciphertext,
      dataToEncryptHash: dataHash,
      authSig: authSign,
      chain: 'luksoTestnet'
    },
    client,
  );

  return decryptedString;
}

type LitNetworkContextType = {
  client: LitNodeClient,
  encrypt: (message: string, conditions: any[]) => any,
  decrypt: (ciphertext: string, hash: string, conditions: any[]) => any
}

const LitNetworkContext = createContext<LitNetworkContextType | undefined>(undefined);

export function LitProvider({ children }: any) {
  const getWallet = useEncryptionWallet();
  const luksoContext = useContext(LuksoContext);

  async function getAuthSig(upAddress: string) {
    const wallet = await getWallet();

    if (!wallet) { return; }

    const siweMessage = createLitSiweMessage(wallet.address, upAddress);
    const sig = await wallet.signMessage(siweMessage);

    return constructAuthSig(sig, siweMessage, wallet.address);
  }

  async function validatePermissions() {
    if (!luksoContext || !luksoContext.provider || !luksoContext.clients.public || !luksoContext.clients.wallet) {
      console.log({ luksoContext, provider: luksoContext?.provider, public: luksoContext?.clients.public, walet: luksoContext?.clients.wallet });

      return;
    }

    const wallet = await getWallet();

    if (!wallet) {
      console.log('Encryption Wallet Not Found');

      return;
    }

    const permissionKeyName = ERC725.encodeKeyName("AddressPermissions:Permissions:<address>", [
      wallet.address
    ]);

    let permission = await luksoContext.clients.public.readContract({
      abi: UniversalProfileContract.abi,
      address: luksoContext.account as `0x${string}`,
      functionName: 'getData',
      args: [permissionKeyName]
    })

    const permissions = permission === '0x' ? {} as Permissions : ERC725.decodePermissions(permission as string)
    const requiredPermissions = ERC725.encodePermissions({ DECRYPT: true });

    if (!(permissions as any).DECRYPT) {
      const calldata = encodeFunctionData({
        abi: UniversalProfileContract.abi,
        functionName: 'setData',
        args: [permissionKeyName, requiredPermissions]
      })

      await luksoContext.clients.wallet.writeContract({
        address: luksoContext.account as `0x${string}`,
        chain: luksoTestnet,
        abi: UniversalProfileContract.abi,
        account: luksoContext.account as `0x${string}`,
        functionName: 'execute',
        args: [0, luksoContext.account as `0x${string}`, 0, calldata]
      });
    } else {
      console.log('permission already present');
    }
  }

  async function encrypt(message: string, conditions: any[]) {
    await getWallet();

    await validatePermissions();
    return encryptMessage(message, conditions)
  }

  async function decrypt(ciphertext: string, hash: string, conditions: any[]) {
    const authSign = await getAuthSig(luksoContext?.account as string);

    await validatePermissions();

    if (!authSign) { return; }

    return decryptString(ciphertext, hash, conditions, authSign);
  }

  return (
    <LitNetworkContext.Provider value={{ client, encrypt, decrypt }}>
      {children}
    </LitNetworkContext.Provider>
  );
}

export default LitNetworkContext;
