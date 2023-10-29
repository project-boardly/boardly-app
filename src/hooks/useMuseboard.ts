import { useContract } from "./useContract";
import { abi } from 'museboard-contracts/artifacts/contracts/museboard.sol/Museboard.json';
import { decodeKeyValue } from '@erc725/erc725.js/build/main/src/lib/utils';

function ipfsUrl(url: string) {
  return url.replace("ipfs://", "https://2eff.lukso.dev/ipfs/");
}

export default function useMuseboard() {
  const contract = useContract(import.meta.env.VITE_MUSEBOARD_CONTRACT, abi);

  async function getBoards(address: string) {
    const boardIds = await contract.tokenIdsOf(address);
    const boards = await Promise.all(boardIds.map(getMetadata))

    return boards.map((board) => Object.assign({ owner: address }, board));
  }

  async function getMetadata(boardId: string) {
    const owner = contract.tokenOwnerOf(boardId);

    return contract.getMetadata('metadata', boardId)
      .then((metadata) => {
        const { url } = decodeKeyValue('JSONURL', 'bytes', metadata, 'metadata');

        return fetch(ipfsUrl(url)).then(res => res.json());
      })
      .then(async (metadata) => Object.assign(metadata, { id: boardId, owner: await owner }));
  }

  async function getTokens(boardId: string) {
    return contract.getMetadata('tokens', boardId)
    .then((metadata) => {
      const data = decodeKeyValue('JSONURL', 'bytes', metadata, 'metadata');

      if (!data) { return { tokens: [] }; }

      return fetch(ipfsUrl(data.url)).then(res => res.json());
    })
    .then((data) => {
      localStorage.setItem(`board:${boardId}`, JSON.stringify({ tokens: data.tokens }));

      return data;
    });
  }

  return { contract, getBoards, getMetadata, getTokens };
}