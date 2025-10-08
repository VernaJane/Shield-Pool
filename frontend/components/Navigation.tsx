"use client";

import { useState } from "react";

export type NavigationTab = 
  | "overview" 
  | "pool-status" 
  | "join-pool" 
  | "compute-payout" 
  | "settings";

interface NavigationProps {
  activeTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  isConnected: boolean;
}

export const Navigation = ({ activeTab, onTabChange, isConnected }: NavigationProps) => {
  const tabs = [
    { id: "overview" as NavigationTab, label: "Overview", icon: "🏠", description: "System Status" },
    { id: "pool-status" as NavigationTab, label: "Pool Status", icon: "📊", description: "View Pool Data" },
    { id: "join-pool" as NavigationTab, label: "Join Pool", icon: "💰", description: "Add Funds" },
    { id: "compute-payout" as NavigationTab, label: "Compute Payout", icon: "🧮", description: "Calculate Claims" },
    { id: "settings" as NavigationTab, label: "Settings", icon: "⚙️", description: "Configuration" },
  ];

  return (
    <div className="w-full mb-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-3 px-6 py-3 gradient-red-yellow rounded-full mb-4">
          <span className="text-2xl">🛡️</span>
          <h1 className="text-3xl font-bold text-black">ShieldPool</h1>
        </div>
        <p className="text-lg text-gray-300">Privacy-Preserving Insurance Pool using Zama FHEVM</p>
        <div className="flex items-center justify-center gap-2 mt-2">
          {isConnected ? (
            <>
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse-yellow"></div>
              <span className="text-green-400 font-semibold">Connected</span>
            </>
          ) : (
            <>
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse-red"></div>
              <span className="text-red-400 font-semibold">Disconnected</span>
            </>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap justify-center gap-2 mb-6">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const isDisabled = !isConnected && tab.id !== "overview";
          
          return (
            <button
              key={tab.id}
              onClick={() => !isDisabled && onTabChange(tab.id)}
              disabled={isDisabled}
              className={`
                group relative px-6 py-4 rounded-xl font-semibold transition-all duration-300
                ${isActive 
                  ? 'gradient-red-yellow text-black shadow-lg transform -translate-y-1' 
                  : 'bg-gray-800 text-white hover:bg-gray-700 border border-gray-600'
                }
                ${isDisabled 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:transform hover:-translate-y-1 hover:shadow-lg'
                }
              `}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{tab.icon}</span>
                <div className="text-left">
                  <div className="font-bold">{tab.label}</div>
                  <div className={`text-xs ${isActive ? 'text-black opacity-70' : 'text-gray-400'}`}>
                    {tab.description}
                  </div>
                </div>
              </div>
              
              {isDisabled && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-xl">
                  <span className="text-xs text-gray-300">Connect Wallet</span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Description */}
      <div className="text-center">
        <div className="inline-block px-4 py-2 bg-gray-800 rounded-lg border border-gray-600">
          <span className="text-gray-300">
            {tabs.find(tab => tab.id === activeTab)?.description || "Select a tab to get started"}
          </span>
        </div>
      </div>
    </div>
  );
};
