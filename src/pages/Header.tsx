import { Disclosure } from "@headlessui/react";
import {
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

import { Link } from "react-router-dom";

import { User, getAuth, onAuthStateChanged } from "firebase/auth";
import { useConnectWallet } from "@web3-onboard/react";
import { useEffect, useState } from "react";
import { BrowserProvider } from "ethers";

import { hooks } from "../connectors/default";
import { authenticate } from "../utils/siwe";
import { LinkButton, Button } from "../common/buttons";

import logo from "../logo.svg";

function NavActions() {
  const [user, setUser] = useState<string | User | null>(null);
  const [, connectToProvider] = useConnectWallet();

  useEffect(() => {
    onAuthStateChanged(getAuth(), setUser);
  }, []);

  async function disconnect() {
    const auth = getAuth();
    console.log("sign out");

    await auth.signOut();
    localStorage.removeItem("museboard:connected:wallet");
  }

  async function connect() {
    localStorage.removeItem("museboard:connected:wallet");

    connectToProvider().then((wallets) => {
      const wallet = wallets[0],
        address = wallet.accounts[0].address;

      return authenticate(address, new BrowserProvider(wallet.provider)).then(() => {
        localStorage.setItem('museboard:connected:wallet', address);
        setUser(address);
      });
    });
  }

  if (!user) {
    return (
      <>
        <Button onClick={() => connect()}>
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
      </>
    );
  }

  return (
    <>
      <Button onClick={disconnect}>
        <span className="sr-only">Sign Out</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
          />
        </svg>
      </Button>
    </>
  );
}

export default function Header() {
  const account = hooks.useAccount();

  return (
    <Disclosure as="nav" className="bg-white">
      {({ open }) => (
        <>
          <div className="mx-auto px-16 relative">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <Link to="/" className="flex-shrink-0">
                  <img src={logo} alt="Museboard" />
                </Link>
              </div>
              <div className="grow"></div>
              <div className="hidden lg:block">
                <div className="ml-4 flex items-center lg:ml-6">
                  <NavActions />
                </div>
              </div>
              <div className="-mr-2 flex lg:hidden">
                {/* Mobile menu button */}
                <Disclosure.Button className="rounded-full border p-2">
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
            </div>
          </div>

          <Disclosure.Panel className="lg:hidden">
            <div className="pt-4 pb-3 h-screen">
              <div className="flex flex-col space-y-2">
              <NavActions/>
              </div>
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}
