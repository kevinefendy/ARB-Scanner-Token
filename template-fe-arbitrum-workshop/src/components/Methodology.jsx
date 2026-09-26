import {
  BookOpen,
  AlertOctagon,
  Coins,
  Users,
  Percent,
  Lock,
  Unlock,
  Info,
  Scale,
  Shield,
  FileCode,
  Star,
  Globe,
} from 'lucide-react';
import { SUPPORTED_NETWORKS } from '../constants/arbitrum';

export default function Methodology() {
  const scoringFactors = [
    {
      factor: 'Mintable Supply',
      points: '+20 pts',
      rateImpact: '-2.0 pts from 10-scale',
      icon: <Coins size={18} />,
      riskLevel: 'HIGH',
      description:
        'The contract exposes a mint() function that allows an administrator to create new tokens at will. This poses severe dilution risks for secondary market holders.',
      solidityExample: 'function mint(address to, uint256 amount) external onlyOwner',
    },
    {
      factor: 'Active Owner / Admin',
      points: '+15 pts',
      rateImpact: '-1.5 pts from 10-scale',
      icon: <Users size={18} />,
      riskLevel: 'MEDIUM',
      description:
        'Ownership is not renounced (address != 0x0). The owner possesses elevated privileges, including potential parameter alteration, fee changes, or blacklist additions.',
      solidityExample: 'address public owner; modifier onlyOwner() { require(msg.sender == owner); _; }',
    },
    {
      factor: 'Blacklist Functionality',
      points: '+20 pts',
      rateImpact: '-2.0 pts from 10-scale',
      icon: <AlertOctagon size={18} />,
      riskLevel: 'HIGH',
      description:
        'Methods that prevent specific addresses from transferring tokens. Often used in honeypots or malicious tokens to prevent retail investors from selling.',
      solidityExample: 'mapping(address => bool) public isBlacklisted;',
    },
    {
      factor: 'High Sell Tax (>10%)',
      points: '+20 pts',
      rateImpact: '-2.0 pts from 10-scale',
      icon: <Percent size={18} />,
      riskLevel: 'HIGH',
      description:
        'Transfer fee on sell transactions exceeds 10%. High taxes severely penalize sellers and are commonly abused to extract liquidity from buyers.',
      solidityExample: 'uint256 fee = (amount * sellTax) / 100; super._transfer(sender, feeWallet, fee);',
    },
    {
      factor: 'Pausable Transfers',
      points: '+10 pts',
      rateImpact: '-1.0 pts from 10-scale',
      icon: <Lock size={18} />,
      riskLevel: 'MEDIUM',
      description:
        'Contract implements pause/unpause mechanisms. While often intended for emergency security, centralized pause controls can indefinitely freeze user funds.',
      solidityExample: 'function pause() external onlyOwner { _pause(); }',
    },
    {
      factor: 'High Holder Concentration',
      points: '+15 pts',
      rateImpact: '-1.5 pts from 10-scale',
      icon: <Users size={18} />,
      riskLevel: 'MEDIUM',
      description:
        'The top 10 non-contract wallets control more than 50% of the circulating token supply, creating severe price volatility and coordinated dump risks.',
      solidityExample: 'Top 10 Wallets > 50% Circulating Supply',
    },
    {
      factor: 'Liquidity Unlocked / Unverified',
      points: '+15 pts',
      rateImpact: '-1.5 pts from 10-scale',
      icon: <Unlock size={18} />,
      riskLevel: 'MEDIUM',
      description:
        'DEX liquidity pool tokens are not locked in an audited timelock contract or burn address. The deployer can remove backing liquidity at any moment.',
      solidityExample: 'Camelot / Uniswap V3 LP in deployer EOA wallet',
    },
  ];

  const ratingTiers = [
    { range: '9.0 – 10.0', grade: 'A+', tier: 'emerald', label: 'Exceptional Security', desc: 'No risk points detected. Fixed supply, renounced ownership, 0% tax, no blacklists.' },
    { range: '8.0 – 8.9', grade: 'A', tier: 'emerald', label: 'Strong Security', desc: 'Minor or negligible privileges, standard DeFi token architecture.' },
    { range: '7.0 – 7.9', grade: 'B+', tier: 'amber', label: 'Standard Safeguards', desc: 'Standard contract with mild centralized controls like timelocked admin.' },
    { range: '5.5 – 6.9', grade: 'B-', tier: 'amber', label: 'Moderate Caution', desc: 'Active owner key or mintable functions detected. Requires holder caution.' },
    { range: '4.0 – 5.4', grade: 'C', tier: 'amber', label: 'Elevated Risk', desc: 'High transfer taxes or unverified liquidity unlock detected.' },
    { range: '2.5 – 3.9', grade: 'D', tier: 'rose', label: 'High Hazard', desc: 'Multiple severe vectors: excessive taxes, pause mechanisms, extreme concentration.' },
    { range: '1.0 – 2.4', grade: 'F', tier: 'rose', label: 'Critical / Honeypot', desc: 'Active blacklist denial hooks, transfer locks, or predatory fee structures.' },
  ];

  return (
    <div className="arb-methodology-view">
      {/* Header */}
      <div className="methodology-hero">
        <div className="methodology-badge">
          <BookOpen size={14} className="text-primary" />
          <span>Security Framework & Conversion Math</span>
          <span className="badge-dot" />
          <span>Multi-Chain Specification</span>
        </div>
        <h1 className="methodology-title">Risk Scoring & 1-10 Rating Scale</h1>
        <p className="methodology-subtitle">
          Understand how ARBCheck converts on-chain bytecode findings and heuristic penalties into
          both a 0-100 Risk Metric and a standardized 1.0 - 10.0 Security Health Rating.
        </p>
      </div>

      {/* Multi-Chain Support Grid */}
      <div className="classification-card">
        <div className="section-header-row">
          <Globe size={18} className="text-primary" />
          <h2 className="section-title">Supported Blockchains & RPCs</h2>
        </div>
        <div className="chains-overview-grid">
          {Object.values(SUPPORTED_NETWORKS).map((net) => (
            <div key={net.id} className="chain-info-box">
              <div className="chain-top">
                <span className="chain-name-text">{net.name}</span>
                <span className={`chain-mode-badge ${net.isTestnet ? 'testnet' : 'mainnet'}`}>
                  {net.isTestnet ? 'Testnet' : 'Production'}
                </span>
              </div>
              <div className="chain-meta-row font-mono">
                <span>Chain ID: {net.chainId}</span>
                <span>Hex: {net.hexId}</span>
              </div>
              <span className="chain-rpc-url font-mono">{net.rpc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 1-10 Conversion Scale Card */}
      <div className="classification-card">
        <div className="section-header-row">
          <Star size={18} className="text-amber" />
          <h2 className="section-title">1.0 – 10.0 Security Rating Scale Breakdown</h2>
        </div>
        <p className="section-subtext">
          Calculated via the inverse formula: <code className="formula-code font-mono">Rating (1-10) = Max(1.0, (100 - Risk Score) / 10)</code>.
          Higher ratings represent safer, more decentralized tokens with fewer admin backdoors.
        </p>

        <div className="rating-tiers-table-wrap">
          <table className="rating-tiers-table">
            <thead>
              <tr>
                <th>Rating Range</th>
                <th>Letter Grade</th>
                <th>Classification</th>
                <th>Underlying Characteristics</th>
              </tr>
            </thead>
            <tbody>
              {ratingTiers.map((tier, idx) => (
                <tr key={idx} className={tier.tier}>
                  <td className="font-mono font-bold">{tier.range}</td>
                  <td>
                    <span className={`tier-badge ${tier.tier} font-mono`}>{tier.grade}</span>
                  </td>
                  <td className="font-semibold">{tier.label}</td>
                  <td className="text-secondary">{tier.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Core Principles */}
      <div className="principles-grid">
        <div className="principle-card">
          <div className="principle-icon-box">
            <Scale size={20} className="text-primary" />
          </div>
          <h3 className="principle-name">Additive Scoring</h3>
          <p className="principle-text">
            Points are accumulated linearly per risk finding. A contract starts at 0 points (10/10 rating)
            and deducts from the rating for every detected backdoor.
          </p>
        </div>

        <div className="principle-card">
          <div className="principle-icon-box">
            <Shield size={20} className="text-emerald" />
          </div>
          <h3 className="principle-name">Never Assume Safety</h3>
          <p className="principle-text">
            Unverified bytecode or unconfirmed data points are labeled as &ldquo;Unknown&rdquo;.
            Data that cannot be verified is never assumed to be secure.
          </p>
        </div>

        <div className="principle-card">
          <div className="principle-icon-box">
            <FileCode size={20} className="text-amber" />
          </div>
          <h3 className="principle-name">100% Read-Only</h3>
          <p className="principle-text">
            Analysis uses read-only RPC calls and bytecode disassembly. No gas fees, no approvals,
            and no custodial interaction required.
          </p>
        </div>
      </div>

      {/* Point Weight Table */}
      <div className="factors-table-card">
        <h2 className="section-title">Risk Factors & 1-10 Deduction Matrix</h2>
        <div className="factors-list">
          {scoringFactors.map((item, index) => (
            <div key={index} className="factor-item-card">
              <div className="factor-header-row">
                <div className="factor-identity">
                  <div className="factor-icon-wrap">{item.icon}</div>
                  <div>
                    <h3 className="factor-name">{item.factor}</h3>
                    <span className="factor-risk-tag">{item.riskLevel} PRIORITY</span>
                  </div>
                </div>

                <div className="factor-pts-group">
                  <span className="factor-pts-pill font-mono">{item.points}</span>
                  <span className="factor-rate-pill font-mono">{item.rateImpact}</span>
                </div>
              </div>

              <p className="factor-detail-text">{item.description}</p>

              <div className="factor-code-preview">
                <span className="code-label">Example Pattern:</span>
                <code className="code-snippet font-mono">{item.solidityExample}</code>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Disclaimer Notice */}
      <div className="methodology-disclaimer">
        <Info size={16} className="disclaimer-icon" />
        <div className="disclaimer-text">
          <strong>Product Disclaimer:</strong> ARBCheck produces a &ldquo;Risk Assessment & 1-10 Rating&rdquo; based on
          heuristic code examination. It does not provide a guarantee against market losses, price slippage, or off-chain developer rugpulls.
        </div>
      </div>
    </div>
  );
}
