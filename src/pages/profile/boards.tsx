import { useEffect, useState } from "react";

import {
  LockClosedIcon,
  PlusCircleIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";

import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { create } from "blockies-ts";
import { useModal } from "@ebay/nice-modal-react";
import { TBoard, useBoardsQuery } from "../../queries/boards";

import useBoards from "../../hooks/useMuseboard";
// import useFollowModule from "../../hooks/useFollowModule";
import useUser from "../../hooks/useUser";

function ipfsUrl(url: string) {
  return url.replace("ipfs://", "http://localhost:3000/ipfs/");
}

function Museboard({ board }: { board: TBoard }) {
  const [image] = useState(
    board.logo
      ? ipfsUrl(board.logo)
      : create({
          seed: `${board?.owner}:${board.id}`,
          scale: 40,
          bgcolor: "#f1f1f1",
          // spotcolor: 'rgba(0,0,0,0.6)',
          // color: 'rgba(0,0,0, 0.4)'
        }).toDataURL(),
  );

  function BoardIcon({ board }: { board: TBoard }) {
    if (board.followersOnly) {
      return <UsersIcon className="inline h-4 mr-2" />;
    }

    if (board.privateBoard) {
      return <LockClosedIcon className="inline h-4 mr-2" />;
    }

    return <></>;
  }

  return (
    <Link to={`/board/${board.id}`} className="group aspect-square">
      <img
        src={image}
        className="rounded-3xl bg-gradient-to-tr to-purple-500 from-cyan-500 hover:p-1 transition-all duration-500 hover:shadow-xl w-full aspect-square object-cover"
      />
      <p className="text-center font-semibold mt-4">
        <BoardIcon board={board} /> {board.name}
      </p>
    </Link>
  );
}

function MuseboardList({ address }: { address: string }) {
  const { query } = useBoardsQuery(address);
  const { getBoards } = useBoards();
  const onchainBoardsQuery = useQuery({
    queryKey: ["onchain:boards", address],
    queryFn: () => getBoards(address),
  });

  if (query.isLoading) {
    return <p>Loading</p>;
  }

  if (onchainBoardsQuery.isLoading) {
    return <p>Loading onchain boards</p>;
  }

  return (
    <>
      {onchainBoardsQuery.data &&
        onchainBoardsQuery.data.map((board: TBoard) => (
          <Museboard key={board.id} board={board} />
        ))}
    </>
  );
}

function MuseboardContainer({ boardId }: { boardId: string }) {
  const { getMetadata } = useBoards();
  const query = useQuery({
    queryKey: ["board:metadata", boardId],
    queryFn: () => getMetadata(boardId as string),
  });
  const [image, setImage] = useState<string | null>(null);

  useEffect(() => {
    if (!query.data) {
      return;
    }

    setImage(
      create({
        seed: `${query.data.owner}:${query.data.id}`,
        scale: 40,
        bgcolor: "#f1f1f1",
      }).toDataURL(),
    );
  }, [query.data]);

  if (query.isLoading) {
    return <p>Loading</p>;
  }

  return <Museboard board={Object.assign({ logo: image }, query.data)} />;
}

// function FollowingMuseboardList({ address }: { address: string }) {
//   const { getFollowingList } = useFollowModule(
//     import.meta.env.VITE_FOLLOW_SYSTEM_ADDR,
//   );
//   const query = useQuery({
//     queryKey: ["profile", address, "following-boards"],
//     queryFn: () =>
//       getFollowingList(address, import.meta.env.VITE_BOARDS_CONTRACT),
//   });

//   if (query.isLoading) {
//     return <p>Loading</p>;
//   }

//   return (
//     <>
//       {query.data &&
//         query.data.map((boardId: string) => (
//           <MuseboardContainer key={boardId} boardId={boardId} />
//         ))}
//     </>
//   );
// }

export default function Boards() {
  const { user, loading: userLoading } = useUser();
  const newMuseboardModal = useModal("create-museboard");
  const { address } = useParams();

  function openModal() {
    if (userLoading) {
      return;
    }

    newMuseboardModal.show({ authUser: user?.uid });
  }

  return (
    <section id="owned-nfts">
      <h4 className="text-gray-500 py-4">OWNED</h4>
      <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4">
        {user?.uid === address && (
          <div className="group transition-all duration-700">
            <button
              onClick={() => openModal()}
              className="w-full aspect-square bg-gray-200 hover:bg-gradient-to-tr to-purple-500 from-cyan-500 rounded-3xl"
            >
              <PlusCircleIcon className="h-10 w-10 mx-auto group-hover:text-white" />
            </button>
            <p className="text-center font-semibold mt-4">Create New</p>
          </div>
        )}
        <MuseboardList address={address as string} />
      </div>
      {/* <h4 className="text-gray-500 py-4">FOLLOWING</h4>
      <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4">
        <FollowingMuseboardList address={address as string} />
      </div> */}
    </section>
  );
}
