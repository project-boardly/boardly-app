import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider
} from "react-router-dom";

import Layout from "./pages/Layout";

import { QueryClient, useQueryClient } from "@tanstack/react-query";
import { Collection } from "./pages/collection/Collection";
import { Explore } from "./pages/explore/Explore";

const router = (queryClient: QueryClient) => createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Layout />}>
      <Route path="/" element={<Explore />} />
      <Route path='/collection/:chain/:address' element={<Collection />} />
    </Route>
  )
);

export default function Router () {
  const queryClient = useQueryClient();

  return <RouterProvider router={router(queryClient)} />
}