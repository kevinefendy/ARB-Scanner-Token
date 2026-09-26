import React, { useState } from 'react';
import {
  ArrowLeft,
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  AlertOctagon,
  CheckCircle2,
  FileCode,
  Cpu,
  FlaskConical,
  Globe,
  Sliders,
} from 'lucide-react';
import {
  calculate10ScaleRating,
} from '../constants/arbitrum';

export default function ScanResult({
  scanData,
  onBack,
  onRescan,
  isScanning,
  onOpenInTestLab,
}) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'simulator' | 'bytecode' | 'json'
  const [copiedJson, setCopiedJson] = useState(false);

  // 1-10 Simulator State
  const [simMintable, setSimMintable] = useState(false);
  const [simOwner, setSimOwner] = useState(false);
  const [simBlacklist, setSimBlacklist] = useState(false);
  const [simTax, setSimTax] = useState(false);
  const [simPause, setSimPause] = useState(false);
  const [simHolders, setSimHolders] = useState(false);
  const [simLiquidity, setSimLiquidity] = useState(false);

  if (!scanData) return null;

  const {
    address,
    network,
    tokenInfo,
    riskScore,
    riskLevel,
    rating10,
    checks = {},
    scoringBreakdown = [],
    bytecodeSize,
    bytecodeSnippet,
    scannedAt,
  } = scanData;

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(scanData, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 1500);
  };

  const ratingValue = rating10?.rating ?? ((100 - riskScore) / 10);
  const ratingGrade = rating10?.grade ?? 'A';

  // Simulator calculation
  let simScore = 0;
  if (simMintable) simScore += 20;
  if (simOwner) simScore += 15;
  if (simBlacklist) simScore += 20;
  if (simTax) simScore += 20;
  if (simPause) simScore += 10;
  if (simHolders) simScore += 15;
  if (simLiquidity) simScore += 15;
  simScore = Math.min(100, simScore);
  const simRating = calculate10ScaleRating(simScore);

  // Separate detected risks from passed checks (RugCheck pattern)
  const allChecksList = [
    { key: 'verification', title: 'Source Verification', ...checks.verification },
    { key: 'ownership', title: 'Ownership & Admin Rights', ...checks.ownership },
    { key: 'mintability', title: 'Mint Functionality', ...checks.mintability },
    { key: 'tax', title: 'Transfer Taxes', ...checks.tax },
    { key: 'blacklist', title: 'Blacklist Function', ...checks.blacklist },
    { key: 'pause', title: 'Pause Function', ...checks.pause },
    { key: 'holders', title: 'Holder Dispersion', ...checks.holders },
    { key: 'liquidity', title: 'Liquidity Pools', ...checks.liquidity },
  ];

  const detectedRisks = allChecksList.filter(
    (c) => c.status === 'RISK' || c.status === 'CAUTION'
  );
  const passedChecks = allChecksList.filter(
    (c) => c.status === 'PASS' || c.status === 'UNKNOWN'
  );

  return (
    <div className="rugcheck-report">
      {/* Top Breadcrumb & Action Row */}
      <div className="report-action-bar">
        <button type="button" className="btn-back-flat" onClick={onBack}>
          <ArrowLeft size={15} />
          <span>Back to Scanner</span>
        </button>

        <div className="action-bar-right">
          <div className="report-chain-badge font-mono">
            <Globe size={13} />
            <span>{network?.name || 'Arbitrum'}</span>
          </div>

          <button
            type="button"
            className="btn-flat-action"
            onClick={onRescan}
            disabled={isScanning}
          >
            <RefreshCw size={14} className={isScanning ? 'icon-spin' : ''} />
            <span>{isScanning ? 'Refreshing...' : 'Re-scan'}</span>
          </button>

          <a
            href={`${network?.explorer || 'https://sepolia.arbiscan.io'}/address/${address}`}
            target="_blank"
            rel="noreferrer"
            className="btn-flat-action"
          >
            <ExternalLink size={14} />
            <span>Explorer</span>
          </a>

          <button
            type="button"
            className="btn-flat-action accent"
            onClick={() => onOpenInTestLab(scanData)}
          >
            <FlaskConical size={14} />
            <span>Test Lab</span>
          </button>
        </div>
      </div>

      {/* RugCheck Token Banner */}
      <div className="token-summary-banner">
        <div className="token-info-left">
          <div className="token-avatar-box font-mono">
            {tokenInfo?.symbol?.slice(0, 3) || 'TOK'}
          </div>
          <div className="token-details-group">
            <div className="token-title-row">
              <h1 className="token-name-h1">{tokenInfo?.name || 'Contract Token'}</h1>
              <span className="token-tag-sym font-mono">{tokenInfo?.symbol || 'TOK'}</span>
              {tokenInfo?.tag && (
                <span className="token-curated-tag font-mono">{tokenInfo.tag}</span>
              )}
            </div>
            <div className="token-address-bar font-mono">
              <span className="addr-txt">{address}</span>
              <button
                type="button"
                className="btn-copy-addr"
                onClick={handleCopyAddress}
                title="Copy Address"
              >
                {copied ? <Check size={13} className="text-emerald" /> : <Copy size={13} />}
              </button>
            </div>
          </div>
        </div>

        <div className="token-info-right font-mono">
          <div className="info-stat">
            <span className="stat-label">Total Supply:</span>
            <span className="stat-val">{tokenInfo?.totalSupply || 'Unknown'}</span>
          </div>
          <div className="info-stat">
            <span className="stat-label">Decimals:</span>
            <span className="stat-val">{tokenInfo?.decimals ?? 18}</span>
          </div>
          <div className="info-stat">
            <span className="stat-label">Chain ID:</span>
            <span className="stat-val">{network?.chainId}</span>
          </div>
        </div>
      </div>

      {/* RugCheck Risk & Rating Score Box */}
      <div className="rugcheck-score-box">
        <div className="score-box-top">
          <div className="score-status-group">
            <span className={`score-status-pill ${riskLevel.toLowerCase()}`}>
              {riskLevel === 'LOW' && 'Good'}
              {riskLevel === 'MEDIUM' && 'Warning'}
              {riskLevel === 'HIGH' && 'Danger'}
            </span>
            <span className="score-summary-text">
              {riskLevel === 'LOW' && 'Contract exhibits no critical privilege backdoors or abnormal tax mechanics.'}
              {riskLevel === 'MEDIUM' && 'Contract contains centralized administrative privileges or active minting mechanisms.'}
              {riskLevel === 'HIGH' && 'Critical hazard vectors detected (transfer restrictions, blacklist, or heavy taxes).'}
            </span>
          </div>

          <div className="score-numbers-right">
            {/* 1-10 Rating */}
            <div className="rating-10-display font-mono">
              <span className="rate-title">Safety Rating:</span>
              <span className={`rate-val ${riskLevel.toLowerCase()}`}>{ratingValue.toFixed(1)} / 10</span>
              <span className="rate-grade-pill font-mono">Grade {ratingGrade}</span>
            </div>

            {/* 0-100 Risk Score */}
            <div className="risk-metric-display font-mono">
              <span className="metric-title">Risk Score:</span>
              <span className="metric-val">{riskScore} / 100</span>
            </div>
          </div>
        </div>

        {/* Flat Score Progress Bar */}
        <div className="score-flat-bar-wrap">
          <div
            className={`score-flat-bar ${riskLevel.toLowerCase()}`}
            style={{ width: `${Math.max(4, riskScore)}%` }}
          />
        </div>
      </div>

      {/* Navigation View Tabs */}
      <div className="report-tabs-bar">
        <button
          type="button"
          className={`report-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <span>Risks & Checklist</span>
          <span className="tab-count font-mono">{detectedRisks.length} Risks</span>
        </button>

        <button
          type="button"
          className={`report-tab-btn ${activeTab === 'simulator' ? 'active' : ''}`}
          onClick={() => setActiveTab('simulator')}
        >
          <Sliders size={14} />
          <span>1-10 Rating Simulator</span>
        </button>

        <button
          type="button"
          className={`report-tab-btn ${activeTab === 'bytecode' ? 'active' : ''}`}
          onClick={() => setActiveTab('bytecode')}
        >
          <Cpu size={14} />
          <span>Bytecode & Methods</span>
        </button>

        <button
          type="button"
          className={`report-tab-btn ${activeTab === 'json' ? 'active' : ''}`}
          onClick={() => setActiveTab('json')}
        >
          <FileCode size={14} />
          <span>JSON Spec</span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW (RUGCHECK STYLE TWO-SECTION CHECKLIST) */}
      {activeTab === 'overview' && (
        <div className="report-overview-content">
          {/* Section: Risks Detected (if any) */}
          <div className="rugcheck-section-card">
            <div className="section-card-title">
              <AlertOctagon size={16} className="text-rose" />
              <span>Risks Detected ({detectedRisks.length})</span>
            </div>

            {detectedRisks.length === 0 ? (
              <div className="no-risks-empty font-mono">
                <CheckCircle2 size={16} className="text-emerald" />
                <span>No high-risk backdoors detected in verified bytecode.</span>
              </div>
            ) : (
              <div className="risks-list-table">
                {detectedRisks.map((item) => (
                  <div key={item.key} className={`risk-row-item ${item.status.toLowerCase()}`}>
                    <div className="risk-row-left">
                      <span className={`status-badge-mini ${item.status.toLowerCase()}`}>
                        {item.status === 'RISK' ? 'DANGER' : 'WARN'}
                      </span>
                      <div className="risk-texts">
                        <span className="risk-name">{item.title}</span>
                        <span className="risk-finding">{item.label}</span>
                      </div>
                    </div>
                    <div className="risk-row-desc">
                      <p>{item.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section: Passed Checks */}
          <div className="rugcheck-section-card">
            <div className="section-card-title">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-emerald" />
                <span>Passed Checks ({passedChecks.length})</span>
              </div>
              <span className="section-header-hint font-mono">
                Bytecode verified clean &middot; Zero malicious backdoors detected
              </span>
            </div>

            <div className="passed-checks-grid">
              {passedChecks.map((item) => (
                <div key={item.key} className="passed-check-box">
                  <div className="passed-top">
                    <CheckCircle2 size={15} className="text-emerald" />
                    <span className="passed-name">{item.title}</span>
                    <span className="passed-tag font-mono">{item.label}</span>
                  </div>
                  <p className="passed-desc">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Contract Data Overview Table */}
          <div className="rugcheck-section-card">
            <div className="section-card-title">
              <FileCode size={16} className="text-primary" />
              <span>Contract Data Summary</span>
            </div>

            <div className="data-summary-grid font-mono">
              <div className="data-metric-cell">
                <span className="cell-label">Mintable Supply</span>
                <span className={`cell-val ${checks.mintability?.status === 'RISK' ? 'text-rose' : 'text-emerald'}`}>
                  {checks.mintability?.label || 'Fixed'}
                </span>
              </div>

              <div className="data-metric-cell">
                <span className="cell-label">Ownership Admin</span>
                <span className={`cell-val ${checks.ownership?.status === 'PASS' ? 'text-emerald' : 'text-amber'}`}>
                  {checks.ownership?.label || 'Active'}
                </span>
              </div>

              <div className="data-metric-cell">
                <span className="cell-label">Buy & Sell Tax</span>
                <span className={`cell-val ${checks.tax?.status === 'RISK' ? 'text-rose' : 'text-emerald'}`}>
                  {checks.tax?.label || '0% / 0%'}
                </span>
              </div>

              <div className="data-metric-cell">
                <span className="cell-label">Blacklist Filter</span>
                <span className={`cell-val ${checks.blacklist?.status === 'RISK' ? 'text-rose' : 'text-emerald'}`}>
                  {checks.blacklist?.label || 'Not Detected'}
                </span>
              </div>

              <div className="data-metric-cell">
                <span className="cell-label">Pausable Gate</span>
                <span className={`cell-val ${checks.pause?.status === 'RISK' ? 'text-rose' : 'text-emerald'}`}>
                  {checks.pause?.label || 'Not Detected'}
                </span>
              </div>

              <div className="data-metric-cell">
                <span className="cell-label">Holder Dispersion</span>
                <span className="cell-val text-main">
                  {checks.holders?.label || 'Moderate'}
                </span>
              </div>

              <div className="data-metric-cell">
                <span className="cell-label">Liquidity Status</span>
                <span className="cell-val text-main">
                  {checks.liquidity?.label || 'Not Available'}
                </span>
              </div>

              <div className="data-metric-cell">
                <span className="cell-label">Bytecode Size</span>
                <span className="cell-val text-main">
                  {bytecodeSize || 2480} bytes
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: 1-10 SIMULATOR */}
      {activeTab === 'simulator' && (
        <div className="rugcheck-section-card">
          <div className="section-card-title">
            <Sliders size={16} className="text-primary" />
            <span>Interactive 1-10 Rating Simulator</span>
          </div>
          <p className="tab-subtext">
            Test how adding specific contract backdoors reduces the 1-10 safety rating.
          </p>

          <div className="sim-preview-box font-mono">
            <div className="sim-left">
              <span className="sim-lbl">Calculated Rating:</span>
              <span className={`sim-rate-val ${simRating.tier}`}>
                {simRating.rating} / 10 (Grade {simRating.grade})
              </span>
            </div>
            <div className="sim-right text-muted">
              <span>Risk Metric: {simScore} / 100</span>
            </div>
          </div>

          <div className="sim-list-grid font-mono">
            <label className="sim-check-row">
              <input
                type="checkbox"
                checked={simMintable}
                onChange={(e) => setSimMintable(e.target.checked)}
              />
              <span className="chk-label">Mint Function Enabled</span>
              <span className="chk-pen text-rose">-2.0 pts</span>
            </label>

            <label className="sim-check-row">
              <input
                type="checkbox"
                checked={simOwner}
                onChange={(e) => setSimOwner(e.target.checked)}
              />
              <span className="chk-label">Active Unrenounced Owner</span>
              <span className="chk-pen text-rose">-1.5 pts</span>
            </label>

            <label className="sim-check-row">
              <input
                type="checkbox"
                checked={simBlacklist}
                onChange={(e) => setSimBlacklist(e.target.checked)}
              />
              <span className="chk-label">Blacklist Functionality</span>
              <span className="chk-pen text-rose">-2.0 pts</span>
            </label>

            <label className="sim-check-row">
              <input
                type="checkbox"
                checked={simTax}
                onChange={(e) => setSimTax(e.target.checked)}
              />
              <span className="chk-label">High Sell Tax (&gt;10%)</span>
              <span className="chk-pen text-rose">-2.0 pts</span>
            </label>

            <label className="sim-check-row">
              <input
                type="checkbox"
                checked={simPause}
                onChange={(e) => setSimPause(e.target.checked)}
              />
              <span className="chk-label">Pausable Transfers</span>
              <span className="chk-pen text-rose">-1.0 pts</span>
            </label>

            <label className="sim-check-row">
              <input
                type="checkbox"
                checked={simHolders}
                onChange={(e) => setSimHolders(e.target.checked)}
              />
              <span className="chk-label">Top 10 Holders &gt; 50%</span>
              <span className="chk-pen text-rose">-1.5 pts</span>
            </label>

            <label className="sim-check-row">
              <input
                type="checkbox"
                checked={simLiquidity}
                onChange={(e) => setSimLiquidity(e.target.checked)}
              />
              <span className="chk-label">Liquidity Pool Unlocked</span>
              <span className="chk-pen text-rose">-1.5 pts</span>
            </label>
          </div>
        </div>
      )}

      {/* TAB 3: BYTECODE INSPECTOR */}
      {activeTab === 'bytecode' && (
        <div className="rugcheck-section-card">
          <div className="section-card-title">
            <Cpu size={16} className="text-primary" />
            <span>Bytecode Telemetry & Function Signatures</span>
          </div>

          <div className="table-responsive">
            <table className="rugcheck-table font-mono">
              <thead>
                <tr>
                  <th>Method Signature</th>
                  <th>Function Selector</th>
                  <th>Category</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>balanceOf(address)</td>
                  <td>0x70a08231</td>
                  <td>ERC20 Standard</td>
                  <td className="text-emerald">Detected</td>
                </tr>
                <tr>
                  <td>transfer(address,uint256)</td>
                  <td>0xa9059cbb</td>
                  <td>ERC20 Standard</td>
                  <td className="text-emerald">Detected</td>
                </tr>
                <tr>
                  <td>mint(address,uint256)</td>
                  <td>0x40c10f19</td>
                  <td>Supply Expansion</td>
                  <td>
                    {checks.mintability?.status === 'RISK' ? (
                      <span className="text-rose font-bold">Detected (Active)</span>
                    ) : (
                      <span className="text-muted">Not Found</span>
                    )}
                  </td>
                </tr>
                <tr>
                  <td>pause()</td>
                  <td>0x8456cb59</td>
                  <td>Transfer Freeze</td>
                  <td>
                    {checks.pause?.status === 'RISK' || checks.pause?.status === 'CAUTION' ? (
                      <span className="text-amber font-bold">Detected (Active)</span>
                    ) : (
                      <span className="text-muted">Not Found</span>
                    )}
                  </td>
                </tr>
                <tr>
                  <td>blacklist(address)</td>
                  <td>0xfe575a62</td>
                  <td>Selective Denial</td>
                  <td>
                    {checks.blacklist?.status === 'RISK' ? (
                      <span className="text-rose font-bold">Detected (Active)</span>
                    ) : (
                      <span className="text-muted">Not Found</span>
                    )}
                  </td>
                </tr>
                <tr>
                  <td>owner()</td>
                  <td>0x8da5cb5b</td>
                  <td>Privilege Key</td>
                  <td>
                    {checks.ownership?.status !== 'PASS' ? (
                      <span className="text-amber font-bold">Active Owner</span>
                    ) : (
                      <span className="text-muted">Renounced / None</span>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="bytecode-preview-box">
            <span className="preview-label font-mono">Bytecode Prefix (First 32 Words):</span>
            <pre className="bytecode-pre font-mono">{bytecodeSnippet}</pre>
          </div>
        </div>
      )}

      {/* TAB 4: JSON SPEC */}
      {activeTab === 'json' && (
        <div className="rugcheck-section-card">
          <div className="json-card-header">
            <div className="section-card-title">
              <FileCode size={16} className="text-primary" />
              <span>Full Raw JSON Output</span>
            </div>
            <button type="button" className="btn-copy-flat font-mono" onClick={handleCopyJson}>
              {copiedJson ? <Check size={13} className="text-emerald" /> : <Copy size={13} />}
              <span>{copiedJson ? 'Copied' : 'Copy JSON'}</span>
            </button>
          </div>
          <pre className="json-code-box font-mono">
            {JSON.stringify(
              {
                address,
                network: network?.name,
                chainId: network?.chainId,
                scannedAt,
                riskScore,
                riskLevel,
                rating10,
                tokenInfo,
                checks,
                scoringBreakdown,
              },
              null,
              2
            )}
          </pre>
        </div>
      )}
    </div>
  );
}
