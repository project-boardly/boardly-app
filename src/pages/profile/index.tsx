import { Fragment, useEffect, useState } from "react";

import safeGet from "lodash/get";

import { Listbox, Transition } from "@headlessui/react";
import { PlusCircleIcon } from "@heroicons/react/24/outline";

import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { create } from "blockies-ts";
import { getAuth } from "firebase/auth";
import { useModal } from "@ebay/nice-modal-react";
import { getAddress, zeroPadValue } from "ethers";

import FollowAction from "../../common/FollowAction";
import { Address } from "../../common/components";

import { TBoard, useBoardsQuery } from "../../queries/boards";
import { useProfileQuery } from "../../queries/profiles";

import useMuseboard from "../../hooks/useMuseboard";
import useFollowModule from "../../hooks/useFollowModule";
import useUser from "../../hooks/useUser";
import useUniversalProfile from "../../hooks/useUniversalProfile";

function ipfsUrl(url: string) {
  return url.replace("ipfs://", "https://2eff.lukso.dev/ipfs/");
}

const _FOLLOWING_ARRAY_KEY =
  "0xd62c218b4cee2c6cd2453415e67c5ffaa3220349ed84a836e45f1fc38c24f476";

function FollowInfo({ address }: { address: string }) {
  const { getFollowersCount } = useFollowModule(
    import.meta.env.VITE_FOLLOW_MODULE
  );
  const { contract } = useUniversalProfile(address);
  const [stats, setStats] = useState({
    following: 0,
    followers: 0,
  });
  const followingModal = useModal("list-following");
  const followersModal = useModal("list-followers");

  useEffect(() => {
    const identifier = zeroPadValue(address, 32);

    Promise.all([
      getFollowersCount(identifier, import.meta.env.VITE_UP_FOLLOW_SYSTEM),
      contract.getData(_FOLLOWING_ARRAY_KEY),
    ]).then(([followers, following]) => {
      setStats({
        followers,
        following: following === "0x" ? 0 : Number(BigInt(following)),
      });
    });
  }, []);

  return (
    <div className="flex row">
      <a onClick={() => followingModal.show({ address })}>
        <span className="text-gray-400">Following</span>{" "}
        <span className="font-bold">{stats.following}</span>
      </a>
      <a
        className="mx-4"
        onClick={() =>
          followersModal.show({
            identifier: zeroPadValue(address, 32),
            target: import.meta.env.VITE_UP_FOLLOW_SYSTEM,
          })
        }
      >
        <span className="text-gray-400">Followers</span>{" "}
        <span className="font-bold">{stats.followers}</span>
      </a>
    </div>
  );
}

function ProfileCard({ address }: { address: string }) {
  const { user, loading: authUserLoading } = useUser();
  const { query } = useProfileQuery(address);

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
            <Address address={address} className="" />
            <FollowInfo address={address} />
          </div>
        </div>
      </div>
      <div className="py-4">
        <p className="text-gray-400">{query.data.description}</p>
      </div>
      {!authUserLoading && user && user.uid !== address && (
        <FollowAction address={getAddress(user.uid)} target={address} />
      )}
    </div>
  );
}

function Museboard({ board }: { board: TBoard }) {
  const [image] = useState(
    board.logo
      ? ipfsUrl(board.logo)
      : create({
          seed: `${board?.owner}:${board.id}`,
          scale: 40,
          bgcolor: "#f1f1f1",
          // spotcolor: 'rgba(0,0,0,0.6)',
          // color: 'rgba(0,0,0, 0.4)'
        }).toDataURL()
  );

  return (
    <Link to={`/board/${board.id}`} className="group aspect-square">
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
  const onchainBoardsQuery = useQuery({
    queryKey: ["onchain:boards", address],
    queryFn: () => getBoards(address),
  });

  if (query.isLoading) {
    return <p>Loading</p>;
  }

  if (onchainBoardsQuery.isLoading) {
    return <p>Loading onchain boards</p>;
  }

  return (
    <>
      {onchainBoardsQuery.data &&
        onchainBoardsQuery.data.map((board: TBoard) => (
          <Museboard key={board.id} board={board} />
        ))}
    </>
  );
}

function MuseboardContainer({ boardId }: { boardId: string }) {
  const { getMetadata } = useMuseboard();
  const query = useQuery({
    queryKey: ["board:metadata", boardId],
    queryFn: () => getMetadata(boardId as string),
  });
  const [image, setImage] = useState<string | null>(null);

  useEffect(() => {
    if (!query.data) {
      return;
    }

    setImage(
      create({
        seed: `${query.data.owner}:${query.data.id}`,
        scale: 40,
        bgcolor: "#f1f1f1",
      }).toDataURL()
    );
  }, [query.data]);

  if (query.isLoading) {
    return <p>Loading</p>;
  }

  return <Museboard board={Object.assign({ logo: image }, query.data)} />;
}

function FollowingMuseboardList({ address }: { address: string }) {
  const { getFollowingList } = useFollowModule(
    import.meta.env.VITE_FOLLOW_MODULE
  );
  const query = useQuery({
    queryKey: ["profile", address, "following-boards"],
    queryFn: () =>
      getFollowingList(address, import.meta.env.VITE_MUSEBOARD_CONTRACT),
  });

  if (query.isLoading) {
    return <p>Loading</p>;
  }

  return (
    <>
      {query.data &&
        query.data.map((boardId: string) => (
          <MuseboardContainer key={boardId} boardId={boardId} />
        ))}
    </>
  );
}

const actions = [{ name: "NFTs" }, { name: "museboards" }];

export default function ProfilePage() {
  const user = getAuth().currentUser;
  const newMuseboardModal = useModal("create-museboard");
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
                  <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4">
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
                  <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4">
                    <FollowingMuseboardList address={address as string} />
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
