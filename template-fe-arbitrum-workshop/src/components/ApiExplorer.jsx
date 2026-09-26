import React, { useState } from 'react';
import {
  FileCode,
  Play,
  Copy,
  Check,
  Code2,
  Terminal,
  Server,
  RefreshCw,
  Globe,
} from 'lucide-react';
import {
  SUPPORTED_NETWORKS,
  MULTICHAIN_TOKENS,
  getNetworkConfig,
} from '../constants/arbitrum';
import { scanContract } from '../services/scanner';

export default function ApiExplorer() {
  const [selectedNetworkId, setSelectedNetworkId] = useState('arbitrum-sepolia');
  const activeNet = getNetworkConfig(selectedNetworkId);
  const networkTokens = MULTICHAIN_TOKENS[selectedNetworkId] || [];

  const [selectedAddress, setSelectedAddress] = useState(
    networkTokens[0]?.address || '0x71C82B4628E46bF5E7B78096236b9074a3D4B662'
  );
  const [chainIdInput, setChainIdInput] = useState(activeNet.chainId);
  const [isLoading, setIsLoading] = useState(false);
  const [responsePayload, setResponsePayload] = useState(null);
  const [copiedPayload, setCopiedPayload] = useState(false);
  const [copiedCurl, setCopiedCurl] = useState(false);

  const handleNetworkChange = (netId) => {
    setSelectedNetworkId(netId);
    const net = getNetworkConfig(netId);
    setChainIdInput(net.chainId);
    const tokens = MULTICHAIN_TOKENS[netId] || [];
    if (tokens.length > 0) {
      setSelectedAddress(tokens[0].address);
    }
  };

  const curlCommand = `curl -X POST https://arbcheck.xyz/api/scan \\
  -H "Content-Type: application/json" \\
  -d '{
    "address": "${selectedAddress}",
    "chainId": ${chainIdInput}
  }'`;

  const handleTestApi = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setResponsePayload(null);

    try {
      const net = getNetworkConfig(chainIdInput);
      const report = await scanContract(selectedAddress, net.id);

      const apiResponse = {
        address: report.address,
        network: report.network.name,
        chainId: report.chainId,
        riskScore: report.riskScore,
        riskLevel: report.riskLevel,
        rating10: report.rating10,
        tokenInfo: report.tokenInfo,
        checks: Object.entries(report.checks).map(([key, val]) => ({
          name: key,
          status: val.status,
          label: val.label,
          value: val.status === 'RISK',
          detail: val.detail,
        })),
        breakdown: report.scoringBreakdown,
        scannedAt: report.scannedAt,
      };

      setResponsePayload(apiResponse);
    } catch (err) {
      setResponsePayload({
        error: true,
        message: err.message || 'API request error.',
        statusCode: 400,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(responsePayload, null, 2));
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2000);
  };

  const handleCopyCurl = () => {
    navigator.clipboard.writeText(curlCommand);
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 2000);
  };

  return (
    <div className="arb-api-view">
      <div className="api-hero">
        <div className="api-badge">
          <Server size={14} className="text-primary" />
          <span>Multi-Chain REST Endpoint</span>
          <span className="badge-dot" />
          <span>Arbitrum & Ethereum</span>
        </div>
        <h1 className="api-title">ARBCheck Multi-Chain API</h1>
        <p className="api-subtitle">
          Query contract risks and 1-10 security ratings across Arbitrum Sepolia, Arbitrum One,
          Ethereum Mainnet, and Ethereum Sepolia with a single unified payload.
        </p>
      </div>

      <div className="api-layout-grid">
        {/* Left Column: Request Builder */}
        <div className="api-request-column">
          <div className="endpoint-header-card">
            <span className="http-method-badge">POST</span>
            <span className="endpoint-path font-mono">/api/scan</span>
            <span className="network-tag font-mono">{activeNet.shortName} ({activeNet.chainId})</span>
          </div>

          <div className="request-card">
            <h3 className="card-section-title">
              <Code2 size={16} />
              <span>Interactive Request Builder</span>
            </h3>

            <form onSubmit={handleTestApi} className="api-form">
              <div className="api-field">
                <label className="api-label">Select Blockchain Network</label>
                <div className="quick-token-select">
                  {Object.values(SUPPORTED_NETWORKS).map((net) => (
                    <button
                      key={net.id}
                      type="button"
                      className={`token-quick-btn ${selectedNetworkId === net.id ? 'active' : ''}`}
                      onClick={() => handleNetworkChange(net.id)}
                    >
                      <Globe size={12} />
                      <span>{net.shortName}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="api-field">
                <label className="api-label">Quick Preloaded Contract</label>
                <div className="quick-token-select">
                  {networkTokens.map((tok) => (
                    <button
                      key={tok.id}
                      type="button"
                      className={`token-quick-btn ${selectedAddress === tok.address ? 'active' : ''}`}
                      onClick={() => setSelectedAddress(tok.address)}
                    >
                      <span>{tok.name}</span>
                      <span className="quick-sym font-mono">({tok.symbol})</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="api-field">
                <label className="api-label">Target Contract Address (0x...)</label>
                <input
                  type="text"
                  className="api-input font-mono"
                  value={selectedAddress}
                  onChange={(e) => setSelectedAddress(e.target.value)}
                  required
                />
              </div>

              <div className="api-field">
                <label className="api-label">Chain ID</label>
                <input
                  type="number"
                  className="api-input font-mono"
                  value={chainIdInput}
                  onChange={(e) => setChainIdInput(Number(e.target.value))}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn-send-request"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <RefreshCw size={15} className="icon-spin" />
                    <span>Executing Request on Chain {chainIdInput}...</span>
                  </>
                ) : (
                  <>
                    <Play size={15} />
                    <span>Send API Request</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* cURL Snippet Card */}
          <div className="curl-snippet-card">
            <div className="curl-header">
              <div className="curl-title">
                <Terminal size={14} />
                <span>cURL Request Example</span>
              </div>
              <button
                type="button"
                className="btn-copy-code"
                onClick={handleCopyCurl}
              >
                {copiedCurl ? <Check size={13} className="text-emerald" /> : <Copy size={13} />}
                <span>{copiedCurl ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <pre className="curl-pre font-mono">{curlCommand}</pre>
          </div>
        </div>

        {/* Right Column: Response Viewer */}
        <div className="api-response-column">
          <div className="response-card">
            <div className="response-header">
              <div className="response-title">
                <FileCode size={16} />
                <span>JSON Response Payload (with rating10 & network)</span>
                {responsePayload && (
                  <span
                    className={`status-code-pill font-mono ${
                      responsePayload.error ? 'status-err' : 'status-200'
                    }`}
                  >
                    {responsePayload.error ? '400 BAD REQUEST' : '200 OK'}
                  </span>
                )}
              </div>

              {responsePayload && (
                <button
                  type="button"
                  className="btn-copy-code"
                  onClick={handleCopyJson}
                >
                  {copiedPayload ? <Check size={13} className="text-emerald" /> : <Copy size={13} />}
                  <span>{copiedPayload ? 'Copied JSON' : 'Copy'}</span>
                </button>
              )}
            </div>

            <div className="response-body">
              {isLoading ? (
                <div className="response-loading-state">
                  <RefreshCw size={24} className="icon-spin text-primary" />
                  <span>Querying RPC provider on Chain {chainIdInput}...</span>
                </div>
              ) : responsePayload ? (
                <pre className="response-json font-mono">
                  {JSON.stringify(responsePayload, null, 2)}
                </pre>
              ) : (
                <div className="response-empty-state">
                  <Terminal size={28} className="text-muted" />
                  <p>Click &ldquo;Send API Request&rdquo; to test the endpoint live.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
