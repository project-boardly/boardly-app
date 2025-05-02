import { Contract } from "ethers";

import { ERC721, providers } from "./hooks/useCollection";

const collections = [
  {
    chain: "lukso",
    address: "0xd3a8f7d653299ac28b04c0f0757d476c88500de9",
    standard: "LSP8",
    interface: ERC721,
  },
  // {
  //   chain: "lukso",
  //   address: "0x86e817172b5c07f7036bf8aa46e2db9063743a83",
  //   standard: "LSP8",
  //   interface: ERC721,
  // },
  {
    chain: "lukso",
    address: "0x5021e9ed50d8c71e3d74c0de7964342aaa1a0f62",
    standard: "LSP8",
    interface: ERC721,
  },

  // {
  //   chain: "lukso",
  //   address: "0x878b22245ee33456492e294fd265767c9a1b65e9",
  //   standard: "LSP8",
  //   interface: ERC721,
  // },
  // {
  //   chain: "lukso",
  //   address: "0x8993b6dbfd57ed5d3b999a8bf430e7b89056a00b",
  //   standard: "LSP8",
  //   interface: ERC721,
  // },
  // {
  //   chain: "lukso",
  //   address: "0x23ab529af53405e15932b1d0452a61a3fa908393",
  //   standard: "LSP8",
  //   interface: ERC721,
  // },
  // {
  //   chain: "lukso",
  //   address: "0x3983151e0442906000dab83c8b1cf3f2d2535f82",
  //   standard: "LSP8",
  //   interface: ERC721,
  // },

  // // all are working below this
  // {
  //   chain: "ethereum",
  //   address: "0xB6c9a4E8AE1cCF33c2dC3D8c4ab322E4529233E2",
  //   standard: "ERC721",
  //   interface: ERC721,
  // },
  // {
  //   chain: "ethereum",
  //   address: "0x18adc812fe66b9381700c2217f0c9dc816c879e6",
  //   standard: "ERC721",
  //   interface: ERC721,
  // },
  // {
  //   chain: "ethereum",
  //   address: "0x3cd54FdC044b40f5E4c8F0727121d15F8A4d84Cb",
  //   standard: "ERC721",
  //   interface: ERC721,
  // },
  // {
  //   chain: "ethereum",
  //   address: "0x500a6D2DEF505ebE9cAC909eF04600952b42d94e",
  //   standard: "ERC721",
  //   interface: ERC721,
  // },
  // {
  //   chain: "ethereum",
  //   address: "0xe2e27b49e405f6c25796167B2500C195F972eBac",
  //   standard: "ERC721",
  //   interface: ERC721,
  // },
  // {
  //   chain: "ethereum",
  //   address: "0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03",
  //   standard: "ERC721",
  //   interface: ERC721,
  // },
  // {
  //   chain: "ethereum",
  //   address: "0x0E42FfbaC75Bcc30Cd0015F8aAA608539ba35FbB",
  //   standard: "ERC721",
  //   interface: ERC721,
  // },
  // {
  //   chain: "ethereum",
  //   address: "0x49cF6f5d44E70224e2E23fDcdd2C053F30aDA28B",
  //   standard: "ERC721",
  //   interface: ERC721,
  // },
  // {
  //   chain: "ethereum",
  //   address: "0x7D8820FA92EB1584636f4F5b8515B5476B75171a",
  //   standard: "ERC721",
  //   interface: ERC721,
  // },
  // {
  //   chain: "ethereum",
  //   address: "0x1D20A51F088492A0f1C57f047A9e30c9aB5C07Ea",
  //   standard: "ERC721",
  //   interface: ERC721,
  // },
  // {
  //   chain: "ethereum",
  //   address: "0xbee7cb80dfd21a9eaae714208f361601f68eb746",
  //   standard: "ERC721",
  //   interface: ERC721,
  // },
  // {
  //   chain: "ethereum",
  //   address: "0xb932a70A57673d89f4acfFBE830E8ed7f75Fb9e0",
  //   standard: "ERC721",
  //   interface: ERC721,
  //   enumerable: true,
  // },
  // {
  //   chain: "ethereum",
  //   address: "0xAb0c59978ba096db64BcDE2eb42A98cEb7eB7c0d",
  //   standard: "ERC721",
  //   interface: ERC721,
  //   enumerable: true,
  // },
  // {
  //   chain: "base",
  //   address: "0xc9Cca8E570F81a7476760279B5B19cc1130B7580",
  //   standard: "ERC721",
  //   interface: ERC721,
  // },
  // {
  //   chain: "ethereum",
  //   address: "0xf9c362cdd6eeba080dd87845e88512aa0a18c615",
  //   standard: "ERC721",
  //   interface: ERC721,
  // },
  // {
  //   chain: "ethereum",
  //   address: "0x306b1ea3ecdf94ab739f1910bbda052ed4a9f949",
  //   standard: "ERC721",
  //   interface: ERC721,
  // },
  // {
  //   chain: "ethereum",
  //   address: "0x7a63d17f5a59bca04b6702f461b1f1a1c59b100b",
  //   standard: "ERC721",
  //   interface: ERC721,
  // },
  // {
  //   chain: "ethereum",
  //   address: "0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d",
  //   standard: "ERC721",
  //   interface: ERC721,
  // },
].map((collection) => ({
  metadata: collection,
  contract: new Contract(
    collection.address,
    collection.interface,
    providers[collection.chain],
  ),
}));

export default collections;
