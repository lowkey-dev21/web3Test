import { ethers } from "ethers";

// Type for Ethereum provider injected by wallets (EIP-1193)
export interface EthereumProvider {
  request: (args: { method: string; params?: any[] }) => Promise<any>;
  on: (event: string, handler: (...args: any[]) => void) => void;
  removeListener: (event: string, handler: (...args: any[]) => void) => void;
  isMetaMask?: boolean;
  isRabby?: boolean;
}

// EIP-6963 interfaces for multi-wallet discovery
export interface EIP6963ProviderInfo {
  uuid: string;
  name: string;
  icon: string;
  rdns: string;
}

export interface EIP6963ProviderDetail {
  info: EIP6963ProviderInfo;
  provider: EthereumProvider;
}

export type EIP6963AnnounceProviderEvent = CustomEvent<EIP6963ProviderDetail>;

// Extend Window interface to include ethereum and EIP-6963 events
declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
  interface WindowEventMap {
    "eip6963:announceProvider": EIP6963AnnounceProviderEvent;
  }
}

// Wallet connection state
export interface WalletState {
  isConnected: boolean;
  account: string | null;
  balance: string;
  network: string;
  isConnecting: boolean;
  error: string | null;
  discoveredProviders: EIP6963ProviderDetail[];
  selectedProviderInfo: EIP6963ProviderInfo | null;
  availableAccounts: string[];
}

// Props for WalletButton component
export interface WalletButtonProps {
  onConnect: (account: string) => void;
  onDisconnect: () => void;
  state: WalletState;
}

// Props for WalletInfo component
export interface WalletInfoProps {
  state: WalletState;
  provider: ethers.BrowserProvider | null;
}
