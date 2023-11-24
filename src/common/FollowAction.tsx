import { useEffect, useState } from "react";

import { getAddress, zeroPadValue } from "ethers";
import { useTransactionSender } from "../hooks/transactions";

// import FollowModule from "museboard-contracts/artifacts/contracts/FollowModule.sol/FollowModule.json";

import KeyManagerSchema from "@erc725/erc725.js/schemas/LSP6KeyManager.json";
import LSP17ExtensionSchema from "@erc725/erc725.js/schemas/LSP17ContractExtension.json";
import { useErc725 } from "../hooks/useErc725";
import type { ERC725JSONSchema } from "@erc725/erc725.js";
import useUniversalProfile from "../hooks/useUniversalProfile";

import { encodeValueType } from "@erc725/erc725.js/build/main/src/lib/encoder";

const _FOLLOW_SYSTEM_ADDR = getAddress(
  "0xc194f5Edde2616D4BDA8d56b3B0Fd1F091d7eFEb"
);

type ReadyToFollow = {
  canFollow: boolean;
  permissions: boolean;
  startFollowingExtension: boolean;
  stopFollowingExtension: boolean;
  allowedDataKeys: boolean;
};

const _START_FOLLOWING_SELECTOR =
  "0xcee78b4094da8601109600004d28340300000000000000000000000000000000";
const _STOP_FOLLOWING_SELECTOR =
  "0xcee78b4094da8601109600001aee210800000000000000000000000000000000";

const _REQUIRED_DATA_KEYS = [
  "0x8f3e89ce6b63dd5d2e740000",
  "0xd62c218b4cee2c6cd2453415e67c5ffa",
];

export default function FollowAction({
  address,
  target,
}: {
  address: string;
  target: string;
}) {
  const { contract } = useUniversalProfile(address);
  const erc725 = useErc725(
    address,
    KeyManagerSchema.concat(LSP17ExtensionSchema) as ERC725JSONSchema[]
  );
  const [loading, setLoading] = useState(true);
  const { sendTransaction, getSigner } = useTransactionSender();
  const [readyToFollow, setRTF] = useState<ReadyToFollow>();
  const [isFollowing] = useState(false);

  useEffect(() => {
    isReadyToFollow().then((rtfStatus: ReadyToFollow) => {
      setRTF(rtfStatus);
      setLoading(false);
    });
  }, []);

  async function isReadyToFollow() {
    const [allowedKeys, permissions] = await erc725.fetchData([
      {
        keyName: "AddressPermissions:AllowedERC725YDataKeys:<address>",
        dynamicKeyParts: "0xc194f5Edde2616D4BDA8d56b3B0Fd1F091d7eFEb",
      },
      {
        keyName: "AddressPermissions:Permissions:<address>",
        dynamicKeyParts: "0xc194f5Edde2616D4BDA8d56b3B0Fd1F091d7eFEb",
      },
    ]);

    const [startFollowingExtension, stopFollowingExtension] =
      await contract.getDataBatch([
        _START_FOLLOWING_SELECTOR,
        _STOP_FOLLOWING_SELECTOR,
      ]);

    const status: ReadyToFollow = {
      canFollow: false,
      permissions: false,
      startFollowingExtension: false,
      stopFollowingExtension: false,
      allowedDataKeys: false,
    };

    if (permissions.value) {
      status.permissions =
        erc725.checkPermissions("SETDATA", permissions.value as string) ||
        erc725.checkPermissions("SUPER_SETDATA", permissions.value as string);
    }

    status.startFollowingExtension =
      startFollowingExtension !== "0x" &&
      getAddress(startFollowingExtension) === _FOLLOW_SYSTEM_ADDR;

    status.stopFollowingExtension =
      stopFollowingExtension !== "0x" &&
      getAddress(stopFollowingExtension) === _FOLLOW_SYSTEM_ADDR;

    if (allowedKeys.value) {
      status.allowedDataKeys = _REQUIRED_DATA_KEYS.reduce((acc, key) => {
        if (!acc) {
          return acc;
        }

        acc = acc && (allowedKeys.value as string[]).indexOf(key) >= 0;

        return acc;
      }, true);
    }

    status.canFollow =
      status.permissions &&
      status.startFollowingExtension &&
      status.stopFollowingExtension &&
      status.allowedDataKeys;

    return status;
  }

  async function setupFollowModule() {
    const keys: string[] = [],
      values: string[] = [];

    if (!readyToFollow) {
      console.log("Loading");

      return;
    }

    if (!readyToFollow.startFollowingExtension) {
      keys.push(_START_FOLLOWING_SELECTOR);
      values.push("0xc194f5Edde2616D4BDA8d56b3B0Fd1F091d7eFEb");
    }

    if (!readyToFollow.stopFollowingExtension) {
      keys.push(_STOP_FOLLOWING_SELECTOR);
      values.push("0xc194f5Edde2616D4BDA8d56b3B0Fd1F091d7eFEb");
    }

    keys.push(
      erc725.encodeKeyName(
        "AddressPermissions:Permissions:<address>",
        "0xc194f5Edde2616D4BDA8d56b3B0Fd1F091d7eFEb"
      )
    );
    values.push(erc725.encodePermissions({ SETDATA: true }));

    keys.push(
      erc725.encodeKeyName(
        "AddressPermissions:AllowedERC725YDataKeys:<address>",
        "0xc194f5Edde2616D4BDA8d56b3B0Fd1F091d7eFEb"
      )
    );
    values.push(
      encodeValueType("bytes[CompactBytesArray]", _REQUIRED_DATA_KEYS)
    );

    // sendTransaction(contract, 'setData', [keys[0], values[0]]);
    console.log(keys[0], values[0]);
    const signer = await getSigner();
    (contract.connect(signer) as any).setData(keys[0], values[0]);
  }

  async function followProfile() {
    const targetAddr = zeroPadValue(address, 32);

    // const upContract = new Contract(getAddress(user?.uid as string), UniversalProfile.abi, rpcProvider);
    // const key = keccak256(toUtf8Bytes('hello'));

    // console.log(erc725.checkPermissions(['SETDATA'], data[3]));
    // console.log(erc725.checkPermissions(['SUPER_SETDATA'], data[3]));

    // upContract.interface.encodeFunctionData('setData', [key, '0x']);
    // const owner = await upContract.owner();
    // const keyManager = new Contract(owner, KeyManager.abi, rpcProvider);

    // const calldata = getCalldata(targetAddr, 'follow');
    // const call = ethers.solidityPacked(['bytes','address','uint256'], [calldata, '0xc4cB530aDdd62FEb189c7832d29B03A1b9D2aCd1', 0n])
    // const call = ethers.solidityPacked(['bytes','address','uint256'], [calldata, user?.uid, 0n]);

    // const calldata = contract.interface.encodeFunctionData('setData', ['0xeee78b4094da8601109600004d28340300000000000000000000000000000002', '0x']);
    // sendTransaction(upContract, 'execute', [0, '0xc194f5Edde2616D4BDA8d56b3B0Fd1F091d7eFEb', 0, call]);
    // console.log(calldata);
    // sendTransaction(keyManager, 'execute', [calldata]);

    // executeTransactionRequest({
    //   to: '0xc194f5Edde2616D4BDA8d56b3B0Fd1F091d7eFEb', // getAddress(user?.uid as string),
    //   data: call
    // }).catch(console.log);

    // sendTransaction(upContract, 'setData', [key, '0x'])

    // const signer = await getSigner();

    // console.log(signer, key);
    // console.log(await signer.signMessage('hello world'));

    // (upContract.connect(signer) as any).setData(key, '0x');

    // (upContract.connect(signer) as any).setData(key, key);

    // (followModuleContract.connect(signer) as any).startFollowing(targetAddr);
  }

  if (loading) {
    return <></>;
  }

  if (!readyToFollow?.canFollow) {
    return (
      <div className="p-2 rounded-xl text-center">
        <button
          onClick={() => setupFollowModule()}
          className="w-full bg-gray-50 border-2 font-bold py-2 rounded-xl"
        >
          Setup Follow Module
        </button>
        <small className="mt-2 text-gray-400">
          Setup the follow module to start following people
        </small>
      </div>
    );
  }

  if (isFollowing) {
    <button
      onClick={console.log}
      className="w-full bg-neutral-600 text-white font-bold py-2 rounded-xl shadow-lg"
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-6 h-6 inline mr-2"
      >
        <g clipPath="url(#clip0_690_7820)">
          <path
            d="M13.5 8C13.5 5.79 11.71 4 9.5 4C7.29 4 5.5 5.79 5.5 8C5.5 10.21 7.29 12 9.5 12C11.71 12 13.5 10.21 13.5 8ZM11.5 8C11.5 9.1 10.6 10 9.5 10C8.4 10 7.5 9.1 7.5 8C7.5 6.9 8.4 6 9.5 6C10.6 6 11.5 6.9 11.5 8Z"
            fill="white"
          />
          <path
            d="M1.5 18V20H17.5V18C17.5 15.34 12.17 14 9.5 14C6.83 14 1.5 15.34 1.5 18ZM3.5 18C3.7 17.29 6.8 16 9.5 16C12.19 16 15.27 17.28 15.5 18H3.5Z"
            fill="white"
          />
          <path d="M22.5 10H16.5V12H22.5V10Z" fill="white" />
        </g>
        <defs>
          <clipPath id="clip0_690_7820">
            <rect width="24" height="24" fill="white" />
          </clipPath>
        </defs>
      </svg>
      Unfollow
    </button>;
  }

  return (
    <button
      onClick={() => followProfile()}
      className="w-full bg-black text-white font-bold py-2 rounded-xl shadow-lg"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-6 h-6 inline mr-2"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z"
        />
      </svg>
      Follow
    </button>
  );
}
