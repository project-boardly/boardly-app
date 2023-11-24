import { abi } from 'museboard-contracts/artifacts/contracts/FollowModule.sol/FollowModule.json';
import { useContract } from './useContract';

export default function useFollowModule(address: string) {
  const contract = useContract(address, abi);

  function getFollowersCount(identifier: string) {
    return contract
      .followersCount(import.meta.env.VITE_MUSEBOARD_CONTRACT, identifier)
      .then(num => Number(num));
  }

  async function isFollowingBoard(identifier: string, follower: string) {
    const isFollowing = await contract
      .isFollowingTarget(import.meta.env.VITE_MUSEBOARD_CONTRACT, identifier, follower);

    console.log('following', isFollowing);

    return isFollowing;
  }

  async function getFollowingBoards(follower: string) {
    const count = await contract.followingCount(follower, import.meta.env.VITE_MUSEBOARD_CONTRACT);

    return Promise.all(Array(Number(count)).fill(1).map((_, idx) => { 
      return contract.followingAt(follower, import.meta.env.VITE_MUSEBOARD_CONTRACT, idx)
    }));
  }

  function getCalldata(boardId: string, type?: string) {
    if (type === 'unfollow') {
      return contract.interface.encodeFunctionData('stopFollowing', [boardId]);
    }

    return contract.interface.encodeFunctionData('startFollowing', [boardId]);
  }

  return { contract, getFollowersCount, getCalldata, isFollowingBoard, getFollowingBoards }
}