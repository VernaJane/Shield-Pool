"use client";

interface SettingsTabProps {
  chainId?: number;
  contractAddress?: string;
  fhevmStatus: string;
  accounts?: string[];
  ethersSigner?: { address: string };
}

export const SettingsTab = ({
  chainId,
  contractAddress,
  fhevmStatus,
  accounts,
  ethersSigner
}: SettingsTabProps) => {
  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
      console.log(`${label} copied to clipboard`);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="text-6xl mb-4">⚙️</div>
        <h2 className="text-3xl font-bold text-white mb-2">System Settings & Configuration</h2>
        <p className="text-lg text-gray-300">
          View and manage your ShieldPool connection settings
        </p>
      </div>

      {/* Network Configuration */}
      <div className="card">
        <div className="card-header">
          🌐 Network Configuration
        </div>
        <div className="space-y-4">
          <SettingItem
            label="Network Chain ID"
            value={chainId ? chainId.toString() : "Not connected"}
            icon="🔗"
            copyable={!!chainId}
            onCopy={() => chainId && copyToClipboard(chainId.toString(), "Chain ID")}
          />
          
          <SettingItem
            label="Contract Address"
            value={contractAddress || "Not deployed"}
            icon="📜"
            copyable={!!contractAddress}
            onCopy={() => contractAddress && copyToClipboard(contractAddress, "Contract Address")}
            displayValue={contractAddress ? 
              `${contractAddress.slice(0, 8)}...${contractAddress.slice(-8)}` : 
              "Not deployed"
            }
          />

          <div className="p-4 bg-gray-800 rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xl">🔒</span>
              <span className="font-semibold text-white">FHEVM Status</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Encryption Service</span>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${
                  fhevmStatus === "ready" ? "bg-green-400 animate-pulse-yellow" : 
                  fhevmStatus === "loading" ? "bg-yellow-400 animate-pulse" : 
                  "bg-red-400 animate-pulse-red"
                }`}></div>
                <span className={`font-mono font-semibold ${
                  fhevmStatus === "ready" ? "status-success" : 
                  fhevmStatus === "loading" ? "status-pending" : 
                  "status-error"
                }`}>
                  {fhevmStatus}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Account Information */}
      <div className="card">
        <div className="card-header">
          👤 Account Information
        </div>
        <div className="space-y-4">
          <SettingItem
            label="Connected Accounts"
            value={accounts?.length ? `${accounts.length} account(s) connected` : "No accounts"}
            icon="👥"
            copyable={false}
          />
          
          {accounts && accounts.length > 0 && (
            <div className="space-y-2">
              {accounts.slice(0, 3).map((account, index) => (
                <SettingItem
                  key={account}
                  label={`Account ${index + 1}`}
                  value={account}
                  icon="🏦"
                  copyable={true}
                  onCopy={() => copyToClipboard(account, `Account ${index + 1}`)}
                  displayValue={`${account.slice(0, 8)}...${account.slice(-8)}`}
                />
              ))}
              {accounts.length > 3 && (
                <p className="text-sm text-gray-400 pl-8">
                  ... and {accounts.length - 3} more account(s)
                </p>
              )}
            </div>
          )}

          <SettingItem
            label="Active Signer"
            value={ethersSigner?.address || "No signer"}
            icon="✍️"
            copyable={!!ethersSigner?.address}
            onCopy={() => ethersSigner?.address && copyToClipboard(ethersSigner.address, "Signer Address")}
            displayValue={ethersSigner?.address ? 
              `${ethersSigner.address.slice(0, 8)}...${ethersSigner.address.slice(-8)}` : 
              "No signer"
            }
          />
        </div>
      </div>

      {/* Privacy & Security */}
      <div className="card">
        <div className="card-header">
          🔐 Privacy & Security Settings
        </div>
        <div className="space-y-4">
          <div className="p-4 bg-green-900 bg-opacity-30 border border-green-500 rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xl">🛡️</span>
              <span className="font-semibold text-green-300">FHE Encryption Active</span>
            </div>
            <p className="text-green-200 text-sm">
              All your sensitive data (contributions, risk levels, payouts) are protected by 
              Fully Homomorphic Encryption and never leave your control.
            </p>
          </div>

          <div className="p-4 bg-blue-900 bg-opacity-30 border border-blue-500 rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xl">🔑</span>
              <span className="font-semibold text-blue-300">Private Key Security</span>
            </div>
            <p className="text-blue-200 text-sm">
              Your private keys remain in your MetaMask wallet and are never transmitted to 
              or stored by the ShieldPool application.
            </p>
          </div>

          <div className="p-4 bg-purple-900 bg-opacity-30 border border-purple-500 rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xl">🔍</span>
              <span className="font-semibold text-purple-300">Zero-Knowledge Privacy</span>
            </div>
            <p className="text-purple-200 text-sm">
              Pool calculations are performed on encrypted data without revealing individual 
              participant information to other users or pool operators.
            </p>
          </div>
        </div>
      </div>

      {/* System Information */}
      <div className="card">
        <div className="card-header">
          📊 System Information
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-300">Application:</span>
              <span className="font-mono text-white">ShieldPool v1.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Encryption:</span>
              <span className="font-mono text-white">Zama FHEVM</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Blockchain:</span>
              <span className="font-mono text-white">Ethereum Compatible</span>
            </div>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-300">Privacy Level:</span>
              <span className="font-mono text-green-400">Maximum</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Data Security:</span>
              <span className="font-mono text-green-400">End-to-End</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Encryption Type:</span>
              <span className="font-mono text-green-400">Homomorphic</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface SettingItemProps {
  label: string;
  value: string;
  icon: string;
  copyable: boolean;
  onCopy?: () => void;
  displayValue?: string;
}

const SettingItem = ({ label, value, icon, copyable, onCopy, displayValue }: SettingItemProps) => {
  return (
    <div className="p-4 bg-gray-800 rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xl">{icon}</span>
          <span className="text-gray-300">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-white">
            {displayValue || value}
          </span>
          {copyable && onCopy && (
            <button
              onClick={onCopy}
              className="p-1 text-gray-400 hover:text-yellow-400 transition-colors"
              title="Copy to clipboard"
            >
              📋
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
