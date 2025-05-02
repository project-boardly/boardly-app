import type { ERC725JSONSchema } from "@erc725/erc725.js";

import ProfileMetadataSchema from "@erc725/erc725.js/schemas/LSP3ProfileMetadata.json";
import ReceivedAssetsSchema from "@erc725/erc725.js/schemas/LSP5ReceivedAssets.json";
import IssuedAssetsSchema from "@erc725/erc725.js/schemas/LSP12IssuedAssets.json";

import UniversalProfileContract from "@lukso/universalprofile-contracts/artifacts/UniversalProfile.json";

import { INTERFACE_IDS } from "@lukso/lsp-smart-contracts/constants";

import { useContract } from "./useContract";
import { useErc725 } from "./useErc725";
import { useQuery, gql } from "@apollo/client";
import safeGet from "lodash/get";

/*
 * Fetch the @param's Universal Profile's
 * LSP3 data
 *
 * @param address of Universal Profile
 * @return string JSON or custom error
 */
export async function fetchProfileData(profile: any) {
  try {
    return await profile.fetchData("LSP3Profile");
  } catch (error) {
    console.log(error);

    return;
  }
}

export interface ImageRef {
  hash: string;
  url: string;
  width: string;
  height: string;
  hashFunction: string;
}
export interface UniversalProfile {
  name: string;
  description: string;
  profileImage: ImageRef[];
  backgroundImage: ImageRef[];
}

const schema = ProfileMetadataSchema.concat(ReceivedAssetsSchema).concat(
  IssuedAssetsSchema,
) as ERC725JSONSchema[];

const GET_PROFIE_QUERY = gql`
  query {
    Profile(
      where: { id: { _eq: "0x1ed2fee0a4aa6e6c498afc4bc811de94da27eb09" } }
    ) {
      id
      name
      profileImages {
        url
        height
        width
      }
      backgroundImages {
        url
        height
        width
      }
      description
      links {
        title
        url
      }
      tags
    }
  }
`;

export default function useUniversalProfile(address: string) {
  const contract = useContract(address, UniversalProfileContract.abi);
  const erc725 = useErc725(address, schema);
  const { loading, error, data } = useQuery(GET_PROFIE_QUERY);

  return {
    contract,
    loading,
    error,
    data: safeGet(data, "Profile.0"),
    isUniversalProfile: () => {
      return contract.supportsInterface(INTERFACE_IDS.LSP0ERC725Account);
    },
    getProfileData: () => {
      return fetchProfileData(erc725).then((data) => data.value.LSP3Profile);
    },
    fetch: function (type: string) {
      return erc725?.fetchData(type);
    },
    fetchDynamic: function (type: string, address: string) {
      return erc725?.fetchData({ keyName: type, dynamicKeyParts: address });
    },
  };
}
