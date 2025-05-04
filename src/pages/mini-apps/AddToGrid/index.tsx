import { useContext } from "react"
import { LuksoContext, publicClient } from "../../../providers/LuksoProvider"

import UniversalProfileContract from "@lukso/universalprofile-contracts/artifacts/UniversalProfile.json";
import ERC725 from "@erc725/erc725.js";
import MiniAppContainer from "../../../common/MiniAppContainer";
import { upload } from "../../../utils/ipfs";
import { luksoTestnet } from "viem/chains";
import { encodeFunctionData, hexToString } from "viem";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";

const getNewGridData = (url: string, name: string = 'Main') => 
  ({
    "title": name,
    "grid": [
      getGridElementData(url)
    ],
    "gridColumns": 2
  } as GridData);

const getGridElementData = (url: string) => {
  return {
    "type": "IFRAME",
    "width": 1,
    "height": 2,
    "properties": {
      "src": `${url}`
    }
  } as GridElementData;
}

type GridElementData = {
  type: string,
  width: number,
  height: number,
  properties: Record<string, any>
}

type GridData = {
  title: string,
  grid: GridElementData[],
  gridColumns: number
};

export default function AddToGrid() {
  const { target } = useParams();
  const targetUrl = hexToString(target as `0x${string}`);
  const luksoContext = useContext(LuksoContext);
  const query = useQuery({
    queryKey: ['grids', luksoContext?.account],
    queryFn: async () => {
      const account = luksoContext?.account as `0x${string}`;
      
      const grid = await publicClient.readContract({
        abi: UniversalProfileContract.abi,
        address: account,
        functionName: 'getData',
        args: ['0x724141d9918ce69e6b8afcf53a91748466086ba2c74b94cab43c649ae2ac23ff']
      }) as string;

      if (grid === '0x') {
        return [] as GridData[];
      }

      const uri = ERC725.decodeDataSourceWithHash(grid);

      const data = await fetch(uri.url.replace('ipfs://', 'https://ipfs.io/ipfs/')).then(res => res.json());

      return data;
    }
  })

  async function addToGrid(gridIdx?: number) {
    if (!luksoContext?.account) {
      return;
    }

    let gridData = ([] as GridData[]).concat(query.data as GridData[]);
    const toastId = toast.loading('Adding widget to grid');
    
    if (gridIdx === undefined) {
      const name = prompt('Title of new grid:') || 'Main';
      
      if (!name) { return; }
      
      gridData = gridData.concat([getNewGridData(targetUrl, name)]);
    }
    else {
      gridData[gridIdx].grid.push(getGridElementData(targetUrl));
    }

    toast.loading('Uploading new grid data', { id: toastId });
    const ipfs =  await upload(gridData);
    
    const calldata = encodeFunctionData({
      abi: UniversalProfileContract.abi,
      functionName: 'setData',
      args: ['0x724141d9918ce69e6b8afcf53a91748466086ba2c74b94cab43c649ae2ac23ff', ipfs.jsonurl],
    })
    

    toast.loading('Commiting changes to blockchain', { id: toastId });
    await luksoContext.clients.wallet.writeContract({
      abi: UniversalProfileContract.abi,
      account: luksoContext.account as `0x${string}`,
      address: luksoContext.account as `0x${string}`,
      functionName: 'execute',
      args: [0, luksoContext.account as `0x${string}`, 0, calldata],
      chain: luksoTestnet
    });
    toast.success('Done', { id: toastId });

    window.location.href = targetUrl;
  }

  if (!luksoContext) {
    return <p>Loading lukso context</p>
  }

  if (!luksoContext.connected) {
    return <div className="px-8 py-16 text-center border rounded-lg text-gray-500">Please connect mini-app from the grid</div>
  }

  if (query.isLoading) {
    return <div className="px-8 py-16 text-center border rounded-lg text-gray-500">Fetching Grids for Profile</div>
  }

  return <MiniAppContainer>
    <div className="space-y-2">
      <h2 className="text-center text-xl font-bold">Add To Grid</h2>
      <span className="text-center block">{(query.data as GridData[]).length} Existing Girds</span>
      { (query.data as GridData[]).map((grid, idx) => 
      <button className="py-2 rounded-lg w-full bg-gray-200 border border-gray-900 text-gray-900" key={idx} onClick={() => addToGrid(idx)}>{grid.title}</button>) }
      <button className="py-2 rounded-lg w-full bg-gray-900 text-white" onClick={() => addToGrid()}>Add To New Grid</button>
    </div>
  </MiniAppContainer>
}