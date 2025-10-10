"use client";

import { useState } from "react";

interface JoinPoolTabProps {
  canJoin: boolean;
  isJoining: boolean;
  onJoinPool: (amount: string, risk: number) => void;
  message?: string;
}

export const JoinPoolTab = ({ canJoin, isJoining, onJoinPool, message }: JoinPoolTabProps) => {
  const [amount, setAmount] = useState<string>("0.1");
  const [risk, setRisk] = useState<number>(50);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (canJoin && !isJoining) {
      onJoinPool(amount, risk);
    }
  };

  const riskLevels = [
    { value: 10, label: "Very Low", color: "text-green-400", description: "Minimal risk exposure" },
    { value: 25, label: "Low", color: "text-green-300", description: "Below average risk" },
    { value: 50, label: "Medium", color: "text-yellow-400", description: "Standard risk level" },
    { value: 75, label: "High", color: "text-orange-400", description: "Above average risk" },
    { value: 90, label: "Very High", color: "text-red-400", description: "Maximum risk exposure" },
  ];

  const selectedRiskLevel = riskLevels.find(level => Math.abs(level.value - risk) < 12.5) || riskLevels[2];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="text-6xl mb-4">🏊‍♂️</div>
        <h2 className="text-3xl font-bold text-white mb-2">Join the Insurance Pool</h2>
        <p className="text-lg text-gray-300">
          Contribute funds and declare your risk level to participate in the privacy-preserving insurance pool
        </p>
      </div>

      {/* Join Form */}
      <div className="max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="card">
          <div className="card-header">
            💰 Pool Contribution Details
          </div>

          <div className="space-y-6">
            {/* Amount Input */}
            <div>
              <label className="block text-lg font-semibold text-white mb-3">
                💸 Contribution Amount (ETH)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="0.000000000000000001"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="input-field w-full text-lg pr-16"
                  placeholder="Enter amount in ETH"
                  required
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                  ETH
                </div>
              </div>
              <p className="text-sm text-gray-400 mt-2">
                💡 Minimum contribution: 0.001 ETH • Your funds will be encrypted and pooled with others
              </p>
            </div>

            {/* Risk Level Selector */}
            <div>
              <label className="block text-lg font-semibold text-white mb-3">
                ⚡ Risk Assessment Level
              </label>
              
              <div className="space-y-4">
                {/* Risk Slider */}
                <div className="relative">
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={risk}
                    onChange={(e) => setRisk(Number(e.target.value))}
                    className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    style={{
                      background: `linear-gradient(to right, #10b981 0%, #eab308 50%, #dc2626 100%)`
                    }}
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>Low Risk</span>
                    <span>Medium Risk</span>
                    <span>High Risk</span>
                  </div>
                </div>

                {/* Current Risk Display */}
                <div className="p-4 bg-gray-800 rounded-lg border border-gray-600">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">📊</span>
                      <div>
                        <div className={`text-lg font-bold ${selectedRiskLevel.color}`}>
                          {selectedRiskLevel.label} Risk ({risk})
                        </div>
                        <div className="text-sm text-gray-400">
                          {selectedRiskLevel.description}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-white">{risk}</div>
                      <div className="text-xs text-gray-400">Risk Units</div>
                    </div>
                  </div>
                </div>

                {/* Risk Level Options */}
                <div className="grid grid-cols-5 gap-2">
                  {riskLevels.map((level) => (
                    <button
                      key={level.value}
                      type="button"
                      onClick={() => setRisk(level.value)}
                      className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                        Math.abs(level.value - risk) < 12.5
                          ? 'border-yellow-400 bg-yellow-900 bg-opacity-30'
                          : 'border-gray-600 bg-gray-800 hover:border-gray-500'
                      }`}
                    >
                      <div className={`font-bold ${level.color}`}>{level.value}</div>
                      <div className="text-xs text-gray-400">{level.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              <p className="text-sm text-gray-400 mt-2">
                🔒 Your risk level determines potential payouts and remains encrypted
              </p>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={!canJoin || isJoining}
                className="btn-primary w-full text-xl py-4"
              >
                {isJoining ? (
                  <>⏳ Joining Pool...</>
                ) : canJoin ? (
                  <>🚀 Join Insurance Pool</>
                ) : (
                  <>🚫 Cannot Join Pool</>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Information Panel */}
      <div className="max-w-2xl mx-auto bg-purple-900 bg-opacity-30 border border-purple-500 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <span className="text-2xl">🛡️</span>
          <div>
            <h3 className="text-lg font-semibold text-purple-300 mb-2">
              How the Insurance Pool Works
            </h3>
            <ul className="space-y-2 text-purple-200">
              <li>• <strong>Privacy First:</strong> Your contribution amount and risk level are encrypted</li>
              <li>• <strong>Fair Payouts:</strong> Claims are calculated based on encrypted risk assessments</li>
              <li>• <strong>Secure Computation:</strong> All calculations happen on encrypted data using FHE</li>
              <li>• <strong>Collective Protection:</strong> Pool resources are shared among all participants</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Status Message */}
      {message && (
        <div className="max-w-2xl mx-auto p-4 bg-gray-800 rounded-lg border border-gray-600">
          <div className="flex items-center gap-2">
            <span className="text-xl">📢</span>
            <span className="font-semibold text-white">Status Update:</span>
          </div>
          <p className="text-gray-300 mt-2">{message}</p>
        </div>
      )}
    </div>
  );
};
