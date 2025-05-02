import { useContract } from "./useContract";
import { abi } from "boardly-contracts/artifacts/contracts/Boards.sol/Boards.json";
import { decodeKeyValue } from "@erc725/erc725.js/build/main/src/lib/utils";
import useLitNetwork from "./useLitNetwork";
import {
  getFollowerOnlyBoardConditions,
  getPrivateBoardConditions,
} from "../contexts/LitNetworkContext";
import { useContext } from "react";
import UserContext from "../contexts/UserContext";
import { upload } from "../utils/ipfs";
import { useTransactionSender } from "./transactions";

function ipfsUrl(url: string) {
  return url.replace("ipfs://", "http://localhost:3000/ipfs/");
}

const TOKENS_DATA_KEY =
  "0x680989b8ba4329dbb34fe099c4644fce6e521152facc82d70e978bdc51facd5c";
const BOARD_METADATA_KEY =
  "0x9afb95cacc9f95858ec44aa8c3b685511002e30ae54415823f406128b85b238e";

export default function useMuseboard() {
  const user = useContext(UserContext);
  const contract = useContract(import.meta.env.VITE_BOARDS_CONTRACT, abi);
  const { sendTransaction } = useTransactionSender();
  const litHelper = useLitNetwork();

  async function getBoards(address: string) {
    const boardIds = await contract.tokenIdsOf(address);
    const boards = await Promise.all(boardIds.map(getMetadata));

    return boards.map((board) => Object.assign({ owner: address }, board));
  }

  async function getMetadata(boardId: string) {
    const owner = contract.tokenOwnerOf(boardId);

    return contract
      .getDataForTokenId(boardId, BOARD_METADATA_KEY)
      .then((metadata) => {
        const { url } = decodeKeyValue(
          "JSONURL",
          "bytes",
          metadata,
          "metadata",
        );

        return fetch(ipfsUrl(url)).then((res) => res.json());
      })
      .then(async (metadata) =>
        Object.assign(metadata, { id: boardId, owner: await owner }),
      );
  }

  async function getTokens(boardId: string) {
    return contract
      .getMetadata(boardId, TOKENS_DATA_KEY)
      .then((metadata) => {
        const data = decodeKeyValue("JSONURL", "bytes", metadata, "metadata");

        if (!data) {
          return { tokens: [] };
        }

        return fetch(ipfsUrl(data.url)).then((res) => res.json());
      })
      .then(async (data) => {
        if (data.private) {
          try {
            const tokens = await litHelper?.decrypt(
              data.ciphertext,
              data.hash,
              data.conditions
            );

            data.tokens = JSON.parse(tokens);
          } catch (err: any) {
            if (err.status === 401) {
              data.encrypted = true;
            } else {
              console.log(err);
            }
          }
        }

        localStorage.setItem(`board:${boardId}`, JSON.stringify(data));

        return data;
      });
  }

  async function updateMetadata(
    boardId: string,
    namespace: string,
    data: any,
    shouldEncrypt: boolean,
    followersOnly: boolean,
    onChange: (status: any) => void,
  ) {
    const tokensData: any = {
      private: shouldEncrypt,
      followersOnly,
    };

    if (shouldEncrypt) {
      onChange({ status: 1, message: "Encrypting tokens information" });

      const conditions = followersOnly
        ? getFollowerOnlyBoardConditions(user?.uid as string)
        : getPrivateBoardConditions(user?.uid as string);

      const { ciphertext, hash } = await litHelper?.encrypt(
        JSON.stringify(data.tokens || []),
        conditions
      );

      tokensData.ciphertext = ciphertext;
      tokensData.hash = hash;
      tokensData.conditions = conditions;
    } else {
      tokensData.tokens = data.tokens;
    }

    const tokens = await upload(tokensData);

    onChange({
      status: 1,
      message: `Commiting ${shouldEncrypt ? "encrypted" : ""} tokens to blockchain`,
    });
    await sendTransaction(contract, "updateMetadata", [
      namespace,
      boardId,
      tokens.jsonurl,
    ]);
  }

  return { contract, getBoards, getMetadata, getTokens, updateMetadata };
}
