import { abi } from 'museboard-contracts/artifacts/contracts/FollowModule.sol/FollowModule.json';
import { useContract } from './useContract';
import { getAddress } from 'ethers';

export default function useFollowModule(address: string) {
  const contract = useContract(address, abi);

  function getFollowersCount(identifier: string, target: string) {
    return contract
      .followersCount(target, identifier)
      .then(num => Number(num));
  }

  async function isFollowing(identifier: string, follower: string, target: string) {
    const isFollowing = await contract
      .isFollowingTarget(target, identifier, follower);

    return isFollowing;
  }

  async function getFollowingList(follower: string, target: string) {
    const count = await contract.followingCount(follower, target);

    return Promise.all(Array(Number(count)).fill(1).map((_, idx) => { 
      return contract.followingAt(follower, target, idx)
    }));
  }

  async function getFollowersList(identifier: string, target: string) {
    console.log('get followers list');

    const count = await contract.followersCount(getAddress(target), identifier);    

    return Promise.all(Array(Number(count)).fill(1).map((_, idx) => { 
      return contract.followerAtIndex(getAddress(target), identifier, idx)
    }));
  }

  function getCalldata(boardId: string, type?: string) {
    if (type === 'unfollow') {
      return contract.interface.encodeFunctionData('stopFollowing', [boardId]);
    }

    return contract.interface.encodeFunctionData('startFollowing', [boardId]);
  }

  return { contract, getFollowersCount, getCalldata, isFollowing, getFollowingList, getFollowersList }
}