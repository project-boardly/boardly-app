import { useInfiniteQuery } from "@tanstack/react-query";

import { useEffect, useState } from "react";
import { Masonry, useInfiniteLoader } from "masonic";

import { Button } from "../../common/buttons";
import collections from "../../collections";
import { fetchTokens } from "../../utils";
import { useModal } from "@ebay/nice-modal-react";
import NFTCard from "../../common/NFTCard";
import toast from "react-hot-toast";

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
};

async function fetchLuksoTokens(
  address: string,
  limit: number,
  offset: number,
) {
  const query = `
      query MyQuery {
        Asset(
          limit: 1
          offset: 0
          where: { id: { _eq: "${address}" } }
        ) {
          id
          blockNumber
          data
          isCollection
          isLSP7
          isUnknown
          lsp4TokenName
          lsp4TokenSymbol
          owner {
            id
          }
          tokens(limit: ${limit}, offset: ${offset}, order_by: { tokenId: asc }) {
            tokenId,
            name,
            images {
              url
            }
          }
        }
      }
    `;

  const res = await fetch("http://localhost:3000/graphql-proxy", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ query: query }),
  }).then((r) => r.json());

  const tokens = res.data.Asset[0].tokens;

  return tokens.map((t: any) => ({
    address: address,
    chain: "lukso",
    id: t.tokenId,
    metadata: {
      name: t.name,
      image: t.images[0].url,
    },
  }));
}

export default function Explore() {
  const collectionsCount = 3;
  const tokenPerCollection = 5;
  const modal = useModal("add-to-museboard");
  // const pageSize = collectionsCount * tokenPerCollection;
  const [loadAfter, setLoadAfter] = useState(Date.now() + 10 * 1000);
  const query = useInfiniteQuery({
    queryKey: ["explore"],
    refetchOnReconnect: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    cacheTime: 60 * 60 * 1000,
    queryFn: async ({ pageParam = {} }) => {
      const counts = shuffle(
        Array(collectionsCount).fill(tokenPerCollection),
      ) as number[];
      const contracts = pickRandom(collections, collectionsCount);

      try {
        const tokens = (await Promise.all(
          counts.map((count, idx) => {
            const collection = contracts[idx];
            const address = collection.contract.target as string;
            const state = pageParam[address] || { cursor: 1 };

            // return fetchTokens(collection, state.cursor, count);
            return new Promise((resolve) => {
              const maps: Record<string, boolean> = {};
              fetchTokens(
                collection.metadata.chain,
                collection.contract.target,
                collection.metadata.standard,
                collection.metadata.enumerable,
                state.cursor,
                count,
                resolve,
                (token: any) => {
                  if (maps[`${token.chain}:${token.address}:${token.id}`]) {
                    return;
                  }

                  maps[`${token.chain}:${token.address}:${token.id}`] = true;

                  setTokensList((_tokens: any[]) => _tokens.concat([token]));
                },
              );
            });
          }),
        )) as FetchTokensRes[];

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
      } catch (err) {
        console.log(err);
      }
    },
    getNextPageParam: (page) => page?.state,
  });
  const [tokensList, setTokensList] = useState<any>([]);

  const maybeLoadMore = useInfiniteLoader(
    (startIdx, endIdx, currentItems) => {
      endIdx;
      // console.log('load more', Date.now(), loadAfter, startIdx, endIdx);
      const timestamp = Date.now();

      if (loadAfter > timestamp) {
        // console.log(`waiting for ${loadAfter - timestamp}ms`);

        return;
      }

      if (startIdx >= currentItems.length) {
        setLoadAfter(timestamp + 120 * 1000);

        query.fetchNextPage().then(() => {
          setLoadAfter(Date.now() + 15 * 1000);
        });
      }
    },
    {
      isItemLoaded: (index, items) => !!items[index],
    },
  );

  function getItems() {
    return query.data
      ? query.data.pages
          .map((p) => p?.data)
          .flat()
          .filter((t: any) => !t?.skip)
      : [];
  }

  function addToMuseboard({ chain, collection, tokenId }: any) {
    modal.show({ chain, collection, tokenId }).then(() => {
      toast.success(<p>Token added to board</p>);
    });
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
          render={({ data }: { data: any }) => {
            return (
              <NFTCard
                chain={data.chain}
                tokenId={data.id}
                collection={data.address}
                metadataUrl={data.metadata}
                name={data.collection}
                addToMuseboard={() =>
                  addToMuseboard({
                    chain: data.chain,
                    collection: data.address,
                    tokenId: data.id,
                  })
                }
              />
            );
          }}
        />
        {!query.isLoading && (
          <div className="mx-auto w-64 my-14">
            <Button onClick={() => query.fetchNextPage()}>Load More</Button>
          </div>
        )}
      </div>
    </div>
  );
}
