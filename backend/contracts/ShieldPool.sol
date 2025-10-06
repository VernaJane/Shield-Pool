// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {FHE, euint32, externalEuint32} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title ShieldPool — Privacy-preserving insurance risk pool using Zama FHEVM
/// @notice Follows Zama template patterns: FHE.fromExternal + FHE ops + FHE.allowThis/allow
/// @dev All amounts & risk fields are encrypted euint32 for simplicity (demo scale). Pool ETH balance is clear.
contract ShieldPool is SepoliaConfig {
    // Encrypted per-user total deposit (demo units, euint32)
    mapping(address => euint32) private _userAmount;

    // Encrypted per-user latest risk level (0..100 for demo)
    mapping(address => euint32) private _userRisk;

    // Encrypted per-user last computed payout amount
    mapping(address => euint32) private _lastPayout;

    // Encrypted global aggregates
    euint32 private _poolTotal;   // sum of declared deposits
    euint32 private _riskSum;     // sum of risk levels (demo)
    // Public (clear) aggregate used for division (FHE.div expects a clear denominator)
    uint32 private _poolTotalClear;

    event Joined(address indexed user, uint256 valueWei);
    event PayoutComputed(address indexed user);

    /// @notice Deposit native ETH into pool while submitting encrypted amount and risk level for FHE computations
    /// @dev msg.value is real ETH put into pool. Encrypted `amountEnc` is used solely for FHE computations (demo).
    /// @param amountEnc Encrypted declared deposit amount (euint32)
    /// @param riskEnc Encrypted risk level (euint32)
    /// @param inputProof Input proof from FHEVM SDK encrypt()
    function joinPool(
        externalEuint32 amountEnc,
        externalEuint32 riskEnc,
        bytes calldata inputProof
    ) external payable {
        require(msg.value > 0, "no-eth");

        euint32 encAmount = FHE.fromExternal(amountEnc, inputProof);
        euint32 encRisk = FHE.fromExternal(riskEnc, inputProof);

        _userAmount[msg.sender] = FHE.add(_userAmount[msg.sender], encAmount);
        _userRisk[msg.sender] = encRisk;
        _poolTotal = FHE.add(_poolTotal, encAmount);
        _riskSum = FHE.add(_riskSum, encRisk);

        // Maintain a clear aggregate as denominator for FHE.div
        // Scale down wei to demo units to fit into uint32
        uint256 scaled = msg.value / 1e14; // 1e18 wei -> 1e4 units per ETH
        if (scaled > type(uint32).max) {
            scaled = type(uint32).max;
        }
        _poolTotalClear += uint32(scaled);

        // Grant read permissions on updated ciphertexts
        FHE.allowThis(_userAmount[msg.sender]);
        FHE.allow(_userAmount[msg.sender], msg.sender);
        FHE.allowThis(_userRisk[msg.sender]);
        FHE.allow(_userRisk[msg.sender], msg.sender);

        FHE.allowThis(_poolTotal);
        FHE.allow(_poolTotal, msg.sender);
        FHE.allowThis(_riskSum);
        FHE.allow(_riskSum, msg.sender);

        emit Joined(msg.sender, msg.value);
    }

    /// @notice Grants decryption permission for caller on current aggregates
    function authorizeViewer() external {
        FHE.allow(_poolTotal, msg.sender);
        FHE.allow(_riskSum, msg.sender);
    }

    /// @notice Compute encrypted payout for caller based on encrypted amount and an encrypted event loss value
    /// @dev payout = userAmount * eventLoss / poolTotal (all euint32). Stores result in _lastPayout and returns handle.
    ///      This is a demo: no clear transfer; front-end decrypts the handle with user signature.
    /// @param eventLossEnc Encrypted event loss numerator (e.g., loss budget or ratio scaled) as euint32
    /// @param inputProof Input proof returned by SDK encrypt()
    function computeMyPayout(
        externalEuint32 eventLossEnc,
        bytes calldata inputProof
    ) external returns (euint32) {
        euint32 loss = FHE.fromExternal(eventLossEnc, inputProof);

        // payout = userAmount * loss / poolTotal
        // Using FHE.mul and FHE.div (denominator must be clear uint32)
        euint32 numerator = FHE.mul(_userAmount[msg.sender], loss);
        euint32 payout;
        if (_poolTotalClear == 0) {
            payout = FHE.asEuint32(0);
        } else {
            payout = FHE.div(numerator, _poolTotalClear);
        }

        _lastPayout[msg.sender] = payout;

        FHE.allowThis(_lastPayout[msg.sender]);
        FHE.allow(_lastPayout[msg.sender], msg.sender);

        emit PayoutComputed(msg.sender);
        return payout;
    }

    // =============================
    //            VIEWS
    // =============================

    function getMyEncryptedDeposit() external view returns (euint32) {
        return _userAmount[msg.sender];
    }

    function getMyEncryptedRisk() external view returns (euint32) {
        return _userRisk[msg.sender];
    }

    function getPoolTotalEncrypted() external view returns (euint32) {
        return _poolTotal;
    }

    function getRiskSumEncrypted() external view returns (euint32) {
        return _riskSum;
    }

    function getPoolTotalClear() external view returns (uint32) {
        return _poolTotalClear;
    }

    function getMyLastPayoutEncrypted() external view returns (euint32) {
        return _lastPayout[msg.sender];
    }

    /// @notice Clear ETH balance held by pool (for display only)
    function getPoolEthBalance() external view returns (uint256) {
        return address(this).balance;
    }
}


