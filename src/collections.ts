import { Contract } from "ethers";

import { ERC721, providers } from "./hooks/useCollection";

const collections = [
  // {
  //   chain: "ethereum",
  //   address: "0x490339CFF5D89E6c83aB036E73A3aC9bf2e2e303",
  //   standard: "ERC721",
  //   interface: ERC721,
  // },
  // {
  //   chain: "ethereum",
  //   address: "0x12C1f820f49f56d1Ca5daf929E82181eB26A07f9",
  //   standard: "ERC1155",
  //   interface: ERC1155
  // },
  // {
  //   chain: "ethereum",
  //   address: "0x3582668EBf6fe56CF53104796Fa98a7e60F209bA",
  //   standard: "ERC721",
  //   interface: ERC721,
  // },

  // {
  //   chain: "ethereum",
  //   address: "0xc170384371494b2A8f6ba20F4d085c4DDe763d96",
  //   standard: "ERC721",
  //   interface: ERC721,
  //   enumerable: true
  // },

  // {
  //   chain: "ethereum",
  //   address: "0x29F45fb845C374a8424a4E3017127621eCa69451",
  //   standard: "ERC721",
  //   interface: ERC721,
  // },

  // {
  //   chain: "ethereum",
  //   address: "0xd1169e5349d1cB9941F3DCbA135C8A4b9eACFDDE",
  //   standard: "ERC721",
  //   interface: ERC721,
  // },

  // {
  //   chain: "ethereum",
  //   address: "0xd07dc4262BCDbf85190C01c996b4C06a461d2430",
  //   standard: "ERC721",
  //   interface: ERC721,
  // },

  // {
  //   chain: "ethereum",
  //   address: "0x21Afa9aB02B6Fb7cb483ff3667c39eCdd6D9Ea73",
  //   standard: "ERC721",
  //   interface: ERC721,
  // },

  // {
  //   chain: "ethereum",
  //   address: "0xaB4d666C58CA992891ad9867D4fB74B34B84Ed05",
  //   standard: "ERC721",
  //   interface: ERC721,
  // },

  // {
  //   chain: "ethereum",
  //   address: "0x17CB1c13B666AE0A439547960CB61830707AC358",
  //   standard: "ERC721",
  //   interface: ERC721,
  // },

  // { video
  //   chain: "ethereum",
  //   address: "0x3B3ee1931Dc30C1957379FAc9aba94D1C48a5405",
  //   standard: "ERC721",
  //   interface: ERC721,
  // },

  // {
  //   chain: "ethereum",
  //   address: "0xE9A59a922d4Da45C485b3634dbE9C96AA31F7Ee1",
  //   standard: "ERC721",
  //   interface: ERC721,
  // },

  // {
  //   chain: "ethereum",
  //   address: "0x22a79E3859AAE4D0F7a24834E9d0F9247b7093cd",
  //   standard: "ERC721",
  //   interface: ERC721,
  // },

  // {
  //   chain: "ethereum",
  //   address: "0xb47e3cd837dDF8e4c57F05d70Ab865de6e193BBB",
  //   standard: "ERC721",
  //   interface: ERC721,
  // },

  // {
  //   chain: "base",
  //   name: 'ERC1155',
  //   address: "0xc541fC1Aa62384AB7994268883f80Ef92AAc6399",
  //   standard: "ERC1155",
  //   interface: ERC1155,
  // },


  // { standard
  //   chain: "ethereum",
  //   address: "0x8887cE34F6f1a4de4E8EB2A9195eEb261C413365",
  //   standard: "ERC721",
  //   interface: ERC721,
  // },

  // all are working below this
  {
    chain: "ethereum",
    address: "0xB6c9a4E8AE1cCF33c2dC3D8c4ab322E4529233E2",
    standard: "ERC721",
    interface: ERC721,
  },
  {
    chain: "ethereum",
    address: "0x18adc812fe66b9381700c2217f0c9dc816c879e6",
    standard: "ERC721",
    interface: ERC721,
  },
  {
    chain: "ethereum",
    address: "0x3cd54FdC044b40f5E4c8F0727121d15F8A4d84Cb",
    standard: "ERC721",
    interface: ERC721,
  },
  {
    chain: "ethereum",
    address: "0x500a6D2DEF505ebE9cAC909eF04600952b42d94e",
    standard: "ERC721",
    interface: ERC721,
  },
  {
    chain: "ethereum",
    address: "0xe2e27b49e405f6c25796167B2500C195F972eBac",
    standard: "ERC721",
    interface: ERC721,
  },
  {
    chain: "ethereum",
    address: "0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03",
    standard: "ERC721",
    interface: ERC721,
  },
  {
    chain: "ethereum",
    address: "0x0E42FfbaC75Bcc30Cd0015F8aAA608539ba35FbB",
    standard: "ERC721",
    interface: ERC721,
  },
  {
    chain: "ethereum",
    address: "0x49cF6f5d44E70224e2E23fDcdd2C053F30aDA28B",
    standard: "ERC721",
    interface: ERC721,
  },
  {
    chain: "ethereum",
    address: "0x7D8820FA92EB1584636f4F5b8515B5476B75171a",
    standard: "ERC721",
    interface: ERC721,
  },
  {
    chain: "ethereum",
    address: "0x1D20A51F088492A0f1C57f047A9e30c9aB5C07Ea",
    standard: "ERC721",
    interface: ERC721,
  },
  {
    chain: "ethereum",
    address: "0xbee7cb80dfd21a9eaae714208f361601f68eb746",
    standard: "ERC721",
    interface: ERC721,
  },
  {
    chain: "ethereum",
    address: "0xb932a70A57673d89f4acfFBE830E8ed7f75Fb9e0",
    standard: "ERC721",
    interface: ERC721,
    enumerable: true
  },
  // {
  //   chain: "ethereum",
  //   address: "0x4C6eaedA81197B948f635bDb2b3720805f5c7615",
  //   standard: "ERC721",
  //   interface: ERC721,
  //   enumerable: true
  // },
  {
    chain: "ethereum",
    address: "0xAb0c59978ba096db64BcDE2eb42A98cEb7eB7c0d",
    standard: "ERC721",
    interface: ERC721,
    enumerable: true
  },
  {
    chain: "base",
    address: "0xc9Cca8E570F81a7476760279B5B19cc1130B7580",
    standard: "ERC721",
    interface: ERC721,
  },
  // {
  //   chain: "ethereum",
  //   address: "0xa7d8d9ef8D8Ce8992Df33D8b8CF4Aebabd5bD270",
  //   standard: "ERC721",
  //   interface: ERC721,
  //   enumerable: true
  // },
  {
    chain: "ethereum",
    address: "0xf9c362cdd6eeba080dd87845e88512aa0a18c615",
    standard: "ERC721",
    interface: ERC721,
  },
  {
    chain: "ethereum",
    address: "0x306b1ea3ecdf94ab739f1910bbda052ed4a9f949",
    standard: "ERC721",
    interface: ERC721,
  },
  {
    chain: "ethereum",
    address: "0x7a63d17f5a59bca04b6702f461b1f1a1c59b100b",
    standard: "ERC721",
    interface: ERC721,
  },
  {
    chain: "ethereum",
    address: "0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d",
    standard: "ERC721",
    interface: ERC721,
  },
].map((collection) => ({
  metadata: collection,
  contract: new Contract(
    collection.address,
    collection.interface,
    providers[collection.chain]
  ),
}));

export default collections;
