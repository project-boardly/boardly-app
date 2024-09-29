import {
  ipfsUpload,
  imageUpload,
} from "@lukso/lsp-factory.js/build/main/src/lib/helpers/uploader.helper";
import { encodeValueContent } from "@erc725/erc725.js/build/main/src/lib/encoder";

const ipfsGateway = {
  host: "boardly-ipfs-proxy.project-boardly.workers.dev",
  port: 443,
  protocol: "https",
};

export async function upload(data: Record<string, any>) {
  const upload = await ipfsUpload(JSON.stringify(data), ipfsGateway);
  const url = `ipfs://${upload.cid.toString()}`;
  const jsonurl = encodeValueContent("JSONURL", { json: data, url });

  return { jsonurl, url };
}

export async function uploadImage(file: File) {
  return imageUpload(file, { ipfsGateway });
}
