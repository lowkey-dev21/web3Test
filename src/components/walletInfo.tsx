"use client";

import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import {
  FiCopy,
  FiCheck,
  FiGlobe,
  FiDollarSign,
  FiExternalLink,
  FiLogOut,
  FiRefreshCw,
} from "react-icons/fi";
import { useWallet } from "@/contexts/walletContext";

const WalletInfo: React.FC = () => {
  const { state, provider, connectWallet, disconnectWallet } = useWallet();
  const [copied, setCopied] = useState(false);
  const [gasPrice, setGasPrice] = useState<string>("");
  const [blockNumber, setBlockNumber] = useState<number | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Copy address to clipboard
  const copyToClipboard = async () => {
    if (!state.account) return;

    try {
      await navigator.clipboard.writeText(state.account);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  // Fetch blockchain data
  useEffect(() => {
    const fetchBlockchainData = async () => {
      if (!provider || !state.isConnected) return;

      try {
        // Get current block number
        const block = await provider.getBlockNumber();
        setBlockNumber(block);

        // Get gas price (in Gwei)
        const feeData = await provider.getFeeData();
        if (feeData.gasPrice) {
          const gasPriceInGwei = ethers.formatUnits(feeData.gasPrice, "gwei");
          setGasPrice(parseFloat(gasPriceInGwei).toFixed(2));
        }
      } catch (error) {
        console.error("Error fetching blockchain data:", error);
      }
    };

    fetchBlockchainData();

    // Optional: Set up polling for real-time updates
    const interval = setInterval(fetchBlockchainData, 15000); // Every 15 seconds

    return () => clearInterval(interval); // Cleanup on unmount
  }, [provider, state.isConnected]);

  // Open address in Etherscan
  const viewOnEtherscan = () => {
    if (!state.account) return;

    const baseUrl = state.network.toLowerCase().includes("mainnet")
      ? "https://etherscan.io"
      : "https://sepolia.etherscan.io";

    window.open(`${baseUrl}/address/${state.account}`, "_blank");
  };

  if (!state.isConnected) {
    const hasNoWallet =
      isMounted &&
      state.discoveredProviders.length === 0 &&
      typeof window !== "undefined" &&
      !window.ethereum;

    return (
      <div className="inner-card rounded-[32px] md:rounded-[40px] p-6 md:p-12 text-center space-y-6 md:space-y-8 animate-in fade-in zoom-in-95 duration-500">
        <div className="w-16 md:w-24 h-16 md:h-24 mx-auto relative"></div>
        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-3xl font-bold">Wallet Not Connected</h3>
            <p className="text-gray-500 max-w-sm mx-auto text-sm">
              Please connect your wallet to view detailed account information
              and manage your settings.
            </p>
          </div>
          <button
            onClick={() => connectWallet()}
            disabled={state.isConnecting}
            className="btn-primary px-10 py-5 rounded-[24px] text-lg font-bold transition-all active:scale-95 flex items-center justify-center gap-3 mx-auto"
          >
            {state.isConnecting ? (
              <FiRefreshCw className="animate-spin" />
            ) : (
              <div className="w-5 h-5 bg-black rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-[#f8ff77] rounded-full" />
              </div>
            )}
            {state.isConnecting
              ? "Connecting..."
              : hasNoWallet
              ? "Install Wallet"
              : "Connect Wallet"}
          </button>
        </div>
      </div>
    );
  }

  if (!isMounted) return null;

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h3 className="text-2xl md:text-3xl font-bold">Wallet Details</h3>
        <div className="w-fit px-4 py-1.5 bg-[#f8ff77]/10 border border-[#f8ff77]/20 rounded-full text-[#f8ff77] text-xs md:text-sm font-bold">
          {state.network}
        </div>
      </div>

      {/* Account Address Card */}
      <div className="inner-card rounded-[24px] md:rounded-[32px] p-4 md:p-8 space-y-4">
        <div className="flex items-center justify-between text-gray-400">
          <span className="text-xs uppercase tracking-widest font-bold">
            Connected Address
          </span>
          <button
            onClick={copyToClipboard}
            className="flex items-center gap-2 text-xs px-4 py-2 bg-white/5 rounded-full hover:bg-white/10 transition-all font-bold"
          >
            {copied ? (
              <>
                <FiCheck className="text-[#f8ff77]" />
                <span className="text-[#f8ff77]">Copied!</span>
              </>
            ) : (
              <>
                <FiCopy />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
        <div className="p-4 md:p-6 bg-black/20 rounded-2xl border border-white/5">
          <code className="text-xs md:text-lg break-all font-mono tracking-tight text-white leading-relaxed">
            {state.account}
          </code>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="inner-card rounded-[24px] p-6 space-y-4">
          <div className="flex items-center gap-2 text-gray-500">
            <FiDollarSign />
            <span className="text-[10px] md:text-xs uppercase font-bold tracking-wider">
              Balance
            </span>
          </div>
          <div className="text-2xl md:text-3xl font-bold text-white">
            {parseFloat(state.balance).toFixed(4)}{" "}
            <span className="text-xs md:text-sm text-gray-500">ETH</span>
          </div>
        </div>

        <div className="inner-card rounded-[24px] p-6 space-y-4">
          <div className="flex items-center gap-2 text-gray-500">
            <FiExternalLink />
            <span className="text-[10px] md:text-xs uppercase font-bold tracking-wider">
              Gas Price
            </span>
          </div>
          <div className="text-2xl md:text-3xl font-bold text-white font-mono">
            {gasPrice || "--"}{" "}
            <span className="text-xs md:text-sm text-gray-500 font-sans">
              Gwei
            </span>
          </div>
        </div>

        <div className="inner-card rounded-[24px] p-6 space-y-4">
          <div className="flex items-center gap-2 text-gray-500">
            <FiGlobe />
            <span className="text-[10px] md:text-xs uppercase font-bold tracking-wider">
              Current Block
            </span>
          </div>
          <div className="text-2xl md:text-3xl font-bold text-white font-mono">
            #{blockNumber?.toLocaleString() || "---"}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 md:gap-4 pt-4">
        <button
          onClick={viewOnEtherscan}
          className="flex-1 py-3 md:py-4 bg-[#f8ff77] text-black border border-white/10 rounded-[16px] md:rounded-[20px] text-sm md:text-base font-bold transition-all flex items-center justify-center gap-2"
        >
          <FiExternalLink />
          View on Explorer
        </button>
        <button
          onClick={disconnectWallet}
          className="flex-1 py-3 md:py-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-500 rounded-[16px] md:rounded-[20px] text-sm md:text-base font-bold transition-all flex items-center justify-center gap-2"
        >
          <FiLogOut />
          Disconnect Wallet
        </button>
      </div>
    </div>
  );
};

export default WalletInfo;
