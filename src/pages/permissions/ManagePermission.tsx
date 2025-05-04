import { useContext, useState } from "react";
import ERC725 from "@erc725/erc725.js";
import { useEncryptionWallet } from "../../contexts/LitNetworkContext";
import { encodeFunctionData } from "viem";
import { LuksoContext } from "../../providers/LuksoProvider";
import { luksoTestnet } from "viem/chains";
import UniversalProfileContract from "@lukso/universalprofile-contracts/artifacts/UniversalProfile.json";

export function ManagePermission() {
  const [generated] = useState<boolean | null>(null);
  const luksoContext = useContext(LuksoContext);
  const getEncryptionWallet = useEncryptionWallet();

  async function setPermissions() {
    if (!luksoContext || !luksoContext.provider || !luksoContext.clients.public || !luksoContext.clients.wallet || !abi) {
      console.log({ luksoContext, provider: luksoContext?.provider, public: luksoContext?.clients.public, abi, walet: luksoContext?.clients.wallet });
      
      return;
    }

    const wallet = await getEncryptionWallet();
    
    if (!wallet) {
      console.log('Encryption Wallet Not Found');

      return;
    }

    const permissionKeyName = ERC725.encodeKeyName("AddressPermissions:Permissions:<address>", [
      wallet.address
    ]);
    
    let permission = await luksoContext.clients.public.readContract({
      abi: UniversalProfileContract.abi,
      address: luksoContext.account as `0x${string}`,
      functionName: 'getData',
      args: [permissionKeyName]
    })

    const permissions = permission === '0x' ? {} as Permissions : ERC725.decodePermissions(permission as string)
    const requiredPermissions = ERC725.encodePermissions({ DECRYPT: true });

    if (!(permissions as any).DECRYPT) {
      const calldata = encodeFunctionData({
        abi: UniversalProfileContract.abi,
        functionName: 'setData',
        args: [permissionKeyName, requiredPermissions]
      })

      await luksoContext.clients.wallet.writeContract({
        address: luksoContext.account as `0x${string}`,
        chain: luksoTestnet,
        abi: UniversalProfileContract.abi,
        account: luksoContext.account as `0x${string}`,
        functionName: 'execute',
        args: [0, luksoContext.account as `0x${string}`, 0, calldata]
      });
    } else {
      console.log('permission already present');
    }
  }

  if (generated) {
    return <div className="w-64 mt-32 bg-gray-50 mx-auto border p-4 relative space-y-4">
      <h1 className="text-center font-bold text-xl">Set Permissions</h1>
      <p className="text-center">In order to do encryption and decryption, we need to generate a new key. And assign <span className="inline font-bold">DECRYPT</span> permissions to the key.</p>
      {/* <button className="bg-gray-900 text-gray-50 font-bold px-8 py-2 rounded w-full relative bottom-0" onClick={setPermissions}>Update</button> */}
    </div>
  }

  return <div className="w-64 mt-32 bg-gray-50 mx-auto border p-4 relative space-y-4">
    <h1 className="text-center font-bold text-xl">Setup Profile to use Encryption</h1>
    <p className="text-center">In order to do encryption and decryption, we need to generate a new key. And assign <span className="inline font-bold">DECRYPT</span> permissions to the key.</p>
    <button className="bg-gray-900 text-gray-50 font-bold px-8 py-2 rounded w-full relative bottom-0" onClick={setPermissions}>Update</button>
  </div>
}

export default function ManagePermissionPage() {
  return <ManagePermission />
}