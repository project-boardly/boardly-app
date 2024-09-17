import { Contract, JsonRpcProvider } from "ethers";

import { abi } from "boardly-contracts/artifacts/@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol/ERC721Enumerable.json";
import ERC1155ABI from "./ERC1155.json";
import { useErc725 } from "./useErc725";

import LSP4DigitalAsset from "@erc725/erc725.js/schemas/LSP4DigitalAsset.json";
import { ERC725JSONSchema } from "@erc725/erc725.js";

function ipfsUrl(url: string) {
  return url.replace("ipfs://", "https://2eff.lukso.dev/ipfs/");
}

export const providers: any = {
  ethereum: new JsonRpcProvider(
    "https://eth-mainnet.g.alchemy.com/v2/2eEiw8W63XB1bzIk-2XJHxPbZreVtM8V",
  ),
  base: new JsonRpcProvider("https://mainnet.base.org"),
  "lukso-testnet": new JsonRpcProvider("https://rpc.testnet.lukso.network"),
};

export const ERC721 = abi;
export const ERC1155 = ERC1155ABI;

export function useCollection(
  chain: string,
  address: string,
  standard?: string,
) {
  const provider = providers[chain];
  const collection = new Contract(address, abi, provider);

  if (standard === "LSP7") {
    return LSP7CollectionUtils(chain, address);
  }

  if (standard === "LSP8") {
    return LSP8CollectionUtils(chain, address);
  }

  async function fetchTokens(startAt = 0, pageSize = 20) {
    let count = 0,
      tokenId = startAt;

    const tokens = [];

    while (count < pageSize) {
      try {
        const tokenUri = await collection.tokenURI(tokenId);

        console.log(tokenUri);

        tokens.push({
          id: tokenId,
          metadata: tokenUri.replace("ipfs://", "https://ipfs.io/ipfs/"),
        });
        count++;
      } catch (error) {
        console.log("failed for token", tokenId);
      } finally {
        tokenId++;
      }
    }

    return { data: tokens, cursor: tokenId };
  }

  async function fetchMetadata(tokenId: string) {
    const tokenUri = await collection.tokenURI(tokenId);

    return fetchMetadataByUri(tokenUri);
  }

  async function fetchMetadataByUri(uri: string) {
    let tokenUri = uri
      .replace("https://cdn.kaizen.finance", "http://localhost:8010/proxy")
      .replace("ipfs://", "https://ipfs.io/ipfs/")
      .replace("https://gateway.pinata.cloud/", "https://ipfs.io/ipfs/")
      .replace("https://ipfs.pixura.io/", "https://ipfs.io/ipfs/")
      .replace("ipfs/ipfs/", "ipfs/");

    if (uri.startsWith("https://token.artblocks.io/")) {
      return fetch(tokenUri).then((res) => res.json());
    }

    if (uri.startsWith("http")) {
      tokenUri = `${import.meta.env.VITE_API_HOST}/proxy?url=${encodeURIComponent(uri)}`;
    }

    return fetch(tokenUri).then((res) => res.json());
  }

  return {
    fetchTokens,
    fetchMetadata,
    fetchMetadataByUri,
    contract: collection,
  };
}

function LSP7CollectionUtils(chain: string, address: string) {
  chain;
  const erc725 = useErc725(address, LSP4DigitalAsset as ERC725JSONSchema[]);

  async function fetchTokens(startAt = 0, pageSize = 20) {
    startAt;
    pageSize;
    return [];
  }

  async function fetchMetadata(tokenId: string) {
    const [{ value: name }, { value: collectionMetadata }] =
      await erc725.fetchData(["LSP4TokenName", "LSP4Metadata"]);

    tokenId;
    return {
      name,
      image: (collectionMetadata as any).LSP4Metadata.images[0][0].url,
    };
  }

  async function fetchMetadataByUri(uri: string) {
    const [name, collectionMetadata] = await erc725.fetchData([
      "LSP4TokenName",
      "LSP4Metadata",
    ]);

    uri;
    return {
      name,
      image: (collectionMetadata as any).LSP4Metadata.icon[0].url,
    };
  }

  return {
    fetchTokens,
    fetchMetadata,
    fetchMetadataByUri,
  };
}

function LSP8CollectionUtils(chain: string, address: string) {
  chain;

  const erc725 = useErc725(address, LSP4DigitalAsset as ERC725JSONSchema[]);

  async function fetchTokens(startAt = 0, pageSize = 20) {
    startAt;
    pageSize;

    return { data: [], cursor: null };
  }

  async function fetchMetadata(tokenId: string) {
    const [{ value: name }, { value: collectionMetadata }] =
      await erc725.fetchData(["LSP4TokenName", "LSP4Metadata"]);

    tokenId;
    return {
      name,
      image: ipfsUrl((collectionMetadata as any).LSP4Metadata.images[0][0].url),
    };
  }

  async function fetchMetadataByUri(uri: string) {
    const [{ value: name }, { value: collectionMetadata }] =
      await erc725.fetchData(["LSP4TokenName", "LSP4Metadata"]);

    uri;
    return {
      name,
      image: (collectionMetadata as any).LSP4Metadata.images[0][0].url,
    };
  }

  return {
    fetchTokens,
    fetchMetadata,
    fetchMetadataByUri,
  };
}
