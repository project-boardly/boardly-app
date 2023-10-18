import { Contract, JsonRpcProvider } from "ethers";

import { abi } from 'museboard-contracts/artifacts/@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol/ERC721Enumerable.json';

export const providers: any = {
  'ethereum': new JsonRpcProvider('https://eth-mainnet.g.alchemy.com/v2/2eEiw8W63XB1bzIk-2XJHxPbZreVtM8V')
};

export const ERC721 = abi;

export function useCollection (chain: string, address: string) {
  const provider = providers[chain];
  const collection = new Contract(address, abi, provider);

  async function fetchTokens(startAt = 0, pageSize = 20) {
    let count = 0,
      tokenId = startAt;

    const tokens = [];

    while (count < pageSize) {
      try {
        const tokenUri = await collection.tokenURI(tokenId);

        tokens.push({ id: tokenId, metadata: tokenUri.replace('ipfs://', 'https://ipfs.io/ipfs/') });
        count++;
      } catch (error) {
        console.log('failed for token', tokenId)
      } finally {
        tokenId++;
      }
    }

    return { data: tokens, cursor: tokenId };
  }

  return {
    fetchTokens,
    contract: collection
  };
}