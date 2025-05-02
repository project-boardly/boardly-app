import { useTransactionSender } from "../hooks/transactions";
import { useQuery } from "@tanstack/react-query";
import useFollowSystem from "../hooks/useFollowSystem";

export default function FollowAction({
  address,
  target,
}: {
  address: string;
  target: string;
}) {
  // const { contract } = useUniversalProfile(address);
  const { isFollowing, contract: followSystemContract } = useFollowSystem(import.meta.env.VITE_FOLLOW_SYSTEM_ADDR);
  const { sendTransaction } = useTransactionSender();
  const query = useQuery({
    queryKey: ["is-following", target],
    queryFn: () => isFollowing(address, target),
    refetchOnWindowFocus: false,
    refetchOnMount: false
  });

  async function followProfile() {
    sendTransaction(followSystemContract, "follow", [target]).then(() =>
      query.refetch(),
    );
  }

  async function unfollowProfile() {
    sendTransaction(followSystemContract, "unfollow", [target]).then(() =>
      query.refetch(),
    );
  }

  if (query.isLoading) {
    return <p className="text-center">Loading</p>;
  }

  if (query.data) {
    return (
      <button
        onClick={() => unfollowProfile()}
        className="w-full backdrop-blur-md bg-white/10 hover:bg-white/30 text-white font-bold py-2 rounded-xl shadow-lg"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-6 h-6 inline mr-2"
        >
          <g clipPath="url(#clip0_690_7820)">
            <path
              d="M13.5 8C13.5 5.79 11.71 4 9.5 4C7.29 4 5.5 5.79 5.5 8C5.5 10.21 7.29 12 9.5 12C11.71 12 13.5 10.21 13.5 8ZM11.5 8C11.5 9.1 10.6 10 9.5 10C8.4 10 7.5 9.1 7.5 8C7.5 6.9 8.4 6 9.5 6C10.6 6 11.5 6.9 11.5 8Z"
              fill="white"
            />
            <path
              d="M1.5 18V20H17.5V18C17.5 15.34 12.17 14 9.5 14C6.83 14 1.5 15.34 1.5 18ZM3.5 18C3.7 17.29 6.8 16 9.5 16C12.19 16 15.27 17.28 15.5 18H3.5Z"
              fill="white"
            />
            <path d="M22.5 10H16.5V12H22.5V10Z" fill="white" />
          </g>
          <defs>
            <clipPath id="clip0_690_7820">
              <rect width="24" height="24" fill="white" />
            </clipPath>
          </defs>
        </svg>
        Unfollow
      </button>
    );
  }

  return (
    <button
      onClick={() => followProfile()}
      className="w-full backdrop-blur-md  bg-white/20 hover:bg-white/50 text-white font-bold py-2 rounded-xl shadow-lg"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-6 h-6 inline mr-2"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z"
        />
      </svg>
      Follow
    </button>
  );
}
