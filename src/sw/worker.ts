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

export const fetchTokens = async (
  meta: CollectionMeta,
  startAt: number,
  pageSize: number,
  callback: any,
  onToken: (token: any) => void,
) => {
  const contract = new Contract(
    meta.address,
    meta.standard === "ERC721" ? ERC721 : ERC1155,
    providers[meta.chain],
  );

  meta.chain === "lukso" && console.log(meta);

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
