import { concat, dataSlice } from "ethers";

export class TokenId {
  collectionId: string;
  variantId: string;
  assetId: string;

  constructor(collectionId: string, variantId: string, assetId: string) {
    this.collectionId = collectionId;
    this.variantId = variantId;
    this.assetId = assetId;
  }

  // 0x798c6047767c 0000 00000000000000000000001d 000000000000000000000001
  static parseTokenId(tokenIdStr: string) {
    const cId = dataSlice(tokenIdStr, 0, 6);
    const vId = dataSlice(tokenIdStr, 8, 20);
    const aId = dataSlice(tokenIdStr, 20);

    return new TokenId(cId, vId, aId);
  }

  toJSON() {
    return {
      collectionId: this.collectionId,
      variantId: this.variantId,
      assetId: this.assetId
    }
  }

  toString() {
    return concat([this.collectionId, '0x0000', this.variantId, this.assetId]);
  }
}