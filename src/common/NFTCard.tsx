import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "../main";
import { useCollection } from "../hooks/useCollection";

export default function NFTCard({
  chain,
  collection,
  tokenId,
  metadataUrl,
  name,
  addToMuseboard,
  standard
}: {
  chain: string,
  collection: string;
  tokenId: number;
  name: string;
  metadataUrl?: string;
  standard?: string;
  addToMuseboard?: () => void
}) {
  const { fetchMetadataByUri, fetchMetadata } = useCollection(chain, collection, standard);
  const query = useQuery({
    queryKey: ["chain", chain, "collection", collection, "token", tokenId],
    cacheTime: 60 * 60 * 1000,
    staleTime: 60 * 60 * 1000,
    queryFn: () => metadataUrl ? fetchMetadataByUri(metadataUrl) : fetchMetadata(tokenId.toString())
  });

  function parseImageUrl (image: string) {
    const url = image
      .replace("ipfs://", "https://ipfs.io/ipfs/")
      .replace('ipfs/ipfs/', 'ipfs/')
      .replace('https://ipfs.pixura.io/', 'https://ipfs.io/');

    if (url.startsWith('https://')) {
      return `${import.meta.env.VITE_API_HOST}/300x,q90/${url}`
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
          onError={() => setSkip()}
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
          { addToMuseboard && <button
            onClick={() => addToMuseboard()}
            className="bg-black text-white font-bold py-4 shadow-lg w-full rounded-2xl"
          >
            Add to museboard
          </button> }
        </div>
      </div>
    </div>
  );
}