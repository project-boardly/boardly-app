import { useContract } from "./useContract";
import { abi } from 'museboard-contracts/artifacts/contracts/museboard.sol/Museboard.json';
import { decodeKeyValue } from '@erc725/erc725.js/build/main/src/lib/utils';
import useLitNetwork from "./useLitNetwork";
import { getPrivateBoardConditions } from "../contexts/LitNetworkContext";
import { useContext } from "react";
import UserContext from "../contexts/UserContext";
import { upload } from "../utils/ipfs";
import { useTransactionSender } from "./transactions";

function ipfsUrl(url: string) {
  return url.replace("ipfs://", "https://2eff.lukso.dev/ipfs/");
}

export default function useMuseboard() {
  const user = useContext(UserContext);
  const contract = useContract(import.meta.env.VITE_MUSEBOARD_CONTRACT, abi);
  const { sendTransaction } = useTransactionSender();
  const { encrypt, decrypt } = useLitNetwork();

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
    .then(async (data) => {
      if (data.private) {
        const tokens = await decrypt(data.ciphertext, data.hash, data.conditions);

        data.tokens = JSON.parse(tokens);
      }

      localStorage.setItem(`board:${boardId}`, JSON.stringify({ tokens: data.tokens }));

      return data;
    })
  }

  async function updateMetadata(boardId: string, namespace: string, data: any, shouldEncrypt: boolean, onChange: (status: any) => void) {
    const tokensData: any = { private: shouldEncrypt };

    if (shouldEncrypt) {
      onChange({ status: 1, message: "Encrypting tokens information" });
      const conditions = getPrivateBoardConditions(user?.uid as string);

      const { ciphertext, hash } = await encrypt(JSON.stringify(data.tokens), conditions);

      tokensData.ciphertext = ciphertext;
      tokensData.hash = hash;
      tokensData.conditions = conditions;
    }
    else {
      tokensData.tokens = data.tokens;
    }

    const tokens = await upload(tokensData);

    onChange({ status: 1, message: `Commiting ${shouldEncrypt ? 'encrypted' : ''} tokens to blockchain` });
    await sendTransaction(contract, "updateMetadata", [
      namespace,
      boardId,
      tokens.jsonurl,
    ]);
  }

  return { contract, getBoards, getMetadata, getTokens, updateMetadata };
}