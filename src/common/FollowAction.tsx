import { useEffect, useState } from "react";

import { Contract, getAddress, zeroPadValue } from "ethers";
import { useTransactionSender } from "../hooks/transactions";

import FollowModule from "boardly-contracts/artifacts/contracts/FollowModule.sol/FollowModule.json";

import KeyManagerSchema from "@erc725/erc725.js/schemas/LSP6KeyManager.json";
import LSP17ExtensionSchema from "@erc725/erc725.js/schemas/LSP17ContractExtension.json";
import { useErc725 } from "../hooks/useErc725";
import type { ERC725JSONSchema } from "@erc725/erc725.js";
import useUniversalProfile from "../hooks/useUniversalProfile";
import { encodeValueType } from "@erc725/erc725.js/build/main/src/lib/encoder";
import useFollowModule from "../hooks/useFollowModule";
import { useQuery } from "@tanstack/react-query";
import { getEncryptionWallet } from "../contexts/LitNetworkContext";

const _FOLLOW_SYSTEM_ADDR = getAddress(import.meta.env.VITE_UP_FOLLOW_SYSTEM);

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
  const targetAddr = zeroPadValue(target, 32);
  const { contract } = useUniversalProfile(address);
  const { isFollowing } = useFollowModule(import.meta.env.VITE_FOLLOW_MODULE);
  const erc725 = useErc725(
    address,
    KeyManagerSchema.concat(LSP17ExtensionSchema) as ERC725JSONSchema[],
  );
  const [loading, setLoading] = useState(true);
  const { sendTransaction } = useTransactionSender();
  const [readyToFollow, setRTF] = useState<ReadyToFollow>();
  const query = useQuery({
    queryKey: ["is-following", target],
    queryFn: () => isFollowing(targetAddr, address, _FOLLOW_SYSTEM_ADDR),
  });

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
        dynamicKeyParts: _FOLLOW_SYSTEM_ADDR,
      },
      {
        keyName: "AddressPermissions:Permissions:<address>",
        dynamicKeyParts: _FOLLOW_SYSTEM_ADDR,
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
        erc725.checkPermissions(
          ["SETDATA", "REENTRANCY"],
          permissions.value as string,
        ) ||
        erc725.checkPermissions(
          ["SUPER_SETDATA", "REENTRANCY"],
          permissions.value as string,
        );
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

    const controller = localStorage.getItem("up-controller");

    if (controller) {
      const controllerPerms = await erc725.fetchData({
        keyName: "AddressPermissions:Permissions:<address>",
        dynamicKeyParts: controller as string,
      });

      const perms = erc725.decodePermissions(controllerPerms.value as string);

      if (!perms.ADDEXTENSIONS) {
        keys.push(controllerPerms.key);
        values.push(
          erc725.encodePermissions(
            Object.assign(perms, { ADDEXTENSIONS: true }),
          ),
        );
      }
    }

    const encWallet = await getEncryptionWallet();

    if (encWallet.address) {
      const controllerPerms = await erc725.fetchData({
        keyName: "AddressPermissions:Permissions:<address>",
        dynamicKeyParts: encWallet.address,
      });

      if (
        !erc725.checkPermissions("DECRYPT", controllerPerms.value as string)
      ) {
        keys.push(controllerPerms.key);
        values.push(erc725.encodePermissions({ DECRYPT: true }));
      }
    }

    if (!readyToFollow.startFollowingExtension) {
      keys.push(_START_FOLLOWING_SELECTOR);
      values.push(_FOLLOW_SYSTEM_ADDR);
    }

    if (!readyToFollow.stopFollowingExtension) {
      keys.push(_STOP_FOLLOWING_SELECTOR);
      values.push(_FOLLOW_SYSTEM_ADDR);
    }

    keys.push(
      erc725.encodeKeyName(
        "AddressPermissions:Permissions:<address>",
        _FOLLOW_SYSTEM_ADDR,
      ),
    );
    values.push(erc725.encodePermissions({ SETDATA: true, REENTRANCY: true }));

    keys.push(
      erc725.encodeKeyName(
        "AddressPermissions:AllowedERC725YDataKeys:<address>",
        _FOLLOW_SYSTEM_ADDR,
      ),
    );
    values.push(
      encodeValueType("bytes[CompactBytesArray]", _REQUIRED_DATA_KEYS),
    );

    sendTransaction(contract, "setDataBatch", [keys, values]);
  }

  async function followProfile() {
    const targetAddr = zeroPadValue(target, 32);

    const followModuleContract = new Contract(address, FollowModule.abi);

    const data = followModuleContract.interface.encodeFunctionData(
      "startFollowing",
      [targetAddr],
    );

    sendTransaction(contract, "execute", [0, address, 0, data]).then(() =>
      query.refetch(),
    );
  }

  async function unfollowProfile() {
    const targetAddr = zeroPadValue(target, 32);

    const followModuleContract = new Contract(address, FollowModule.abi);

    const data = followModuleContract.interface.encodeFunctionData(
      "stopFollowing",
      [targetAddr],
    );

    sendTransaction(contract, "execute", [0, address, 0, data]).then(() =>
      query.refetch(),
    );
  }

  if (loading || query.isLoading) {
    return <></>;
  }

  if (!readyToFollow?.canFollow) {
    return (
      <div className="p-2 rounded-xl text-center">
        <button
          onClick={() => setupFollowModule()}
          className="w-full backdrop-blur-lg bg-white/30 font-bold py-2 rounded-xl"
        >
          Setup Follow Module
        </button>
        <small className="mt-2 text-gray-400">
          Setup the follow module to start following people
        </small>
      </div>
    );
  }

  if (query.data) {
    return (
      <button
        onClick={() => unfollowProfile()}
        className="w-full backdrop-blur-md bg-white/10 hover:bg-white/30 text-white font-bold py-2 rounded-xl shadow-lg"
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
      </button>
    );
  }

  return (
    <button
      onClick={() => followProfile()}
      className="w-full backdrop-blur-md  bg-white/20 hover:bg-white/50 text-white font-bold py-2 rounded-xl shadow-lg"
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
