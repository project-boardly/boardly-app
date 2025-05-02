import { createClientUPProvider, UPClientProvider } from "@lukso/up-provider";
import { createContext, type ReactNode, useCallback, useEffect, useState } from "react";
import { createPublicClient, createWalletClient, custom, http, PublicClient, WalletClient } from "viem";
import { luksoTestnet } from "viem/chains";

const provider = typeof window !== "undefined" ? createClientUPProvider() : null;

type LuksoContextType = undefined | {
  account: string,
  contextAccount: string,
  connected: boolean,
  provider: UPClientProvider | null,
  clients: {
    public: PublicClient,
    wallet: WalletClient
  }
};

export const LuksoContext = createContext<LuksoContextType>(undefined);

export const publicClient = createPublicClient({
  chain: luksoTestnet,
  transport: http()
});

export default function LuksoProvider({ children }: { children: ReactNode }) {
  const [accounts, setAccounts] = useState<Array<`0x${string}`>>([]);
  const [contextAccounts, setContextAccounts] = useState<Array<`0x${string}`>>(
    [],
  );
  const [connected, setProfileConnected] = useState(false);
  const [clients, setClients] = useState<{ wallet: any, public: any }>({
    wallet: null,
    public: null
  })

  useEffect(() => {
    if (!connected || (clients.wallet && clients.public)) {
      return;
    }

    const walletClient = createWalletClient({
      chain: luksoTestnet,
      transport: custom(provider!)
    });

    setClients({
      wallet: walletClient,
      public: publicClient
    });
  }, [connected]);

  // Helper to check connection status
  const updateConnected = useCallback(
    (_accounts: Array<`0x${string}`>, _contextAccounts: Array<`0x${string}`>) => {
      setProfileConnected(_accounts.length > 0 && _contextAccounts.length > 0);
    },
    [],
  );

  useEffect(() => {
    async function init(miniAppProvider: UPClientProvider) {
      try {
        const _accounts = miniAppProvider.accounts as Array<`0x${string}`>;
        setAccounts(_accounts);

        const _contextAccounts = miniAppProvider.contextAccounts;
        updateConnected(_accounts, _contextAccounts);
      } catch (error) {
        console.error('Failed to initialize provider:', error);
      }
    }

    // Handle account changes
    const accountsChanged = (_accounts: Array<`0x${string}`>) => {
      setAccounts(_accounts);
      updateConnected(_accounts, contextAccounts);
    };

    const contextAccountsChanged = (_accounts: Array<`0x${string}`>) => {
      setContextAccounts(_accounts);
      updateConnected(accounts, _accounts);
    };

    if (!provider) {
      // TODO: Log error here that provider is expected
      
      return;
    }

    init(provider);

    // Set up event listeners
    provider.on('accountsChanged', accountsChanged);
    provider.on('contextAccountsChanged', contextAccountsChanged);

    // Cleanup listeners
    return () => {
      provider.removeListener('accountsChanged', accountsChanged);
      provider.removeListener('contextAccountsChanged', contextAccountsChanged);
    };
  }, [accounts[0], contextAccounts[0], updateConnected]);
  
  return <LuksoContext.Provider value={{
    account: accounts[0],
    contextAccount: contextAccounts[0],
    provider,
    connected,
    clients
  }}>
    {children}
  </LuksoContext.Provider>
}
