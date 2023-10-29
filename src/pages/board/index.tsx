import { Link, useParams } from "react-router-dom";

import { Loader } from "../../modals/AddToMuseboard";
import { Masonry } from "masonic";
import NFTCard from "../../common/NFTCard";
import useMuseboard from "../../hooks/useMuseboard";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { create } from "blockies-ts";
import useUser from "../../hooks/useUser";
import { Cog6ToothIcon } from "@heroicons/react/24/outline";
import { useModal } from "@ebay/nice-modal-react";

// const IPFS_GATEWAY = "https://2eff.lukso.dev/ipfs/";

function ipfsUrl(url: string) {
  return url.replace("ipfs://", "https://2eff.lukso.dev/ipfs/");
}

function BoardTokens({ boardId }: { boardId: string }) {
  const { getTokens } = useMuseboard();
  const query = useQuery({ queryKey: ['board:tokens', boardId], queryFn: () => getTokens(boardId as string) })

  if (query.isLoading) {
    return <Loader />
  }

  if (!query.data || query.data.tokens.length === 0) {
    return <div className="w-full h-56 bg-gray-50 flex flex-col justify-center text-center text-gray-500 space-y-4">
      <p className="text-xl block">{'This is empty :('}</p>
      <p>Start adding NFTs to this museboard and inspire others!</p>
    </div>
  }
  
  return <div>
  <Masonry
    items={query.data.tokens}
    columnGutter={8}
    overscanBy={2}
    maxColumnCount={5}
    render={({ data }: { data: any }) =>{
      return <NFTCard name="x" chain={data.chain} tokenId={Number(data.tokenId)} collection={data.collection} />
    }}
  />
  </div>
}

function BoardActions({ boardId, owner, toggleSettings }: { boardId: string, owner: string, toggleSettings: () => void }) {
  const { user, loading } = useUser();

  if (loading) {
    return <p>...</p>
  }

  if (!user) {
    return <p>Login</p>
  }

  if (user?.uid === owner) {
    return <button
      className="bg-gray-200 text-black py-2 px-8 rounded-xl hover:shadow-lg duration-300"
      onClick={toggleSettings}
    >
      <Cog6ToothIcon height={24} width={24} className="inline mr-2"/>
      Settings
    </button>
  }

  return <button className="bg-black text-white font-bold py-2 px-8 rounded-xl shadow-lg">
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
}

export default function BoardPage() {
  const { boardId } = useParams();
  const { getMetadata } = useMuseboard();
  const query = useQuery({ queryKey: ['board:metadata', boardId], queryFn: () => getMetadata(boardId as string) })
  const [image, setImage] = useState<string|null>(null);
  const modal = useModal('create-museboard');
  // const query = useBoardQuery(boardId as string);

  useEffect(() => {
    if (!query.data) { return; }
  
    setImage(create({ seed: `${query.data.owner}:${query.data.id}`, scale: 40, bgcolor: '#f1f1f1' }).toDataURL());
  }, [query.data]);

  function toggleSettings() {
    if (!query.data) { return; }

    modal.show(query.data);
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
              src={(query.data?.logo ? ipfsUrl(query.data.logo) : image) as string}
              alt="Board"
            />
            <div className="absolute top-16 left-0 right-0 h-80 z-10">
            <div className="max-w-7xl px-8 mb-40 mx-auto flex flex-row space-x-3">
              <button
                onClick={() => window.history.back()}
                className="px-4 py-2 bg-gray-200 rounded-lg text-black"
              >
                Back
              </button>
              <span className="grow"></span>
              <button className="px-4 py-2 bg-gray-200 rounded-lg text-black" onClick={() => window.alert('Not Implemented')}>
                Share
              </button>
            </div>
              <div className="flex flex-row space-x-8 max-w-7xl px-8 mx-auto">
                <div className="min-w-fit">
                  <img
                    className="w-64 h-64 rounded-2xl border-4 border-white  object-cover object-center"
                    src={(query.data?.logo ? ipfsUrl(query.data.logo) : image) as string}
                    alt="Board"
                  />
                </div>
                <div className="flex flex-col grow">
                  <div>
                    <h2 className="text-5xl text-white font-semibold">
                      {query.data?.name}
                    </h2>
                    { query.data.description && <p className="text-lg text-white mt-2 h-16 text-ellipsis">
                      {query.data.description.substring(0, 180)}{query.data.description.length > 180 && '...'}
                    </p> }
                  </div>
                  <div className="grow"></div>
                  <div className="flex flex-row space-x-8">
                    <div>
                      <img className="h-8 w-8 rounded-full inline mr-4 bg-black" src={`https://avatars.dicebear.com/api/identicon/${query.data.owner}.svg`} alt="Board Owner"/>
                      <span className="text-gray-500 mr-4">Curated by</span>
                      <Link to={`/profile/${query.data.owner}`} className="font-semibold">{query.data.owner.substring(0, 5)}...{query.data.owner.substring(query.data.owner.length - 5)}</Link>
                    </div>
                    <span className="leading-7">0 Followers</span>
                    {/* <span className="leading-7">{(board.tokens || []).length} NFTs</span> */}
                  </div>
                  <div className="pt-4 mb-2">
                    <BoardActions owner={query.data.owner} boardId={boardId as string} toggleSettings={toggleSettings} />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="max-w-7xl mx-auto px-8">
            <BoardTokens boardId={boardId as string} />
          </div>
        </main>
      </div>
    </>
  );
}
