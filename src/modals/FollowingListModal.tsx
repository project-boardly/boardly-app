import { Fragment, useEffect, useState } from "react";
import { Transition, Dialog, Switch } from "@headlessui/react";
import NiceModal, { useModal } from "@ebay/nice-modal-react";
import { Loader } from "./AddToMuseboard";
import { useErc725 } from "../hooks/useErc725";
import { useQuery } from "@tanstack/react-query";
import type { ERC725JSONSchema } from "@erc725/erc725.js";
import { useProfileQuery } from "../queries/profiles";
import { create } from "blockies-ts";
import safeGet from "lodash/get";
import { Address } from "../common/components";

function ipfsUrl(url: string) {
  return url.replace("ipfs://", "https://2eff.lukso.dev/ipfs/");
}

const schema: ERC725JSONSchema[] = [
  {
    name: "FollowingProfiles[]",
    key: "0xd62c218b4cee2c6cd2453415e67c5ffaa3220349ed84a836e45f1fc38c24f476",
    keyType: "Array",
    valueType: "address",
    valueContent: "Address",
  },
];

function InlineProfile({ address }: { address: string }) {
  const { query } = useProfileQuery(address);

  return (
    <div className="flex space-x-4 group">
      <div className="py-2">
        <img
          className="w-12 rounded-full"
          src={ipfsUrl(
            safeGet(
              query,
              "data.profileImage.0.url",
              create({ seed: address }).toDataURL()
            )
          )}
        />
      </div>
      <div className="grow py-4">
        <p className="text-lg font-semibold align-middle h-max">{query.isLoading ? address : query.data.name}</p>
      </div>
      <Address address={address} className="text-xs py-4"/>
    </div>
  );
}

function ProfilesList({ profiles }: { profiles: string[] }) {
  return (
    <ul>
      {profiles.map((profile) => (
        <li key={profile}>
          <InlineProfile address={profile} />
        </li>
      ))}
    </ul>
  );
}

type FollowingListModalArgs = {
  address: string;
};

const FollowingListModal = NiceModal.create(() => {
  const modal = useModal();
  const { address } = modal.args as FollowingListModalArgs;
  const erc725 = useErc725(address, schema);
  const query = useQuery({
    queryKey: ["following-profiles", address],
    queryFn: () => {
      return erc725.fetchData("FollowingProfiles[]").then((data) => data.value);
    },
  });

  return (
    <Transition appear show={modal.visible} as={Fragment}>
      <Dialog as="div" className="relative z-8" onClose={modal.remove}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-16 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white px-6 py-8  text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h2"
                  className="text-2xl pl-4 font-medium leading-6 text-gray-900 text-center"
                >
                  Following
                </Dialog.Title>
                <Dialog.Description
                  as="p"
                  className="text-center px-8 mt-4 text-gray-400"
                ></Dialog.Description>
                { query.isLoading ? <Loader/> :<ProfilesList profiles={query.data as string[]} /> }
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
});

export default FollowingListModal;
