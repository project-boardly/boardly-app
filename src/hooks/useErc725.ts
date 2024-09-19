import { ERC725, ERC725JSONSchema } from "@erc725/erc725.js";

const IPFS_GATEWAY = "http://localhost:3000/ipfs/";// "http://localhost:3000/ipfs/";
const config = { ipfsGateway: IPFS_GATEWAY };

export function useErc725 (address: string, schema: ERC725JSONSchema[]) {
  return new ERC725(
    schema,
    address,
    window.lukso,
    config
  );
}

export function getERC725(address: string, schema: ERC725JSONSchema[]) {
  return new ERC725(
    schema,
    address,
    window.lukso,
    config
  );
}