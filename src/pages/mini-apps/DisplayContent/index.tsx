import './styles.scss';

import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Color } from '@tiptap/extension-color'
import ListItem from '@tiptap/extension-list-item'
import TextStyle from '@tiptap/extension-text-style'

import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';

import useLitNetwork from '../../../hooks/useLitNetwork';
import { useContext, useEffect, useState } from 'react';
import MiniAppContainer from '../../../common/MiniAppContainer';
import { LuksoContext, publicClient } from '../../../providers/LuksoProvider';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

import UniversalProfileContract from "@lukso/universalprofile-contracts/artifacts/UniversalProfile.json";
import ERC725 from '@erc725/erc725.js';
import { getAddress, stringToHex } from 'viem';
import { ShortAddress } from '../../../common/components';

const NOT_AUTHORISED_ERROR = 'NodeAccessControlConditionsReturnedNotAuthorized';

const extensions = [
  StarterKit,
  Placeholder.configure({
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

const notAuthorisedBody = { "type": "doc", "content": [{ "type": "paragraph", "attrs": { "textAlign": null }, "content": [{ "type": "text", "text": "You don't have access to view this section" }] }] };
const decryptionFailedBody = (message: string) => ({ "type": "doc", "content": [{ "type": "paragraph", "attrs": { "textAlign": null }, "content": [{ "type": "text", "text": "We were not able to decrypt the data of this section. Please Try Again" }] }, { "type": "paragraph", "attrs": { "textAlign": null }, "content": [{ "type": "text", "text": message }] }] });

type EncryptedSectionStructure = {
  ciphertext: string,
  hash: string
}
function EncryptedSection({ section, conditions }: { section: EncryptedSectionStructure, conditions: any }) {
  const [loading, setLoading] = useState({ loading: false, message: '' });
  const [loaded, setLoaded] = useState(false);
  const [data, setData] = useState<SectionStructure>({} as SectionStructure);
  const litUtil = useLitNetwork();
  const ctx = useContext(LuksoContext);

  useEffect(() => {
    if (!ctx) { return; }

    const { account, provider } = ctx;

    if (!account) { return; }

    async function run() {
      setLoading({ loading: true, message: 'Preparing Private Content' });

      if (!account || !provider) { return; }

      let data: any = JSON.stringify({ data: decryptionFailedBody(section.hash) });

      try {
        data = await litUtil?.decrypt(section.ciphertext, section.hash, conditions);
      }
      catch (err: any) {
        if (err.info.errorCode === NOT_AUTHORISED_ERROR) {
          data = JSON.stringify({ data: notAuthorisedBody });
        }
        else {
          console.log(err);
        }
      }

      if (!data) {
        console.log('data not found');
        return;
      }

      setData({
        content: {
          data: JSON.parse(data).data
        },
        encrypted: false
      });
      setLoading({ loading: false, message: '' });
      setLoaded(true);
    };

    run().catch(console.log);
  }, [ctx, ctx?.account]);

  if (loading.loading) {
    return <p>Loading</p>
  }

  if (loaded) {
    return <DisplaySection section={data} />
  }

  return <p>Something</p>
}


type SectionStructure = {
  encrypted: boolean,
  content: any,
  conditions?: any
};
function DisplaySection({ section }: { section: SectionStructure }) {
  const editor = useEditor({
    extensions,
    editable: false,
    content: section.content.data
  });

  if (section.encrypted) {
    return <EncryptedSection conditions={section.conditions} section={section.content as EncryptedSectionStructure} />
  }

  return <EditorContent editor={editor} className="editor-container-reader" />
}
type ContentStructure = {
  title: string,
  sections: any[]
}
function DisplayContent({ data }: { data: ContentStructure }) {
  const params = useParams();

  if (!data.sections) {
    return <>Content not found</>
  }

  return <div className="pb-24">
    <h1 className='text-xl font-bold'>{data.title}</h1>
    <a
      href={`https://universaleverything.io/${params.address}?assetType=owned&assetGroup=grid&network=testnet`}
      target="_blank"
    >
      Creator: <ShortAddress address={params.address as string} />
    </a>
    {data.sections.map((sec, idx) => <DisplaySection key={idx} section={sec} />)}
  </div>
}

export default function Widget() {
  const params = useParams();
  const luksoContext = useContext(LuksoContext);
  const query = useQuery({
    queryKey: ['ipfs-data', params.address, params.id],
    queryFn: async () => {
      const account = params.address as `0x${string}`;

      const value = await publicClient.readContract({
        address: account,
        abi: UniversalProfileContract.abi,
        account: account,
        functionName: 'getData',
        args: [params.id]
      }) as string;

      if (value === '0x') {
        return {
          content: {},
          verification: {}
        }
      }

      const data = ERC725.decodeDataSourceWithHash(value);

      const res = await fetch(data.url.replace('ipfs://', 'https://ipfs.io/ipfs/'))

      return {
        content: await res.json(),
        verification: data.verification
      }
    },
    refetchOnMount: false,
    refetchOnWindowFocus: false
  })

  if (query.isLoading) {
    return <p>Loading Content</p>
  }

  if (!query.data) {
    return <p>Something went wrong while fetching data</p>
  }

  function getUrl(address: string, id: string) {
    return stringToHex(`${import.meta.env.VITE_APP_HOST}/user/${address}/view/${id}`);
  }

  function canAddToGrid() {
    if (!luksoContext?.connected) {
      console.log('xyzx');      

      return false;
    }

    const viewingSelfProfile = luksoContext?.contextAccount === luksoContext?.account;
    const viewingSelfContent = getAddress(luksoContext.account) === getAddress(params.address as `0x${string}`);

    console.log({
      viewingSelfProfile,
      viewingSelfContent
    });

    if (viewingSelfProfile && viewingSelfContent) {
      return true
    }

    if (!viewingSelfProfile) {
      return true;
    }

    return false;
  }

  const footer = (<div className="flex flex-row m-4 space-x-2">
    {canAddToGrid() && <div className="flex grow min-w-[50%]"><Link
      className="bg-gray-900 w-full text-white font-bold text-center rounded-lg shadow py-2"
      to={`/add/${getUrl(params.address as string, params.id as string)}`}
    >
      Add to Grid
    </Link></div>}
    <div className="flex grow">
      <a className="w-full border border-gray-900 hover:bg-gray-900 hover:text-red-50 text-gray-900 text-center rounded-lg py-2" href={`/user/${params.address}`}>
        View Author Profile
      </a>
    </div>
  </div>);

  return <MiniAppContainer footer={footer}>
    <DisplayContent data={query.data.content as ContentStructure} />
  </MiniAppContainer>
}
