export function errorNotDeployed(chainId?: number) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <div className="text-8xl mb-6">🚫</div>
          <h1 className="text-4xl font-bold text-white mb-4">Contract Not Deployed</h1>
          <p className="text-xl text-gray-300">
            ShieldPool smart contract is not available on this network
          </p>
        </div>

        <div className="card">
          <div className="p-6 bg-red-900 bg-opacity-50 border border-red-500 rounded-lg mb-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">⚠️</span>
              <div>
                <h3 className="text-xl font-bold text-red-300">Deployment Required</h3>
                <p className="text-red-200">
                  The ShieldPool contract is not deployed on Chain ID: <span className="font-mono font-bold">{String(chainId)}</span>
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <span>🛠️</span>
                Required Setup Steps
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-gray-800 rounded-lg">
                  <span className="text-yellow-400 font-bold mt-1">1.</span>
                  <div>
                    <p className="text-white font-semibold">Deploy Backend Contract</p>
                    <p className="text-gray-300 text-sm">Run the deployment script in the backend directory</p>
                    <code className="block mt-2 p-2 bg-black rounded text-green-400 text-sm">
                      cd backend && npm run deploy
                    </code>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 bg-gray-800 rounded-lg">
                  <span className="text-yellow-400 font-bold mt-1">2.</span>
                  <div>
                    <p className="text-white font-semibold">Generate ABI Files</p>
                    <p className="text-gray-300 text-sm">Update the frontend with contract addresses and ABIs</p>
                    <code className="block mt-2 p-2 bg-black rounded text-green-400 text-sm">
                      cd frontend && npm run genabi
                    </code>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-gray-800 rounded-lg">
                  <span className="text-yellow-400 font-bold mt-1">3.</span>
                  <div>
                    <p className="text-white font-semibold">Restart Application</p>
                    <p className="text-gray-300 text-sm">Refresh the page or restart the development server</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-blue-900 bg-opacity-30 border border-blue-500 rounded-lg">
              <div className="flex items-start gap-3">
                <span className="text-2xl mt-1">💡</span>
                <div>
                  <h4 className="font-semibold text-blue-300 mb-2">Development Tips</h4>
                  <ul className="space-y-1 text-blue-200 text-sm">
                    <li>• Make sure your local blockchain network is running</li>
                    <li>• Verify your MetaMask is connected to the correct network</li>
                    <li>• Check that the deployment completed successfully</li>
                    <li>• Ensure all environment variables are properly configured</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


