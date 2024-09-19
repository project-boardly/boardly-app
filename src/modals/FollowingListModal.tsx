import { Fragment } from "react";
import { Transition, Dialog } from "@headlessui/react";
import NiceModal, { useModal } from "@ebay/nice-modal-react";
import { Loader } from "./AddToMuseboard";
import { useErc725 } from "../hooks/useErc725";
import { useQuery } from "@tanstack/react-query";
import type { ERC725JSONSchema } from "@erc725/erc725.js";
import ProfilesList from "../common/ProfilesList";
import useFollowSystem from "../hooks/useFollowSystem";

const schema: ERC725JSONSchema[] = [
  {
    name: "FollowingProfiles[]",
    key: "0xd62c218b4cee2c6cd2453415e67c5ffaa3220349ed84a836e45f1fc38c24f476",
    keyType: "Array",
    valueType: "address",
    valueContent: "Address",
  },
];

type FollowingListModalArgs = {
  address: string;
};

const FollowingListModal = NiceModal.create(() => {
  const modal = useModal();
  const { address } = modal.args as FollowingListModalArgs;
  const { getFollowingList } = useFollowSystem(import.meta.env.VITE_FOLLOW_SYSTEM_ADDR);
  const query = useQuery({
    queryKey: ["following-profiles", address],
    queryFn: () => {
      return getFollowingList(address);
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
                { query.isLoading ? <Loader/> : <ProfilesList profiles={query.data as string[]} /> }
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
});

export default FollowingListModal;
