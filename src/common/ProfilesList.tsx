import { useProfileQuery } from "../queries/profiles";
import { create } from "blockies-ts";
import safeGet from "lodash/get";
import { Address } from "../common/components";

function ipfsUrl(url: string) {
  return url.replace("ipfs://", "https://2eff.lukso.dev/ipfs/");
}

function InlineProfile({ address }: { address: string }) {
  const { query } = useProfileQuery(address);

  return (
    <div className="flex space-x-4 group">
      <div className="py-2">
        <img
          className="w-12 rounded-full"
          src={ipfsUrl(
            safeGet(
              query,
              "data.profileImage.0.url",
              create({ seed: address }).toDataURL()
            )
          )}
        />
      </div>
      <div className="grow py-4">
        <p className="text-lg font-semibold align-middle h-max">{query.isLoading ? address : query.data.name}</p>
      </div>
      <Address address={address} className="text-xs py-4"/>
    </div>
  );
}

export default function ProfilesList({ profiles }: { profiles: string[] }) {
  return (
    <ul>
      {profiles.map((profile) => (
        <li key={profile}>
          <InlineProfile address={profile} />
        </li>
      ))}
    </ul>
  );
}
