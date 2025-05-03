import {
  ipfsUpload,
  imageUpload,
} from "@lukso/lsp-factory.js/build/main/src/lib/helpers/uploader.helper";
import { encodeValueContent } from "@erc725/erc725.js/build/main/src/lib/encoder";
import { ethers } from "ethers";

const ipfsGateway = {
  host: "boardly-ipfs-proxy.project-boardly.workers.dev",
  port: 443,
  protocol: "https",
};

export async function upload(data: Record<string, any> | any) {
  const jsonStr = JSON.stringify(data);
  const upload = await ipfsUpload(jsonStr, ipfsGateway);
  const url = `ipfs://${upload.cid.toString()}`;
  const jsonurl = encodeValueContent('VerifiableURI', {
    verification: {
      method: 'keccak256(utf8)',
      data: ethers.keccak256(ethers.toUtf8Bytes(jsonStr)),
    },
    url
  });

  return { jsonurl, url };
}

export async function uploadImage(file: File) {
  return imageUpload(file, { ipfsGateway });
}
