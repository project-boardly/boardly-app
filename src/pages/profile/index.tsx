import { useEffect, useState } from "react";

import safeGet from "lodash/get";

import { PlusCircleIcon } from "@heroicons/react/24/outline";

import {
  Link,
  NavLink,
  Outlet,
  useNavigation,
  useParams,
} from "react-router-dom";
import { create } from "blockies-ts";
import { getAuth } from "firebase/auth";
import { useModal } from "@ebay/nice-modal-react";
import { getAddress, zeroPadValue } from "ethers";

import FollowAction from "../../common/FollowAction";
import { Address } from "../../common/components";

import { useProfileQuery } from "../../queries/profiles";

import useFollowModule from "../../hooks/useFollowModule";
import useUser from "../../hooks/useUser";
import useUniversalProfile from "../../hooks/useUniversalProfile";

function ipfsUrl(url: string) {
  return url.replace("ipfs://", "https://2eff.lukso.dev/ipfs/");
}

const _FOLLOWING_ARRAY_KEY =
  "0xd62c218b4cee2c6cd2453415e67c5ffaa3220349ed84a836e45f1fc38c24f476";

function FollowInfo({ address }: { address: string }) {
  const { getFollowersCount } = useFollowModule(
    import.meta.env.VITE_FOLLOW_MODULE
  );
  const { contract } = useUniversalProfile(address);
  const [stats, setStats] = useState({
    following: 0,
    followers: 0,
  });
  const followingModal = useModal("list-following");
  const followersModal = useModal("list-followers");

  useEffect(() => {
    const identifier = zeroPadValue(address, 32);

    Promise.all([
      getFollowersCount(identifier, import.meta.env.VITE_UP_FOLLOW_SYSTEM),
      contract.getData(_FOLLOWING_ARRAY_KEY),
    ]).then(([followers, following]) => {
      setStats({
        followers,
        following: following === "0x" ? 0 : Number(BigInt(following)),
      });
    });
  }, []);

  return (
    <div className="flex row">
      <a onClick={() => followingModal.show({ address })}>
        <span className="text-gray-400">Following</span>{" "}
        <span className="font-bold">{stats.following}</span>
      </a>
      <a
        className="mx-4"
        onClick={() =>
          followersModal.show({
            identifier: zeroPadValue(address, 32),
            target: import.meta.env.VITE_UP_FOLLOW_SYSTEM,
          })
        }
      >
        <span className="text-gray-400">Followers</span>{" "}
        <span className="font-bold">{stats.followers}</span>
      </a>
    </div>
  );
}

function ProfileCard({ address }: { address: string }) {
  const { user, loading: authUserLoading } = useUser();
  const { query } = useProfileQuery(address);
  const backgroundImage = ipfsUrl(
    safeGet(query, "data.backgroundImage.0.url", "")
  );

  if (query.isLoading) {
    return <p>Loading</p>;
  }

  if (!query.data) {
    return <p>This address is not a universal profile</p>;
  }

  return (
    <div
      className="max-w-7xl mx-auto bg-cover bg-center shadow-2xl rounded-xl overflow-hidden"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="backdrop-blur-md bg-black/50">
        <div className="max-w-sm mx-auto py-10 text-white">
          <div className="flex flex-row">
            <div className="flex-none w-50">
              <img
                className="w-20 rounded-full"
                src={ipfsUrl(
                  safeGet(
                    query,
                    "data.profileImage.0.url",
                    create({ seed: address }).toDataURL()
                  )
                )}
              />
            </div>
            <div className="grow">
              <div className="px-4">
                <h2 className="text-3xl font-extrabold">{query.data.name}</h2>
                <Address address={address} className="" />
                <FollowInfo address={address} />
              </div>
            </div>
          </div>
          <div className="py-4">
            <p className="">{query.data.description}</p>
          </div>
          {!authUserLoading && user && user.uid !== address && (
            <FollowAction address={getAddress(user.uid)} target={address} />
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { address } = useParams();

  function ActiveNavLink({ to, children }: { to: string; children: any }) {
    const active = to === window.location.pathname;

    if (active) {
      return (
        <NavLink to={to} className="text-2xl font-bold truncate border-b-2">
          {children}
        </NavLink>
      );
    }

    return (
      <NavLink to={to} className="text-2xl text-gray-400 truncate">
        {children}
      </NavLink>
    );
  }

  return (
    <>
      <div className="min-h-full">
        <main>
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 space-y-4">
            <ProfileCard address={address as string} />
            <div className="space-x-3">
              <ActiveNavLink to={`/profile/${address}`}>
                museboards
              </ActiveNavLink>
              <ActiveNavLink to={`/profile/${address}/assets`}>
                assets
              </ActiveNavLink>
            </div>
            <div className="mt-2">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
