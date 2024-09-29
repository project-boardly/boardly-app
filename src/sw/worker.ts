// @/src/sw/worker.ts

/// <reference lib="webworker" />
declare const self: DedicatedWorkerGlobalScope;

import { Contract, JsonRpcProvider } from "ethers";
import { ERC721, ERC1155 } from "../hooks/useCollection";

const providers: any = {
  ethereum: new JsonRpcProvider(
    "https://eth-mainnet.g.alchemy.com/v2/2eEiw8W63XB1bzIk-2XJHxPbZreVtM8V",
  ),
  base: new JsonRpcProvider("https://mainnet.base.org"),
  "lukso-testnet": new JsonRpcProvider("https://rpc.testnet.lukso.network"),
};

type CollectionMeta = {
  chain: string;
  address: string;
  standard: string;
  enumerable: boolean;
  interface: any;
};

async function fetchLuksoTokens(
  address: string,
  limit: number,
  offset: number,
) {
  console.log("fetching lukso tokens", address, limit, offset);

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

export const fetchTokens = async (
  meta: CollectionMeta,
  startAt: number,
  pageSize: number,
  callback: any,
  onToken: (token: any) => void,
) => {
  if (meta.chain === "lukso") {
    const tokens = await fetchLuksoTokens(meta.address, pageSize, startAt);

    for (const token of tokens) {
      onToken({
        id: token.id,
        address: meta.address,
        metadata: token.metadata,
        collection: "",
        chain: meta.chain,
      });
    }

    callback({ tokens: tokens, cursor: tokens.length });
    return;
  }

  const contract = new Contract(
    meta.address,
    meta.standard === "ERC721" ? ERC721 : ERC1155,
    providers[meta.chain],
  );

  let _count = 0,
    tokenId = startAt;

  const tokens = [];
  let failedAttempts = 0;
  // const totalSupply = await collection.contract.totalSupply();

  console.debug("fetching", contract.target, startAt, pageSize);

  while (_count < pageSize) {
    if (failedAttempts == 10) {
      break;
    }

    try {
      let tokenUri;
      let _tokenId = tokenId;

      if (meta.enumerable) {
        _tokenId = Number(await contract.tokenByIndex(tokenId));
        tokenUri = await contract.tokenURI(_tokenId);
      } else if (meta.standard !== "ERC721") {
        tokenUri = await contract.uri(tokenId);
      } else {
        tokenUri = await contract.tokenURI(tokenId);
      }

      onToken({
        id: _tokenId,
        address: contract.target as string,
        metadata: tokenUri,
        collection: await name,
        chain: meta.chain,
      });

      tokens.push({
        id: _tokenId,
        address: contract.target as string,
        metadata: tokenUri,
        collection: await name,
        chain: meta.chain,
      });

      _count++;
    } catch (error: any) {
      failedAttempts++;

      console.log("failed for token", contract.target, tokenId);
    } finally {
      tokenId++;
    }
  }

  if (failedAttempts === 10) {
    callback({ data: tokens, cursor: tokenId, failed: true });
  } else {
    callback({ data: tokens, cursor: tokenId });
  }

  self.close();
};
