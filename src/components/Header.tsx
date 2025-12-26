"use client";

import React from "react";
import { FiSettings } from "react-icons/fi";
import WalletButton from "./walletButton";

interface HeaderProps {
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
}

const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  return (
    <header className="w-full h-16 md:h-20 flex items-center justify-between px-4 md:px-8 bg-transparent">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <span className="text-xl md:text-2xl font-bold tracking-tight text-white">
          Demo
        </span>
      </div>

      {/* Navigation */}
      <nav className="hidden md:flex items-center gap-8">
        <button
          onClick={() => setActiveTab?.("Wallet")}
          className={`${
            activeTab === "Wallet"
              ? "text-[#f8ff77]"
              : "text-gray-400 hover:text-white"
          } text-sm md:text-base font-medium transition-colors`}
        >
          Wallet
        </button>
        <button
          onClick={() => setActiveTab?.("Swap")}
          className={`${
            activeTab === "Swap"
              ? "text-[#f8ff77]"
              : "text-gray-400 hover:text-white"
          } text-sm md:text-base font-medium transition-colors`}
        >
          Trade
        </button>
      </nav>

      {/* Actions */}
      <div className="flex items-center gap-2 md:gap-4">
        <WalletButton />
      </div>
    </header>
  );
};

export default Header;
