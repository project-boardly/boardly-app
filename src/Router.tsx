import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider
} from "react-router-dom";

import Layout from "./pages/Layout";

import { QueryClient, useQueryClient } from "@tanstack/react-query";
import ClaimOrder from "./pages/claim";
import Marketplace from "./pages/marketplace";
import Inventory from "./pages/inventory";
import Bag from "./pages/bag";
import Store from "./pages/store";
import Trade from "./pages/trade";


const router = (queryClient: QueryClient) => createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Layout />}>
      <Route path="/" element={<ClaimOrder />} />
      <Route path="/claim" element={<ClaimOrder />} />
      <Route path="/bag" element={<Bag />} />
      <Route path="/store" element={<Store />} />
      <Route path="/trade" element={<Trade />} />
      <Route path="/marketplace" element={<Marketplace/>}/>
      <Route path="/inventory" element={<Inventory />}/>
    </Route>
  )
);

export default function Router () {
  const queryClient = useQueryClient();

  return <RouterProvider router={router(queryClient)} />
}