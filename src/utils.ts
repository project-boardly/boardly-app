import { proxy } from "comlink";

// worker instance
export const fetchTokens = async (chain: string, address: string, standard: string, enumerable: boolean, startAt: number, count: number, callback: any, onToken: any) => {
  const worker = new ComlinkWorker<typeof import("./sw/worker")>(
    new URL("./sw/worker", import.meta.url)
  );

  const tokens = await worker.fetchTokens({ chain, address, standard, enumerable }, startAt, count, proxy(callback), proxy(onToken));

  return tokens;
}

export function groupProof () {
  const worker = new ComlinkWorker<typeof import("./sw/proofWorker")>(
    new URL("./sw/proofWorker", import.meta.url)
  );

  return worker.createProof();
}