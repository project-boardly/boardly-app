import type { Contract } from "ethers";

export default async function fetchTokens(collection: { metadata: any, contract: Contract }, startAt = 0, pageSize = 20) {
  let count = 0,
    tokenId = startAt;

  const tokens = [];
  const name = collection.contract.name();
  let failedAttempts = 0;
  // const totalSupply = await collection.contract.totalSupply();

  console.log('fetching', collection.contract.target, startAt, pageSize);

  while (count < pageSize) {
    if (failedAttempts == 10) {
      break;
    }

    try {
      let tokenUri;
      let _tokenId = tokenId;

      if (collection.metadata.enumerable) {
        _tokenId = Number(await collection.contract.tokenByIndex(tokenId));
        tokenUri = await collection.contract.tokenURI(_tokenId)
      }
      else if (collection.metadata.standard !== 'ERC721') {
        tokenUri = await collection.contract.uri(tokenId)
      } else {
        tokenUri = await collection.contract.tokenURI(tokenId)
      }

      tokens.push({
        id: _tokenId,
        address: collection.contract.target as string,
        metadata: tokenUri,
        collection: await name,
        chain: collection.metadata.chain
      });

      count++;
    } catch (error: any) {
      failedAttempts++;

      console.log("failed for token", collection.contract.target, tokenId);
    } finally {
      tokenId++;
    }
  }

  if (failedAttempts === 10) {
    return { data: tokens, cursor: tokenId, failed: true }
  }

  return { data: tokens, cursor: tokenId };
}