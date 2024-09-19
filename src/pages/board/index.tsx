import { useContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { Masonry } from "masonic";
import { useQuery } from "@tanstack/react-query";

import { create } from "blockies-ts";
import { Cog6ToothIcon } from "@heroicons/react/24/outline";

import { useModal } from "@ebay/nice-modal-react";

import NFTCard from "../../common/NFTCard";
import { ConnectWallet } from "../../common/components";

import { Loader } from "../../modals/AddToMuseboard";

import useMuseboard from "../../hooks/useMuseboard";
import useUser from "../../hooks/useUser";
import useConnectModule from "../../hooks/useConnectModule";
import { useTransactionSender } from "../../hooks/transactions";
import UserContext from "../../contexts/UserContext";
import { ProfileCard } from "../profile";

function ipfsUrl(url: string) {
  return url.replace("ipfs://", "http://localhost:3000/ipfs/");
}

function BoardTokens({ boardId, owner }: { boardId: string; owner: string }) {
  const { getTokens } = useMuseboard();
  const query = useQuery({
    queryKey: ["board:tokens", boardId],
    queryFn: async () => {
      let data: any = { tokens: [] };

      try {
        data = await getTokens(boardId as string);
      } catch (error: any) {
        console.log(error);

        if (error.status === 401) {
          data.encrypted = true;
        } else {
          console.log(error);
        }
      }

      return data;
    },
    refetchOnMount: false,
    staleTime: 60 * 60,
  });

  if (query.isLoading) {
    return <Loader />;
  }

  if (query.data.encrypted && query.data.followersOnly) {
    return (
      <div className="w-full p-16 bg-gray-50 flex flex-col justify-center text-center text-gray-500 space-y-4">
        <p className="text-xl block">{"This is a private board :("}</p>
        <div className="max-w-2xl mx-auto">
          <ProfileCard address={owner} followersInfo={false} />
        </div>
        <p>Start following the creator to view this board.</p>
      </div>
    );
  }

  if (query.data.encrypted) {
    return (
      <div className="w-full h-56 bg-gray-50 flex flex-col justify-center text-center text-gray-500 space-y-4">
        <p className="text-xl block">{"This is a private board :("}</p>
        {/* <p>Start adding NFTs to this museboard and inspire others!</p> */}
      </div>
    );
  }

  if (!query.data || !query.data.tokens || query.data.tokens.length === 0) {
    return (
      <div className="w-full h-56 bg-gray-50 flex flex-col justify-center text-center text-gray-500 space-y-4">
        <p className="text-xl block">{"This is empty :("}</p>
        <p>Start adding NFTs to this museboard and inspire others!</p>
      </div>
    );
  }

  return (
    <div>
      <Masonry
        items={query.data.tokens}
        columnGutter={8}
        overscanBy={2}
        maxColumnCount={5}
        render={({ data }: { data: any }) => {
          return (
            <NFTCard
              name="x"
              chain={data.chain}
              tokenId={Number(data.tokenId)}
              collection={data.collection}
              standard={data.standard}
            />
          );
        }}
      />
    </div>
  );
}

function BoardActions({
  boardId,
  owner,
  toggleSettings,
}: {
  boardId: string;
  owner: string;
  toggleSettings: () => void;
}) {
  const { user, loading } = useUser();
  const { contract, isFollowing, getCalldata } = useConnectModule(
    import.meta.env.VITE_FOLLOW_MODULE,
  );
  const query = useQuery({
    queryKey: ["board", boardId, "user", user?.uid, "following"],
    enabled: !!user,
    queryFn: () =>
      isFollowing(
        boardId,
        user?.uid as string,
        import.meta.env.VITE_BOARDS_CONTRACT,
      ),
  });
  const { executeTransactionRequest } = useTransactionSender();

  async function followMuseboard() {
    try {
      const calldata = getCalldata(boardId);

      const txn = executeTransactionRequest({
        to: import.meta.env.VITE_BOARDS_CONTRACT,
        data: calldata,
      });

      await txn;
    } catch (err: any) {
      console.log(contract.interface.parseError(err.data));
    }
  }

  async function unfollowMuseboard() {
    const calldata = getCalldata(boardId, "unfollow");

    const txn = executeTransactionRequest({
      to: import.meta.env.VITE_BOARDS_CONTRACT,
      data: calldata,
    });

    await txn;
  }

  if (loading) {
    return <p>...</p>;
  }

  if (!user) {
    return <ConnectWallet />;
  }

  if (query.isLoading) {
    return <p>Loading</p>;
  }

  if (user?.uid === owner) {
    return (
      <button
        className="bg-gray-200 text-black py-2 px-8 rounded-xl hover:shadow-lg duration-300"
        onClick={toggleSettings}
      >
        <Cog6ToothIcon height={24} width={24} className="inline mr-2" />
        Settings
      </button>
    );
  }

  if (query.data) {
    return (
      <button
        className="bg-gray-500 text-white font-bold py-2 px-8 rounded-xl shadow-lg"
        onClick={() => unfollowMuseboard()}
      >
        <svg
          width="21"
          height="16"
          viewBox="0 0 21 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-6 h-6 inline mr-2"
        >
          <path
            d="M12 4C12 1.79 10.21 0 8 0C5.79 0 4 1.79 4 4C4 6.21 5.79 8 8 8C10.21 8 12 6.21 12 4ZM10 4C10 5.1 9.1 6 8 6C6.9 6 6 5.1 6 4C6 2.9 6.9 2 8 2C9.1 2 10 2.9 10 4Z"
            fill="#E0E0E0"
          />
          <path
            d="M0 14L0 16L16 16V14C16 11.34 10.67 10 8 10C5.33 10 0 11.34 0 14ZM2 14C2.2 13.29 5.3 12 8 12C10.69 12 13.77 13.28 14 14L2 14Z"
            fill="#E0E0E0"
          />
          <path d="M21 6L15 6V8L21 8V6Z" fill="#E0E0E0" />
        </svg>
        Unfollow Museboard
      </button>
    );
  }

  return (
    <button
      className="bg-black text-white font-bold py-2 px-8 rounded-xl shadow-lg"
      onClick={() => followMuseboard()}
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
      Follow Museboard
    </button>
  );
}

function Followers({ identifier }: { identifier: string }) {
  const { getFollowersCount } = useConnectModule(
    import.meta.env.VITE_FOLLOW_MODULE,
  );
  const followersModal = useModal("list-followers");
  const query = useQuery({
    queryKey: ["board:metadata:followers-count", identifier],
    queryFn: () =>
      getFollowersCount(identifier, import.meta.env.VITE_BOARDS_CONTRACT),
  });

  if (query.isLoading) {
    return <p>...</p>;
  }

  return (
    <a
      className="cursor-pointer"
      onClick={() =>
        followersModal.show({
          identifier,
          target: import.meta.env.VITE_BOARDS_CONTRACT,
        })
      }
    >
      {query.data} followers
    </a>
  );
}

export default function BoardPage() {
  const user = useContext(UserContext);
  const { boardId } = useParams();
  const { getMetadata } = useMuseboard();
  const query = useQuery({
    queryKey: ["board:metadata", boardId],
    queryFn: () => getMetadata(boardId as string),
  });
  const [image, setImage] = useState<string | null>(null);
  const modal = useModal("create-museboard");
  // const query = useBoardQuery(boardId as string);

  useEffect(() => {
    if (!query.data) {
      return;
    }

    setImage(
      create({
        seed: `${query.data.owner}:${query.data.id}`,
        scale: 40,
        bgcolor: "#f1f1f1",
      }).toDataURL(),
    );
  }, [query.data]);

  function toggleSettings() {
    if (!query.data) {
      return;
    }

    modal.show({ data: query.data, update: true, authUser: user?.uid });
  }

  if (query.isLoading) {
    return <Loader />;
  }

  return (
    <>
      <div className="min-h-full pb-16">
        <main>
          <div className="bg-slate-900 h-96 relative mb-48">
            <img
              className="absolute left-0 top-0.5 h-96 w-full object-cover opacity-30 z-0"
              src={
                (query.data?.logo ? ipfsUrl(query.data.logo) : image) as string
              }
              alt="Board"
            />
            <div className="absolute top-16 left-0 right-0 h-80 z-6">
              <div className="max-w-7xl px-8 mb-40 mx-auto flex flex-row space-x-3">
                <button
                  onClick={() => window.history.back()}
                  className="px-4 py-2 bg-gray-200 rounded-lg text-black"
                >
                  Back
                </button>
                <span className="grow"></span>
                <button
                  className="px-4 py-2 bg-gray-200 rounded-lg text-black"
                  onClick={() => window.alert("Not Implemented")}
                >
                  Share
                </button>
              </div>
              <div className="flex flex-row space-x-8 max-w-7xl px-8 mx-auto">
                <div className="min-w-fit">
                  <img
                    className="w-64 h-64 rounded-2xl border-4 border-white  object-cover object-center"
                    src={
                      (query.data?.logo
                        ? ipfsUrl(query.data.logo)
                        : image) as string
                    }
                    alt="Board"
                  />
                </div>
                <div className="flex flex-col grow">
                  <div>
                    <h2 className="text-5xl text-white font-semibold">
                      {query.data?.name}
                    </h2>
                    {query.data.description && (
                      <p className="text-lg text-white mt-2 h-16 text-ellipsis">
                        {query.data.description.substring(0, 180)}
                        {query.data.description.length > 180 && "..."}
                      </p>
                    )}
                  </div>
                  <div className="grow"></div>
                  <div className="flex flex-row space-x-8">
                    <div className="border-r pr-4">
                      <span className="text-gray-500 mr-4">Curated by</span>
                      <Link
                        to={`/profile/${query.data.owner}`}
                        className="font-semibold"
                      >
                        {query.data.owner.substring(0, 5)}...
                        {query.data.owner.substring(
                          query.data.owner.length - 5,
                        )}
                      </Link>
                    </div>
                    <Followers identifier={boardId as string} />
                    {/* <span className="leading-7">{(query.board.tokens || []).length} NFTs</span> */}
                  </div>
                  <div className="pt-4 mb-2">
                    <BoardActions
                      owner={query.data.owner}
                      boardId={boardId as string}
                      toggleSettings={toggleSettings}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="max-w-7xl mx-auto px-8">
            {(user || !query.data.privateBoard) && (
              <BoardTokens
                boardId={boardId as string}
                owner={query.data.owner}
              />
            )}
            {!user && query.data.privateBoard && (
              <p>This is a private board.. connect wallet to check access</p>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
