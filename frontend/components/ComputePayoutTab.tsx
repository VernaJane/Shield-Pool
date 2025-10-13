"use client";

import { useState } from "react";

interface ComputePayoutTabProps {
  canCompute: boolean;
  isComputing: boolean;
  onComputePayout: (loss: number) => void;
  onAuthorizeViewer: () => void;
  message?: string;
}

export const ComputePayoutTab = ({ 
  canCompute, 
  isComputing, 
  onComputePayout, 
  onAuthorizeViewer,
  message 
}: ComputePayoutTabProps) => {
  const [loss, setLoss] = useState<number>(100);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (canCompute && !isComputing) {
      onComputePayout(loss);
    }
  };

  const lossScenarios = [
    { value: 25, label: "Minor Loss", color: "text-green-400", description: "Small incident with limited impact", icon: "🟢" },
    { value: 50, label: "Moderate Loss", color: "text-yellow-400", description: "Moderate damage requiring compensation", icon: "🟡" },
    { value: 100, label: "Significant Loss", color: "text-orange-400", description: "Major incident with substantial impact", icon: "🟠" },
    { value: 200, label: "Severe Loss", color: "text-red-400", description: "Catastrophic event requiring maximum payout", icon: "🔴" },
    { value: 500, label: "Total Loss", color: "text-red-600", description: "Complete loss scenario", icon: "⛔" },
  ];

  const selectedScenario = lossScenarios.find(scenario => scenario.value === loss) || lossScenarios[2];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="text-6xl mb-4">🧮</div>
        <h2 className="text-3xl font-bold text-white mb-2">Compute Insurance Payout</h2>
        <p className="text-lg text-gray-300">
          Calculate your potential payout based on an insurance event and your risk profile
        </p>
      </div>

      {/* Compute Form */}
      <div className="max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="card">
          <div className="card-header">
            📊 Event Loss Assessment
          </div>

          <div className="space-y-6">
            {/* Loss Amount Input */}
            <div>
              <label className="block text-lg font-semibold text-white mb-3">
                💥 Insurance Event Loss Level
              </label>
              
              <div className="relative mb-4">
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={loss}
                  onChange={(e) => setLoss(Number(e.target.value))}
                  className="input-field w-full text-lg pr-20"
                  placeholder="Enter loss amount"
                  required
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                  Units
                </div>
              </div>

              {/* Current Loss Display */}
              <div className="p-4 bg-gray-800 rounded-lg border border-gray-600 mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{selectedScenario?.icon || "📊"}</span>
                    <div>
                      <div className={`text-lg font-bold ${selectedScenario?.color || "text-white"}`}>
                        {selectedScenario?.label || "Custom Loss"}
                      </div>
                      <div className="text-sm text-gray-400">
                        {selectedScenario?.description || `Custom loss level: ${loss} units`}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">{loss}</div>
                    <div className="text-xs text-gray-400">Loss Units</div>
                  </div>
                </div>
              </div>

              {/* Predefined Loss Scenarios */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {lossScenarios.map((scenario) => (
                  <button
                    key={scenario.value}
                    type="button"
                    onClick={() => setLoss(scenario.value)}
                    className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                      scenario.value === loss
                        ? 'border-yellow-400 bg-yellow-900 bg-opacity-30'
                        : 'border-gray-600 bg-gray-800 hover:border-gray-500'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">{scenario.icon}</span>
                      <div className={`font-bold ${scenario.color}`}>
                        {scenario.value}
                      </div>
                    </div>
                    <div className="text-sm font-semibold text-white">
                      {scenario.label}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {scenario.description}
                    </div>
                  </button>
                ))}
              </div>

              <p className="text-sm text-gray-400 mt-3">
                🔐 Payout calculations are performed on encrypted data to maintain privacy
              </p>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                type="submit"
                disabled={!canCompute || isComputing}
                className="btn-primary text-lg py-4"
              >
                {isComputing ? (
                  <>⏳ Computing...</>
                ) : canCompute ? (
                  <>🧮 Calculate Payout</>
                ) : (
                  <>🚫 Cannot Compute</>
                )}
              </button>

              <button
                type="button"
                onClick={onAuthorizeViewer}
                className="btn-secondary text-lg py-4"
              >
                👁️ Authorize Viewer
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* How It Works */}
      <div className="max-w-2xl mx-auto">
        <div className="bg-indigo-900 bg-opacity-30 border border-indigo-500 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <span className="text-2xl">🧠</span>
            <div>
              <h3 className="text-lg font-semibold text-indigo-300 mb-3">
                How Payout Calculation Works
              </h3>
              <div className="space-y-3 text-indigo-200">
                <div className="flex items-start gap-2">
                  <span className="text-yellow-400 mt-1">1.</span>
                  <p><strong>Event Assessment:</strong> Enter the loss amount for the insurance event</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-yellow-400 mt-1">2.</span>
                  <p><strong>Risk Calculation:</strong> Your payout is computed based on your encrypted risk profile</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-yellow-400 mt-1">3.</span>
                  <p><strong>Pool Distribution:</strong> Available funds are distributed proportionally among eligible participants</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-yellow-400 mt-1">4.</span>
                  <p><strong>Privacy Preserved:</strong> All calculations happen on encrypted data using FHE</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Message */}
      {message && (
        <div className="max-w-2xl mx-auto p-4 bg-gray-800 rounded-lg border border-gray-600">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">📢</span>
            <span className="font-semibold text-white">Computation Status:</span>
          </div>
          <p className="text-gray-300">{message}</p>
        </div>
      )}

      {/* Warning */}
      <div className="max-w-2xl mx-auto bg-amber-900 bg-opacity-30 border border-amber-500 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">⚠️</span>
          <span className="font-semibold text-amber-300">Important Note</span>
        </div>
        <p className="text-amber-200 mt-2 text-sm">
          Payout calculations are estimates based on current pool conditions. 
          Actual payouts may vary depending on pool liquidity and participant risk profiles.
        </p>
      </div>
    </div>
  );
};
