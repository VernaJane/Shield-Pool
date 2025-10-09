"use client";

interface PoolStatusTabProps {
  handles: {
    myAmount?: string;
    myRisk?: string;
    lastPayout?: string;
    poolTotal?: string;
    riskSum?: string;
  };
  clears: Record<string, { clear: string | bigint | boolean } | undefined>;
  canView: boolean;
  canDecrypt: boolean;
  isDecrypting: boolean;
  onRefreshHandles: () => void;
  onDecryptAll: () => void;
  onAuthorizeViewer: () => void;
}

export const PoolStatusTab = ({
  handles,
  clears,
  canView,
  canDecrypt,
  isDecrypting,
  onRefreshHandles,
  onDecryptAll,
  onAuthorizeViewer
}: PoolStatusTabProps) => {
  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 justify-center">
        <button 
          className="btn-primary"
          disabled={!canView} 
          onClick={onRefreshHandles}
        >
          🔄 {canView ? "Refresh Data Handles" : "Contract Not Available"}
        </button>
        
        <button 
          className="btn-secondary"
          disabled={!canDecrypt} 
          onClick={onDecryptAll}
        >
          {canDecrypt ? (
            <>🔓 Decrypt All Data</>
          ) : isDecrypting ? (
            <>⏳ Decrypting...</>
          ) : (
            <>🚫 Nothing to Decrypt</>
          )}
        </button>

        <button 
          className="btn-secondary"
          onClick={onAuthorizeViewer}
        >
          👁️ Authorize Viewer
        </button>
      </div>

      {/* Personal Encrypted Data */}
      <div className="card">
        <div className="card-header">
          👤 Your Personal Encrypted Data
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <DataItem
              label="Contribution Amount"
              handle={handles.myAmount}
              clearValue={clears[handles.myAmount ?? ""]?.clear}
              icon="💰"
              description="Your total contribution to the insurance pool"
            />
            <DataItem
              label="Risk Level"
              handle={handles.myRisk}
              clearValue={clears[handles.myRisk ?? ""]?.clear}
              icon="⚡"
              description="Your declared risk assessment level"
            />
          </div>
          <div className="space-y-4">
            <DataItem
              label="Last Payout"
              handle={handles.lastPayout}
              clearValue={clears[handles.lastPayout ?? ""]?.clear}
              icon="💸"
              description="Most recent payout you received"
            />
          </div>
        </div>
        
        {!handles.myAmount && !handles.myRisk && !handles.lastPayout && (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">📊</div>
            <p className="text-xl text-gray-300">No personal data available</p>
            <p className="text-gray-400 mt-2">
              Join the insurance pool to see your encrypted data here
            </p>
          </div>
        )}
      </div>

      {/* Pool Aggregate Data */}
      <div className="card">
        <div className="card-header">
          🏊 Pool Aggregate Data
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <DataItem
            label="Total Pool Value"
            handle={handles.poolTotal}
            clearValue={clears[handles.poolTotal ?? ""]?.clear}
            icon="🏦"
            description="Combined value of all contributions in the pool"
            isAggregate
          />
          <DataItem
            label="Total Risk Sum"
            handle={handles.riskSum}
            clearValue={clears[handles.riskSum ?? ""]?.clear}
            icon="⚖️"
            description="Aggregate risk assessment of all participants"
            isAggregate
          />
        </div>

        {!handles.poolTotal && !handles.riskSum && (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">🏊</div>
            <p className="text-xl text-gray-300">Pool data not available</p>
            <p className="text-gray-400 mt-2">
              Refresh handles to load the current pool statistics
            </p>
          </div>
        )}
      </div>

      {/* Information Panel */}
      <div className="bg-blue-900 bg-opacity-30 border border-blue-500 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <span className="text-2xl">ℹ️</span>
          <div>
            <h3 className="text-lg font-semibold text-blue-300 mb-2">
              Understanding Encrypted Data
            </h3>
            <ul className="space-y-2 text-blue-200">
              <li>• <strong>Handles:</strong> Encrypted references to your private data</li>
              <li>• <strong>Clear Values:</strong> Decrypted readable values (only visible to you)</li>
              <li>• <strong>FHE Protection:</strong> All computations happen on encrypted data</li>
              <li>• <strong>Privacy Guarantee:</strong> Your sensitive information never leaves your control</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

interface DataItemProps {
  label: string;
  handle?: string;
  clearValue?: string | bigint | boolean;
  icon: string;
  description: string;
  isAggregate?: boolean;
}

const DataItem = ({ label, handle, clearValue, icon, description, isAggregate }: DataItemProps) => {
  const hasHandle = !!handle;
  const hasClearValue =
    clearValue !== undefined &&
    (typeof clearValue === "string" ? clearValue !== "Not decrypted" : true);
  
  return (
    <div className="p-4 bg-gray-800 rounded-lg border border-gray-600">
      <div className="flex items-center gap-3 mb-3">
        <span className="text-2xl">{icon}</span>
        <div>
          <h4 className="font-semibold text-white">{label}</h4>
          <p className="text-xs text-gray-400">{description}</p>
        </div>
      </div>
      
      <div className="space-y-2 text-sm">
        <div className="flex justify-between items-center">
          <span className="text-gray-300">Encrypted Handle:</span>
          <span className={`font-mono ${hasHandle ? 'status-success' : 'status-error'}`}>
            {hasHandle ? `${handle?.slice(0, 8)}...` : "Not available"}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-300">Clear Value:</span>
          <span className={`font-mono font-bold ${hasClearValue ? 'status-success' : 'status-pending'}`}>
            {hasClearValue ? String(clearValue) : "🔒 Not decrypted"}
          </span>
        </div>
      </div>

      {isAggregate && (
        <div className="mt-3 p-2 bg-yellow-900 bg-opacity-30 rounded border border-yellow-600">
          <p className="text-xs text-yellow-300">
            🔐 This is aggregate data computed on encrypted values from all pool participants
          </p>
        </div>
      )}
    </div>
  );
};
