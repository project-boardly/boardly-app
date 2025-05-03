import './styles.scss';

import { EditorContent, BubbleMenu, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Color } from '@tiptap/extension-color'
import ListItem from '@tiptap/extension-list-item'
import TextStyle from '@tiptap/extension-text-style'

import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';

import type { Editor } from '@tiptap/react'

import { NumberedListIcon, ListBulletIcon, BoldIcon, ItalicIcon, StrikethroughIcon, H1Icon, H2Icon, H3Icon, CodeBracketIcon, ArrowUturnLeftIcon, ArrowUturnRightIcon, } from '@heroicons/react/24/solid'
import useLitNetwork from '../../hooks/useLitNetwork';
import { getFollowerOnlyBoardConditions, getPrivateBoardConditions } from '../../contexts/LitNetworkContext';
import { useContext, useEffect, useState } from 'react';
import { Switch } from '@headlessui/react';
import { upload } from '../../utils/ipfs';
import MiniAppContainer from '../../common/MiniAppContainer';
import { Link } from 'react-router-dom';
import { PlusIcon } from '@heroicons/react/24/outline';
import UniversalProfileContract from "@lukso/universalprofile-contracts/artifacts/UniversalProfile.json";

import { LuksoContext } from '../../providers/LuksoProvider';
import ERC725 from '@erc725/erc725.js';
import { encodeFunctionData, hexToBigInt } from 'viem';
import { luksoTestnet } from 'viem/chains';
import toast from 'react-hot-toast';

function HistoryControls({ editor }: { editor: Editor }) {
  return <>
    <button
      onClick={() => editor.chain().focus().undo().run()}
      disabled={
        !editor.can()
          .chain()
          .focus()
          .undo()
          .run()
      }
    >
      <ArrowUturnLeftIcon height={12} width={12} />
    </button>
    <button
      onClick={() => editor.chain().focus().redo().run()}
      disabled={
        !editor.can()
          .chain()
          .focus()
          .redo()
          .run()
      }
    >
      <ArrowUturnRightIcon height={12} width={12} />
    </button></>
}

function Controls({ editor }: { editor: Editor }) {
  return <>        <button
    onClick={() => editor.chain().focus().toggleBulletList().run()}
    className={editor.isActive('bulletList') ? 'is-active' : ''}
  >
    <ListBulletIcon height={12} width={12} />
  </button>
    <button
      onClick={() => editor.chain().focus().toggleOrderedList().run()}
      className={editor.isActive('orderedList') ? 'is-active' : ''}
    >
      <NumberedListIcon height={12} width={12} />
    </button>
    <button
      onClick={() => editor.chain().focus().toggleCodeBlock().run()}
      className={editor.isActive('codeBlock') ? 'is-active' : ''}
    >
      <CodeBracketIcon height={12} width={12} />
    </button></>
}

function Headings({ editor }: { editor: Editor }) {
  return <>
    <button
      onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
      className={editor.isActive('heading', { level: 1 }) ? 'is-active' : ''}
    >
      <H1Icon height={12} width={12} />
    </button>
    <button
      onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      className={editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}
    >
      <H2Icon height={12} width={12} />
    </button>
    <button
      onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      className={editor.isActive('heading', { level: 3 }) ? 'is-active' : ''}
    >
      <H3Icon height={12} width={12} />
    </button>
  </>
}

function TextOptions({ editor }: { editor: Editor }) {
  return <>
    <button
      onClick={() => editor.chain().focus().toggleBold().run()}
      disabled={
        !editor.can()
          .chain()
          .focus()
          .toggleBold()
          .run()
      }
      className={editor.isActive('bold') ? 'is-active' : ''}
    >
      <BoldIcon height={12} width={12} />
    </button>
    <button
      onClick={() => editor.chain().focus().toggleItalic().run()}
      disabled={
        !editor.can()
          .chain()
          .focus()
          .toggleItalic()
          .run()
      }
      className={editor.isActive('italic') ? 'is-active' : ''}
    ><ItalicIcon height={12} width={12} />
    </button>
    <button
      onClick={() => editor.chain().focus().toggleStrike().run()}
      disabled={
        !editor.can()
          .chain()
          .focus()
          .toggleStrike()
          .run()
      }
      className={editor.isActive('strike') ? 'is-active' : ''}
    ><StrikethroughIcon height={12} width={12} />
    </button>
  </>
}

const MenuBar = ({ editor }: { editor: Editor }) => {
  if (!editor) {
    return null
  }

  return (
    <div className="control-group">
      <div className="button-group">
        {/* <TextOptions editor={editor} /> */}
        <Headings editor={editor} />
        <Controls editor={editor} />
        <HistoryControls editor={editor} />
      </div>
    </div>
  )
}

const extensions = [
  StarterKit,
  Placeholder.configure({
    // placeholder: ({ node }) => {
    //   return 'What’s the title?'
    // },
    placeholder: 'Write something'
  }),
  Color.configure({ types: [TextStyle.name, ListItem.name] }),
  TextStyle,
  BulletList.configure({
    HTMLAttributes: {
      class: 'list-disc'
    }
  }),
  OrderedList.configure({
    HTMLAttributes: {
      class: 'list-decimal'
    }
  }),
  TextAlign.configure({
    types: ['heading', 'paragraph'],
  }),
]

const Tiptap = ({ section, onUpdate }: { section: any, onUpdate: (props: { data: any, private: boolean, followersOnly: boolean }) => void }) => {
  const [privateBoard, setPrivate] = useState(false);
  const [followersOnly, setFollowersOnly] = useState(false);

  const editor = useEditor({
    extensions,
    editable: true,
    onUpdate: (props) => {
      onUpdate({
        data: props.editor.getJSON(),
        private: privateBoard,
        followersOnly
      })
    }
  })

  useEffect(() => {
    if (!editor) { return; }

    onUpdate({
      data: editor.getJSON(),
      private: privateBoard,
      followersOnly
    });
  }, [followersOnly, privateBoard]);

  console.log(section);

  return (
    <>

      <div className="relative">
        <div className="shadow-xl bg-white border mt-2 rounded-xl overflow-hidden">
          {editor && <div className="px-4 w-full py-2 bg-gray-100">
            <MenuBar editor={editor} />
          </div>}
          <EditorContent editor={editor} className="editor-container" />
          {editor && <BubbleMenu className="bubble-menu" tippyOptions={{ duration: 100 }} editor={editor}>
            <TextOptions editor={editor} />
          </BubbleMenu>}
        </div>
        {/* <small className="text-gray-700">Markdown syntax is supported</small> */}
      </div>
      <div className="bg-gray-50 pt-8 -mt-8 pb-2 border rounded-xl">
        <div className="flex flex-row mx-2 mt-2">
          <Switch
            checked={privateBoard}
            onChange={setPrivate}
            className={`${privateBoard ? "bg-blue-600" : "bg-gray-400"
              } relative inline-flex h-5 w-7 items-center rounded-full`}
          >
            <span className="sr-only">Private</span>
            <span
              className={`${privateBoard ? "translate-x-3" : "translate-x-1"
                } inline-block h-3 w-3 transform rounded-full bg-white shadow`}
            />
          </Switch>
          <div className="grow text-sm ml-2">Make this section private</div>
        </div>
        {privateBoard && (
          <div className="flex flex-row mt-4 mx-2">
            <Switch
              checked={followersOnly}
              onChange={setFollowersOnly}
              className={`${followersOnly ? "bg-blue-600" : "bg-gray-400"
                } relative inline-flex h-5 w-7 items-center rounded-full`}
            >
              <span className="sr-only">Private</span>
              <span
                className={`${followersOnly ? "translate-x-3" : "translate-x-1"
                  } inline-block h-3 w-3 transform rounded-full bg-white shadow`}
              />
            </Switch>
            <div className="grow text-sm ml-2">Only my followers can view this section</div>
          </div>
        )}
      </div>

    </>
  )
}

const RPC_URL = 'https://rpc.testnet.lukso.network';
const config = {
  ipfsGateway: 'https://boardly-ipfs-proxy.project-boardly.workers.dev/ipfs/',
  gas: 20_000_000, // optional, default is 1_000_000
};

export default function CreateSomething() {
  const [title, setTitle] = useState('');
  const [, setLoading] = useState({ status: 0, message: "Not Loading" });
  const litUtil = useLitNetwork();
  const ctx = useContext(LuksoContext);
  const [sections, setSections] = useState<any[]>([{}]);

  async function saveContent() {
    if (!ctx) { return; }

    const { connected, provider, account } = ctx;

    if (!connected || !provider || !account) { return; }

    if (!title) {
      window.alert('Title is required!');

      return;
    }

    setLoading({ status: 1, message: "Validating encryption keys" });
    const toastId = toast.loading('Validating encryption keys');

    const preparedSections = await Promise.all(sections.map(async (sec) => {
      let conditions;

      if (!sec.private) {
        return {
          encrypted: false,
          content: sec
        };
      }

      if (!sec.followersOnly) {
        conditions = getPrivateBoardConditions(account);
      }
      else {
        conditions = getFollowerOnlyBoardConditions(account);
      }

      if (!litUtil) {
        console.log('it looks like lit util is not present');

        return;
      }

      const encData = await litUtil.encrypt(JSON.stringify(sec), conditions);

      return {
        encrypted: true,
        conditions,
        content: encData
      }
    }));

    const data = { title, sections: preparedSections, createdAt: Date.now() };

    toast.loading('Uploading data to IPFS', { id: toastId });

    const dataIpfs = await upload(data);

    const promise = addToList(dataIpfs.jsonurl as string);

    toast.promise(promise, {
      loading: 'Commiting the changes to blockchain',
      success: 'Done',
      error: 'Something went wrong while commiting changes to blockchain'
    }, { id: toastId });

    promise.then(console.log);

    await promise;

    window.location.pathname = `/user/${account}`
  }

  async function addToList(url: string) {
    if (!ctx) { return; }

    const { account, clients } = ctx;

    const schemas = [
      {
        name: 'BoardlyContent[]',
        key: '0x187419b75ac8171237488ba5ef5b320d696cc2c1797d164c9e8c669e5420f90f',
        keyType: 'Array',
        valueType: 'bytes',
        valueContent: 'VerifiableURI',
      },
    ];
    const myErc725 = new ERC725(schemas, account, RPC_URL, config);

    const listLengthStr = await clients.public.readContract({
      address: account as `0x${string}`,
      abi: UniversalProfileContract.abi,
      account: account as `0x${string}`,
      functionName: 'getData',
      args: ['0x187419b75ac8171237488ba5ef5b320d696cc2c1797d164c9e8c669e5420f90f']
    }) as `0x${string}`;

    const listLength = listLengthStr === '0x' ? 0 : Number(hexToBigInt(listLengthStr).valueOf());

    const { keys, values } = myErc725.encodeData([
      {
        keyName: 'BoardlyContent[]',
        value: [
          url
        ],
        totalArrayLength: 1 + listLength,
        startingIndex: listLength as number
      }
    ]);

    const calldata = encodeFunctionData({
      abi: UniversalProfileContract.abi,
      functionName: 'setDataBatch',
      args: [keys, values]
    });

    return clients.wallet.writeContract({
      address: account as `0x${string}`,
      chain: luksoTestnet,
      abi: UniversalProfileContract.abi,
      account: account as `0x${string}`,
      functionName: 'execute',
      args: [0, account, 0, calldata]
    });
  }

  function updateSection(idx: number, data: any) {
    const newSections = Array.from(sections);

    newSections[idx] = data;

    setSections(newSections);
  }

  return <MiniAppContainer footer={<div className="m-2 space-y-2"><button className="w-full text-center py-2 border bg-gray-900 text-white rounded-lg" onClick={saveContent}>Save Content</button>
    <Link className="block text-center" to={`/user/${ctx?.account}`}>Cancel</Link></div>}>
    <input
      type="text"
      value={title}
      autoFocus
      placeholder='Title'
      onChange={(e) => setTitle(e.target.value)}
      className="w-full text-3xl text-bold pl-4 outline-none mt-2 border py-2 rounded-xl"
    />
    {sections.map((section, idx) => <Tiptap key={idx} section={section} onUpdate={(sectionData) => updateSection(idx, sectionData)} />)}
    <div className="my-4 pb-24 space-y-2">
      <button className="w-full text-center py-2 border rounded-lg" onClick={() => setSections(sections.concat([{}]))}><PlusIcon className="inline mr-2" height={14} width={14} />Add Section</button>
    </div>
  </MiniAppContainer>
}