// import './polyfill.ts';

import React from "react";
import ReactDOM from "react-dom/client";

import NiceModal from "@ebay/nice-modal-react";
import { Toaster } from "react-hot-toast";

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider
} from "@apollo/client";

import App from "./App.tsx";
import { UserProvider } from "./contexts/UserContext.tsx";

import "./index.css";
import LuksoProvider from "./providers/LuksoProvider.tsx";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FB_API_KEY,
  authDomain: import.meta.env.VITE_FB_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FB_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FB_BUCKET,
  messagingSenderId: import.meta.env.VITE_FB_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FB_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
getFirestore(app);

export const queryClient = new QueryClient();

const graphClient = new ApolloClient({
  uri: "http://localhost:3000/graphql-proxy",
  cache: new InMemoryCache(),
});

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ApolloProvider client={graphClient}>
      <UserProvider>
        <QueryClientProvider client={queryClient}>
          <NiceModal.Provider>
            <LuksoProvider>
              {/* <ReactQueryDevtools initialIsOpen={false} /> */}
              <App />
            </LuksoProvider>
            <Toaster position="bottom-center" />
          </NiceModal.Provider>
        </QueryClientProvider>
      </UserProvider>
    </ApolloProvider>
  </React.StrictMode>,
);
