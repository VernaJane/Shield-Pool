"use client";

import { useFhevm } from "@/fhevm/useFhevm";
import { useInMemoryStorage } from "@/hooks/useInMemoryStorage";
import { useMetaMaskEthersSigner } from "@/hooks/metamask/useMetaMaskEthersSigner";
import { errorNotDeployed } from "./ErrorNotDeployed";
import { useShieldPool } from "@/hooks/useShieldPool";
import { useState } from "react";

import { Navigation, NavigationTab } from "./Navigation";
import { OverviewTab } from "./OverviewTab";
import { PoolStatusTab } from "./PoolStatusTab";
import { JoinPoolTab } from "./JoinPoolTab";
import { ComputePayoutTab } from "./ComputePayoutTab";
import { SettingsTab } from "./SettingsTab";

export const ShieldPoolDemo = () => {
  const { storage: fhevmDecryptionSignatureStorage } = useInMemoryStorage();
  const {
    provider,
    chainId,
    accounts,
    isConnected,
    connect,
    ethersSigner,
    ethersReadonlyProvider,
    sameChain,
    sameSigner,
    initialMockChains,
  } = useMetaMaskEthersSigner();

  const {
    instance: fhevmInstance,
    status: fhevmStatus,
    error: fhevmError,
  } = useFhevm({ provider, chainId, initialMockChains, enabled: true });

  const sp = useShieldPool({
    instance: fhevmInstance,
    fhevmDecryptionSignatureStorage,
    eip1193Provider: provider,
    chainId,
    ethersSigner,
    ethersReadonlyProvider,
    sameChain,
    sameSigner,
  });

  const [activeTab, setActiveTab] = useState<NavigationTab>("overview");

  // Show "not deployed" only when chainId is known and the network has no configured address
  if (chainId !== undefined && sp.isDeployed === false) {
    return errorNotDeployed(chainId);
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <OverviewTab
            chainId={chainId}
            accounts={accounts}
            ethersSigner={ethersSigner}
            fhevmStatus={fhevmStatus}
            fhevmError={fhevmError?.message ?? null}
            contractAddress={sp.contractAddress}
            isConnected={isConnected}
            onConnect={connect}
          />
        );

      case "pool-status":
        return (
          <PoolStatusTab
            handles={sp.handles}
            clears={sp.clears}
            canView={!!sp.canView}
            canDecrypt={!!sp.canDecrypt}
            isDecrypting={!!sp.isDecrypting}
            onRefreshHandles={sp.refreshAllHandles}
            onDecryptAll={sp.decryptAll}
            onAuthorizeViewer={sp.authorizeViewer}
          />
        );

      case "join-pool":
        return (
          <JoinPoolTab
            canJoin={!!sp.canJoin}
            isJoining={!!sp.isJoining}
            onJoinPool={sp.joinPool}
            message={sp.message}
          />
        );

      case "compute-payout":
        return (
          <ComputePayoutTab
            canCompute={!!sp.canCompute}
            isComputing={!!sp.isComputing}
            onComputePayout={sp.computeMyPayout}
            onAuthorizeViewer={sp.authorizeViewer}
            message={sp.message}
          />
        );

      case "settings":
        return (
          <SettingsTab
            chainId={chainId}
            contractAddress={sp.contractAddress}
            fhevmStatus={fhevmStatus}
            accounts={accounts}
            ethersSigner={ethersSigner}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        <Navigation
          activeTab={activeTab}
          onTabChange={setActiveTab}
          isConnected={isConnected}
        />

        <div className="mt-8">
          {renderTabContent()}
        </div>

        {/* Status Message Footer */}
        {sp.message && (
          <div className="mt-8 max-w-4xl mx-auto">
            <div className="p-4 bg-gray-800 rounded-lg border border-gray-600">
              <div className="flex items-center gap-3">
                <span className="text-2xl">💬</span>
                <div>
                  <div className="font-semibold text-white mb-1">System Message</div>
                  <div className="text-gray-300">{sp.message}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};



