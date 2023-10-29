
import { ClipboardDocumentListIcon } from '@heroicons/react/24/outline';
import { UseQueryResult } from "@tanstack/react-query";
import { Button } from './buttons';
import { useConnectWallet } from '@web3-onboard/react';
import { authenticate } from '../utils/siwe';
import { BrowserProvider } from 'ethers';

export function ShortAddress ({ address }: { address: string }) {
  return <a className="cursor-pointer inline" onClick={() => navigator.clipboard.writeText(address)}>
    {address.slice(0,5)}...{address.slice(address.length - 3)}
  </a>
}

type QueryResultViewType = { query: UseQueryResult, element: (data: any) => JSX.Element | JSX.Element[]};

export function QueryResultView ({ query, element }: QueryResultViewType) {
  const { isLoading, isError, error, data } = query;

  if (isLoading) {
    return <p>Loading</p>
  }

  if (isError) {
    return <p>{(error as Error).message}</p>
  }

  return <>{element(data)}</>;
}

function copy (text: string) {
  navigator.clipboard.writeText(text)
}

export function Address({ address }: { address: string }) {
  return (
      <p>
        <span className="pr-2">{address.substring(0, 5)}...{address.substring(address.length - 5)}</span>
        <button className="inline" onClick={() => copy(address)}><ClipboardDocumentListIcon className="h-5 w-5"/></button>
      </p>
  );
}

export function ConnectWallet({ onChange }: { onChange?: (address: string | null) => void }) {
  const [, connectToProvider] = useConnectWallet();

  async function connect() {
    !!onChange && onChange(null);
    localStorage.removeItem("museboard:connected:wallet");

    connectToProvider().then((wallets) => {
      const wallet = wallets[0],
        address = wallet.accounts[0].address;

      return authenticate(address, new BrowserProvider(wallet.provider)).then(
        () => {
          localStorage.setItem("museboard:connected:wallet", address);
          !!onChange && onChange(address);
        }
      );
    });
  }

  return <Button onClick={() => connect()}>
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="inline mx-1"
    >
      <g clipPath="url(#clip0_817_926)">
        <path
          d="M14.1666 6.66634V4.16634C14.1666 3.94533 14.0788 3.73337 13.9226 3.57709C13.7663 3.42081 13.5543 3.33301 13.3333 3.33301H4.99998C4.55795 3.33301 4.13403 3.5086 3.82147 3.82116C3.50891 4.13372 3.33331 4.55765 3.33331 4.99967M3.33331 4.99967C3.33331 5.4417 3.50891 5.86563 3.82147 6.17819C4.13403 6.49075 4.55795 6.66634 4.99998 6.66634H15C15.221 6.66634 15.433 6.75414 15.5892 6.91042C15.7455 7.0667 15.8333 7.27866 15.8333 7.49967V9.99967M3.33331 4.99967V14.9997C3.33331 15.4417 3.50891 15.8656 3.82147 16.1782C4.13403 16.4907 4.55795 16.6663 4.99998 16.6663H15C15.221 16.6663 15.433 16.5785 15.5892 16.4223C15.7455 16.266 15.8333 16.054 15.8333 15.833V13.333"
          stroke="black"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M16.6667 10V13.3333H13.3334C12.8913 13.3333 12.4674 13.1577 12.1548 12.8452C11.8423 12.5326 11.6667 12.1087 11.6667 11.6667C11.6667 11.2246 11.8423 10.8007 12.1548 10.4882C12.4674 10.1756 12.8913 10 13.3334 10H16.6667Z"
          stroke="black"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_817_926">
          <rect width="20" height="20" fill="white" />
        </clipPath>
      </defs>
    </svg>
    Connect Wallet
  </Button>
}