import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider
} from "react-router-dom";

import Layout from "./pages/Layout";

import { QueryClient, useQueryClient } from "@tanstack/react-query";
import { Collection } from "./pages/collection/Collection";
import Explore from "./pages/explore/Explore";
import Token from "./pages/token";
import ProfilePage from "./pages/profile";
import BoardPage from "./pages/board";

const router = (queryClient: QueryClient) => createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Layout />}>
      <Route path="/" element={<Explore />} />
      <Route path='/collection/:chain/:collection/token/:tokenId' element={<Token />} />
      <Route path='/collection/:chain/:address' element={<Collection />} />
      <Route path='/profile/:address' element={<ProfilePage />} />
      <Route path='/board/:boardId' element={<BoardPage />} />
    </Route>
  )
);

export default function Router () {
  const queryClient = useQueryClient();

  return <RouterProvider router={router(queryClient)} />
}