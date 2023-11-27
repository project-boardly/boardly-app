import { Identity } from "@semaphore-protocol/identity";
import { Group } from "@semaphore-protocol/group";
// import { generateProof, verifyProof } from "@semaphore-protocol/proof";
import { ArgumentTypeName } from "@pcd/pcd-types";

import {
  SemaphoreIdentityPCD,
  SemaphoreIdentityPCDPackage,
  SemaphoreIdentityPCDTypeName
} from "@pcd/semaphore-identity-pcd";

import { Poseidon, Tree } from "@personaelabs/spartan-ecdsa";
import JSONBig from "json-bigint";

import {
  EthereumGroupPCDPackage,
  getRawPubKeyBuffer,
  GroupType
} from "../pages/profile/eth-group";


const identity = new Identity();
const group = new Group(1);

import { HDNodeWallet, Wallet, hashMessage } from "ethers";

group.addMember(identity.getCommitment());

async function groupProof(
  identity: SemaphoreIdentityPCD,
  wallet: HDNodeWallet,
  groupType: GroupType = GroupType.PUBLICKEY
) {
  const signatureOfIdentityCommitment = await wallet.signMessage(
    identity.claim.identity.commitment.toString()
  );

  const msgHash = Buffer.from(
      hashMessage(identity.claim.identity.commitment.toString())
      .slice(2),
    "hex"
  );

  const poseidon = new Poseidon();
  await poseidon.initWasm();
  const treeDepth = 20; // Provided circuits have tree depth = 20
  const tree = new Tree(treeDepth, poseidon);

  // Add some IDs to the tree before the prover's public key
  const randM = Math.floor(Math.random() * 10) + 1;
  for (let i = 0; i < randM; i++) {
    const otherWallet = Wallet.createRandom();

    tree.insert(
      groupType == GroupType.ADDRESS
        ? BigInt(otherWallet.address)
        : poseidon.hashPubKey(getRawPubKeyBuffer(otherWallet.publicKey))
    );
  }

  // Add the prover's ID to the tree
  // const proverPubkeyBuffer: Buffer = ;
  tree.insert(
    groupType == GroupType.ADDRESS
      ? BigInt(wallet.address)
      : poseidon.hashPubKey(getRawPubKeyBuffer(wallet.publicKey))
  );

  // Add some IDs to the tree after the prover's public key
  const randN = Math.floor(Math.random() * 10) + 1;
  for (let i = 0; i < randN; i++) {
    const otherWallet = Wallet.createRandom();
    tree.insert(
      groupType == GroupType.ADDRESS
        ? BigInt(otherWallet.address)
        : poseidon.hashPubKey(getRawPubKeyBuffer(otherWallet.publicKey))
    );
  }

  // Get the index of the prover's public key in the tree
  const idIndex = tree.indexOf(
    groupType == GroupType.ADDRESS
      ? BigInt(wallet.address)
      : poseidon.hashPubKey(getRawPubKeyBuffer(wallet.publicKey))
  );

  // Prove membership of the prover's public key in the tree
  const merkleProof = tree.createProof(idIndex);
  return {
    signatureOfIdentityCommitment,
    msgHash,
    merkleProof
  };
}

async function happyPathEthGroupPCD(groupType: GroupType) {
  const identity = await SemaphoreIdentityPCDPackage.prove({
    identity: new Identity()
  });
  const serializedIdentity = await SemaphoreIdentityPCDPackage.serialize(
    identity
  );
  const wallet = Wallet.createRandom();
  const { signatureOfIdentityCommitment, merkleProof } = await groupProof(
    identity,
    wallet,
    groupType
  );

  console.log('generating pcd proof');

  const ethGroupPCD = await EthereumGroupPCDPackage.prove({
    merkleProof: {
      argumentType: ArgumentTypeName.String,
      value: JSONBig({ useNativeBigInt: true }).stringify(merkleProof)
    },
    identity: {
      argumentType: ArgumentTypeName.PCD,
      pcdType: SemaphoreIdentityPCDTypeName,
      value: serializedIdentity
    },
    signatureOfIdentityCommitment: {
      argumentType: ArgumentTypeName.String,
      value: signatureOfIdentityCommitment
    },
    groupType: {
      argumentType: ArgumentTypeName.String,
      value: groupType
    }
  });

  return ethGroupPCD;
}

async function testGroup() {
  const addrMembershipConfig = {
    circuit: '/group/addr_membership.circuit',
    witnessGenWasm: '/group/addr_membership.wasm',
    useRemoteCircuit: true
  };
  const pubkeyMembershipConfig = {
    circuit: '/group/pubkey_membership.circuit',
    witnessGenWasm: '/group/pubkey_membership.wasm',
    useRemoteCircuit: true
  };

  await EthereumGroupPCDPackage.init!({
    wasmFilePath: `/16/semaphore.wasm`,
    zkeyFilePath: `/16/semaphore.zkey`,
    addrMembershipConfig,
    pubkeyMembershipConfig
  });

  const ethGroupPCD = await happyPathEthGroupPCD(GroupType.ADDRESS);

  console.log(ethGroupPCD);
  console.log('some other thing verified');
}

export function createProof () {
  console.log('starting to create group proof');
  testGroup();
}
