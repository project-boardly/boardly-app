import { Identity } from "@semaphore-protocol/identity";
import { Group } from "@semaphore-protocol/group";
// import { generateProof, verifyProof } from "@semaphore-protocol/proof";
import { ArgumentTypeName } from "@pcd/pcd-types";

import {
  SemaphoreIdentityPCDPackage,
  SemaphoreIdentityPCDTypeName
} from "@pcd/semaphore-identity-pcd";


const identity = new Identity();
const group = new Group(1);

// import { EthereumOwnershipPCDPackage } from '@pcd/ethereum-ownership-pcd';
import { useEffect } from "react";
import { Wallet } from "ethers";

import { EthereumOwnershipPCDPackage } from "./eth";
import { groupProof } from "../../utils";

group.addMember(identity.getCommitment());

export default function Universe() {
  useEffect(() => {
    test();
    groupProof();
  }, []);

  async function test() {
    await EthereumOwnershipPCDPackage.init!({
      wasmFilePath: `/16/semaphore.wasm`,
      zkeyFilePath: `/16/semaphore.zkey`,
    });

    const wallet = Wallet.createRandom();

    const identity = await SemaphoreIdentityPCDPackage.prove({
      identity: new Identity(),
    });

    const serializedIdentity = await SemaphoreIdentityPCDPackage.serialize(
      identity
    );

    const signatureOfIdentityCommitment = await wallet.signMessage(
      identity.claim.identity.commitment.toString()
    );

    const ethereumPCD = await EthereumOwnershipPCDPackage.prove({
      ethereumAddress: {
        argumentType: ArgumentTypeName.String,
        value: wallet.address,
      },
      ethereumSignatureOfCommitment: {
        argumentType: ArgumentTypeName.String,
        value: signatureOfIdentityCommitment,
      },
      identity: {
        argumentType: ArgumentTypeName.PCD,
        pcdType: SemaphoreIdentityPCDTypeName,
        value: serializedIdentity,
      },
    });

    console.log(ethereumPCD);

    await EthereumOwnershipPCDPackage.verify(ethereumPCD);

    console.log("ethereum pcd verified");
  }

  return (
    <div>
      <h1>Universe</h1>
    </div>
  );
}
