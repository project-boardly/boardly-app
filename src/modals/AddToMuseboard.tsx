/* This example requires Tailwind CSS v2.0+ */
import { Fragment, useState } from "react";
import { Transition, Dialog } from "@headlessui/react";

import NiceModal, { useModal } from "@ebay/nice-modal-react";
// import { useTransactionSender } from "../hooks/transactions";
import { getAuth } from "firebase/auth";
import { generateSlug } from "random-word-slugs";
import { TBoard, TToken, useBoardsQuery } from "../queries/boards";

import { upload } from "../utils/ipfs";
import { abi } from 'museboard-contracts/artifacts/contracts/museboard.sol/Museboard.json';
import { useContract } from "../hooks/useContract";
import { useTransactionSender } from "../hooks/transactions";

import toast from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
import useMuseboard from "../hooks/useMuseboard";
import { create } from "blockies-ts";

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

function InlineMuseboard({ board, addToBoard }: { board: TBoard, addToBoard: (boardId: string) => Promise<any> }) {
  const { getTokens } = useMuseboard(); 
  const query = useQuery({ queryKey: ['board:tokens', board.id], queryFn: () => getTokens(board.id as string) })
  const [image] = useState(board.image ? board.image : create({ seed: `${board?.owner}:${board.id}`, scale: 40, bgcolor: '#f1f1f1' }).toDataURL());

  return <a className="flex flex-row rounded-lg hover:bg-gray-100 cursor-pointer w-full px-4 py-4" onClick={() => addToBoard(board.id) }>
    <img className="inline rounded-lg mr-4 w-12" src={board.image || image}/>
    <div className="flex flex-col">
      <div>{board.name}</div>
      { !query.isLoading && <small className="font-normal text-gray-500">{query.data.tokens.length} tokens</small> }
    </div>
  </a>
}

const AddToMuseboard = NiceModal.create(() => {
  const user = getAuth().currentUser;
  const modal = useModal();
  const [boardName, setBoardName] = useState<string>(generateSlug());
  const { query, addNew, addTokenToBoard } = useBoardsQuery(user?.uid as string);
  const { getBoards } = useMuseboard();
  const onchainBoardsQuery = useQuery({ queryKey: ['onchain:boards', user?.uid], queryFn: () => getBoards(user?.uid as string) });
  const contract = useContract(import.meta.env.VITE_MUSEBOARD_CONTRACT, abi);
  const { sendTransaction } = useTransactionSender();
  const [loading, setLoading] = useState({ status: 0, message: 'Not Loading' });
  const [error, setError] = useState<string|null>(null);

  async function createNew () {
    if (!user) {
      window.alert('Not authenticated');

      return;
    }

    setError(null);
    setLoading({ status: 1, message: 'Uploading to IPFS' });

    try {
      const [metadata, tokens] = await Promise.all([
        upload({ name: boardName, owner: user.uid }),
        upload({ tokens: [modal.args] })
      ])
  
      setLoading({ status: 1, message: 'Commiting changes to blockchain' });

      const txn = sendTransaction(contract, 'mint', [metadata.jsonurl, tokens.jsonurl]);

      toast.promise(txn, {
        loading: 'Preparing and sending transaction',
        success: 'Transaction sent',
        error: 'Unable to send transaction'
      });

      await txn;

      setLoading({ status: 0, message: 'Not Loading' });

      const boardId = addNew(boardName, [modal.args as TToken]);
      setBoardName(generateSlug());

      modal.resolve({ boardId });
      modal.hide();
      query.refetch();
    } catch (err: any) {
      console.log(err);
      setLoading({ status: 0, message: 'Not Loading' });
      setError(err.message);
    }
  }

  async function handleAddTokenToBoard(boardId: string) {
    setError(null);
    setLoading({ status: 1, message: 'Uploading to IPFS' });

    try {
      const _board = addTokenToBoard(boardId, modal.args as TToken);
      const tokens = await upload({ tokens: _board.tokens });

      setLoading({ status: 1, message: 'Commiting changes to blockchain' });
      const txn = sendTransaction(contract, 'updateMetadata', ['tokens', boardId, tokens.jsonurl]);

      toast.promise(txn, {
        loading: 'Preparing and sending transaction',
        success: 'Transaction sent',
        error: 'Unable to send transaction'
      });

      await txn;

      modal.resolve({ boardId });
      modal.hide();
      query.refetch();
    } catch (err: any) {
      console.log(err);
      setLoading({ status: 0, message: 'Not Loading' });
      setError(err.message);
    }
  }

  return (
    <Transition appear show={modal.visible} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={modal.remove}>
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
                >
                </Dialog.Description>
                { error && <span className="px-2 py-4 border rounded-xl border-red-900 text-red-900 bg-red-200 w-full">{error}</span>}
                { loading.status !== 0 && <div className="flex flex-col space-y-2 text-center my-2">
                  <Loader />
                  <p>{loading.message}</p>
                </div> }
                {loading.status === 0 && onchainBoardsQuery.isLoading && <p>Loading boards</p>}
                { loading.status === 0 && !onchainBoardsQuery.isLoading && <ul>
                  { onchainBoardsQuery.data && onchainBoardsQuery.data.map((board: TBoard) => <li key={board.id} className="my-2 font-semibold">
                    <InlineMuseboard board={board} addToBoard={(boardId) => handleAddTokenToBoard(boardId)} />
                  </li>) }
                  <li><a className="text-center block font-semibold bg-gray-200 hover:shadow-lg rounded-lg cursor-pointer py-4" onClick={() => createNew()}>Create New</a></li>
                </ul>}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
});

export default AddToMuseboard;
