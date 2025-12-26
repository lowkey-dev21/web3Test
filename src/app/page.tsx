"use client";

import React, { useState } from "react";
import {
  FiRefreshCw,
  FiSettings,
  FiChevronDown,
  FiArrowRight,
  FiRepeat,
} from "react-icons/fi";
import { useWallet } from "../contexts/walletContext";
import WalletButton from "../components/walletButton";

import Header from "../components/Header";
import WalletInfo from "../components/walletInfo";

export default function Home() {
  const { state } = useWallet();
  const [activeTab, setActiveTab] = useState("Wallet");
  const [sendAmount, setSendAmount] = useState("");
  const [recipientAddress, setRecipientAddress] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [swapStatus, setSwapStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [showRecipientDropdown, setShowRecipientDropdown] = useState(false);

  const handleMaxClick = () => {
    if (state.isConnected) {
      setSendAmount(state.balance);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const handleSwap = () => {
    if (!state.isConnected) {
      alert("Please connect your wallet first");
      return;
    }
    if (!sendAmount || parseFloat(sendAmount) === 0) {
      alert("Please enter a valid amount");
      return;
    }
    if (!recipientAddress) {
      alert("Please select a recipient address");
      return;
    }

    setSwapStatus("loading");
    // Simulate transaction
    setTimeout(() => {
      setSwapStatus("success");
      setTimeout(() => setSwapStatus("idle"), 3000);
    }, 2000);
  };

  const steps = [
    { id: 1, label: "Select tokens", active: true },
    { id: 2, label: "", active: false },
    { id: 3, label: "", active: false },
    { id: 4, label: "", active: false },
  ];

  return (
    <div className="relative min-h-screen flex flex-col items-center p-4 overflow-hidden">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Background Dots/Stars */}
      <div className="absolute inset-0 pointer-events-none -z-10">
        <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-white rounded-full opacity-20" />
        <div className="absolute top-1/2 left-1/10 w-1 h-1 bg-white rounded-full opacity-10" />
        <div className="absolute top-3/4 left-1/2 w-1.5 h-1.5 bg-white rounded-full opacity-30 shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
        <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-white rounded-full opacity-20" />
        <div className="absolute bottom-1/4 right-1/10 w-1 h-1 bg-white rounded-full opacity-10" />
      </div>

      {/* Main Container */}
      <div className="w-full max-w-[900px] glass-panel rounded-[40px] mt-7 p-8 md:p-12 relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex gap-8 text-3xl font-semibold">
            <button
              onClick={() => setActiveTab("Wallet")}
              className={`${
                activeTab === "Wallet" ? "text-white" : "text-gray-500"
              } transition-colors`}
            >
              Wallet
            </button>
            <button
              onClick={() => setActiveTab("Swap")}
              className={`${
                activeTab === "Swap" ? "text-white" : "text-gray-500"
              } transition-colors`}
            >
              Swap
            </button>
          </div>
          <div className="flex gap-4 text-gray-400 text-2xl">
            <button
              onClick={handleRefresh}
              className={`hover:text-white transition-all ${
                isRefreshing ? "animate-spin text-[#f8ff77]" : ""
              }`}
            >
              <FiRefreshCw />
            </button>
            <button className="hover:text-white transition-colors">
              <FiSettings />
            </button>
          </div>
        </div>

        {activeTab === "Wallet" ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <WalletInfo />
          </div>
        ) : (
          <>
            {/* Swap Cards Grid */}
            <div className="grid md:grid-cols-2 gap-4 relative">
              {/* Swap Button (Middle) */}
              <button className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-xl bg-[#1a1a1e] border border-white/10 flex items-center justify-center text-gray-400 hover:text-[#f8ff77] hover:border-[#f8ff77]/40 transition-all active:scale-95">
                <FiRepeat className="rotate-90" />
              </button>

              {/* From Card */}
              <div className="inner-card rounded-[32px] p-6 flex flex-col gap-8 min-h-[300px]">
                <div className="flex justify-between items-center text-gray-400 text-sm">
                  <span>From:</span>
                  <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/5">
                    <span className="text-xs font-mono">
                      {state.account
                        ? `${state.account.slice(0, 6)}...${state.account.slice(
                            -4
                          )}`
                        : "Connect Wallet"}
                    </span>
                    <div className="w-4 h-4 bg-white rounded-sm flex items-center justify-center text-black font-bold text-[8px]">
                      N
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-end">
                  <div className="flex flex-col gap-4">
                    <span className="text-gray-500 text-xs font-medium uppercase tracking-wider">
                      Token
                    </span>
                    <button className="flex items-center gap-2 text-xl font-bold bg-white/5 hover:bg-white/10 px-3 py-2 rounded-2xl transition-colors">
                      <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-[10px]">
                        ₿
                      </div>
                      ETH <FiChevronDown />
                    </button>
                  </div>
                  <div className="flex flex-col gap-4">
                    <span className="text-gray-500 text-xs font-medium uppercase tracking-wider">
                      Network
                    </span>
                    <button className="flex items-center gap-2 text-gray-300 bg-white/5 hover:bg-white/10 px-3 py-2 rounded-2xl transition-colors">
                      <div className="w-6 h-6 bg-blue-600/20 rounded-full flex items-center justify-center text-blue-500 text-xs text-center">
                        {state.network === "Ethereum Mainnet" ? "Ξ" : "⛓"}
                      </div>
                      {state.isConnected ? state.network : "Network"}{" "}
                      <FiChevronDown />
                    </button>
                  </div>
                </div>

                <div className="mt-auto">
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-gray-400">You send:</span>
                    <div className="flex gap-2">
                      <span className="text-gray-500">
                        Available:{" "}
                        {state.isConnected
                          ? parseFloat(state.balance).toFixed(4)
                          : "0.0000"}
                      </span>
                      <button
                        onClick={handleMaxClick}
                        className="text-[#f8ff77] font-bold hover:opacity-80 transition-opacity"
                      >
                        MAX
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <input
                      type="text"
                      value={sendAmount}
                      onChange={e => setSendAmount(e.target.value)}
                      className="bg-transparent text-6xl font-light tracking-tighter text-right w-full outline-none focus:text-white transition-colors"
                      placeholder="0.00"
                    />
                    <div className="text-gray-500 mt-1">
                      ≈$
                      {state.isConnected
                        ? (
                            parseFloat(sendAmount || "0") * 2500
                          ).toLocaleString()
                        : "0.00"}
                    </div>
                  </div>
                </div>
              </div>

              {/* To Card */}
              <div className="inner-card rounded-[32px] p-6 flex flex-col gap-8 min-h-[300px]">
                <div className="flex justify-between items-center text-gray-400 text-sm">
                  <span>To:</span>
                  <div className="relative">
                    <button
                      onClick={() =>
                        setShowRecipientDropdown(!showRecipientDropdown)
                      }
                      className="flex items-center gap-2 px-3 py-1 bg-white/5 hover:bg-white/10 rounded-full border border-white/5 transition-colors"
                    >
                      <span className="text-xs font-mono text-white">
                        {recipientAddress
                          ? `${recipientAddress.slice(
                              0,
                              6
                            )}...${recipientAddress.slice(-4)}`
                          : "Select Address"}
                      </span>
                      <FiChevronDown
                        className={`transition-transform ${
                          showRecipientDropdown ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {showRecipientDropdown && (
                      <div className="absolute top-full right-0 mt-2 w-64 bg-[#1a1a1e] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden py-1">
                        {state.isConnected ? (
                          state.availableAccounts.length > 0 ? (
                            state.availableAccounts.map(addr => (
                              <button
                                key={addr}
                                onClick={() => {
                                  setRecipientAddress(addr);
                                  setShowRecipientDropdown(false);
                                }}
                                className={`w-full text-left px-4 py-2 text-xs font-mono hover:bg-white/5 transition-colors ${
                                  recipientAddress === addr
                                    ? "text-[#f8ff77]"
                                    : "text-gray-400"
                                }`}
                              >
                                {addr.slice(0, 10)}...{addr.slice(-10)}
                                {addr.toLowerCase() ===
                                  state.account?.toLowerCase() && (
                                  <span className="ml-2 text-[10px] text-gray-600">
                                    (Current)
                                  </span>
                                )}
                              </button>
                            ))
                          ) : (
                            <div className="px-4 py-2 text-xs text-gray-500 text-center">
                              No other accounts found
                            </div>
                          )
                        ) : (
                          <div className="px-4 py-2 text-xs text-gray-500 text-center">
                            Connect wallet first
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-end">
                  <div className="flex flex-col gap-4">
                    <span className="text-gray-500 text-xs font-medium uppercase tracking-wider">
                      Token
                    </span>
                    <button className="flex items-center gap-2 text-xl font-bold bg-white/5 hover:bg-white/10 px-3 py-2 rounded-2xl transition-colors">
                      <div className="w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center text-[10px]">
                        ₮
                      </div>
                      USDT <FiChevronDown />
                    </button>
                  </div>
                  <div className="flex flex-col gap-4">
                    <span className="text-gray-500 text-xs font-medium uppercase tracking-wider">
                      Network
                    </span>
                    <button className="flex items-center gap-2 text-gray-300 bg-white/5 hover:bg-white/10 px-3 py-2 rounded-2xl transition-colors">
                      <div className="w-6 h-6 bg-red-600/20 rounded-full flex items-center justify-center text-red-500 text-xs">
                        ▲
                      </div>
                      Avalanche <FiChevronDown />
                    </button>
                  </div>
                </div>

                <div className="mt-auto">
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-gray-400">You receive:</span>
                    <span className="text-gray-500">Balance: 0.00</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="text-6xl font-light tracking-tighter text-gray-400">
                      0.<span className="text-gray-600">00</span>
                    </div>
                    <div className="text-gray-500 mt-1">≈$0.00</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Area */}
            <div className="mt-12 flex flex-col md:flex-row justify-between items-end md:items-center gap-6">
              <div className="text-xs">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-gray-300">1 ETH = 2,500.00 USDT</span>
                  <span className="text-green-500">▲ 2.15% (24H)</span>
                </div>
                <p className="text-gray-500">
                  Rate is for reference only. Updated just now
                </p>
              </div>
              <button
                onClick={handleSwap}
                disabled={swapStatus === "loading"}
                className={`btn-primary flex items-center gap-2 px-10 py-5 rounded-[24px] text-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
                  swapStatus === "success"
                    ? "bg-green-500 text-black border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.4)]"
                    : ""
                }`}
              >
                {swapStatus === "loading" ? (
                  <FiRefreshCw className="animate-spin" />
                ) : swapStatus === "success" ? (
                  "Swap Complete!"
                ) : (
                  "Swap"
                )}
                {swapStatus === "idle" && (
                  <>
                    <FiArrowRight className="text-black/50" />
                    <FiArrowRight className="text-black/30 -ml-1" />
                    <FiArrowRight className="text-black/10 -ml-1" />
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
