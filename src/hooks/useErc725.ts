import { ERC725, ERC725JSONSchema } from "@erc725/erc725.js";
import { BrowserProvider } from "ethers";

const IPFS_GATEWAY =
  "https://boardly-ipfs-proxy.project-boardly.workers.dev/ipfs/"; // "http://localhost:3000/ipfs/";
const config = { ipfsGateway: IPFS_GATEWAY };

export function useErc725(address: string, schema: ERC725JSONSchema[]) {
  return new ERC725(schema, address, window.lukso, config);
}

export function getERC725(address: string, schema: ERC725JSONSchema[], provider?: BrowserProvider) {
  return new ERC725(schema, address, provider, config);
}
