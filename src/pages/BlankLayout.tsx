import { Outlet } from "react-router-dom";

import { getAuth } from 'firebase/auth';
import { useEffect } from "react";

export default function BlankLayout () {
  useEffect(() => {
    const auth = getAuth();

    auth.onAuthStateChanged(console.log);
  }, []);

  return <div className="min-h-[100vh] relative">
    <Outlet/>
  </div>
}