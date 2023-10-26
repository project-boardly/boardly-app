import { Link } from "react-router-dom";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

import { useEffect, useState } from "react";
import { Masonry , useInfiniteLoader } from "masonic";

import { Button } from "../../common/buttons";
import { queryClient } from "../../main";
import collections from '../../collections';
import { useCollection } from "../../hooks/useCollection";
import { fetchTokens } from "../../utils";

function NFTCard({
  chain,
  collection,
  tokenId,
  metadataUrl,
  name,
}: {
  chain: string,
  collection: string;
  tokenId: number;
  metadataUrl: string;
  name: string;
}) {
  const { fetchMetadataByUri } = useCollection(chain, collection);
  const query = useQuery({
    queryKey: ["chain", chain, "collection", collection, "token", tokenId],
    cacheTime: 60 * 60 * 1000,
    staleTime: 60 * 60 * 1000,
    queryFn: () => fetchMetadataByUri(metadataUrl)
  });

  function parseImageUrl (image: string) {
    const url = image
      .replace("ipfs://", "https://ipfs.io/ipfs/")
      .replace('ipfs/ipfs/', 'ipfs/')
      .replace('https://ipfs.pixura.io/', 'https://ipfs.io/');

    if (url.startsWith('https://')) {
      return `http://localhost:8080/300x,q90/${url}`
    }

    return url;
  }

  function setDimensions(e: any) {
    const height = e.target.height;
    const width = e.target.width;

    if (width/height > 2) {
      return queryClient.setQueryData(["chain", chain, "collection", collection, "token", tokenId], Object.assign({
        imageMeta: { height: 400, width: 400 }
      }, query.data))
    }

    queryClient.setQueryData(["chain", chain, "collection", collection, "token", tokenId], Object.assign({
      imageMeta: { height, width }
    }, query.data))
  }

  function setSkip () {
    queryClient.setQueryData(["chain", chain, "collection", collection, "token", tokenId], Object.assign({
      skip: true
    }, query.data))
  }

  if (query.isLoading) {
    return (
      <div className="rounded-3xl aspect-square bg-slate-100 text-center align-middle animate-pulse">
      </div>
    );
  }

  if (!query.data) {
    console.log(`No data found for: ${collection}, ${tokenId}, ${metadataUrl}`);

    return <></>;
  }

  if (query.data.skip) {
    console.log('skipped', collection, tokenId);

    return <></>;
  }

  if (!query.data.imageMeta) {
    return (
      <div className="rounded-3xl aspect-square overflow-hidden border">
        <img
          className="rounded-3xl blur-sm bg-slate-200 animate-pulse"
          src={parseImageUrl(query.data.image)}
          onLoad={setDimensions}
          onError={(x) => { console.log(x); setSkip() }}
          loading="lazy"
          crossOrigin=""
        />
        <div className="p-4 group-hover:p-2 transition-all transition-duration-700">
          <p className="truncate font-semibold text-gray-700">
            {query.data.name || `${name} #${tokenId}`}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`group grow-0 overflow-hidden rounded-3xl flex flex-col border border-gray-300 hover:shadow-2xl transition-all transition-duration-700 hover:p-4`}
      style={{ aspectRatio: `${query.data.imageMeta.width}/${query.data.imageMeta.height}` }}
    >
      <Link
        id={`explore:${collection}:${tokenId}`}
        to={`/collection/${chain}/${collection}/token/${tokenId}`}
        className={`grow bg-cover bg-center rounded-3xl bg-gray-200`}
        style={{
          backgroundImage: `url(${parseImageUrl(query.data.image)})`,
        }}
      ></Link>
      <div>
        <div className="p-4 group-hover:p-2 transition-all transition-duration-700">
          <p className="truncate font-semibold text-gray-700">
            {query.data.name || `${name} #${tokenId}`}
          </p>
        </div>
        <div className="transition-all transition-duration-700 hidden group-hover:block">
          <p className="px-2 mb-2 font-semibold">
            <span className="text-gray-600 font-normal mr-2 mb-2 ">From</span>
            {name}
          </p>
          <button
            onClick={console.log}
            className="bg-black text-white font-bold py-4 shadow-lg w-full rounded-2xl"
          >
            Add to museboard
          </button>
        </div>
      </div>
    </div>
  );
}

function shuffle(array: unknown[]) {
  let currentIndex = array.length,
    randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex > 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
}

// async function fetchTokens(collection: { metadata: any, contract: Contract }, startAt = 0, pageSize = 20) {
//   let count = 0,
//     tokenId = startAt;

//   const tokens = [];
//   const name = collection.contract.name();
//   let failedAttempts = 0;
//   // const totalSupply = await collection.contract.totalSupply();

//   console.log('fetching', collection.contract.target, startAt, pageSize);

//   while (count < pageSize) {
//     if (failedAttempts == 10) {
//       break;
//     }

//     try {
//       let tokenUri;
//       let _tokenId = tokenId;

//       if (collection.metadata.enumerable) {
//         _tokenId = Number(await collection.contract.tokenByIndex(tokenId));
//         tokenUri = await collection.contract.tokenURI(_tokenId)
//       }
//       else if (collection.metadata.standard !== 'ERC721') {
//         tokenUri = await collection.contract.uri(tokenId)
//       } else {
//         tokenUri = await collection.contract.tokenURI(tokenId)
//       }

//       tokens.push({
//         id: _tokenId,
//         address: collection.contract.target as string,
//         // metadata: tokenUri.startsWith('https://') ? `http://localhost:3000/proxy?url=${encodeURIComponent(tokenUri)}` : tokenUri,
//         metadata: tokenUri,
//         collection: await name,
//         chain: collection.metadata.chain
//       });

//       count++;
//     } catch (error: any) {
//       failedAttempts++;

//       console.log("failed for token", collection.contract.target, tokenId);
//     } finally {
//       tokenId++;
//     }
//   }

//   if (failedAttempts === 10) {
//     return { data: tokens, cursor: tokenId, failed: true }
//   }

//   return { data: tokens, cursor: tokenId };
// }

function pickRandom(arr: any[], n: number) {
  let len = arr.length;
  const result = new Array(n),
    taken = new Array(len);

  if (n > len)
    throw new RangeError("getRandom: more elements taken than available");

  while (n--) {
    const x = Math.floor(Math.random() * len);

    result[n] = arr[x in taken ? taken[x] : x];
    taken[x] = --len in taken ? taken[len] : len;
  }

  return result;
}

type FetchTokensRes = {
  cursor: number;
  data: any[];
  failed?: boolean;
}

export default function Explore() {
  const collectionsCount = 8;
  const tokenPerCollection = 2;
  // const pageSize = collectionsCount * tokenPerCollection;
  const [loadAfter, setLoadAfter] = useState(Date.now() + 10 * 1000);
  const query = useInfiniteQuery({
    queryKey: ["explore"],
    refetchOnReconnect: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    cacheTime: 60 * 60 * 1000,
    queryFn: async ({ pageParam = {} }) => {
      const counts = shuffle(Array(collectionsCount).fill(tokenPerCollection)) as number[];
      const contracts = pickRandom(collections, collectionsCount);

      try {
        const tokens = await Promise.all(
          counts.map((count, idx) => {
            
            const collection = contracts[idx];
            const address = collection.contract.target as string;
            const state = pageParam[address] || { cursor: 1 };

            // return fetchTokens(collection, state.cursor, count);
            return new Promise((resolve) => {
              fetchTokens(
                collection.metadata.chain,
                collection.contract.target,
                collection.metadata.standard,
                collection.metadata.enumerable,
                state.cursor,
                count,
                resolve,
                (token: any) => {
                  setTokensList((_tokens: any[]) => _tokens.concat([token]));
                }
              );
            });
          })
        ) as FetchTokensRes[];

        const newState = tokens.reduce((acc, collTokens, idx) => {
          const address = contracts[idx].contract.target as string;
          const state = { cursor: collTokens?.cursor };

          acc[address] = state;

          return acc;
        }, pageParam);

        return {
          data: shuffle(tokens.map((list) => list.data).flat()),
          state: newState,
        };
      }
      catch (err) {
        console.log(err);
      }
    },
    getNextPageParam: (page) => page?.state,
  });
  const [tokensList, setTokensList] = useState<any>([]);

  const maybeLoadMore = useInfiniteLoader((startIdx, endIdx, currentItems) => {
    console.log('load more', Date.now(), loadAfter, startIdx, endIdx);
    const timestamp = Date.now()

    if (loadAfter > timestamp) {
      console.log(`waiting for ${loadAfter - timestamp}ms`);

      return;
    }

    console.log('loading items');

    if (startIdx >= currentItems.length) {
      setLoadAfter(timestamp + 120 * 1000);

      query.fetchNextPage().then(() => {
        setLoadAfter(Date.now() + 15 * 1000);
      });
    }
  }, {
    isItemLoaded: (index, items) => !!items[index]
  });

  function getItems() {
    return query.data ? query.data.pages.map((p) => p?.data).flat().filter((t: any) => !t?.skip) : []
  }

  useEffect(() => {
    if (tokensList.length === 0) {
      setTokensList(getItems());
    }
  }, [query.data]);

  return (
    <div>
      <div className="mx-16">
        <Masonry
          items={tokensList}
          columnGutter={8}
          overscanBy={2}
          maxColumnCount={5}
          columnWidth={250}
          onRender={maybeLoadMore}
          render={({ data }: { data: any }) =>{
            return <NFTCard chain={data.chain} tokenId={data.id} collection={data.address} metadataUrl={data.metadata} name={data.collection} />
          }}
        />
        { !query.isLoading && <div className="mx-auto w-64 my-14">
          <Button onClick={() => query.fetchNextPage()}>Load More</Button>
        </div> }
      </div>
    </div>
  );
}
