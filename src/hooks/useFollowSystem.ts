import { abi } from "../common/LSP26FollowerSystem.json";
import { useContract } from "./useContract";
import { getAddress } from "ethers";

export default function useFollowSystem(address: string) {
  const contract = useContract(address, abi);

  function getFollowersCount(target: string) {
    return contract
      .followerCount(target)
      .then((num) => Number(num));
  }

  function getFollowingCount(addr: string) {
    return contract
      .followingCount(addr)
      .then((num) => Number(num));
  }

  async function isFollowing(
    follower: string,
    target: string,
  ) {
    const isFollowing = await contract.isFollowing(
      follower,
      target,
    );

    return isFollowing;
  }

  async function getFollowingList(follower: string) {
    const count = await contract.followingCount(getAddress(follower));

    return contract.getFollowsByIndex(follower, 0, Number(count));
  }

  async function getFollowersList(target: string) {
    const count = await contract.followerCount(getAddress(target));

    const list = await contract.getFollowersByIndex(target, 0, Number(count));

    return list;
  }

  return {
    contract,
    getFollowersCount,
    getFollowingCount,
    isFollowing,
    getFollowingList,
    getFollowersList,
  };
}
