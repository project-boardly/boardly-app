import { Link } from "react-router-dom";
import { ERC721, providers } from "../../hooks/useCollection";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { Button } from "../../common/buttons";
import { useEffect, useRef, useState } from "react";
import { Contract } from "ethers";

import AutoSizer from "react-virtualized-auto-sizer";
import { FixedSizeList as List } from "react-window";

type ImageMeta = {
  height: number;
  width: number;
  aspect: number;
}

function NFTCard ({ collection, tokenId, metadataUrl, name }: { collection: string, tokenId: number, metadataUrl: string, name: string }) {
  const [imageMeta, setImageMeta] = useState<null|ImageMeta>(null);
  const query = useQuery({
    queryKey: ['collection', collection, 'token', tokenId],
    queryFn: () => fetch(metadataUrl.replace('https://cdn.kaizen.finance', 'http://localhost:8010/proxy')).then(res => res.json())
  });

  function setDimensions(e: any) {
    const height = e.target.height;
    const width = e.target.width;

    setImageMeta({
      height,
      width,
      aspect: width/height
    })
  }

  if (query.isLoading) {
    return <div>Loading</div>
  }

  if (!query.data) {
    console.log(`No data found for: ${collection}, ${tokenId}, ${metadataUrl}`);

    return <></>
  }

  if (!imageMeta) {
    return <div className="rounded-3xl overflow-hidden border border-gray-300">
      <img src={query.data.image.replace('ipfs://', 'https://ipfs.io/ipfs/')} onLoad={setDimensions} />
      <p>{query.data.name}</p>    
    </div>
  }

  return <div
      className={`group grow-0 overflow-hidden rounded-3xl flex flex-col border border-gray-300 hover:shadow-2xl transition-all transition-duration-700 hover:p-4`}
      style={{ aspectRatio: imageMeta.aspect }}
    >
      <Link
        id={`explore:${collection}:${tokenId}`}
        to={`/collection/${collection}/token/${tokenId}`}
        className={`grow bg-cover bg-center rounded-3xl bg-gray-200`}
        style={{ backgroundImage: `url(${query.data.image.replace('ipfs://', 'https://ipfs.io/ipfs/')})` }}
      >
      </Link>
      <div>
        <div className="p-4 group-hover:p-2 transition-all transition-duration-700">
          <p className="truncate font-semibold text-gray-700">{query.data.name || `${name} #${tokenId}`}</p>
        </div>
        <div className="transition-all transition-duration-700 hidden group-hover:block">
          <p className="px-2 mb-2 font-semibold"><span className="text-gray-600 font-normal mr-2 mb-2 ">From</span>{name}</p>
          <button onClick={console.log} className="bg-black text-white font-bold py-4 shadow-lg w-full rounded-2xl">
            Add to museboard
          </button>
        </div>
      </div>
    </div>
}

function EmptyToken() {
  return <div className="invisible"></div>
}

function generateGrid(count: number, columns: number) {
  const rows = Math.ceil(count/columns);
  const coordinates = Array(columns).fill(1).map((_, x) => {
    return Array(rows).fill(1).map((__, y) => [y * columns + x, x, y]);
  });

  return coordinates;
}

function Items({ items, render }: { items: any[], render: any }) {
  const Row = ({ index }: { index: number }) => {
    return render(items[index][0]);
  };

  return <div className="block h-full"><AutoSizer>
      {({ height, width }) => <List
          height={height}
          itemCount={items.length}
          itemSize={360}
          width={width}
          style={{ overflow: 'hidden' }}
        >
          {Row}
        </List>
      }
  </AutoSizer></div>
}

function Masonry({ count, columns, render }: { count: number, columns: number, render: (index: number) => JSX.Element}) {
  const grid = generateGrid(count, columns);
  const content = grid.map((column, colIdx) => {
    if (column.length === 0) {
      return <p key={colIdx}>Loading</p>
    }

    return <div key={colIdx} className="grid-cols-1 space-y-4 h-[100vh]">
      {/* { column.map(([listIdx], idx) => <div key={`token-${idx}`}>{listIdx > count - 1 ? <EmptyToken /> : render(listIdx)}</div> )} */}
      <Items items={column} render={(listIdx: number) => listIdx > count - 1 ? <EmptyToken /> : render(listIdx)}/>
    </div>
  });

  if (columns === 3) {
    return <div className="grid grid-cols-3 gap-4 absolute top-0 bottom-0 left-0 right-0">{content}</div> 
  }
  
  if (columns === 4) {
    return <div className="grid grid-cols-4 gap-4 absolute top-0 bottom-0 left-0 right-0">{content}</div> 
  }

  if (columns === 5) {
    return <div className="grid grid-cols-5 gap-4 absolute top-0 bottom-0 left-0 right-0">{content}</div> 
  }

  return <div className="grid grid-cols-1 gap-4 absolute top-0 bottom-0 left-0 right-0">{content}</div> 
}

function shuffle(array: unknown[]) {
  let currentIndex = array.length,  randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex > 0) {

    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}

const collections = [
  {
    chain: 'ethereum',
    address: '0xeb3f9f56eebcb2628e7de29ff93aab91616a0c6f',
    interface: ERC721,
  },
  {
    chain: 'ethereum',
    address: '0xf9c362cdd6eeba080dd87845e88512aa0a18c615',
    interface: ERC721
  },
  {
    chain: 'ethereum',
    address: '0x306b1ea3ecdf94ab739f1910bbda052ed4a9f949',
    interface: ERC721
  },
  {
    chain: 'ethereum',
    address: '0x7a63d17f5a59bca04b6702f461b1f1a1c59b100b',
    interface: ERC721
  },
  {
    chain: 'ethereum',
    address: '0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d',
    interface: ERC721,

  },
  {
    chain: 'ethereum',
    address: '0xbee7cb80dfd21a9eaae714208f361601f68eb746',
    interface: ERC721
  },
  {
    chain: 'ethereum',
    address: '0xB6c9a4E8AE1cCF33c2dC3D8c4ab322E4529233E2',
    interface: ERC721
  },
  {
    chain: 'ethereum',
    address: '0x18adc812fe66b9381700c2217f0c9dc816c879e6',
    interface: ERC721
  }
].map((collection) => new Contract(collection.address, collection.interface, providers[collection.chain]));

async function fetchTokens(collection: Contract, startAt = 0, pageSize = 20) {
  let count = 0,
    tokenId = startAt;

  const tokens = [];
  const name = collection.name();

  while (count < pageSize) {
    try {
      const tokenUri = await collection.tokenURI(tokenId);

      tokens.push({
        id: tokenId,
        address: collection.target as string,
        metadata: tokenUri.replace('ipfs://', 'https://ipfs.io/ipfs/'),
        collection: await name
      });
      count++;
    } catch (error) {
      console.log('failed for token', tokenId)
    } finally {
      tokenId++;
    }
  }

  return { data: tokens, cursor: tokenId };
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

export function Explore () {
  const pageSize = 16;
  const contracts = pickRandom(collections, 5);
  
  const query = useInfiniteQuery({
      queryKey: ['explore'],
      refetchOnReconnect: false,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      cacheTime: 60 * 60 * 1000,
      queryFn: async ({ pageParam = {} }) => {
        const counts = shuffle([2, 3, 3, 3, 4]) as number[];

        const tokens = await Promise.all(counts.map((count, idx) => {
          const collection = contracts[idx];
          const address = collection.target as string;
          const state = pageParam[address] || { cursor: 1 };

          return fetchTokens(collection, state.cursor, count);
        }));

        const newState = tokens.reduce((acc, collTokens, idx) => {
          const address = contracts[idx].target as string;
          const state = { cursor: collTokens.cursor };

          acc[address] = state;

          return acc;
        }, pageParam);

        return {
          data: shuffle(tokens.map(list => list.data).flat()),
          state: newState
        }
      },
      getNextPageParam: (page) => page.state
    });

  const [columns, setColumns] = useState(4);

  function renderForIndex(index: number) {
    try {
      const page = Math.floor(index/pageSize),
      itemNum = index - page * pageSize,
      { id: tokenId, address, metadata, collection: name } = query.data?.pages[page].data[itemNum] as any;

      console.log(query.data?.pages[page].data[itemNum]);

      return <NFTCard collection={address} metadataUrl={metadata} tokenId={tokenId} name={name}/>
    } catch (error) {
      const page = Math.floor(index/pageSize),
      itemNum = index - page * pageSize;

      console.log(`Loading failed for ${index}, Item: ${itemNum}, ${page}, ${index} :: ${pageSize}`);

      return <></>
    }
  }

  function getCount() {
    if (!query.data) { return 0; }

    const pages = query.data.pages.length as number - 1;

    const count = pages * pageSize + query.data.pages[pages].data.length;

    console.log(count);

    return count;
  }

  return <div>
    <div className="mx-16">
    { <Masonry columns={columns} count={getCount()} render={renderForIndex} /> }
    </div>
    <Button onClick={() => query.fetchNextPage()}>Load More</Button>
    <Button onClick={() => setColumns(5)}>Zoom Out</Button>
  </div>
}