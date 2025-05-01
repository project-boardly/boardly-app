import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
// import { VitePWA } from "vite-plugin-pwa";
import { comlink } from "vite-plugin-comlink";
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import { fileURLToPath, URL } from "node:url";
import { readFileSync } from 'node:fs';

// https://vitejs.dev/config/
export default defineConfig({
  // resolve: {
  //   alias: {
  //     process: "process/browser",
  //     stream: "stream-browserify",
  //     zlib: "browserify-zlib",
  //     util: "util",
  //     buffer: 'buffer',
      
  //   },
  // },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./@", import.meta.url))
    }
  },
  plugins: [
    react(),
    comlink(),
    nodePolyfills()
  ],
  server: {
    port: 5172,
  },
  worker: {
    plugins: [comlink()]
  },
  build: {
    sourcemap: false
  }
});
