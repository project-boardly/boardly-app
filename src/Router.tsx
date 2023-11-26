import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider
} from "react-router-dom";

import Layout from "./pages/Layout";

import { QueryClient, useQuery, useQueryClient } from "@tanstack/react-query";
import { Collection } from "./pages/collection/Collection";
import Explore from "./pages/explore/Explore";
import Token from "./pages/token";
import ProfilePage from "./pages/profile";
import BoardPage from "./pages/board";
import useMuseboard from "./hooks/useMuseboard";
import { useEffect } from "react";
import useUser from "./hooks/useUser";
import Museboards from "./pages/profile/boards";
import Assets from "./pages/profile/assets";
import Universe from "./pages/profile/universe";

const router = (queryClient: QueryClient) => createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Layout />}>
      <Route path="/" element={<Explore />} />
      <Route path='/collection/:chain/:collection/token/:tokenId' element={<Token />} />
      <Route path='/collection/:chain/:address' element={<Collection />} />
      <Route path='/profile/:address' element={<ProfilePage />}>
        <Route index={true} path='/profile/:address' element={<Museboards />}/>
        <Route path='/profile/:address/assets' element={<Assets />}/>
        <Route path='/profile/:address/universe' element={<Universe />}/>
      </Route>
      <Route path='/board/:boardId' element={<BoardPage />} />
    </Route>
  )
);

export default function Router () {
  const { loading, user } = useUser();
  const queryClient = useQueryClient();
  const { getBoards } = useMuseboard();

  useEffect(() => {
    if (loading) { return; }

    if (!user) { return; }

    queryClient.prefetchQuery({
      queryKey: ['onchain:boards', user.uid],
      queryFn: () => getBoards(user.uid as string),
      staleTime: 1 * 24 * 60 * 60
    });
  }, [loading, user]);

  return <RouterProvider router={router(queryClient)} />
}