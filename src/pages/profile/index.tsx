import { Fragment, useEffect, useState } from "react";

import safeGet from "lodash/get";

import * as blockies from 'blockies-ts';

import { Listbox, Transition } from "@headlessui/react";

import { Link, useParams } from "react-router-dom";
import useUniversalProfile from "../../hooks/useUniversalProfile";
import { PlusCircleIcon } from "@heroicons/react/24/outline";
// import { Loader } from "../../modals/AddToMuseboard";
import { useQuery } from "@tanstack/react-query";
import { create } from "blockies-ts";
import { Address } from "../../common/components";
import { TBoard, useBoardsQuery } from "../../queries/boards";
import { getAuth } from "firebase/auth";
import useMuseboard from "../../hooks/useMuseboard";
import { useModal } from "@ebay/nice-modal-react";

function ipfsUrl(url: string) {
  return url.replace("ipfs://", "https://2eff.lukso.dev/ipfs/");
}

function ProfileCard({ address }: { address: string }) {
  const profile = useUniversalProfile(address);
  const query = useQuery({
    queryKey: ["profile", address],
    queryFn: async () => {
      const isValid = await profile.isUniversalProfile();

      if (!isValid) {
        console.log(`${address} is not a universal profile`);

        return null;
      }

      return profile.getProfileData();
    },
  });

  if (query.isLoading) {
    return <p>Loading</p>;
  }

  if (!query.data) {
    return <p>This address is not a universal profile</p>;
  }

  return (
    <div className="max-w-sm mx-auto mt-10">
      <div className="flex flex-row">
        <div className="flex-none w-50">
          <img
            className="w-20 rounded-full"
            src={ipfsUrl(
              safeGet(
                query,
                "data.profileImage.0.url",
                create({ seed: address }).toDataURL()
              )
            )}
          />
        </div>
        <div className="grow">
          <div className="px-4">
            <h2 className="text-3xl font-extrabold">{query.data.name}</h2>
            <Address address={address} />
            <div className="flex row">
              <div>
                <span className="text-gray-400">Following</span>{" "}
                <span className="font-bold">1</span>
              </div>
              <div className="mx-4">
                <span className="text-gray-400">Followers</span>{" "}
                <span className="font-bold">1</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="py-4">
        <p className="text-gray-400">{query.data.description}</p>
      </div>
      <button
        onClick={() => window.alert("Follow module is not live yet")}
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
      {/* <button
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
        </button> */}
    </div>
  );
}

function Museboard({ board }: { board: TBoard }) {
  const [image] = useState(board.logo ? ipfsUrl(board.logo) : blockies.create({
    seed: `${board?.owner}:${board.id}`,
    scale: 40,
    bgcolor: '#f1f1f1',
    // spotcolor: 'rgba(0,0,0,0.6)',
    // color: 'rgba(0,0,0, 0.4)'
  }).toDataURL());

  return (
    <Link
      to={`/board/${board.id}`}
      className="group aspect-square"
    >
      <img
        src={image}
        className="rounded-3xl bg-gradient-to-tr to-purple-500 from-cyan-500 hover:p-1 transition-all duration-500 hover:shadow-xl w-full aspect-square object-cover"
      />
      <p className="text-center font-semibold mt-4">{board.name}</p>
    </Link>
  );
}

function MuseboardList({ address }: { address: string }) {
  const { query } = useBoardsQuery(address);
  const { getBoards } = useMuseboard();
  const onchainBoardsQuery = useQuery({ queryKey: ['onchain:boards', address], queryFn: () => getBoards(address) });

  if (query.isLoading) {
    return <p>Loading</p>
  }

  if (onchainBoardsQuery.isLoading) {
    return <p>Loading onchain boards</p>
  }

  return (
    <>
      {onchainBoardsQuery.data && onchainBoardsQuery.data.map((board: TBoard) => (
        <Museboard key={board.id} board={board} />
      ))}
    </>
  );
}

const actions = [{ name: "NFTs" }, { name: "museboards" }];

export default function ProfilePage() {
  const user = getAuth().currentUser;
  const newMuseboardModal = useModal('create-museboard')
  const { address } = useParams();
  const [selected, setSelected] = useState(actions[1]);

  function openModal() {
    newMuseboardModal.show();
  }

  return (
    <>
      <div className="min-h-full">
        <main>
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <ProfileCard address={address as string} />
            <Listbox value={selected} onChange={setSelected}>
              <div className="relative mt-4">
                <Listbox.Button className="relative cursor-default rounded-lg bg-white py-2 pr-10 text-left focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
                  <h3 className="text-2xl font-bold truncate">
                    {selected.name}
                  </h3>
                  <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                    {/* <SelectorIcon
                      className="h-5 w-5 text-gray-400"
                      aria-hidden="true"
                    /> */}
                  </span>
                </Listbox.Button>
                <Transition
                  as={Fragment}
                  leave="transition ease-in duration-100"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <Listbox.Options className="absolute block w-40 mt-1 max-h-60 overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                    {actions.map((action, actionIdx) => (
                      <Listbox.Option
                        key={actionIdx}
                        className={`relative cursor-default select-none py-2 px-4 text-gray-900`}
                        value={action}
                      >
                        {({ selected }) => (
                          <span
                            className={`block truncate ${
                              selected ? "font-medium" : "font-normal"
                            }`}
                          >
                            {action.name}
                          </span>
                        )}
                      </Listbox.Option>
                    ))}
                  </Listbox.Options>
                </Transition>
              </div>
            </Listbox>
            <div className="mt-2">
              {/* {selected.name === "NFTs" && (
                <section id="owned-nfts">
                  <h4 className="text-gray-500 py-4">OWNED</h4>
                  <div className="columns-4 gap-4">
                    {profile.nfts.map((token) => (
                      <NFTCard
                        key={`${token.contract}:${token.tokenId}`}
                        address={token.contract}
                        tokenId={token.tokenId}
                        classes="mb-4"
                      />
                    ))}
                  </div>
                </section>
              )} */}
              {selected.name === "museboards" && (
                <section id="owned-nfts">
                  <h4 className="text-gray-500 py-4">OWNED</h4>
                  <div className="grid lg:grid-cols-5 gap-4">
                    {user?.uid === address && (
                      <div className="group transition-all duration-700">
                        <button
                          onClick={() => openModal()}
                          className="w-full aspect-square bg-gray-200 hover:bg-gradient-to-tr to-purple-500 from-cyan-500 rounded-3xl"
                        >
                          <PlusCircleIcon className="h-10 w-10 mx-auto group-hover:text-white" />
                        </button>
                        <p className="text-center font-semibold mt-4">
                          Create New
                        </p>
                      </div>
                    )}
                    <MuseboardList address={address as string} />
                  </div>
                  <h4 className="text-gray-500 py-4">FOLLOWING</h4>
                  <div className="grid lg:grid-cols-5 gap-4">
                    {/* <MuseboardList boards={profile.boards.following} /> */}
                  </div>
                </section>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
