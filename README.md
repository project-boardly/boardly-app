# museboard

Museboard has something to offer for everyone in the community. Be it just exploring the content, or creating a network of people.

### [View Contracts](https://github.com/kriss1897/boardly-contracts)

Demo Videos:
- [Complete Demo](https://www.youtube.com/watch?v=1wsMuEJwEnQ&t=3s)
- [Basics of museboard and boards](https://www.loom.com/share/73bcd005c0f4455d8fc1a032a287816e?sid=c9cba008-c2ea-4bf1-98db-327ea5ac66e2)
- [Basics of the follow system](https://www.loom.com/share/bdb6f03215d54d14956b9f5b8b258245?sid=ec25a3eb-996a-4cae-8dfe-a915f1483440)

Key Learnings:
- Alignment with key principles is key. If I was completely aligned with the core principles that Lukso works on, I would have been able to think clearly.. and escape the mindset that I've built from other web3 and web2 development.
- Use the UP to store data or reference to data. We learned this halfway through our development. Even though we store boards as NFT tokens, it would have been perfectly fine just to store then in an array. (Don't let the web3 mindset take over.)
- You don't always need extensions. Sometime you can just use LSP1 and handle things with notifications. This lesson is related to the follow module. The follow module is build around extensions (LSP17) only. However while building it, I realised that LSP1 in combination with LSP17 would have given a better working product.
- Parse solidity errors.. and know that you can inspect the extension's network calls as well. I spent days debugging issues, because in tests everything was working, but in production it was not. Turned out the UP Extension had a bug, and didn't return revert data for certain calls.

Features:
- Explore tokens from all around web3, directly from information that is stored on-chain. The explore page of museboard has an infinite loading list of content from different chains so that you are never limited in for quests.

- A rich and generic follow system that allows you to own build your own network however you want.

- The follow system is designed for both explorers and builders. And is a generic tool. We have integrated it to support following different universal profiles, and museboards. But it can be directly hooked to any smart contract in a extensible way. This tool truely showcases the power of LSP17 extensions.

- Encrypted data stored directly on your universal profile. With the integration of Lit Network, you can now store encrypted content off-chain, add references to that data on-chain. And do conditional decryption. With the power of KeyManager and Encryption network of Lit, you can create content which only is private to you. Or content that can only be viewed by your followers. Here are some features that showcases the power of encryption and conditional decryption.

  - Private museboards.

  - Follower only museboards.

- [In-progress, not complete] We've also experimented with stored PCDs with Universal Profile. These PCDs can we encrypted and stored directly on universal profile. And these can then later to be use to do ZK Proofs for building privacy focused reputation systems.


### Follow System Diagram

![Follow System Diagram](https://cdn.discordapp.com/attachments/1024295793781383288/1179388228575436850/Screenshot_2023-11-29_at_5.16.27_PM.png?ex=657999e1&is=656724e1&hm=2fcfac353a0da933c072df4f8a168496cd8a464e27309dcbe34ae5ef10e8e0d6&)

### Contracts

```
MUSEBOARD_CONTRACT='0xe5Ae879Bf6Fe9281CCBBDe09bb56aB64DDc4A06D'
FOLLOW_MODULE='0xC79fb40EE0FCfdF0A4301d7CDA9A72F7921E4ECd'
UP_FOLLOW_SYSTEM='0xc194f5Edde2616D4BDA8d56b3B0Fd1F091d7eFEb'
```
