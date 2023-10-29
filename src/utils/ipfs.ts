import { ipfsUpload, imageUpload } from '@lukso/lsp-factory.js/build/main/src/lib/helpers/uploader.helper';
import { encodeValueContent } from '@erc725/erc725.js/build/main/src/lib/encoder';

const ipfsGateway = {
  host: 'api.2eff.lukso.dev',
  port: 443,
  protocol: 'https'
};

export async function upload(data: Record<string, any>) {
  const upload = await ipfsUpload(JSON.stringify(data), ipfsGateway);
  const url = `ipfs://${upload.cid.toString()}`;
  const jsonurl = encodeValueContent('JSONURL', { json: data, url });

  return { jsonurl, url };
}

export async function uploadImage(file: File) {
  return imageUpload(file, { ipfsGateway });
}

// export async  function createBoard(title: string, description: string, file: File, contract owner: string, updateStatus: Function) {
//   updateStatus('Uploading Image');

//   const images = await uploadHelpers.imageUpload(file, { ipfsGateway })

//   const data: LSP4MetadataBeforeUpload = {
//     LSP4Metadata: {
//       description: `[${title}] ${description}`,
//       links: [],
//       icon: images,
//       images: [images],
//       assets: []
//     }
//   };

//   const schema: ERC725JSONSchema = {
//     "name": "LSP8MetadataJSON:<bytes32>",
//     "key": "0x9a26b4060ae7f7d5e3cd0000<bytes32>",
//     "keyType": "Mapping",
//     "valueType": "bytes",
//     "valueContent": "JSONURL"
//   };

//   updateStatus('Uploading Metadata');

//   const metadataUpload = await uploadHelpers.ipfsUpload(JSON.stringify(data), ipfsGateway);
//   const metadataUrl = `ipfs://${metadataUpload.cid.toString()}`;

//   const { keys, values } = ERC725.encodeData(
//     [{ keyName: 'LSP8MetadataJSON:<bytes32>', dynamicKeyParts: [tokenId], value: { json: data, url: metadataUrl }}],
//     [schema] as ERC725JSONSchema[]
//   );

//   console.log(keys[0], values[0]);
//   updateStatus('Minting Board');

//   // return contract.connect(library.getSigner())['setData(bytes32,bytes)'](keys[0], values[0]);
//   await contract.connect(library.getSigner()).mint(owner, tokenId, false, values[0]);
// }