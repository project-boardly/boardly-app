import { Fragment, useEffect, useState } from "react";
import { PhotoIcon } from "@heroicons/react/24/solid";
import { PencilIcon } from "@heroicons/react/24/outline";
import { Transition, Dialog, Switch } from "@headlessui/react";
import NiceModal, { useModal } from "@ebay/nice-modal-react";
import { useContract } from "../hooks/useContract";
import { useTransactionSender } from "../hooks/transactions";
import { upload, uploadImage } from "../utils/ipfs";
import { TToken, useBoardsQuery } from "../queries/boards";

import safeGet from "lodash/get";

import { abi } from "boardly-contracts/artifacts/contracts/Museboard.sol/Museboard.json";
import LSP6KeyManager from "@erc725/erc725.js/schemas/LSP6KeyManager.json";

import useUser from "../hooks/useUser";
import { Loader } from "./AddToMuseboard";
import { getERC725 } from "../hooks/useErc725";
import { ERC725JSONSchema } from "@erc725/erc725.js";
import { getEncryptionWallet } from "../contexts/LitNetworkContext";
import useUniversalProfile from "../hooks/useUniversalProfile";
import useMuseboard from "../hooks/useMuseboard";

function CircleFileUpload({
  fileUrl,
  onChange,
}: {
  fileUrl?: string;
  onChange: (x: any) => void;
}) {
  const [uploaded, setUploaded] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [fileURL, setFileURL] = useState<string | null>(fileUrl || null);

  function handleUpload(files: FileList) {
    setFile(files[0]);
    setFileURL(URL.createObjectURL(files[0]));
    setUploaded(true);
  }

  useEffect(() => {
    onChange(file);
  }, [file]);

  return (
    <label
      htmlFor="file-upload"
      className="relative cursor-pointer bg-white font-medium focus-within:outline-none"
    >
      {uploaded && (
        <div className="inline-block h-20 w-20 leading-4 mx-auto relative">
          <img src={fileURL as string} className=" rounded-full" alt="Logo" />
          <span className="h-10 w-10 absolute -right-2 -bottom-2 bg-white shadow-md hover:shadow-xl rounded-full">
            <PencilIcon className="h-5 w-5 mt-2.5 mx-auto" />
          </span>
        </div>
      )}
      {!uploaded && (
        <span className="inline-block h-20 w-20 leading-4 hover:shadow-lg mx-auto rounded-full bg-gradient-to-tr to-purple-500 from-cyan-500">
          <PhotoIcon className="h-10 w-10 mx-auto mt-5 text-white" />
        </span>
      )}
      <input
        id="file-upload"
        name="file-upload"
        type="file"
        className="sr-only"
        onChange={(e) => handleUpload(e.target.files as FileList)}
      />
    </label>
  );
}

function BoardForm({
  initialValue,
  submitForm,
  onCancel,
}: {
  initialValue?: any;
  submitForm: any;
  onCancel: any;
}) {
  const [title, setTitle] = useState(safeGet(initialValue, "name", ""));
  const [description, setDescription] = useState(
    safeGet(initialValue, "description", ""),
  );
  const [logo, setLogo] = useState(null);
  const [enabled, setEnabled] = useState(
    safeGet(initialValue, "privateBoard", false),
  );
  const [followersOnly, setFollowersOnly] = useState(
    safeGet(initialValue, "followersOnly", false),
  );

  useEffect(() => {
    if (!enabled && followersOnly) {
      setFollowersOnly(false);
    }
  }, [enabled]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    submitForm({
      title,
      description,
      logo,
      privateBoard: enabled,
      followersOnly,
    });
  }

  function handleClose(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    e;
    setTitle("");
    setDescription("");
    setLogo(null);

    onCancel();
  }

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div className="text-center mt-8 mb-8">
          <CircleFileUpload onChange={setLogo} />
        </div>
        <div className="mt-4">
          <span className="py-4">Title</span>
          <input
            type="text"
            name="title"
            placeholder="Title"
            value={title}
            className="w-full border border-gray-100 px-4 py-2 rounded-md shadow-md"
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="mt-4">
          <span className="py-2">Description</span>
          <textarea
            name="title"
            placeholder="Optional"
            className="w-full border border-gray-100 px-4 py-2 rounded-md shadow-md"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          ></textarea>
        </div>
        <div className="flex flex-row mt-4">
          <Switch
            checked={enabled}
            onChange={setEnabled}
            className={`${
              enabled ? "bg-blue-600" : "bg-gray-200"
            } relative inline-flex h-6 w-11 items-center rounded-full`}
          >
            <span className="sr-only">Private</span>
            <span
              className={`${
                enabled ? "translate-x-6" : "translate-x-1"
              } inline-block h-4 w-4 transform rounded-full bg-white`}
            />
          </Switch>
          <div className="grow font-bold ml-4">Hide from others</div>
        </div>
        {enabled && (
          <div className="flex flex-row mt-4">
            <Switch
              checked={followersOnly}
              onChange={setFollowersOnly}
              className={`${
                followersOnly ? "bg-blue-600" : "bg-gray-200"
              } relative inline-flex h-6 w-11 items-center rounded-full`}
            >
              <span className="sr-only">Private</span>
              <span
                className={`${
                  followersOnly ? "translate-x-6" : "translate-x-1"
                } inline-block h-4 w-4 transform rounded-full bg-white`}
              />
            </Switch>
            <div className="grow font-bold ml-4">Only my follows can view</div>
          </div>
        )}
      </form>
      <div className="flex flex-row space-x-4 mt-10">
        <button
          name="cancel"
          className="w-full bg-black text-white font-bold py-2 rounded-xl shadow-lg"
          onClick={handleClose}
        >
          Cancel
        </button>
        <button
          type="submit"
          name="submit"
          className="w-full bg-black text-white font-bold py-2 rounded-xl shadow-lg"
          onClick={() =>
            submitForm({
              title,
              description,
              logo,
              privateBoard: enabled,
              followersOnly,
            })
          }
        >
          {initialValue ? "Update" : "Create"}
        </button>
      </div>
    </>
  );
}

const MuseboardModal = NiceModal.create(() => {
  const { user } = useUser();
  const modal = useModal();
  const contract = useContract(import.meta.env.VITE_MUSEBOARD_CONTRACT, abi);
  const { addNew } = useBoardsQuery(user?.uid as string);
  const { getTokens, updateMetadata } = useMuseboard();
  const { sendTransaction } = useTransactionSender();
  const [loading, setLoading] = useState({ status: 0, message: "Not Loading" });
  const [error, setError] = useState<string | null>(null);
  const { contract: upContract } = useUniversalProfile(
    modal.args?.authUser as string,
  );

  async function createNew({
    title,
    description,
    logo,
    privateBoard,
    followersOnly,
  }: {
    title: string;
    description: string;
    logo: File;
    privateBoard: boolean;
    followersOnly: boolean;
  }) {
    if (!user) {
      window.alert("Not authenticated");

      return;
    }

    setError(null);

    try {
      const payload: Record<string, any> = {
        name: title,
        description,
        privateBoard,
        followersOnly,
      };

      // Ensure that proper permissions are set on the encryption key
      if (privateBoard) {
        setLoading({ status: 1, message: "Validating encryption keys" });
        const erc = getERC725(user.uid, LSP6KeyManager as ERC725JSONSchema[]);
        const wallet = await getEncryptionWallet();

        const permissions = await erc.fetchData({
          keyName: "AddressPermissions:Permissions:<address>",
          dynamicKeyParts: wallet.address,
        });
        const requiredPermissions = erc.encodePermissions({ DECRYPT: true });
        const permissionKey = erc.encodeKeyName(
          "AddressPermissions:Permissions:<address>",
          wallet.address,
        );

        if (!permissions.value) {
          setLoading({
            status: 1,
            message: "Setting encryption keys on Profile",
          });
          await sendTransaction(upContract, "setData", [
            permissionKey,
            requiredPermissions,
          ]);
        }
      }

      if (logo) {
        setLoading({ status: 1, message: "Uploading logo to IPFS" });
        const images = await uploadImage(logo);

        payload.images = images;
        payload.logo = images[0].url;
      }

      setLoading({ status: 1, message: "Uploading metadata to IPFS" });
      const metadata = await upload(payload);

      setLoading({ status: 1, message: "Commiting changes to blockchain" });

      await sendTransaction(contract, "mint", [metadata.jsonurl, "0x"]);

      setLoading({ status: 0, message: "Not Loading" });

      const boardId = addNew(title, [modal.args as TToken]);

      modal.resolve({ boardId });
      modal.hide();
    } catch (err: any) {
      if (err.code === "ACTION_REJECTED") {
        setError("User rejected the transaction");
      } else {
        console.error(err);

        setError("That did't go as expected. We'll take a look into this.");
      }

      setLoading({ status: 0, message: "Not Loading" });
    }
  }

  async function update({
    board,
    title,
    description,
    logo,
    privateBoard,
    followersOnly,
  }: {
    board: any;
    title: string;
    description: string;
    logo: File;
    privateBoard: boolean;
    followersOnly: boolean;
  }) {
    if (!user) {
      window.alert("Not authenticated");

      return;
    }

    setError(null);

    try {
      const payload = board;

      payload.name = title;
      payload.description = description;
      payload.privateBoard = privateBoard;
      payload.followersOnly = followersOnly;

      // Ensure that proper permissions are set on encryption key
      if (privateBoard) {
        const erc = getERC725(user.uid, LSP6KeyManager as ERC725JSONSchema[]);
        const wallet = await getEncryptionWallet();

        const permissions = await erc.fetchData({
          keyName: "AddressPermissions:Permissions:<address>",
          dynamicKeyParts: wallet.address,
        });
        const requiredPermissions = erc.encodePermissions({ DECRYPT: true });
        const permissionKey = erc.encodeKeyName(
          "AddressPermissions:Permissions:<address>",
          wallet.address,
        );

        if (!permissions.value) {
          setLoading({
            status: 1,
            message: "Setting encryption keys on Profile",
          });
          await sendTransaction(upContract, "setData", [
            permissionKey,
            requiredPermissions,
          ]);
        }
      }

      if (privateBoard !== !(modal.args?.data as any).privateBoard) {
        setLoading({
          status: 1,
          message: privateBoard
            ? "Fetching and encrypting tokens"
            : "Fetching and decrypting tokens",
        });

        const data = await getTokens(board.id);
        await updateMetadata(
          board.id,
          "tokens",
          data,
          privateBoard,
          followersOnly,
          setLoading,
        );
      }

      if (logo) {
        setLoading({ status: 1, message: "Uploading logo to IPFS" });
        const images = await uploadImage(logo);

        payload.images = images;
        payload.logo = images[0].url;
      }

      setLoading({ status: 1, message: "Uploading metadata to IPFS" });
      const metadata = await upload(payload);

      setLoading({ status: 1, message: "Commiting changes to blockchain" });

      await sendTransaction(contract, "updateMetadata", [
        "metadata",
        board.id,
        metadata.jsonurl,
      ]);

      setLoading({ status: 0, message: "Not Loading" });

      // const boardId = addNew(title, [modal.args as TToken]);

      modal.resolve({ boardId: board.id });
      modal.hide();
    } catch (err: any) {
      if (err.code === "ACTION_REJECTED") {
        setError("User rejected the transaction");
      } else {
        console.error(err);

        setError("That did't go as expected. We'll take a look into this.");
      }

      setLoading({ status: 0, message: "Not Loading" });
      setError(err.message);
    }
  }

  function handleSubmit({
    title,
    description,
    logo,
    privateBoard,
    followersOnly,
  }: {
    title: string;
    description: string;
    logo: File;
    privateBoard: boolean;
    followersOnly: boolean;
  }) {
    console.log("upon submission", followersOnly);

    if (modal.args?.update) {
      return update({
        board: modal.args.data,
        title,
        description,
        logo,
        privateBoard,
        followersOnly,
      });
    }

    return createNew({ title, description, logo, privateBoard, followersOnly });
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
                  {modal.args?.update ? "Update board" : "Create new board"}
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
                  <BoardForm
                    initialValue={modal.args?.data}
                    submitForm={handleSubmit}
                    onCancel={() => modal.hide()}
                  />
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
});

export default MuseboardModal;
