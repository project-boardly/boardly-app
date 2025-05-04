import { Link, useParams } from "react-router-dom";
import MiniAppContainer from "../../../common/MiniAppContainer";
import { getAddress } from "ethers";
import { useContext, useState } from "react";
import { LuksoContext, publicClient } from "../../../providers/LuksoProvider";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import ERC725 from "@erc725/erc725.js";
import UniversalProfileContract from "@lukso/universalprofile-contracts/artifacts/UniversalProfile.json";
import { hexToBigInt, stringToHex } from "viem";
import moment from 'moment';
import { ShortAddress } from "../../../common/components";
import { luksoTestnet } from "viem/chains";
import { TrashIcon } from '@heroicons/react/24/outline';

const RPC_URL = 'https://rpc.testnet.lukso.network';
const config = {
  ipfsGateway: 'https://boardly-ipfs-proxy.project-boardly.workers.dev/ipfs/',
  gas: 20_000_000, // optional, default is 1_000_000
};

type ContentIndexViewType = {
  verification: {
    method: string,
    data: string
  },
  ipfs: string,
  id: string,
  creator: string
};
function ContentIndexView({ verification, ipfs, creator, id }: ContentIndexViewType) {
  const query = useQuery({
    queryKey: ['ipfs-data', creator, id],
    queryFn: async () => {
      const res = await fetch(ipfs.replace('ipfs://', 'https://ipfs.io/ipfs/'));

      return {
        content: await res.json(),
        verification
      }
    }
  })

  if (query.isLoading) {
    return <p>Loading Content</p>
  }

  return <Link className="bg-white text-gray-900 rounded-lg block py-2 px-4 shadow-lg hover:shadow-xl transition duration-150" to={`/user/${creator}/view/${id}`}>
    <span className="block">{query.data?.content.title}</span>
    <span className="text-gray-500 text-xs">Created on {moment(query.data?.content.createdAt).format('MMM Do, YYYY')}</span>
  </Link>
}

function IndexQueryView({ address, query }: { address: string, query: UseQueryResult }) {
  if (query.isLoading) {
    return <p>Loading Data</p>
  }

  if (query.isError) {
    return <p>Something went wrong while fetching data</p>
  }

  if (!Array.isArray(query.data)) {
    return <p>It seems like data is not structured correctly</p>
  }

  return <div className="space-y-2">
    <div>Content Created By <a target="_blank" href={`https://universaleverything.io/${address}?assetType=owned&assetGroup=grid&network=testnet`}><ShortAddress address={address} /></a></div>
    {query.data.length === 0 && <div className="px-8 py-16 text-center border rounded-lg text-gray-500">It looks like no content has been created on this profile yet.</div>}
    {query.data.map((data, idx) => <ContentIndexView verification={data.verification} ipfs={data.url} id={data.id} creator={data.creator} key={idx} />)}
  </div>
}

export default function IndexMiniApp() {
  const ctx = useContext(LuksoContext);
  const params = useParams();
  const [dataKeys, setKeys] = useState<string[]>();
  const dataQuery = useQuery({
    queryKey: ["content", params.address],
    queryFn: async () => {
      if (!ctx) { return; }

      const account = params.address as `0x${string}`;

      try {
        const schemas = [
          {
            name: 'BoardlyContent[]',
            key: '0x187419b75ac8171237488ba5ef5b320d696cc2c1797d164c9e8c669e5420f90f',
            keyType: 'Array',
            valueType: 'bytes',
            valueContent: 'VerifiableURI',
          },
        ];
        const myErc725 = new ERC725(schemas, account, RPC_URL, config);

        const listLengthStr = await publicClient.readContract({
          address: account as `0x${string}`,
          abi: UniversalProfileContract.abi,
          account: account as `0x${string}`,
          functionName: 'getData',
          args: ['0x187419b75ac8171237488ba5ef5b320d696cc2c1797d164c9e8c669e5420f90f']
        }) as `0x${string}`;

        const listLength = listLengthStr === '0x' ? 0 : Number(hexToBigInt(listLengthStr).valueOf());

        const { keys } = myErc725.encodeData([
          {
            keyName: 'BoardlyContent[]',
            value: Array(listLength).fill('0x'),
            totalArrayLength: listLength,
            startingIndex: 0
          }
        ]);

        setKeys(keys);

        const values = await publicClient.readContract({
          address: account as `0x${string}`,
          abi: UniversalProfileContract.abi,
          account: account as `0x${string}`,
          functionName: 'getDataBatch',
          args: [keys.slice(1)]
        }) as string[];

        return values.map((str, idx) => {
          const data = ERC725.decodeDataSourceWithHash(str);

          return {
            verification: data.verification,
            url: data.url,
            id: keys[idx + 1],
            creator: account
          }
        });
      }
      catch (err) {
        console.log(err);
      }
    },
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  })

  async function clearAll() {
    if (!window.confirm('Do you want to delete all content created on Boardly?')) {
      return;
    }

    const acc = ctx?.account as `0x${string}`;

    await ctx?.clients.wallet.writeContract({
      address: acc,
      abi: UniversalProfileContract.abi,
      account: acc,
      functionName: 'setDataBatch',
      chain: luksoTestnet,
      args: [dataKeys, Array(dataKeys?.length).fill('0x')]
    });
  }

  function canCreate() {
    return ctx?.connected && ctx.account && params.address ? getAddress(params.address) === getAddress(ctx.account) : false;
  }

  function canDelete() {
    return canCreate() && !dataQuery.isLoading && dataQuery.data && dataQuery.data?.length > 0
  }

  function getCreateLinkForProfile(address: string) {
    return stringToHex(`${import.meta.env.VITE_APP_HOST}/user/${address}`);
  }

  const footer = <div className="flex flex-row m-4 space-x-2">
    {canCreate() && <Link className="bg-gray-900 grow text-white font-bold block text-center rounded-lg shadow py-2" to='/create'>Add New</Link>}
    {canDelete() && <button className="text-center w-10 border border-red-900 hover:bg-red-900 hover:text-red-50 text-red-900 flex flex-col justify-center rounded-lg py-2" onClick={clearAll}><TrashIcon className="mx-auto" width={18} height={18}/></button>}
    {!canCreate() && ctx && ctx.connected && <Link
      className="bg-gray-900 grow text-white font-bold block text-center rounded-lg shadow py-2"
      to={`/add/${getCreateLinkForProfile(ctx.account)}`}
    >Add Boardly To Your Grid</Link>}
    {ctx && !ctx.connected && <div className="text-center grow rounded-lg bg-[#e6ddf4] text-[#561caa] shadow py-2">Connect the app to start using Boardly</div>}
  </div>

  return <MiniAppContainer footer={footer}>
    <IndexQueryView address={params.address as string} query={dataQuery} />
  </MiniAppContainer>
}