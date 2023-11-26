/* This example requires Tailwind CSS v2.0+ */
import { Fragment, useContext, useEffect, useState } from "react";
import { Transition, Dialog } from "@headlessui/react";

import NiceModal, { useModal } from "@ebay/nice-modal-react";
import { TBoard, TToken, matchTokens, useBoardsQuery } from "../queries/boards";

import { upload } from "../utils/ipfs";
import { abi } from "museboard-contracts/artifacts/contracts/museboard.sol/Museboard.json";
import { useContract } from "../hooks/useContract";
import { useTransactionSender } from "../hooks/transactions";

import toast from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
import useMuseboard from "../hooks/useMuseboard";
import { create } from "blockies-ts";
import { ConnectWallet } from "../common/components";
import { CheckCircleIcon } from "@heroicons/react/24/outline";
import UserContext from "../contexts/UserContext";
import useLitNetwork from "../hooks/useLitNetwork";
import { getPrivateBoardConditions } from "../contexts/LitNetworkContext";

function ipfsUrl(url: string) {
  return url.replace("ipfs://", "https://2eff.lukso.dev/ipfs/");
}

export function Loader() {
  return (
    <div className="p-4 mx-auto w-20" role="status">
      <svg
        aria-hidden="true"
        className="mr-2 w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
        viewBox="0 0 100 101"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
          fill="currentColor"
        />
        <path
          d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
          fill="currentFill"
        />
      </svg>
      <span className="sr-only">Loading...</span>
    </div>
  );
}

function InlineMuseboard({
  board,
  addToBoard,
  token,
  removeFromBoard,
}: {
  board: TBoard;
  token: TToken;
  addToBoard: (boardId: string) => Promise<any>;
  removeFromBoard: (boardId: string) => Promise<any>;
}) {
  const { getTokens } = useMuseboard();
  const query = useQuery({
    queryKey: ["board:tokens", board.id],
    queryFn: () => getTokens(board.id as string),
  });
  const [image] = useState(
    board.logo
      ? ipfsUrl(board.logo)
      : create({
          seed: `${board?.owner}:${board.id}`,
          scale: 40,
          bgcolor: "#f1f1f1",
        }).toDataURL()
  );
  const [tokenExists, setTokenExists] = useState(false);

  useEffect(() => {
    if (!query.data) {
      return;
    }

    const tokens = query.data.tokens;

    const matchedToken = tokens.find((_target: TToken) =>
      matchTokens(_target, token)
    );

    setTokenExists(!!matchedToken);

    console.log(matchedToken, token, tokens);
  }, [query.data]);

  return (
    <a
      className={`flex flex-row rounded-xl  w-full px-4 py-4 group cursor-pointer ${
        tokenExists ? "bg-gray-100" : "hover:bg-gray-100"
      }`}
      onClick={() =>
        !query.isLoading &&
        (tokenExists ? removeFromBoard(board.id) : addToBoard(board.id))
      }
    >
      <img
        className="inline rounded-xl mr-4 w-12 h-12"
        src={board.image || image}
      />
      <div className="flex flex-col grow">
        <div>{board.name}</div>
        {!query.isLoading && (
          <div className="flex flex-row space-x-2">
            <small className="font-normal text-gray-500">
              {query.data.tokens.length} tokens
            </small>
            {board.privateBoard && (
              <small className="font-normal text-gray-500 border-l-2 pl-2">
                Private
              </small>
            )}
          </div>
        )}
      </div>
      {tokenExists && (
        <div className="text-center text-gray-600 group-hover:invisible group-hover:w-0">
          <CheckCircleIcon height={24} width={24} className="mx-auto" />
          <small className="text-xs">Added</small>
        </div>
      )}
      <div className="text-center text-gray-600 invisible w-0 group-hover:w-auto group-hover:visible my-auto">
        <small className="text-xs">{tokenExists ? "Remove" : "Add"}</small>
      </div>
    </a>
  );
}

function InlineCreateNew({ create }: { create: (name: string) => void }) {
  const [_name, setName] = useState<string>("");
  const [started, setStarted] = useState(false);

  function handleSubmit(e: any) {
    e.preventDefault();

    create(_name);
  }

  if (started) {
    return (
      <form onSubmit={handleSubmit}>
        <div className="w-full rounded-xl bg-gradient-to-tr to-purple-500 from-cyan-500 p-1">
          <div className="bg-white rounded-xl">
            <div className="flex flex-row space-x-2">
              <div className="grow">
                <input
                  className="w-full h-full focus-visible:outline-none px-2 rounded-xl"
                  onChange={(e: any) => setName(e.target.value)}
                  placeholder="museboard title"
                />
              </div>
              <div className="w-12">
                <button
                  type="submit"
                  className="w-full py-4 px-2"
                  onClick={() => create(_name)}
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="inline mr-2"
                  >
                    <path
                      d="M13 7H11V11H7V13H11V17H13V13H17V11H13V7ZM12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z"
                      fill="#4F4F4F"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    );
  }

  return (
    <a
      className="text-center block font-semibold bg-gray-200 hover:shadow-lg rounded-lg cursor-pointer py-4"
      onClick={() => setStarted(true)}
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="inline mr-2"
      >
        <path
          d="M13 7H11V11H7V13H11V17H13V13H17V11H13V7ZM12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z"
          fill="#4F4F4F"
        />
      </svg>
      Create New
    </a>
  );
}

const AddToMuseboard = NiceModal.create(() => {
  const modal = useModal();
  const user = useContext(UserContext);
  const { query, addNew, addTokenToBoard, removeTokenFromBoard } =
    useBoardsQuery(user?.uid as string);
  const { getBoards } = useMuseboard();
  const onchainBoardsQuery = useQuery({
    queryKey: ["onchain:boards", user?.uid],
    queryFn: () => getBoards(user?.uid as string),
  });
  const contract = useContract(import.meta.env.VITE_MUSEBOARD_CONTRACT, abi);
  const { sendTransaction } = useTransactionSender();
  const { encrypt } = useLitNetwork();
  const [loading, setLoading] = useState({ status: 0, message: "Not Loading" });
  const [error, setError] = useState<string | null>(null);

  async function createNew(boardName: string) {
    if (!user) {
      window.alert("Not authenticated");

      return;
    }

    setError(null);
    setLoading({ status: 1, message: "Uploading to IPFS" });

    try {
      const [metadata, tokens] = await Promise.all([
        upload({ name: boardName, owner: user.uid }),
        upload({ tokens: [modal.args] }),
      ]);

      setLoading({ status: 1, message: "Commiting changes to blockchain" });

      const txn = sendTransaction(contract, "mint", [
        metadata.jsonurl,
        tokens.jsonurl,
      ]);

      toast.promise(txn, {
        loading: "Preparing and sending transaction",
        success: "Transaction sent",
        error: "Unable to send transaction",
      });

      await txn;

      setLoading({ status: 0, message: "Not Loading" });

      const boardId = addNew(boardName, [modal.args as TToken]);

      modal.resolve({ boardId });
      modal.hide();
      query.refetch();
    } catch (err: any) {
      console.log(err);
      setLoading({ status: 0, message: "Not Loading" });
      setError(err.message);
    }
  }

  async function handleAddTokenToBoard(boardId: string, privateBoard: boolean) {
    setError(null);
    setLoading({ status: 1, message: "Uploading to IPFS" });

    try {
      const _board = addTokenToBoard(boardId, modal.args as TToken);

      const data: any = { private: privateBoard };

      if (privateBoard) {
        const conditions = getPrivateBoardConditions(user?.uid as string);

        setLoading({ status: 1, message: "Encrypting tokens information" });
        const { ciphertext, hash } = await encrypt(JSON.stringify(_board.tokens), conditions);

        data.ciphertext = ciphertext;
        data.hash = hash;
        data.conditions = conditions;
      } else {
        data.tokens = _board.tokens;
      }

      console.log('data to be uploaded', data);
      const tokens = await upload(data);

      setLoading({ status: 1, message: "Commiting changes to blockchain" });
      await sendTransaction(contract, "updateMetadata", [
        "tokens",
        boardId,
        tokens.jsonurl,
      ]);

      modal.resolve({ boardId });
      modal.hide();
      query.refetch();
    } catch (err: any) {
      if (err.code === "ACTION_REJECTED") {
        setError("User rejected the transaction");
      } else {
        console.error(err);

        setError("That did't go as expected. We'll take a look into this.");
      }

      setLoading({ status: 0, message: "Not Loading" });
      setError(err.message);
    }
  }

  async function handleRemoveTokenFromBoard(
    boardId: string,
    privateBoard: boolean
  ) {
    setError(null);
    setLoading({ status: 1, message: "Uploading to IPFS" });

    try {
      const _board = removeTokenFromBoard(boardId, modal.args as TToken);
      const data: any = { private: privateBoard };

      if (privateBoard) {
        const conditions = getPrivateBoardConditions(user?.uid as string);

        setLoading({ status: 1, message: "Encrypting tokens information" });
        const { ciphertext, hash } = await encrypt(JSON.stringify(_board.tokens), conditions);

        data.ciphertext = ciphertext;
        data.hash = hash;
        data.conditions = conditions;
      } else {
        data.tokens = _board.tokens;
      }

      const tokens = await upload(data);

      setLoading({ status: 1, message: "Commiting changes to blockchain" });
      await sendTransaction(contract, "updateMetadata", [
        "tokens",
        boardId,
        tokens.jsonurl,
      ]);

      modal.resolve({ boardId });
      modal.hide();
      query.refetch();
    } catch (err: any) {
      if (err.code === "ACTION_REJECTED") {
        setError("User rejected the transaction");
      } else {
        console.error(err);

        setError("That did't go as expected. We'll take a look into this.");
      }

      setLoading({ status: 0, message: "Not Loading" });
      setError(err.message);
    }
  }

  function renderContent() {
    if (loading.status !== 0) {
      return (
        <div className="flex flex-col space-y-2 text-center my-2">
          <Loader />
          <p>{loading.message}</p>
        </div>
      );
    }

    if (!user) {
      return (
        <div className="flex justify-center flex-col space-y-2">
          <p className="text-center">
            Please connect wallet to add tokens to museboard
          </p>
          <ConnectWallet
            onChange={console.log}
            // onChange={(address) => setLoading({ status: address ? 0: 1, message: address ? 'Not Loading' : 'Waiting for authentication' } )}
          />
        </div>
      );
    }

    return (
      <>
        {error && (
          <span className="px-2 py-4 border rounded-xl border-red-900 text-red-900 bg-red-200 w-full">
            {error}
          </span>
        )}
        {loading.status === 0 && onchainBoardsQuery.isLoading && (
          <p>Loading boards</p>
        )}
        {loading.status === 0 && !onchainBoardsQuery.isLoading && (
          <ul>
            {onchainBoardsQuery.data &&
              onchainBoardsQuery.data.map((board: TBoard) => (
                <li key={board.id} className="my-2 font-semibold">
                  <InlineMuseboard
                    board={board}
                    token={modal.args as TToken}
                    addToBoard={(boardId) =>
                      handleAddTokenToBoard(boardId, board.privateBoard)
                    }
                    removeFromBoard={(boardId) =>
                      handleRemoveTokenFromBoard(boardId, board.privateBoard)
                    }
                  />
                </li>
              ))}
            <li>
              {/* <a className="text-center block font-semibold bg-gray-200 hover:shadow-lg rounded-lg cursor-pointer py-4" onClick={() => createNew()}>Create New</a> */}
              <InlineCreateNew create={(name) => createNew(name)} />
            </li>
          </ul>
        )}
      </>
    );
  }

  return (
    <Transition appear show={modal.visible} as={Fragment}>
      <Dialog as="div" className="relative z-8" onClose={modal.remove}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-16 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white px-6 py-8  text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h2"
                  className="text-2xl pl-4 font-medium leading-6 text-gray-900 text-center"
                >
                  Add to museboard
                </Dialog.Title>
                <Dialog.Description
                  as="p"
                  className="text-center px-8 mt-4 text-gray-400"
                ></Dialog.Description>
                {renderContent()}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
});

export default AddToMuseboard;
