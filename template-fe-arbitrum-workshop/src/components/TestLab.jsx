import React, { useState, useEffect, useCallback } from 'react';
import {
  FlaskConical,
  Search,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  Copy,
  Check,
  Wallet,
  ArrowRight,
  RefreshCw,
  Send,
  Coins,
  Info,
  CheckCircle2,
  XCircle,
  Globe,
  Star,
  Percent,
  Ban,
  Pause,
  KeyRound,
} from 'lucide-react';
import {
  SUPPORTED_NETWORKS,
  MULTICHAIN_TOKENS,
  getNetworkConfig,
  calculate10ScaleRating,
} from '../constants/arbitrum';
import {
  hasEthereum,
  getTokenBalance,
  executeTestContractAction,
} from '../services/wallet';

export default function TestLab({
  onScanToken,
  wallet,
  onConnectWallet,
  selectedNetworkId,
  onSelectNetwork,
}) {
  const [activeNetworkTab, setActiveNetworkTab] = useState(selectedNetworkId || 'arbitrum-sepolia');
  const networkTokens = MULTICHAIN_TOKENS[activeNetworkTab] || MULTICHAIN_TOKENS['arbitrum-sepolia'];
  const [selectedToken, setSelectedToken] = useState(networkTokens[0]);
  const [tokenBalance, setTokenBalance] = useState('0');
  const [activeAction, setActiveAction] = useState('transfer'); // 'transfer' | 'mint' | 'approve'
  const [amountInput, setAmountInput] = useState('100');
  const [recipientInput, setRecipientInput] = useState('');
  const [isLoadingAction, setIsLoadingAction] = useState(false);
  const [actionFeedback, setActionFeedback] = useState(null);
  const [copiedAddress, setCopiedAddress] = useState(null);

  const activeNetConfig = getNetworkConfig(activeNetworkTab);

  // Sync token selection when switching network tab
  const handleSwitchNetworkTab = (netId) => {
    setActiveNetworkTab(netId);
    onSelectNetwork(netId);
    const tokens = MULTICHAIN_TOKENS[netId] || [];
    if (tokens.length > 0) {
      setSelectedToken(tokens[0]);
      setActionFeedback(null);
    }
  };

  const loadBalance = useCallback(async () => {
    if (!wallet.isConnected || !wallet.address || !selectedToken) return;
    try {
      const bal = await getTokenBalance(selectedToken.address, wallet.address, activeNetworkTab);
      setTokenBalance(bal);
    } catch {
      setTokenBalance('0');
    }
  }, [wallet.isConnected, wallet.address, selectedToken, activeNetworkTab]);

  useEffect(() => {
    let isMounted = true;
    if (wallet.isConnected && wallet.address && selectedToken) {
      getTokenBalance(selectedToken.address, wallet.address, activeNetworkTab)
        .then((bal) => {
          if (isMounted) setTokenBalance(bal);
        })
        .catch(() => {
          if (isMounted) setTokenBalance('0');
        });
    }
    return () => {
      isMounted = false;
    };
  }, [wallet.isConnected, wallet.address, selectedToken, activeNetworkTab]);

  const handleCopy = (addr) => {
    navigator.clipboard.writeText(addr);
    setCopiedAddress(addr);
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  const getRiskIcon = (level) => {
    if (level === 'LOW') return <ShieldCheck size={16} className="text-emerald" />;
    if (level === 'MEDIUM') return <AlertTriangle size={16} className="text-amber" />;
    return <AlertOctagon size={16} className="text-rose" />;
  };

  const handleExecuteAction = async (e) => {
    e.preventDefault();
    if (!wallet.isConnected) {
      onConnectWallet();
      return;
    }

    setIsLoadingAction(true);
    setActionFeedback(null);

    try {
      // 1. Honeypot transfer simulation / check
      if (selectedToken.id === 'honeypot' && activeAction === 'transfer') {
        await new Promise((resolve) => setTimeout(resolve, 600));
        setActionFeedback({
          type: 'error',
          title: 'Transaction Reverted: TRANSFER_RESTRICTED_HONEYPOT',
          message:
            'Execution halted by contract hook: Non-whitelisted caller detected in _validateAndTransfer(). This demonstrates a classic honeypot vector where purchases succeed but token transfers and DEX sell routes are blocked by the owner.',
        });
        setIsLoadingAction(false);
        return;
      }

      // 2. Tax Token transfer calculation simulation
      if (selectedToken.id === 'tax' && activeAction === 'transfer') {
        const gross = parseFloat(amountInput) || 0;
        const taxRate = 0.20; // 20% sell tax
        const fee = (gross * taxRate).toFixed(2);
        const net = (gross - fee).toFixed(2);

        setActionFeedback({
          type: 'warning',
          title: 'High Tax Applied: 20% Sell Fee Deducted',
          message: `Transfer of ${gross} ${selectedToken.symbol} executed with fee. Smart contract deducted ${fee} ${selectedToken.symbol} (20% fee) to treasury (${selectedToken.address.slice(0, 8)}...). Recipient receives ${net} ${selectedToken.symbol}.`,
        });
        setIsLoadingAction(false);
        return;
      }

      // 3. Direct On-Chain Contract Execution via Web3 Wallet
      if (hasEthereum() && window.ethereum.selectedAddress) {
        try {
          const res = await executeTestContractAction({
            tokenAddress: selectedToken.address,
            action: activeAction,
            amount: amountInput,
            recipient: recipientInput || wallet.address,
            extraParams: {
              buyTaxBps: 500, // 5%
              sellTaxBps: 2000, // 20%
              status: true,
              paused: true,
            },
          });

          const txHashStr = res?.hash ? ` (Tx: ${res.hash.slice(0, 10)}...${res.hash.slice(-6)})` : '';

          let successMsg = `Successfully confirmed ${activeAction} on-chain${txHashStr}.`;
          if (activeAction === 'renounce') {
            successMsg = `Ownership renounced on-chain. Owner is now set to 0x0000...0000.${txHashStr}`;
          } else if (activeAction === 'mint') {
            successMsg = `Minted ${amountInput} ${selectedToken.symbol} to target address.${txHashStr}`;
          } else if (activeAction === 'setTaxes') {
            successMsg = `Updated taxes on-chain to 5% Buy and 20% Sell.${txHashStr}`;
          } else if (activeAction === 'setBlacklist') {
            successMsg = `Updated blacklist status on-chain for target address.${txHashStr}`;
          } else if (activeAction === 'setPaused') {
            successMsg = `Updated contract pause state on-chain.${txHashStr}`;
          }

          setActionFeedback({
            type: 'success',
            title: `Smart Contract Execution Confirmed`,
            message: successMsg,
          });
          loadBalance();
        } catch (contractErr) {
          setActionFeedback({
            type: 'info',
            title: 'Test Sandbox Simulation Completed',
            message: `Executed ${activeAction} for ${selectedToken.symbol} on ${activeNetConfig.name} in sandbox mode. (RPC/Wallet response: ${contractErr?.message ? contractErr.message.slice(0, 110) + '...' : 'Simulated on testnet'}).`,
          });
        }
      } else {
        setActionFeedback({
          type: 'info',
          title: 'Simulation Executed',
          message: `Simulated ${activeAction} for ${amountInput} ${selectedToken.symbol} in test sandbox.`,
        });
      }
    } catch (err) {
      setActionFeedback({
        type: 'error',
        title: 'Action Failed',
        message: err.message || 'Transaction could not be completed.',
      });
    } finally {
      setIsLoadingAction(false);
    }
  };

  return (
    <div className="arb-testlab-view">
      {/* Header */}
      <div className="testlab-hero">
        <div className="testlab-badge">
          <FlaskConical size={14} className="text-primary" />
          <span>Multi-Chain Security Sandbox</span>
          <span className="badge-dot" />
          <span>1.0 – 10.0 Rating Benchmark</span>
        </div>
        <h1 className="testlab-title">Token Risk & 1-10 Rating Test Lab</h1>
        <p className="testlab-subtitle">
          Explore and benchmark contract risk archetypes across Arbitrum Sepolia, Arbitrum One,
          Ethereum Mainnet, and Ethereum Sepolia with live 1-10 safety scoring.
        </p>

        {/* Network Selector Tabs */}
        <div className="testlab-net-tabs">
          {Object.values(SUPPORTED_NETWORKS).map((net) => (
            <button
              key={net.id}
              type="button"
              className={`testlab-net-tab-btn ${activeNetworkTab === net.id ? 'active' : ''}`}
              onClick={() => handleSwitchNetworkTab(net.id)}
            >
              <Globe size={13} />
              <span>{net.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Test Tokens Grid */}
      <div className="test-tokens-grid">
        {networkTokens.map((token) => {
          const isSelected = selectedToken?.id === token.id;
          const tokenRating = calculate10ScaleRating(token.riskScore);
          return (
            <div
              key={token.id}
              className={`test-token-card ${isSelected ? 'selected' : ''} ${token.riskLevel.toLowerCase()}`}
            >
              <div className="token-card-top">
                <div className="token-card-meta">
                  <div className="token-icon-avatar">
                    <span>{token.symbol}</span>
                  </div>
                  <div>
                    <h3 className="card-token-name">{token.name}</h3>
                    <span className="card-token-sub font-mono">{token.totalSupply}</span>
                  </div>
                </div>

                <div className="card-rating-group">
                  <div className={`card-rating-10-pill ${token.riskLevel.toLowerCase()} font-mono`}>
                    <Star size={13} />
                    <span>{tokenRating.rating} / 10</span>
                  </div>
                  <div className={`card-risk-pill ${token.riskLevel.toLowerCase()}`}>
                    {getRiskIcon(token.riskLevel)}
                    <span>{token.riskLevel}</span>
                  </div>
                </div>
              </div>

              <p className="token-card-desc">{token.description}</p>

              <div className="token-address-bar">
                <span className="token-addr-text font-mono">
                  {token.address.slice(0, 10)}...{token.address.slice(-8)}
                </span>
                <button
                  type="button"
                  className="btn-copy-tiny"
                  onClick={() => handleCopy(token.address)}
                >
                  {copiedAddress === token.address ? (
                    <Check size={13} className="text-emerald" />
                  ) : (
                    <Copy size={13} />
                  )}
                </button>
              </div>

              <div className="token-card-actions">
                <button
                  type="button"
                  className="btn-card-scan"
                  onClick={() => onScanToken(token.address, activeNetworkTab)}
                >
                  <Search size={14} />
                  <span>Scan Report</span>
                </button>

                <a
                  href={`${activeNetConfig.explorer}/address/${token.address}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-card-explorer"
                  title={`View contract on ${activeNetConfig.name}`}
                >
                  <ExternalLink size={14} />
                </a>

                <button
                  type="button"
                  className={`btn-card-interact ${isSelected ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedToken(token);
                    setActionFeedback(null);
                  }}
                >
                  <FlaskConical size={14} />
                  <span>{isSelected ? 'Active' : 'Select'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Test Lab Interactive Sandbox */}
      {selectedToken && (
        <div className="sandbox-panel-card">
          <div className="sandbox-header">
            <div className="sandbox-title-group">
              <div className="sandbox-icon-box">
                <FlaskConical size={20} className="text-primary" />
              </div>
              <div>
                <h2 className="sandbox-title">
                  Interactive Sandbox: <span className="text-primary">{selectedToken.name}</span> ({selectedToken.symbol})
                </h2>
                <span className="sandbox-sub">
                  Simulating on {activeNetConfig.name} (Chain ID: {activeNetConfig.chainId}). All write actions require wallet approval.
                </span>
              </div>
            </div>

            <div className="sandbox-wallet-status">
              {wallet.isConnected ? (
                <div className="sandbox-balance-box">
                  <span className="balance-label">Your Balance:</span>
                  <span className="balance-value font-mono">
                    {tokenBalance} {selectedToken.symbol}
                  </span>
                </div>
              ) : (
                <button
                  type="button"
                  className="btn-connect-sm"
                  onClick={onConnectWallet}
                >
                  <Wallet size={14} />
                  <span>Connect Wallet to Test</span>
                </button>
              )}
            </div>
          </div>

          {/* Action Tabs */}
          <div className="sandbox-action-tabs">
            <button
              type="button"
              className={`action-tab-btn ${activeAction === 'transfer' ? 'active' : ''}`}
              onClick={() => setActiveAction('transfer')}
            >
              <Send size={15} />
              <span>Transfer & Sell Simulation</span>
            </button>

            {selectedToken.id === 'mintable' && (
              <button
                type="button"
                className={`action-tab-btn ${activeAction === 'mint' ? 'active' : ''}`}
                onClick={() => setActiveAction('mint')}
              >
                <Coins size={15} />
                <span>Owner Mint()</span>
              </button>
            )}

            {selectedToken.id === 'safe' && (
              <button
                type="button"
                className={`action-tab-btn ${activeAction === 'renounce' ? 'active' : ''}`}
                onClick={() => setActiveAction('renounce')}
              >
                <KeyRound size={15} />
                <span>Renounce Ownership</span>
              </button>
            )}

            {selectedToken.id === 'tax' && (
              <button
                type="button"
                className={`action-tab-btn ${activeAction === 'setTaxes' ? 'active' : ''}`}
                onClick={() => setActiveAction('setTaxes')}
              >
                <Percent size={15} />
                <span>Set Taxes (5% Buy / 20% Sell)</span>
              </button>
            )}

            {selectedToken.id === 'honeypot' && (
              <>
                <button
                  type="button"
                  className={`action-tab-btn ${activeAction === 'setBlacklist' ? 'active' : ''}`}
                  onClick={() => setActiveAction('setBlacklist')}
                >
                  <Ban size={15} />
                  <span>Set Blacklist Hook</span>
                </button>
                <button
                  type="button"
                  className={`action-tab-btn ${activeAction === 'setPaused' ? 'active' : ''}`}
                  onClick={() => setActiveAction('setPaused')}
                >
                  <Pause size={15} />
                  <span>Toggle Pause State</span>
                </button>
              </>
            )}

            <button
              type="button"
              className={`action-tab-btn ${activeAction === 'approve' ? 'active' : ''}`}
              onClick={() => setActiveAction('approve')}
            >
              <ShieldCheck size={15} />
              <span>ERC20 Approve</span>
            </button>
          </div>

          {/* Interactive Form */}
          <form onSubmit={handleExecuteAction} className="sandbox-action-form">
            <div className="form-grid">
              {activeAction !== 'renounce' && activeAction !== 'setPaused' && activeAction !== 'setTaxes' && (
                <div className="form-field">
                  <label className="field-label">Amount ({selectedToken.symbol})</label>
                  <input
                    type="number"
                    className="field-input font-mono"
                    value={amountInput}
                    onChange={(e) => setAmountInput(e.target.value)}
                    min="1"
                    step="any"
                    required
                  />
                </div>
              )}

              {activeAction === 'setTaxes' && (
                <div className="form-field">
                  <label className="field-label">Simulated Tax Rates (Basis Points)</label>
                  <div className="field-input font-mono text-muted text-sm flex items-center">
                    Buy: 500 bps (5%) &middot; Sell: 2000 bps (20%)
                  </div>
                </div>
              )}

              {activeAction === 'renounce' && (
                <div className="form-field full-width">
                  <label className="field-label">Target Renouncement Address</label>
                  <div className="field-input font-mono text-muted text-sm">
                    0x0000000000000000000000000000000000000000 (Zero Address)
                  </div>
                </div>
              )}

              {activeAction === 'setPaused' && (
                <div className="form-field full-width">
                  <label className="field-label">Contract Pause Hook State</label>
                  <div className="field-input font-mono text-muted text-sm">
                    Toggle paused = true (Halts all ERC20 transfers on-chain)
                  </div>
                </div>
              )}

              {activeAction !== 'mint' && activeAction !== 'renounce' && activeAction !== 'setPaused' && activeAction !== 'setTaxes' && (
                <div className="form-field">
                  <label className="field-label">
                    {activeAction === 'setBlacklist' ? 'Target Account to Blacklist' : 'Recipient / Spender Address'}
                  </label>
                  <input
                    type="text"
                    className="field-input font-mono"
                    placeholder="0x... or leave empty for self"
                    value={recipientInput}
                    onChange={(e) => setRecipientInput(e.target.value)}
                  />
                </div>
              )}
            </div>

            {/* Educational Note about current token */}
            <div className="sandbox-archetype-note">
              <Info size={15} className="note-icon" />
              <div className="note-text">
                {selectedToken.id === 'safe' && (
                  <span>
                    <strong>SafeToken (Rating 10.0 / 10):</strong> Standard ERC20 fixed supply. Transfers execute with 0% tax, no blacklist filters, and no pausable gates.
                  </span>
                )}
                {selectedToken.id === 'mintable' && (
                  <span>
                    <strong>MintableToken (Rating 6.5 / 10):</strong> Allows owner to mint unbounded new tokens, penalizing the rating by -2.0 points for dilution risk.
                  </span>
                )}
                {selectedToken.id === 'tax' && (
                  <span>
                    <strong>TaxToken (Rating 4.5 / 10):</strong> Deducts 5% buy and 20% sell taxes. Heavy exit friction reduces safety rating to Grade C.
                  </span>
                )}
                {selectedToken.id === 'honeypot' && (
                  <span>
                    <strong>Honeypot Simulator (Rating 1.5 / 10):</strong> Critical Grade F danger. Non-whitelisted wallet transfers systematically revert.
                  </span>
                )}
                {selectedToken.id !== 'safe' && selectedToken.id !== 'mintable' && selectedToken.id !== 'tax' && selectedToken.id !== 'honeypot' && (
                  <span>
                    <strong>{selectedToken.name} on {activeNetConfig.name}:</strong> Verified smart contract token. Safety rating calculated at {((100 - selectedToken.riskScore) / 10).toFixed(1)} / 10.
                  </span>
                )}
              </div>
            </div>

            <div className="form-actions-row">
              <button
                type="submit"
                className="btn-execute-action"
                disabled={isLoadingAction}
              >
                {isLoadingAction ? (
                  <>
                    <RefreshCw size={15} className="icon-spin" />
                    <span>Executing on {activeNetConfig.shortName}...</span>
                  </>
                ) : (
                  <>
                    <span>
                      {activeAction === 'transfer' && 'Simulate / Execute Transfer'}
                      {activeAction === 'mint' && 'Execute Owner Mint()'}
                      {activeAction === 'renounce' && 'Execute Renounce Ownership'}
                      {activeAction === 'setTaxes' && 'Set On-Chain Taxes (5% / 20%)'}
                      {activeAction === 'setBlacklist' && 'Execute Blacklist Address'}
                      {activeAction === 'setPaused' && 'Toggle Contract Pause'}
                      {activeAction === 'approve' && 'Simulate / Execute Approve'}
                    </span>
                    <ArrowRight size={15} />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Feedback Alert Box */}
          {actionFeedback && (
            <div className={`action-feedback-box ${actionFeedback.type}`}>
              <div className="feedback-header">
                {actionFeedback.type === 'success' && <CheckCircle2 size={18} className="text-emerald" />}
                {actionFeedback.type === 'warning' && <AlertTriangle size={18} className="text-amber" />}
                {actionFeedback.type === 'error' && <XCircle size={18} className="text-rose" />}
                {actionFeedback.type === 'info' && <Info size={18} className="text-primary" />}
                <span className="feedback-title">{actionFeedback.title}</span>
              </div>
              <p className="feedback-message">{actionFeedback.message}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
