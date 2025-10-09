"use client";

interface OverviewTabProps {
  chainId?: number;
  accounts?: string[];
  ethersSigner?: { address: string };
  fhevmStatus: string;
  fhevmError?: string | null;
  contractAddress?: string;
  isConnected: boolean;
  onConnect: () => void;
}

export const OverviewTab = ({
  chainId,
  accounts,
  ethersSigner,
  fhevmStatus,
  fhevmError,
  contractAddress,
  isConnected,
  onConnect
}: OverviewTabProps) => {
  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6">
        <div className="text-center space-y-4">
          <div className="text-6xl mb-4">🔗</div>
          <h2 className="text-3xl font-bold text-white">Welcome to ShieldPool</h2>
          <p className="text-xl text-gray-300 max-w-md">
            Connect your MetaMask wallet to start using the privacy-preserving insurance pool
          </p>
        </div>
        
        <button 
          onClick={onConnect}
          className="btn-primary text-xl px-8 py-4 rounded-xl"
        >
          🦊 Connect MetaMask Wallet
        </button>

        <div className="text-center text-sm text-gray-400 max-w-lg">
          <p>
            ShieldPool uses Zama's Fully Homomorphic Encryption (FHE) to provide complete privacy
            for insurance pool operations. Your sensitive data remains encrypted at all times.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Connection Status Card */}
      <div className="card">
        <div className="card-header">
          🌐 Network & Connection Status
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <InfoItem
              label="Network Chain ID"
              value={chainId ? `${chainId}` : "Unknown"}
              status={chainId ? "success" : "error"}
              icon="🔗"
            />
            <InfoItem
              label="Connected Accounts"
              value={
                accounts && accounts.length > 0
                  ? `${accounts.length} account(s)`
                  : "No accounts"
              }
              status={accounts && accounts.length > 0 ? "success" : "error"}
              icon="👥"
            />
          </div>
          <div className="space-y-4">
            <InfoItem
              label="Active Signer"
              value={ethersSigner?.address ? 
                `${ethersSigner.address.slice(0, 6)}...${ethersSigner.address.slice(-4)}` : 
                "No signer available"
              }
              status={ethersSigner ? "success" : "error"}
              icon="✍️"
            />
            <InfoItem
              label="Connection Status"
              value="Wallet Connected"
              status="success"
              icon="✅"
            />
          </div>
        </div>
      </div>

      {/* FHEVM Status Card */}
      <div className="card">
        <div className="card-header">
          🔐 FHEVM Encryption Status
        </div>
        <div className="space-y-4">
          <InfoItem
            label="FHEVM Instance Status"
            value={fhevmStatus || "Unknown"}
            status={fhevmStatus === "ready" ? "success" : fhevmStatus === "loading" ? "pending" : "error"}
            icon="🔒"
          />
          {fhevmError && (
            <div className="p-4 bg-red-900 bg-opacity-50 border border-red-500 rounded-lg">
              <div className="flex items-center gap-2 text-red-400">
                <span>⚠️</span>
                <span className="font-semibold">FHEVM Error</span>
              </div>
              <p className="text-red-300 mt-2">{fhevmError}</p>
            </div>
          )}
          {!fhevmError && fhevmStatus === "ready" && (
            <div className="p-4 bg-green-900 bg-opacity-50 border border-green-500 rounded-lg">
              <div className="flex items-center gap-2 text-green-400">
                <span>✅</span>
                <span className="font-semibold">Encryption Ready</span>
              </div>
              <p className="text-green-300 mt-2">
                Fully homomorphic encryption is active and ready for secure operations
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Contract Status Card */}
      <div className="card">
        <div className="card-header">
          📋 Smart Contract Status
        </div>
        <div className="space-y-4">
          <InfoItem
            label="ShieldPool Contract"
            value={contractAddress ? 
              `${contractAddress.slice(0, 6)}...${contractAddress.slice(-4)}` : 
              "Not deployed"
            }
            status={contractAddress ? "success" : "error"}
            icon="📜"
          />
          {contractAddress && (
            <div className="p-4 bg-yellow-900 bg-opacity-50 border border-yellow-500 rounded-lg">
              <div className="flex items-center gap-2 text-yellow-400">
                <span>📋</span>
                <span className="font-semibold">Contract Deployed</span>
              </div>
              <p className="text-yellow-300 mt-2">
                ShieldPool contract is successfully deployed and ready for operations
              </p>
              <p className="text-xs text-yellow-400 mt-2 font-mono">
                Address: {contractAddress}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface InfoItemProps {
  label: string;
  value: string;
  status: "success" | "error" | "pending";
  icon: string;
}

const InfoItem = ({ label, value, status, icon }: InfoItemProps) => {
  const statusClasses = {
    success: "status-success",
    error: "status-error",
    pending: "status-pending"
  };

  return (
    <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
      <div className="flex items-center gap-3">
        <span className="text-xl">{icon}</span>
        <span className="text-gray-300">{label}</span>
      </div>
      <span className={`font-mono font-semibold ${statusClasses[status]}`}>
        {value}
      </span>
    </div>
  );
};
