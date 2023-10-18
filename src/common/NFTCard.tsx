import { useEffect, useState } from "react";
import safeGet from "lodash/get";
import { Link } from "react-router-dom";

import addIcon from "../addIcon.svg";
import { useQuery } from "@tanstack/react-query";

const IPFS_GATEWAY = "https://2eff.lukso.dev/ipfs/";
interface NFTCardProps {
  address: string;
  tokenId: string;
  chain?: string;
  classes?: string;
}

function extractTitle(description: string) {
  const _title = (description.match(/^\[.*\]/g) || [])[0] || "";
  const _desc = description.replace(_title, "").trimStart();

  return { title: _title.replace(/[[\]]/g, ""), description: _desc };
}

export default function NFTCard({
  address,
  tokenId,
  classes,
}: NFTCardProps) {
  const [image, setImage] = useState<string>("");
  const [alt, setAlt] = useState<string>("");
  const [padding] = useState<number>(Math.random() * 150);
  const [aspect, setAspect] = useState<string|null>(null);
  const token = useQuery(['token:data', address, tokenId], { queryFn: () => console.log('try to fetch'), staleTime: 60 * 5 * 1000 });

  useEffect(() => {
    if (token.isLoading) { return; }

    const imagePath = "token.images.0.url";
    const descriptionPath = "token.description";

    const imageUrl = safeGet(token.data, imagePath, '');
    const iconUrl = safeGet(token.data, 'token.icons.0.url');
    
    const { title, description } = extractTitle(safeGet(token.data, descriptionPath, ''));

    if (!title && !description) {
      const { title: cTitle, description: cDescription } = extractTitle(
        safeGet(token.data, 'collection.description') || safeGet(token.data, 'collection.name', '')
      );

      setAlt(cTitle ? cTitle : cDescription);
    } else {
      setAlt(title ? title : description);
    }

    if (imageUrl) {
      setImage((imageUrl as string).replace("ipfs://", IPFS_GATEWAY));

      const height = safeGet(token.data, 'token.images.0.height', 1) as number;
      const width = safeGet(token.data, 'token.images.0.width', 1) as number;

      setAspect(`${height}/${width * 1.2}`);

      return;
    }

    if (iconUrl) {
      setImage((iconUrl as string).replace("ipfs://", IPFS_GATEWAY));

      return;
    }
    
    // Fallback to loading collection image
    const collectionMetadataUrl = safeGet(token.data, 'collection.metadata.url');

    if (!collectionMetadataUrl) { return; }

    fetch((collectionMetadataUrl as string).replace("ipfs://", IPFS_GATEWAY))
      .then(res => res.json())
      .then((_colData) => {
        const logoUrl = safeGet(_colData, "LSP4Metadata.images.0.0.url") || safeGet(_colData, "LSP4Metadata.icon.0.url", '');

        logoUrl && setImage(logoUrl.replace("ipfs://", IPFS_GATEWAY));
      })
  }, [token]);
  
  function addToMuseboard() {
    window.alert('Add To Museboard');
  }

  if (token.isLoading) {
    return (
      <div
        className="group overflow-hidden rounded-3xl flex flex-col border border-gray-300 hover:shadow-2xl mb-8 transition-all transition-duration-700 hover:p-4"
        style={{ height: 400 + padding }}
      >
        <div className="animate-pulse grow bg-cover bg-center rounded-3xl bg-gray-200"></div>
      </div>
    );
  }

  return (
    <div
      className={`group grow-0 overflow-hidden rounded-3xl flex flex-col border border-gray-300 hover:shadow-2xl transition-all transition-duration-700 hover:p-4 ${classes}`}
      style={aspect ? { aspectRatio: aspect } : { height: 400 + padding }}
    >
      <Link
        to={`/collection/${address}/token/${tokenId}`}
        className={`grow bg-cover bg-center rounded-3xl ${
          image ? "" : "bg-gradient-to-r from-purple-500 to-pink-500"
        }`}
        style={image ? { backgroundImage: `url(${image})` } : {}}
      ></Link>
      <div>
        <div className="p-4 group-hover:p-2 transition-all transition-duration-700">
          <p className="truncate font-semibold text-gray-700">{alt}</p>
        </div>
        <div className="transition-all transition-duration-700 hidden group-hover:block">
          <p className="px-2 mb-2 font-semibold"><span className="text-gray-600 font-normal mr-2 mb-2 ">From</span>{(token.data as any).collection?.name}</p>
          <button onClick={addToMuseboard} className="bg-black text-white font-bold py-4 shadow-lg w-full rounded-2xl">
            <img className="inline mr-4" alt="Add" src={addIcon} />
            Add to museboard
          </button>
        </div>
      </div>
    </div>
  );
}
