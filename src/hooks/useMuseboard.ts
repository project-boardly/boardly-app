import { useContract } from "./useContract";
import { abi } from 'museboard-contracts/artifacts/contracts/museboard.sol/Museboard.json';
import { decodeKeyValue } from '@erc725/erc725.js/build/main/src/lib/utils';
import { useQueryClient } from "@tanstack/react-query";

function ipfsUrl(url: string) {
  return url.replace("ipfs://", "https://2eff.lukso.dev/ipfs/");
}

export default function useMuseboard() {
  const queryClient = useQueryClient();
  const contract = useContract(import.meta.env.VITE_MUSEBOARD_CONTRACT, abi);

  async function getBoards(address: string) {
    const boardIds = await contract.tokenIdsOf(address);
    const boards = await Promise.all(boardIds.map(getMetadata))

    return boards;
  }

  async function getMetadata(boardId: string) {
    return contract.getMetadata('metadata', boardId)
      .then((metadata) => {
        const { url } = decodeKeyValue('JSONURL', 'bytes', metadata, 'metadata');

        return fetch(ipfsUrl(url)).then(res => res.json());
      })
      .then((metadata) => Object.assign(metadata, { id: boardId }));
  }

  async function getTokens(boardId: string) {
    return contract.getMetadata('tokens', boardId)
    .then((metadata) => {
      const { url } = decodeKeyValue('JSONURL', 'bytes', metadata, 'metadata');

      return fetch(ipfsUrl(url)).then(res => res.json());
    })
    .then((data) => {
      localStorage.setItem(`board:${boardId}`, JSON.stringify({ tokens: data.tokens }));

      return data;
    });
  }

  return { contract, getBoards, getMetadata, getTokens };
}