import { useParams } from "react-router-dom";
import { useCollection } from "../../hooks/useCollection";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { Button } from "../../common/buttons";
import { useEffect, useState } from "react";

function NFTCard ({ collection, tokenId, metadataUrl }: { collection: string, tokenId: string, metadataUrl: string }) {
  const query = useQuery({
    queryKey: ['collection', collection, 'token', tokenId],
    queryFn: () => fetch(metadataUrl.replace('https://cdn.kaizen.finance', 'http://localhost:8010/proxy')).then(res => res.json())
  });

  if (query.isLoading) {
    return <div>Loading</div>
  }

  if (!query.data) {
    return <div>No Data Found</div>
  }

  return <div>
    <img src={query.data.image.replace('ipfs://', 'https://ipfs.io/ipfs/')} loading="lazy"/>
    <p>{query.data.name}</p>
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

function Masonry({ count, columns, render }: { count: number, columns: number, render: (index: number) => JSX.Element}) {
  const grid = generateGrid(count, columns);
  const content = grid.map((column, colIdx) => {
    return <div key={colIdx} className="grid-cols-1">
      { column.map(([listIdx], idx) => <div className="flex-grow" key={`token-${idx}`}>{listIdx > count - 1 ? <EmptyToken /> : render(listIdx)}</div> )}
    </div>
  });

  if (columns === 3) {
    return <div className="grid grid-cols-3 gap-4">{content}</div> 
  }
  
  if (columns === 4) {
    return <div className="grid grid-cols-4 gap-4">{content}</div> 
  }

  if (columns === 5) {
    return <div className="grid grid-cols-5 gap-4">{content}</div> 
  }

  return <div className="grid grid-cols-1 gap-4">{content}</div> 
}

export function Collection () {
  const pageSize = 10;
  const { chain, address } = useParams();
  const { fetchTokens } = useCollection(chain as string, address as string);
  const query = useInfiniteQuery({
      queryKey: ['tokens', chain, address],
      queryFn: ({ pageParam = 1 }) => fetchTokens(pageParam, pageSize),
      getNextPageParam: (page) => page.cursor
    });

  const [columns, setColumns] = useState(4);

  function renderForIndex(index: number) {
    try {
      const page = Math.floor(index/pageSize),
      itemNum = index - page * pageSize,
      item = query.data?.pages[page].data[itemNum];

      return <NFTCard collection={address as string} tokenId={index.toString()} metadataUrl={item?.metadata} />
    } catch {
      console.log('render for index', index);

      return <p>Loading failed for {index}</p>
    }
  }

  function getCount() {
    if (!query.data) { return 0; }

    const pages = query.data.pages.length as number - 1;

    return pages * pageSize + query.data.pages[pages].data.length; 
  }

  return <div>
    <div className="mx-16">
    { <Masonry columns={columns} count={getCount()} render={renderForIndex} /> }
    </div>
    <Button onClick={() => query.fetchNextPage()}>Load More</Button>
    <Button onClick={() => setColumns(5)}>Zoom Out</Button>
  </div>
}