import { Disclosure } from "@headlessui/react";
import {
  BellIcon,
  Bars3Icon,
  XMarkIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";

import { Link } from "react-router-dom";

import logo from "../logo.svg";

import { hooks } from "../connectors/default";
import { User, getAuth, onAuthStateChanged } from "firebase/auth";
import { useConnectWallet } from "@web3-onboard/react";
import { ReactNode, useEffect, useState } from "react";

function Button({
  children,
  onClick,
  ...props
}: {
  children: ReactNode;
  onClick: any;
}) {
  return (
    <button
      type="button"
      className="px-4 mx-1 py-2 rounded-full border text-gray-800 transition duration-700 hover:bg-gray-200 hover:text-gray-900  focus:outline-none font-medium"
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
}

function LinkButton({
  to,
  children,
  variant,
  ...props
}: {
  children: ReactNode;
  to: string;
  variant?: string;
}) {
  const baseClassNames =
    "px-4 mx-1 py-2 rounded-full border text-gray-800 transition duration-700 hover:bg-gray-200 hover:text-gray-900  focus:outline-none font-medium";
  const darkClassNames =
    "px-4 mx-1 py-2 rounded-full border text-gray-800 transition duration-700 hover:bg-gray-200 hover:text-gray-900 focus:outline-none font-medium" +
    "text-white bg-black";

  return (
    <Link
      to={to}
      className={variant === "dark" ? darkClassNames : baseClassNames}
      {...props}
    >
      {children}
    </Link>
  );
}

function LeftActions() {
  return (
    <>
      <LinkButton to="/marketplace">Marketplace</LinkButton>
      <LinkButton to="/trade">Trade</LinkButton>
      <LinkButton to="/trade">Jury</LinkButton>
      <LinkButton to="/trade">Claim</LinkButton>
    </>
  );
}

function NavActions() {
  const account = hooks.useAccount();
  const [user, setUser] = useState<User | null>(null);
  const [, connectToProvider] = useConnectWallet();

  useEffect(() => {
    onAuthStateChanged(getAuth(), setUser);
  }, []);

  async function disconnect() {
    const auth = getAuth();
    console.log("sign out");

    await auth.signOut();
    localStorage.removeItem("family:connected:wallet");
  }

  async function connect() {
    localStorage.removeItem("family:connected:wallet");

    await connectToProvider();
  }

  if (!user) {
    return (
      <>
        <LinkButton to="/store">Store</LinkButton>
        <LinkButton to="/inventory">Inventory</LinkButton>
        <LinkButton to="/bag" variant="dark">
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g clipPath="url(#clip0_817_917)">
              <path
                d="M5.27581 6.66699H14.725C14.9653 6.66696 15.2028 6.7189 15.4211 6.81924C15.6395 6.91958 15.8335 7.06596 15.99 7.24833C16.1465 7.4307 16.2617 7.64475 16.3277 7.87581C16.3937 8.10687 16.409 8.34948 16.3725 8.58699L15.3266 15.3803C15.2359 15.9707 14.9367 16.509 14.4833 16.8979C14.0299 17.2868 13.4523 17.5005 12.855 17.5003H7.14498C6.54781 17.5003 5.97038 17.2865 5.51717 16.8977C5.06396 16.5088 4.76492 15.9706 4.67415 15.3803L3.62831 8.58699C3.59179 8.34948 3.60705 8.10687 3.67307 7.87581C3.73908 7.64475 3.85428 7.4307 4.01077 7.24833C4.16725 7.06596 4.36133 6.91958 4.57968 6.81924C4.79804 6.7189 5.03551 6.66696 5.27581 6.66699Z"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M7.5 9.16667V5C7.5 4.33696 7.76339 3.70107 8.23223 3.23223C8.70107 2.76339 9.33696 2.5 10 2.5C10.663 2.5 11.2989 2.76339 11.7678 3.23223C12.2366 3.70107 12.5 4.33696 12.5 5V9.16667"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
            <defs>
              <clipPath id="clip0_817_917">
                <rect width="20" height="20" fill="white" />
              </clipPath>
            </defs>
          </svg>
        </LinkButton>
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
      <LinkButton to="/store">Store</LinkButton>
      <LinkButton to="/inventory">Inventory</LinkButton>
      <LinkButton to="/bag" variant="dark">
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g clipPath="url(#clip0_817_917)">
            <path
              d="M5.27581 6.66699H14.725C14.9653 6.66696 15.2028 6.7189 15.4211 6.81924C15.6395 6.91958 15.8335 7.06596 15.99 7.24833C16.1465 7.4307 16.2617 7.64475 16.3277 7.87581C16.3937 8.10687 16.409 8.34948 16.3725 8.58699L15.3266 15.3803C15.2359 15.9707 14.9367 16.509 14.4833 16.8979C14.0299 17.2868 13.4523 17.5005 12.855 17.5003H7.14498C6.54781 17.5003 5.97038 17.2865 5.51717 16.8977C5.06396 16.5088 4.76492 15.9706 4.67415 15.3803L3.62831 8.58699C3.59179 8.34948 3.60705 8.10687 3.67307 7.87581C3.73908 7.64475 3.85428 7.4307 4.01077 7.24833C4.16725 7.06596 4.36133 6.91958 4.57968 6.81924C4.79804 6.7189 5.03551 6.66696 5.27581 6.66699Z"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M7.5 9.16667V5C7.5 4.33696 7.76339 3.70107 8.23223 3.23223C8.70107 2.76339 9.33696 2.5 10 2.5C10.663 2.5 11.2989 2.76339 11.7678 3.23223C12.2366 3.70107 12.5 4.33696 12.5 5V9.16667"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
          <defs>
            <clipPath id="clip0_817_917">
              <rect width="20" height="20" fill="white" />
            </clipPath>
          </defs>
        </svg>
      </LinkButton>
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

export default function Footer() {
  return (
    <div className="mx-auto px-4 sm:px-6 lg:px-8 absolute bottom-0 left-0 right-0 text-gray-400">
      <div className="flex items-center justify-between h-16">
        <div className="hidden md:block">
          <div className="ml-4 flex items-center md:ml-6 space-x-4">
            <a>© Family, Inc.</a>
            <a>Terms</a>
            <a>Privacy policy</a>
          </div>
        </div>
        <div className="grow"></div>
        <div className="hidden md:block">
          <div className="ml-4 flex items-center md:ml-6 space-x-3">
            <a>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M22 12.0607C22 6.504 17.5233 2 12 2C6.47667 2 2 6.504 2 12.0607C2 17.0833 5.656 21.2453 10.4373 22V14.9693H7.89867V12.06H10.4373V9.844C10.4373 7.32267 11.93 5.92933 14.2147 5.92933C15.308 5.92933 16.4533 6.126 16.4533 6.126V8.602H15.1913C13.9493 8.602 13.5627 9.378 13.5627 10.174V12.0607H16.336L15.8927 14.9687H13.5627V22C18.344 21.2453 22 17.0833 22 12.0607Z"
                  fill="black"
                  fillOpacity="0.5"
                />
              </svg>
            </a>
            <a>
              <svg
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M18 1.32353V16.6765C18 17.0275 17.8606 17.3641 17.6123 17.6123C17.3641 17.8606 17.0275 18 16.6765 18H1.32353C0.972508 18 0.635863 17.8606 0.387653 17.6123C0.139443 17.3641 0 17.0275 0 16.6765L0 1.32353C0 0.972508 0.139443 0.635863 0.387653 0.387653C0.635863 0.139443 0.972508 0 1.32353 0L16.6765 0C17.0275 0 17.3641 0.139443 17.6123 0.387653C17.8606 0.635863 18 0.972508 18 1.32353ZM5.29412 6.88235H2.64706V15.3529H5.29412V6.88235ZM5.53235 3.97059C5.53375 3.77036 5.49569 3.57182 5.42035 3.3863C5.34502 3.20078 5.23387 3.03191 5.09328 2.88935C4.95268 2.74678 4.78537 2.6333 4.60091 2.5554C4.41646 2.47749 4.21846 2.43668 4.01824 2.43529H3.97059C3.5634 2.43529 3.17289 2.59705 2.88497 2.88497C2.59705 3.17289 2.43529 3.5634 2.43529 3.97059C2.43529 4.37777 2.59705 4.76828 2.88497 5.05621C3.17289 5.34413 3.5634 5.50588 3.97059 5.50588C4.17083 5.51081 4.37008 5.47623 4.55696 5.40413C4.74383 5.33202 4.91467 5.2238 5.0597 5.08565C5.20474 4.94749 5.32113 4.78212 5.40223 4.59897C5.48333 4.41582 5.52755 4.21848 5.53235 4.01824V3.97059ZM15.3529 10.2071C15.3529 7.66059 13.7329 6.67059 12.1235 6.67059C11.5966 6.6442 11.0719 6.75644 10.6019 6.9961C10.1318 7.23577 9.73285 7.59448 9.44471 8.03647H9.37059V6.88235H6.88235V15.3529H9.52941V10.8476C9.49115 10.3862 9.63649 9.92835 9.93388 9.57347C10.2313 9.2186 10.6567 8.9954 11.1176 8.95235H11.2182C12.06 8.95235 12.6847 9.48177 12.6847 10.8159V15.3529H15.3318L15.3529 10.2071Z"
                  fill="black"
                  fillOpacity="0.5"
                />
              </svg>
            </a>
            <a>
              <svg
                width="20"
                height="16"
                viewBox="0 0 20 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M16.9308 1.64161C15.6561 1.05671 14.2892 0.625776 12.8599 0.378965C12.8339 0.374202 12.8079 0.386106 12.7945 0.409914C12.6187 0.722593 12.4239 1.13051 12.2876 1.45113C10.7503 1.22099 9.22099 1.22099 7.71527 1.45113C7.57887 1.12338 7.37707 0.722593 7.20048 0.409914C7.18707 0.3869 7.16107 0.374996 7.13504 0.378965C5.70659 0.624988 4.33963 1.05592 3.06411 1.64161C3.05307 1.64637 3.04361 1.65431 3.03732 1.66462C0.444493 5.53826 -0.265792 9.31668 0.0826501 13.0483C0.0842267 13.0665 0.0944749 13.084 0.108665 13.0951C1.81934 14.3514 3.47642 15.114 5.10273 15.6196C5.12876 15.6275 5.15634 15.618 5.1729 15.5965C5.55761 15.0712 5.90054 14.5172 6.19456 13.9347C6.21192 13.9006 6.19535 13.8601 6.15989 13.8466C5.61594 13.6403 5.098 13.3887 4.59977 13.103C4.56037 13.08 4.55721 13.0236 4.59347 12.9966C4.69831 12.9181 4.80318 12.8363 4.9033 12.7538C4.92141 12.7387 4.94665 12.7356 4.96794 12.7451C8.24107 14.2395 11.7846 14.2395 15.0191 12.7451C15.0404 12.7348 15.0657 12.7379 15.0846 12.753C15.1847 12.8356 15.2895 12.9181 15.3952 12.9966C15.4314 13.0236 15.4291 13.08 15.3897 13.103C14.8914 13.3943 14.3735 13.6403 13.8288 13.8458C13.7933 13.8593 13.7775 13.9006 13.7949 13.9347C14.0952 14.5164 14.4381 15.0704 14.8157 15.5957C14.8315 15.618 14.8599 15.6275 14.8859 15.6196C16.5201 15.114 18.1772 14.3514 19.8879 13.0951C19.9028 13.084 19.9123 13.0673 19.9139 13.049C20.3309 8.73493 19.2154 4.98749 16.9568 1.66541C16.9513 1.65431 16.9419 1.64637 16.9308 1.64161ZM6.68335 10.7761C5.69792 10.7761 4.88594 9.87141 4.88594 8.76034C4.88594 7.64927 5.68217 6.74457 6.68335 6.74457C7.69239 6.74457 8.49651 7.65721 8.48073 8.76034C8.48073 9.87141 7.68451 10.7761 6.68335 10.7761ZM13.329 10.7761C12.3435 10.7761 11.5316 9.87141 11.5316 8.76034C11.5316 7.64927 12.3278 6.74457 13.329 6.74457C14.338 6.74457 15.1421 7.65721 15.1264 8.76034C15.1264 9.87141 14.338 10.7761 13.329 10.7761Z"
                  fill="black"
                  fillOpacity="0.5"
                />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
