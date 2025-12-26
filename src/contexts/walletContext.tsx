"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
  useRef,
} from "react";
import { ethers } from "ethers";
import {
  WalletState,
  EIP6963ProviderDetail,
  EthereumProvider,
} from "@/types/wallet";

// Context type
interface WalletContextType {
  state: WalletState;
  connectWallet: (provider?: EthereumProvider) => Promise<void>;
  disconnectWallet: () => void;
  clearError: () => void;
  provider: ethers.BrowserProvider | null;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [state, setState] = useState<WalletState>({
    isConnected: false,
    account: null,
    balance: "0",
    network: "Not Connected",
    isConnecting: false,
    error: null,
    discoveredProviders: [],
    selectedProviderInfo: null,
    availableAccounts: [],
  });

  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);

  // Use refs to avoid stale closures in event listeners
  const stateRef = useRef(state);
  const providerRef = useRef(provider);
  const baseProviderRef = useRef<EthereumProvider | null>(null);

  useEffect(() => {
    stateRef.current = state;
    providerRef.current = provider;
  }, [state, provider]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const disconnectWallet = useCallback(() => {
    console.log("Disconnecting wallet...");

    // Set preference in localStorage to prevent auto-reconnect
    if (typeof window !== "undefined") {
      localStorage.setItem("wallet_disconnected", "true");
    }

    if (baseProviderRef.current) {
      try {
        baseProviderRef.current.removeListener(
          "accountsChanged",
          handleAccountsChanged
        );
        baseProviderRef.current.removeListener(
          "chainChanged",
          handleChainChanged
        );
      } catch (e) {
        console.error("Error removing listeners:", e);
      }
      baseProviderRef.current = null;
    }

    setState(prev => ({
      ...prev,
      isConnected: false,
      account: null,
      balance: "0",
      network: "Not Connected",
      isConnecting: false,
      error: null,
      selectedProviderInfo: null,
      availableAccounts: [],
    }));
    setProvider(null);
  }, []);

  const handleAccountsChanged = useCallback(
    async (accounts: string[]) => {
      console.log("Accounts changed:", accounts);
      if (accounts.length === 0) {
        disconnectWallet();
      } else if (
        providerRef.current &&
        accounts[0] !== stateRef.current.account
      ) {
        try {
          const balance = await providerRef.current.getBalance(accounts[0]);
          setState(prev => ({
            ...prev,
            account: accounts[0],
            balance: ethers.formatEther(balance),
            availableAccounts: accounts,
          }));
        } catch (error) {
          console.error("Error updating account balance:", error);
        }
      }
    },
    [disconnectWallet]
  );

  const handleChainChanged = useCallback((_chainId: string) => {
    console.log("Chain changed:", _chainId);
    window.location.reload();
  }, []);

  const connectWallet = useCallback(
    async (requestedProvider?: EthereumProvider) => {
      console.log("Connect wallet triggered");

      // Determine which provider to use:
      // 1. Explicitly requested provider (from UI)
      // 2. First discovered EIP-6963 provider
      // 3. Falling back to window.ethereum
      const baseProvider =
        requestedProvider ||
        stateRef.current.discoveredProviders[0]?.provider ||
        (typeof window !== "undefined" ? window.ethereum : undefined);

      if (!baseProvider) {
        console.error("No ethereum provider found");
        setState(prev => ({
          ...prev,
          error: "Please install MetaMask or Rabby Wallet!",
        }));
        return;
      }

      if (stateRef.current.isConnecting) {
        console.log("Already connecting, ignoring request");
        return;
      }

      setState(prev => ({ ...prev, isConnecting: true, error: null }));

      try {
        console.log("Requesting accounts...");
        const accounts = (await baseProvider.request({
          method: "eth_requestAccounts",
        })) as string[];

        if (!accounts || accounts.length === 0) {
          throw new Error("No accounts returned from wallet");
        }

        console.log("Accounts received:", accounts[0]);

        // Clear disconnect preference
        if (typeof window !== "undefined") {
          localStorage.removeItem("wallet_disconnected");
        }

        const web3Provider = new ethers.BrowserProvider(baseProvider);
        const signer = await web3Provider.getSigner();
        const address = await signer.getAddress();
        const balance = await web3Provider.getBalance(address);
        const network = await web3Provider.getNetwork();

        console.log("Connected to network:", network.name);

        // Find info if it's one of the discovered ones
        const info =
          stateRef.current.discoveredProviders.find(
            p => p.provider === baseProvider
          )?.info || null;

        setState(prev => ({
          ...prev,
          isConnected: true,
          account: address,
          balance: ethers.formatEther(balance),
          network:
            network.name === "homestead" ? "Ethereum Mainnet" : network.name,
          isConnecting: false,
          error: null,
          selectedProviderInfo: info,
          availableAccounts: accounts,
        }));

        setProvider(web3Provider);
        baseProviderRef.current = baseProvider;

        // Add listeners to the ACTIVE provider
        baseProvider.on("accountsChanged", handleAccountsChanged);
        baseProvider.on("chainChanged", handleChainChanged);
      } catch (error: any) {
        console.error("Connection error catch:", error);
        setState(prev => ({
          ...prev,
          isConnecting: false,
          error: error.message || "Failed to connect wallet",
        }));
      }
    },
    [handleAccountsChanged, handleChainChanged]
  );

  // EIP-6963 discovery and initial check
  useEffect(() => {
    const handleAnounceProvider = (event: any) => {
      console.log("Provider announced:", event.detail.info.name);
      setState(prev => {
        // Avoid duplicates
        if (
          prev.discoveredProviders.some(
            p => p.info.uuid === event.detail.info.uuid
          )
        ) {
          return prev;
        }
        return {
          ...prev,
          discoveredProviders: [...prev.discoveredProviders, event.detail],
        };
      });
    };

    window.addEventListener(
      "eip6963:announceProvider" as any,
      handleAnounceProvider
    );

    // Dispatch request event to trigger announcements
    window.dispatchEvent(new Event("eip6963:requestProvider"));

    const checkExistingConnection = async () => {
      if (typeof window === "undefined") return;

      // Respect user's explicit disconnect
      if (localStorage.getItem("wallet_disconnected") === "true") {
        console.log("Skipping auto-connect: user explicitly disconnected.");
        return;
      }

      // Try to find a provider that's already authorized
      const checkProvider = async (p: EthereumProvider) => {
        try {
          const accounts = (await p.request({
            method: "eth_accounts",
          })) as string[];
          return accounts.length > 0 ? { provider: p, accounts } : null;
        } catch (e) {
          return null;
        }
      };

      // Check window.ethereum first as it's common
      let activeSession = window.ethereum
        ? await checkProvider(window.ethereum)
        : null;

      if (activeSession) {
        console.log("Existing connection found in window.ethereum");
        const { provider: baseProvider, accounts } = activeSession;

        const web3Provider = new ethers.BrowserProvider(baseProvider);
        const signer = await web3Provider.getSigner();
        const address = await signer.getAddress();
        const balance = await web3Provider.getBalance(address);
        const network = await web3Provider.getNetwork();

        setState(prev => ({
          ...prev,
          isConnected: true,
          account: address,
          balance: ethers.formatEther(balance),
          network:
            network.name === "homestead" ? "Ethereum Mainnet" : network.name,
          availableAccounts: accounts,
        }));
        setProvider(web3Provider);
        baseProviderRef.current = baseProvider;

        baseProvider.on("accountsChanged", handleAccountsChanged);
        baseProvider.on("chainChanged", handleChainChanged);
      }
    };

    checkExistingConnection();

    return () => {
      window.removeEventListener(
        "eip6963:announceProvider" as any,
        handleAnounceProvider
      );
      if (baseProviderRef.current) {
        baseProviderRef.current.removeListener(
          "accountsChanged",
          handleAccountsChanged
        );
        baseProviderRef.current.removeListener(
          "chainChanged",
          handleChainChanged
        );
      }
    };
  }, [handleAccountsChanged, handleChainChanged]);

  return (
    <WalletContext.Provider
      value={{ state, connectWallet, disconnectWallet, clearError, provider }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
};
