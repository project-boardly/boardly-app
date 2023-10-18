import { Contract, InterfaceAbi, JsonRpcProvider } from "ethers";
const rpcProvider = new JsonRpcProvider('https://rpc.testnet.lukso.network');

export const useContract = (target: string, abi: InterfaceAbi) => new Contract(target, abi, rpcProvider);