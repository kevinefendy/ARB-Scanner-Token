import React, { useState } from 'react';
import {
  ShieldCheck,
  Wallet,
  ChevronDown,
  ExternalLink,
  LogOut,
  AlertTriangle,
  FileCode,
  FlaskConical,
  BookOpen,
  Search,
  Network,
  Check,
  Globe,
} from 'lucide-react';
import {
  SUPPORTED_NETWORKS,
  getNetworkConfig,
} from '../constants/arbitrum';

export default function Navbar({
  activeTab,
  setActiveTab,
  wallet,
  isConnecting,
  onConnectWallet,
  onDisconnectWallet,
  selectedNetworkId,
  onSelectNetwork,
}) {
  const [walletDropdownOpen, setWalletDropdownOpen] = useState(false);
  const [networkDropdownOpen, setNetworkDropdownOpen] = useState(false);

  const activeNetwork = getNetworkConfig(selectedNetworkId);

  const formatAddress = (addr) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const isChainMatched = wallet.isConnected && wallet.chainId === activeNetwork.chainId;

  return (
    <nav className="arb-navbar">
      <div className="arb-nav-container">
        {/* Brand Logo */}
        <div className="arb-brand" onClick={() => setActiveTab('scanner')}>
          <div className="arb-logo-icon">
            <ShieldCheck className="icon-shield" size={22} />
          </div>
          <div className="arb-brand-text">
            <div className="arb-brand-title">
              ARB<span className="brand-highlight">Check</span>
            </div>
            <span className="arb-badge-network">Multi-Chain Security</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="arb-nav-links">
          <button
            type="button"
            className={`arb-nav-link ${activeTab === 'scanner' ? 'active' : ''}`}
            onClick={() => setActiveTab('scanner')}
          >
            <Search size={16} />
            <span>Scanner</span>
          </button>

          <button
            type="button"
            className={`arb-nav-link ${activeTab === 'testnet' ? 'active' : ''}`}
            onClick={() => setActiveTab('testnet')}
          >
            <FlaskConical size={16} />
            <span>Test Lab</span>
          </button>

          <button
            type="button"
            className={`arb-nav-link ${activeTab === 'methodology' ? 'active' : ''}`}
            onClick={() => setActiveTab('methodology')}
          >
            <BookOpen size={16} />
            <span>Methodology & 1-10 Scale</span>
          </button>

          <button
            type="button"
            className={`arb-nav-link ${activeTab === 'api' ? 'active' : ''}`}
            onClick={() => setActiveTab('api')}
          >
            <FileCode size={16} />
            <span>API</span>
          </button>
        </div>

        {/* Network & Wallet Section */}
        <div className="arb-nav-actions">
          {/* Network Selector Dropdown (4 Networks) */}
          <div className="network-dropdown-wrapper">
            <button
              type="button"
              className="arb-network-btn"
              onClick={() => setNetworkDropdownOpen(!networkDropdownOpen)}
            >
              <span className="arb-pulse-dot" />
              <span className="network-name-text">{activeNetwork.shortName}</span>
              <span className="network-chain-badge font-mono">{activeNetwork.chainId}</span>
              <ChevronDown size={13} className="caret-icon" />
            </button>

            {networkDropdownOpen && (
              <div className="network-select-menu">
                <div className="menu-header">
                  <Network size={13} className="text-primary" />
                  <span>Select Blockchain Network</span>
                </div>
                <div className="menu-options-list">
                  {Object.values(SUPPORTED_NETWORKS).map((net) => {
                    const isSelected = net.id === activeNetwork.id;
                    return (
                      <button
                        key={net.id}
                        type="button"
                        className={`network-menu-item ${isSelected ? 'active' : ''}`}
                        onClick={() => {
                          onSelectNetwork(net.id);
                          setNetworkDropdownOpen(false);
                        }}
                      >
                        <div className="net-item-left">
                          <Globe size={14} className={isSelected ? 'text-primary' : 'text-muted'} />
                          <div className="net-item-info">
                            <span className="net-title">{net.name}</span>
                            <span className="net-sub font-mono">
                              Chain ID: {net.chainId} {net.isTestnet ? '(Testnet)' : '(Mainnet)'}
                            </span>
                          </div>
                        </div>
                        {isSelected && <Check size={14} className="text-primary" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Wallet Button */}
          {wallet.isConnected ? (
            <div className="arb-wallet-wrapper">
              {!isChainMatched ? (
                <button
                  type="button"
                  className="arb-btn-warn"
                  onClick={() => onSelectNetwork(activeNetwork.id)}
                  title={`Switch wallet to ${activeNetwork.name}`}
                >
                  <AlertTriangle size={15} />
                  <span>Switch Chain</span>
                </button>
              ) : (
                <div className="wallet-connected-group">
                  <div
                    className="arb-wallet-btn"
                    onClick={() => setWalletDropdownOpen(!walletDropdownOpen)}
                  >
                    <div className="wallet-eth-pill">
                      <span className="wallet-balance">{wallet.balance} ETH</span>
                    </div>
                    <span className="wallet-address font-mono">
                      {formatAddress(wallet.address)}
                    </span>
                    <ChevronDown size={14} className="dropdown-caret" />
                  </div>

                  {walletDropdownOpen && (
                    <div className="wallet-dropdown-menu">
                      <div className="dropdown-header">
                        <span className="dropdown-subtext">Connected Account</span>
                        <span className="dropdown-addr font-mono">{wallet.address}</span>
                      </div>
                      <div className="dropdown-divider" />
                      <a
                        href={`${activeNetwork.explorer}/address/${wallet.address}`}
                        target="_blank"
                        rel="noreferrer"
                        className="dropdown-item"
                        onClick={() => setWalletDropdownOpen(false)}
                      >
                        <ExternalLink size={14} />
                        <span>View on {activeNetwork.name.includes('Ethereum') ? 'Etherscan' : 'Arbiscan'}</span>
                      </a>
                      <button
                        type="button"
                        className="dropdown-item dropdown-item-danger"
                        onClick={() => {
                          setWalletDropdownOpen(false);
                          onDisconnectWallet();
                        }}
                      >
                        <LogOut size={14} />
                        <span>Disconnect</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              className="arb-btn-primary"
              onClick={onConnectWallet}
              disabled={isConnecting}
            >
              <Wallet size={16} />
              <span>{isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
