import { Fragment, useContext, useEffect, useState } from "react";
import { Transition, Dialog } from "@headlessui/react";
import NiceModal, { useModal } from "@ebay/nice-modal-react";
import { useTransactionSender } from "../hooks/transactions";
import { Loader } from "./AddToMuseboard";
import useUniversalProfile from "../hooks/useUniversalProfile";
import UserContext from "../contexts/UserContext";
import { hexlify, keccak256, toUtf8Bytes } from "ethers";
import { useCollection } from "../hooks/useCollection";
import { useQuery } from "@tanstack/react-query";

import safeGet from "lodash/get";
import * as mime from "mime-types";
import { Button } from "../common/buttons";
import { upload, uploadImage } from "../utils/ipfs";
import { encodeValueType } from "@erc725/erc725.js/build/main/src/lib/encoder";
import LSP3 from '@erc725/erc725.js/schemas/LSP3ProfileMetadata.json';
import ERC725, { ERC725JSONSchema } from "@erc725/erc725.js";

function ipfsUrl(url: string) {
  return url.replace("ipfs://", "http://localhost:3000/ipfs/");
}

const UpdateProfilePictureModal = NiceModal.create(() => {
  const user = useContext(UserContext);
  const modal = useModal();
  const { collection, chain, tokenId } = modal.args || {};
  const { fetchMetadata } = useCollection(
    chain as string,
    collection as string
  );
  const { data } = useQuery({
    queryKey: ["chain", chain, "collection", collection, "token", tokenId],
    cacheTime: 60 * 60 * 1000,
    staleTime: 60 * 60 * 1000,
    queryFn: () => fetchMetadata(tokenId as string),
  });

  const { sendTransaction } = useTransactionSender();
  const [loading, setLoading] = useState({ status: 1, message: "Loading" });
  const [error] = useState<string | null>(null);
  const { contract: upContract, getProfileData } = useUniversalProfile(user?.uid as string);
  const [image, setImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [imageDims, setDims] = useState({ height: 0, width: 0 });

  useEffect(() => {
    const url = safeGet(data, "image");

    if (!url) {
      return;
    }

    const src = ipfsUrl(url);
    setLoading({ status: 1, message: "Fetching Image" });
    fetch(src)
      .then(async (res) => ({
        blob: await res.blob(),
        type: res.headers.get("Content-Type"),
      }))
      .then(async ({ blob, type }) => {
        const file = new File(
          [blob],
          `image.${mime.extension(type as string)}`,
          blob
        );

        setImageUrl(URL.createObjectURL(blob));
        setImage(file);
        setLoading({ status: 0, message: "Not Loading" });
      });
  }, [data]);

  async function setPicture() {
    if (!image) { return; }
    const url = safeGet(data, "image");

    setLoading({ status: 1, message: 'Processing and uploading image' });
    const [metadata, hash, images] = await Promise.all([
      getProfileData(),
      keccak256(new Uint8Array(await image.arrayBuffer())),
      await uploadImage(image)
    ]);
    setLoading({ status: 0, message: 'Not loading' });

    images[4] = { width: imageDims.width, height: imageDims.height, hashFunction: images[4].hashFunction, hash, url };

    metadata.profileImage = images;

    const { url: ipfsUrl } = await upload({ LSP3Profile: metadata });
    const tokenData = [chain, collection, tokenId].map((str) => toUtf8Bytes(str as string)).map((bytes) => hexlify(bytes));
    const verificationData = encodeValueType("bytes[CompactBytesArray]", tokenData);

    const { keys, values } = ERC725.encodeData([
      {
        keyName: 'LSP3Profile',
        value: {
          json: { LSP3Profile: metadata },
          url: ipfsUrl,
        },
      },
    ], LSP3 as ERC725JSONSchema[]);

    const verificationKey = keccak256(toUtf8Bytes('ProfilePictureVerification'));

    keys.push(verificationKey);
    values.push(verificationData);

    return sendTransaction(upContract, 'setDataBatch', [keys, values]).then(() => modal.remove());
  }

  return (
    <Transition appear show={modal.visible} as={Fragment}>
      <Dialog as="div" className="relative z-8" onClose={modal.remove}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-16 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white px-6 py-8  text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h2"
                  className="text-2xl pl-4 font-medium leading-6 text-gray-900 text-center"
                >
                  Set NFT Picture
                </Dialog.Title>
                <Dialog.Description
                  as="p"
                  className="text-center px-8 mt-4 text-gray-400"
                ></Dialog.Description>
                {error && (
                  <span className="px-2 py-4 border rounded-xl border-red-900 text-red-900 bg-red-200 block">
                    {error}
                  </span>
                )}
                {loading.status !== 0 && (
                  <div className="flex flex-col space-y-2 text-center my-2">
                    <Loader />
                    <p>{loading.message}</p>
                  </div>
                )}
                {loading.status === 0 && (
                  <div className="flex flex-col justify-center space-y-4">
                    {imageUrl && (
                      <img
                        onLoad={(e: any) =>
                          setDims({
                            width: e.target.width,
                            height: e.target.height,
                          })
                        }
                        src={imageUrl}
                        className="mx-auto max-w-xs rounded-xl"
                      />
                    )}
                    <Button variant="dark" onClick={() => setPicture()}>
                      Set Picture
                    </Button>
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
});

export default UpdateProfilePictureModal;
