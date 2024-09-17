import { Link, useParams } from "react-router-dom";
import { useCollection } from "../../hooks/useCollection";
import { useQuery } from "@tanstack/react-query";

import collections from '../../collections';

const IPFS_GATEWAY = 'https://ipfs.io/ipfs/';

import addIcon from "../../addIcon.svg";
import { useModal } from "@ebay/nice-modal-react";
import toast from "react-hot-toast";
import { Loader } from "../../modals/AddToMuseboard";

function TokenImages({ images }: { images: any[] }) {
  const url = images[0].url;

  return (
    <img
      className="max-w-2xl mx-auto"
      src={url.replace("ipfs://", IPFS_GATEWAY)}
      alt="Token"
    />
  );
}

export default function Token() {
  const { chain, collection, tokenId } = useParams();
  const collectionMeta = collections.find((col) => col.metadata.chain === chain && col.metadata.address === collection);
  const pfpModal = useModal('profile-picture-modal');
  const addToMuseboard = useModal('add-to-museboard');
  const { fetchMetadata } = useCollection(
    chain as string,
    collection as string
  );
  const { data, ...query } = useQuery({
    queryKey: ["chain", chain, "collection", collection, "token", tokenId],
    cacheTime: 60 * 60 * 1000,
    staleTime: 60 * 60 * 1000,
    queryFn: () => fetchMetadata(tokenId as string),
  });

  function handleAddToMuseboard ({ chain, collection, tokenId }: any) {
    addToMuseboard.show({ chain, collection, tokenId })
      .then(() => {
        toast.success(<p>Token added to board</p>);
      });
  }

  if (query.isLoading) {
    return <Loader />;
  }

  if (!data) {
    return <p>Data Not Found</p>;
  }

  return (
    <div className="min-h-full">
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="flex flex-row space-x-3">
            <button
              onClick={() => window.history.back()}
              className="px-4 py-2 bg-gray-200 rounded-lg text-black"
            >
              Back
            </button>
            <span className="grow"></span>
            <button
              onClick={handleAddToMuseboard}
              className="px-4 py-2 bg-gray-200 rounded-lg text-black"
            >
              Add to Board
            </button>
            <button className="px-4 py-2 bg-gray-200 rounded-lg text-black">
              Share
            </button>
          </div>
          <div className="py-8">
            <TokenImages images={[{ url: data.image }]} />
          </div>
          <div className="text-center">
            <span className="text-lg text-gray-600">
              {data.name}
            </span>
            {/* <h2 className="text-3xl font-bold">
              {title ? title : token.data.collection.name}
            </h2> */}
          </div>
          {/* <div className="py-4">
            <div className="max-w-sm flex flex-row mx-auto text-center">
              <div className="grow">
                {owner && <ProfileSmallCard label="Owner" address={owner} />}
              </div>
              <div className="grow">
                {creator && (
                  <ProfileSmallCard label="Creator" address={creator} />
                )}
              </div>
            </div>
          </div> */}
          <div className="text-center max-w-md mx-auto my-8 p-8 bg-gray-100 rounded-md">
            <span>Description</span>
            <p>{data.description}</p>
          </div>
          <div className="text-center my-8 flex flex-col space-y-4 max-w-xs mx-auto">
            <button
              onClick={handleAddToMuseboard}
              className="bg-black text-white font-bold py-4 px-8 shadow-lg rounded-2xl"
            >
              <img className="inline mr-4" alt="Add" src={addIcon} />
              Add to Board
            </button>
            { <button
              onClick={() => pfpModal.show({ chain, collection, tokenId, name: data.name })}
              className="bg-white border-2 font-bold py-4 px-8 rounded-2xl hover:bg-white hover:shadow-lg"
            >
              Set as Profile Picture
            </button> }
            { <Link
              to={`/collection/${chain}/${collection}`}
              className="bg-white border-2 font-bold py-4 px-8 rounded-2xl hover:bg-white hover:shadow-lg"
            >
              View Collection
            </Link> }
          </div>
          <div className="grid grid-cols-2">
            <div className="w-full">
              <span className="block py-4 w-full">METADATA</span>
              <div className="border-t border-b my-4">
                <div className="leading-10">
                  <div className="flex flex-row">
                    <span className="">Contract Address</span>
                    <span className="grow"></span>
                    <span>
                      {collection?.substring(0, 5)}...
                      {collection?.substring(
                        collection.length - 5
                      )}
                    </span>
                  </div>
                  <div className="flex flex-row">
                    <span>Token Standard</span>
                    <span className="grow"></span>
                    <span>{ collectionMeta?.metadata.standard }</span>
                  </div>
                  <div className="flex flex-row">
                    <span>Blokchain</span>
                    <span className="grow"></span>
                    <span>{chain}</span>
                  </div>
                </div>
              </div>
              {/* <a
                className="py-4"
                target="_blank"
                rel="noreferrer"
                href={`https://explorer.execution.l16.lukso.network/address/${token.data.collection.address}`}
              >
                BlockScout
              </a> */}
              <br />
              {/* {token.data.token.metadata && (
                <a
                  className="py-4"
                  href={token.data.token.metadata.replace(
                    "ipfs://",
                    'https://ipfs.io/ipfs/'
                  )}
                  target="_blank"
                  rel="noreferrer"
                >
                  IPFS
                </a>
              )} */}
            </div>
            <div></div>
          </div>
        </div>
      </main>
    </div>
  );
}
