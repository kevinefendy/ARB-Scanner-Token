import React, { useState } from 'react';
import {
  Search,
  ArrowRight,
  Clipboard,
  AlertCircle,
  Copy,
  Check,
  Globe,
  ExternalLink,
} from 'lucide-react';
import {
  SUPPORTED_NETWORKS,
  MULTICHAIN_TOKENS,
  getNetworkConfig,
  calculate10ScaleRating,
} from '../constants/arbitrum';
import { validateAddress } from '../services/scanner';

export default function HeroSearch({
  onScan,
  isScanning,
  onSelectTestToken,
  selectedNetworkId,
  onSelectNetwork,
}) {
  const [addressInput, setAddressInput] = useState('');
  const [validationError, setValidationError] = useState('');
  const [copiedAddr, setCopiedAddr] = useState(null);

  const activeNetwork = getNetworkConfig(selectedNetworkId);
  const currentTokens = MULTICHAIN_TOKENS[activeNetwork.id] || [];

  const handleSubmit = (e) => {
    e.preventDefault();
    const clean = addressInput.trim();
    if (!clean) {
      setValidationError('Please enter a contract address.');
      return;
    }
    if (!validateAddress(clean)) {
      setValidationError('Invalid contract address format (0x...).');
      return;
    }
    setValidationError('');
    onScan(clean, activeNetwork.id);
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setAddressInput(text.trim());
        setValidationError('');
      }
    } catch {
      // clipboard permission
    }
  };

  const handleCopy = (e, addr) => {
    e.stopPropagation();
    navigator.clipboard.writeText(addr);
    setCopiedAddr(addr);
    setTimeout(() => setCopiedAddr(null), 1500);
  };

  return (
    <div className="rugcheck-hero">
      {/* Top Simple Header */}
      <div className="rugcheck-header-block">
        <h1 className="rugcheck-title">Arbitrum & Ethereum Token Scanner</h1>
        <p className="rugcheck-subtitle">
          Instant on-chain contract risk analysis and 1.0 – 10.0 security rating.
        </p>
      </div>

      {/* Network Filter Bar */}
      <div className="rugcheck-net-bar">
        <div className="net-bar-list">
          {Object.values(SUPPORTED_NETWORKS).map((net) => {
            const isSelected = net.id === activeNetwork.id;
            return (
              <button
                key={net.id}
                type="button"
                className={`rugcheck-net-tab ${isSelected ? 'active' : ''}`}
                onClick={() => onSelectNetwork(net.id)}
              >
                <Globe size={13} />
                <span>{net.name}</span>
                <span className="net-tag font-mono">{net.isTestnet ? 'Testnet' : 'Mainnet'}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Clean Utilitarian Search Bar */}
      <form onSubmit={handleSubmit} className="rugcheck-search-form">
        <div className={`rugcheck-input-row ${validationError ? 'has-error' : ''}`}>
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input font-mono"
            placeholder={`Search by contract address on ${activeNetwork.name} (0x...)`}
            value={addressInput}
            onChange={(e) => {
              setAddressInput(e.target.value);
              if (validationError) setValidationError('');
            }}
            spellCheck={false}
            autoComplete="off"
          />
          {addressInput ? (
            <button
              type="button"
              className="btn-clear font-mono"
              onClick={() => {
                setAddressInput('');
                setValidationError('');
              }}
            >
              Clear
            </button>
          ) : (
            <button
              type="button"
              className="btn-paste"
              onClick={handlePaste}
              title="Paste from clipboard"
            >
              <Clipboard size={14} />
              <span>Paste</span>
            </button>
          )}
          <button
            type="submit"
            className="btn-submit-scan"
            disabled={isScanning}
          >
            {isScanning ? (
              <span>Scanning...</span>
            ) : (
              <>
                <span>Scan Contract</span>
                <ArrowRight size={15} />
              </>
            )}
          </button>
        </div>

        {validationError && (
          <div className="rugcheck-error-row">
            <AlertCircle size={14} />
            <span>{validationError}</span>
          </div>
        )}
      </form>

      {/* RugCheck-Style Token Table */}
      <div className="rugcheck-table-container">
        <div className="table-header-row">
          <span className="table-heading">
            Sample Verified & Test Tokens ({activeNetwork.name})
          </span>
          <span className="table-sub-info font-mono">
            Chain ID: {activeNetwork.chainId}
          </span>
        </div>

        <div className="table-responsive">
          <table className="rugcheck-table">
            <thead>
              <tr>
                <th>Token</th>
                <th>Contract Address</th>
                <th>Supply</th>
                <th>1-10 Rating</th>
                <th>Risk Status</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {currentTokens.map((token) => {
                const ratingInfo = calculate10ScaleRating(token.riskScore);
                return (
                  <tr
                    key={token.id}
                    onClick={() => {
                      setAddressInput(token.address);
                      onSelectTestToken(token, activeNetwork.id);
                    }}
                    className="clickable-tr"
                  >
                    <td>
                      <div className="token-cell">
                        <div className="token-sym-avatar font-mono">
                          {token.symbol.slice(0, 3)}
                        </div>
                        <div className="token-name-group">
                          <span className="name-bold">{token.name}</span>
                          <span className="sym-sub font-mono">{token.symbol}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="addr-cell font-mono">
                        <span>{token.address.slice(0, 8)}...{token.address.slice(-6)}</span>
                        <button
                          type="button"
                          className="btn-copy-inline"
                          onClick={(e) => handleCopy(e, token.address)}
                          title="Copy address"
                        >
                          {copiedAddr === token.address ? (
                            <Check size={12} className="text-emerald" />
                          ) : (
                            <Copy size={12} />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="font-mono text-muted">{token.totalSupply}</td>
                    <td>
                      <div className={`rating-pill-tag ${token.riskLevel.toLowerCase()} font-mono`}>
                        <span className="rate-num">{ratingInfo.rating} / 10</span>
                        <span className="rate-grade">({ratingInfo.grade})</span>
                      </div>
                    </td>
                    <td>
                      <span className={`status-flat-badge ${token.riskLevel.toLowerCase()}`}>
                        {token.riskLevel === 'LOW' && 'Good'}
                        {token.riskLevel === 'MEDIUM' && 'Warning'}
                        {token.riskLevel === 'HIGH' && 'Danger'}
                      </span>
                    </td>
                    <td className="text-right">
                      <button
                        type="button"
                        className="btn-view-report"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectTestToken(token, activeNetwork.id);
                        }}
                      >
                        <span>View Report</span>
                        <ExternalLink size={12} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
