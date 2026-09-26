import {
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';
import {
  ARBITRUM_SEPOLIA_EXPLORER,
  ARBITRUM_SEPOLIA_CHAIN_ID,
} from '../constants/arbitrum';

export default function Footer({ onNavigate }) {
  return (
    <footer className="arb-footer">
      <div className="arb-footer-container">
        <div className="footer-top-row">
          <div className="footer-brand">
            <div className="footer-logo">
              <ShieldCheck size={20} className="text-primary" />
              <span className="footer-title">
                ARB<span className="brand-highlight">Check</span>
              </span>
            </div>
            <p className="footer-tagline">
              Arbitrum Token & Smart Contract Risk Scanner. Read-only, deterministic bytecode analysis.
            </p>
          </div>

          <div className="footer-links-group">
            <div className="footer-nav-col">
              <span className="footer-col-title">Navigation</span>
              <button type="button" className="footer-link-btn" onClick={() => onNavigate('scanner')}>
                Scanner Home
              </button>
              <button type="button" className="footer-link-btn" onClick={() => onNavigate('testnet')}>
                ARBCheck Test Lab
              </button>
              <button type="button" className="footer-link-btn" onClick={() => onNavigate('methodology')}>
                Scoring Methodology
              </button>
              <button type="button" className="footer-link-btn" onClick={() => onNavigate('api')}>
                API Reference
              </button>
            </div>

            <div className="footer-nav-col">
              <span className="footer-col-title">Network & Explorer</span>
              <a
                href={ARBITRUM_SEPOLIA_EXPLORER}
                target="_blank"
                rel="noreferrer"
                className="footer-external-link"
              >
                <span>Arbiscan Sepolia</span>
                <ExternalLink size={13} />
              </a>
              <a
                href="https://arbitrum.io"
                target="_blank"
                rel="noreferrer"
                className="footer-external-link"
              >
                <span>Arbitrum Foundation</span>
                <ExternalLink size={13} />
              </a>
              <a
                href="https://faucet.quicknode.com/arbitrum/sepolia"
                target="_blank"
                rel="noreferrer"
                className="footer-external-link"
              >
                <span>Sepolia ETH Faucet</span>
                <ExternalLink size={13} />
              </a>
            </div>
          </div>
        </div>

        <div className="footer-bottom-row">
          <div className="footer-network-status">
            <span className="status-ping-dot" />
            <span>Arbitrum Sepolia Testnet (Chain ID: {ARBITRUM_SEPOLIA_CHAIN_ID})</span>
          </div>

          <div className="footer-copyright">
            <span>ARBCheck v1.0 (MVP) — Security & Risk Analysis Engine</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
