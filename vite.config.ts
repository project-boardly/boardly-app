import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
// import { VitePWA } from "vite-plugin-pwa";
import { comlink } from "vite-plugin-comlink";
import { nodePolyfills } from 'vite-plugin-node-polyfills'

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
  plugins: [
    react(),
    // VitePWA({
    //   registerType: "autoUpdate",
    //   injectRegister: 'auto',
    //   devOptions: {
    //     enabled: true,
    //   },
    //   workbox: {
    //     globPatterns: ['**/*.{js,css,html,ico,png,svg,jpeg,jpg}']
    //   }
    // }),
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
