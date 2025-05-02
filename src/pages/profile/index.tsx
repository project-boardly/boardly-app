import { useEffect, useState } from "react";

import safeGet from "lodash/get";

import { NavLink, Outlet, useParams } from "react-router-dom";
import { create } from "blockies-ts";
import { useModal } from "@ebay/nice-modal-react";
import { getAddress } from "ethers";

import FollowAction from "../../common/FollowAction";
import { Address } from "../../common/components";

import { useProfileQuery } from "../../queries/profiles";

import useUser from "../../hooks/useUser";
import useFollowSystem from "../../hooks/useFollowSystem";

function ipfsUrl(url: string) {
  return url.replace("ipfs://", "https://boardly-ipfs-proxy.project-boardly.workers.dev/ipfs/");
}

function FollowInfo({ address }: { address: string }) {
  const { getFollowersCount, getFollowingCount } = useFollowSystem(
    import.meta.env.VITE_FOLLOW_SYSTEM_ADDR,
  );
  const [stats, setStats] = useState({
    following: 0,
    followers: 0,
  });
  const followingModal = useModal("list-following");
  const followersModal = useModal("list-followers");

  useEffect(() => {
    Promise.all([getFollowersCount(address), getFollowingCount(address)]).then(
      ([followers, following]) => {
        setStats({
          followers,
          following,
        });
      },
    );
  }, []);

  return (
    <div className="flex row">
      <a
        className="cursor-pointer"
        onClick={() => followingModal.show({ address })}
      >
        <span className="text-gray-400">Following</span>{" "}
        <span className="font-bold">{stats.following}</span>
      </a>
      <a
        className="mx-4 cursor-pointer"
        onClick={() =>
          followersModal.show({
            target: address,
          })
        }
      >
        <span className="text-gray-400">Followers</span>{" "}
        <span className="font-bold">{stats.followers}</span>
      </a>
    </div>
  );
}

export function ProfileCard({
  address,
  followersInfo = true,
}: {
  address: string;
  followersInfo?: boolean;
}) {
  const { user, loading: authUserLoading } = useUser();
  const { profile } = useProfileQuery(address);
  const backgroundImage = ipfsUrl(
    safeGet(profile, "data.backgroundImages.0.url", ""),
  );

  if (profile.loading) {
    return (
      <div className="max-w-7xl mx-auto bg-cover bg-center shadow-2xl rounded-xl overflow-hidden">
        <div className="backdrop-blur-md bg-black/50">
          <div className="max-w-sm mx-auto py-10 text-white">
            <div className="flex flex-row">
              <div className="flex-none w-50 h-50 py-4 animate-pulse backdrop-blur-lg bg-white/30"></div>
              <div className="grow py-4 ">
                <div className="px-4 animate-pulse backdrop-blur-lg bg-white/30">
                  <h2 className="text-3xl font-extrabold animate-pulse backdrop-blur-lg bg-white/30 w-full"></h2>
                  <Address address={address} className="" />
                </div>
              </div>
            </div>
            <div className="py-4 animate-pulse backdrop-blur-lg bg-white/30"></div>
          </div>
        </div>
      </div>
    );
  }

  // if (!query.data) {
  //   return <p>This address is not a universal profile</p>;
  // }

  return (
    <div
      className="max-w-7xl mx-auto bg-cover bg-center shadow-2xl rounded-xl overflow-hidden"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="backdrop-blur-md bg-black/50 px-16">
        <div className="max-w-sm mx-auto py-10 text-white">
          <div className="flex lg:flex-row sm:flex-col my-4">
            <div className="flex-none w-50 float-right">
              <img
                className="w-20 rounded-full sm:mx-auto"
                src={ipfsUrl(
                  safeGet(
                    profile,
                    "data.profileImages.0.url",
                    create({ seed: address }).toDataURL(),
                  ),
                )}
              />
            </div>
            <div className="grow">
              <div className="px-4">
                <h2 className="text-3xl font-extrabold">{profile.data.name}</h2>
                <Address address={address} className="" />
                {followersInfo && <FollowInfo address={address} />}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {profile.data.tags ? (
              profile.data.tags.map((tag: string, index: number) => (
                <span
                  key={index}
                  className="bg-gray-200 bg-opacity-50 text-black font-medium py-1 px-3 rounded-full"
                >
                  {tag}
                </span>
              ))
            ) : (
              <span className="text-gray-400 italic">No tags available</span>
            )}
          </div>
          <div className="py-4">
            <p className="">{profile.data.description}</p>
          </div>
          {!authUserLoading && user && user.uid !== address && (
            <FollowAction address={getAddress(user.uid)} target={address} />
          )}
          <div className="flex flex-wrap gap-2">
            {profile.data.links.map(
              (link: { title: string; url: string }, index: number) => (
                <a
                  key={index}
                  href={link.url}
                  target="_blank"
                  className="text-white border-2 border-white hover:bg-white hover:shadow-xl hover:text-black transition font-bold py-2 px-4 rounded-xl"
                >
                  {link.title}
                </a>
              ),
            )}
          </div>
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
    <div className="min-h-full">
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 space-y-4">
          <ProfileCard address={address as string} />
          <div className="space-x-3">
            <ActiveNavLink to={`/profile/${address}`}>boards</ActiveNavLink>
            <ActiveNavLink to={`/profile/${address}/assets`}>
              assets
            </ActiveNavLink>
            <ActiveNavLink to={`/profile/${address}/universe`}>
              universe
            </ActiveNavLink>
          </div>
          <div className="mt-2">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
