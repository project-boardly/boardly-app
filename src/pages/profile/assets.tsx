import { Masonry } from "masonic";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { Contract, toUtf8String } from "ethers";
import type { ERC725JSONSchema } from "@erc725/erc725.js";

import ERC165 from "@openzeppelin/contracts/build/contracts/ERC165.json";

import { INTERFACE_IDS } from "@lukso/lsp-smart-contracts/constants.js";
import LSP5ReceivedAssets from "@erc725/erc725.js/schemas/LSP5ReceivedAssets.json";
import LSP8IdentifiableDigitalAsset from "@lukso/lsp-smart-contracts/artifacts/LSP8IdentifiableDigitalAsset.json";


import { useErc725 } from "../../hooks/useErc725";
import { rpcProvider } from "../../hooks/useContract";
import NFTCard from "../../common/NFTCard";
import toast from "react-hot-toast";
import { useModal } from "@ebay/nice-modal-react";

function supportsInterface(collection: string, selector: string) {
  const contract = new Contract(collection, ERC165.abi, rpcProvider);

  return contract.supportsInterface(selector);
}

async function loadCollectionAssets(collection: string, address: string) {
  const isERC725Y = await supportsInterface(collection, INTERFACE_IDS.ERC725Y);

  if (!isERC725Y) {
    return [];
  }

  const contract = new Contract(
    collection,
    LSP8IdentifiableDigitalAsset.abi,
    rpcProvider
  );

  let isLSP7 = true;
  try {
    isLSP7 = !(await supportsInterface(collection, INTERFACE_IDS.LSP8IdentifiableDigitalAsset));

    await contract.balanceOf(address);
  } catch (error) {
    isLSP7 = false;
  }

  try {
    if (isLSP7) {
      return [
        {
          collection,
          standard: "LSP7",
          id: '0x',
        },
      ];
    }

    const tokenIds = await contract.tokenIdsOf(address);
    const name = await contract.getData('0xdeba1e292f8ba88238e10ab3c7f88bd4be4fac56cad5194b6ecceaf653468af1');

    return tokenIds.map((id: string) => ({ name: toUtf8String(name), collection, standard: "LSP8", id }));
  } catch (error: any) {
    console.log(collection, error);

    return [];
  }
}

export default function Assets() {
  const { address } = useParams();
  const modal = useModal('add-to-museboard');
  const erc725 = useErc725(
    address as string,
    LSP5ReceivedAssets as ERC725JSONSchema[]
  );
  const query = useQuery({
    queryKey: ["received-assets", address],
    queryFn: () => {
      return erc725.fetchData("LSP5ReceivedAssets[]").then(({ value }) => {
        return Promise.all(
          (value as string[]).map((collection) =>
            loadCollectionAssets(collection, address as string)
          )
        ).then((assets) => assets.flat());
      });
    },
    retry: false
  });

  function addToMuseboard ({ chain, collection, tokenId, standard }: any) {
    modal.show({ chain, collection, tokenId, standard })
      .then(() => {
        toast.success(<p>Token added to board</p>);
      });
  }

  return (
    <div>
      {query.data && (
        <Masonry
          items={query.data as any[]}
          columnGutter={8}
          overscanBy={2}
          maxColumnCount={5}
          columnWidth={250}
          render={({ data }: { data: any }) => {
            return (
              <NFTCard
                chain="lukso-testnet"
                collection={data.collection}
                tokenId={data.id}
                name={data.name}
                addToMuseboard={() => addToMuseboard({ chain: 'lukso-testnet', collection: data.collection, standard: data.standard, tokenId: data.id })}
                standard={data.standard}
              />
            );
          }}
        />
      )}
    </div>
  );
}
