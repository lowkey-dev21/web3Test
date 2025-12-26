"use client";

import { useWallet } from "@/contexts/walletContext";
import React, { useState, useEffect } from "react";
import { FiUser, FiLogOut, FiAlertCircle, FiChevronDown } from "react-icons/fi";
import { FaWallet } from "react-icons/fa";

const WalletButton: React.FC = () => {
  const { state, connectWallet, disconnectWallet, clearError } = useWallet();
  const [showPicker, setShowPicker] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Format address for display: 0x1234...5678
  const formatAddress = (address: string): string => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Handle button click based on state
  const handleClick = () => {
    if (state.isConnected) {
      disconnectWallet();
    } else {
      // Clear any existing error when trying to connect again
      if (state.error) clearError();

      // If we have multiple providers, show picker. Otherwise just connect first one.
      if (state.discoveredProviders.length > 1) {
        setShowPicker(!showPicker);
      } else {
        connectWallet();
      }
    }
  };

  // Determine button text and icon
  const getButtonContent = () => {
    if (state.isConnecting) {
      return (
        <>
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          <span>Connecting...</span>
        </>
      );
    }

    if (state.isConnected && state.account) {
      return (
        <>
          {state.selectedProviderInfo ? (
            <img
              src={state.selectedProviderInfo.icon}
              alt={state.selectedProviderInfo.name}
              className="w-5 h-5 rounded-sm"
            />
          ) : (
            <FiUser className="text-lg" />
          )}
          <span>{formatAddress(state.account)}</span>
          <FiLogOut className="text-lg" />
        </>
      );
    }

    const hasNoWallet =
      isMounted &&
      state.discoveredProviders.length === 0 &&
      typeof window !== "undefined" &&
      !window.ethereum;

    return (
      <>
        <FaWallet className="text-lg" />
        <span>{hasNoWallet ? "Install Wallet" : "Connect Wallet"}</span>
        {state.discoveredProviders.length > 1 && <FiChevronDown />}
      </>
    );
  };

  // Determine button classes based on state
  const getButtonClasses = (): string => {
    const baseClasses =
      "flex items-center gap-2 px-6 py-3 rounded-[24px] font-semibold transition-all duration-200 shadow-lg";

    if (state.isConnecting) {
      return `${baseClasses} bg-gray-600 cursor-wait`;
    }

    if (state.isConnected) {
      return `${baseClasses} bg-linear-to-r rounded-full from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700`;
    }

    const hasNoWallet =
      isMounted &&
      state.discoveredProviders.length === 0 &&
      typeof window !== "undefined" &&
      !window.ethereum;

    if (hasNoWallet) {
      return `${baseClasses} bg-[#f8ff77] hover:bg-gray-700 text-black`;
    }

    return `${baseClasses} btn-primary hover:from-blue-700 rounded-full hover:to-purple-700`;
  };

  return (
    <div className="relative">
      {/* Error Message */}
      {state.error && (
        <div className="fixed top-6 right-6 z-100 animate-in slide-in-from-right-full duration-300">
          <div className="bg-black backdrop-blur-xl border border-red-500/20 rounded-xl p-4 shadow-2xl flex flex-col gap-3 max-w-sm">
            <div className="flex items-center gap-4">
              <div className="shrink-0 w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                <FiAlertCircle className="text-xl text-red-500" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-white mb-0.5">
                  
                </h4>
                <p className="text-sm text-gray-400 leading-tight">
                  {state.error}
                </p>
              </div>
              <button
                onClick={e => {
                  e.stopPropagation();
                  clearError();
                }}
                className="shrink-0 w-8 h-8 rounded-full hover:bg-white/5 flex items-center justify-center transition-colors text-gray-500 hover:text-white"
              >
                <span className="text-2xl">&times;</span>
              </button>
            </div>

            {/* Actionable installation links if wallet is missing */}
            {state.error.includes("install") && (
              <div className="grid grid-cols-2 gap-2 mt-1">
                <a
                  href="https://metamask.io/download/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-3 py-2 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20 rounded-full text-xs font-bold text-orange-500 transition-colors"
                >
                  MetaMask
                </a>
                <a
                  href="https://rabby.io/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded-full text-xs font-bold text-blue-400 transition-colors"
                >
                  Rabby Wallet
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Wallet Picker Dropdown */}
      {showPicker && !state.isConnected && (
        <div className="absolute top-full mt-2 right-0 w-64 bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden z-50 shadow-2xl animate-in fade-in slide-in-from-top-2">
          <div className="p-3 border-b border-white/5 text-xs font-bold text-gray-500 uppercase tracking-wider">
            Select Wallet
          </div>
          <div className="max-h-64 overflow-y-auto">
            {state.discoveredProviders.map(detail => (
              <button
                key={detail.info.uuid}
                onClick={() => {
                  connectWallet(detail.provider);
                  setShowPicker(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left"
              >
                <img
                  src={detail.info.icon}
                  alt={detail.info.name}
                  className="w-6 h-6 rounded-md"
                />
                <span className="font-medium">{detail.info.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Button / Connection State */}
      {state.isConnected && state.account ? (
        <div className="flex items-center gap-2 animate-in fade-in zoom-in-95 duration-200">
          {/* Address Badge */}
          <div className="flex items-center gap-2 px-4 py-2.5 bg-white/5 backdrop-blur-md border border-white/10 rounded-full shadow-inner">
            {state.selectedProviderInfo ? (
              <img
                src={state.selectedProviderInfo.icon}
                alt={state.selectedProviderInfo.name}
                className="w-5 h-5 rounded-sm"
              />
            ) : (
              <FiUser className="text-[#f8ff77]" />
            )}
            <span className="font-mono text-sm font-medium">
              {formatAddress(state.account)}
            </span>
          </div>
        </div>
      ) : (
        <button
          onClick={handleClick}
          disabled={state.isConnecting}
          className={getButtonClasses()}
          aria-label="Connect wallet"
        >
          {getButtonContent()}
        </button>
      )}
    </div>
  );
};

export default WalletButton;
