import { Outlet } from "react-router-dom";
import Header from "./Header";

import { getAuth } from 'firebase/auth';
import { useEffect } from "react";
import Footer from "./Footer";

export default function Layout () {
  useEffect(() => {
    const auth = getAuth();

    auth.onAuthStateChanged(console.log);
  }, []);

  return <div className="min-h-[100vh] relative">
    <Header />
    <Outlet/>
    <Footer />
  </div>
}