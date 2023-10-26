/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/react" />
/// <reference types="vite-plugin-pwa/info" />
/// <reference types="vite-plugin-comlink/client" />

interface Ethereum {
  request: unknown
  enable: () => Promise<string[]>
  on?: (method: string, listener: (...args: any[]) => void) => void
  removeListener?: (method: string, listener: (...args: any[]) => void) => void
}

declare interface Window {
  ethereum?: Eip1193Provider
  lukso?: Eip1193Provider
}

declare const __DEV__: boolean

declare module '@lukso/lsp-smart-contracts/constants'