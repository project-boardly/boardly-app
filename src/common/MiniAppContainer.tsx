import { type ReactNode } from "react";
import logo from "../logo.svg";

import { ArrowPathIcon } from '@heroicons/react/24/solid';

export default function MiniAppContainer ({ children, footer }: { children: ReactNode, footer?: ReactNode }) {
  return <div className="pt-12 px-4">
    <div className="h-8 fixed top-0 w-full pt-2 flex justify-center px-16 space-x-2">
      <img className="h-4 mt-1" src={logo} alt="Boardly" />
      <button className="bg-white w-6 h-6 rounded-full flex items-center justify-center shadow" onClick={() => window.location.reload()}><ArrowPathIcon height={14} width={14}/></button>
    </div>
    {children}
    { footer && <div className="fixed bottom-0 m-0 left-0 right-0">
      <div className="relative">
        {footer}
      </div>
    </div> }
  </div>
}
