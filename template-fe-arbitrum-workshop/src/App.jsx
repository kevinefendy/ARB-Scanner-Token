import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HeroSearch from './components/HeroSearch';
import ScanResult from './components/ScanResult';
import TestLab from './components/TestLab';
import Methodology from './components/Methodology';
import ApiExplorer from './components/ApiExplorer';
import Footer from './components/Footer';
import { scanContract } from './services/scanner';
import {
  connectWallet,
  switchNetworkTo,
  hasEthereum,
} from './services/wallet';
import {
  AlertOctagon,
  Search,
} from 'lucide-react';
import {
  DEFAULT_NETWORK_ID,
  getNetworkConfig,
} from './constants/arbitrum';
import './App.css';

export default function App() {
  const [activeTab, setActiveTab] = useState('scanner'); // 'scanner' | 'testnet' | 'methodology' | 'api'
  const [selectedNetworkId, setSelectedNetworkId] = useState(DEFAULT_NETWORK_ID);
  const [scanResult, setScanResult] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState(null);
  const [currentAddress, setCurrentAddress] = useState('');

  // Wallet State
  const [wallet, setWallet] = useState({
    isConnected: false,
    address: '',
    balance: '0',
    chainId: null,
  });
  const [isConnecting, setIsConnecting] = useState(false);

  // Connect Wallet Handler
  const handleConnectWallet = async (netId = selectedNetworkId) => {
    setIsConnecting(true);
    try {
      const wData = await connectWallet(netId);
      setWallet({
        isConnected: true,
        address: wData.address,
        balance: wData.balance,
        chainId: wData.chainId,
      });
    } catch (err) {
      console.warn('Wallet connection cancelled or failed:', err);
    } finally {
      setIsConnecting(false);
    }
  };

  // Monitor Ethereum Wallet events if available
  useEffect(() => {
    if (hasEthereum()) {
      const handleAccountsChanged = (accounts) => {
        if (!accounts || accounts.length === 0) {
          setWallet({
            isConnected: false,
            address: '',
            balance: '0',
            chainId: null,
          });
        } else {
          handleConnectWallet();
        }
      };

      const handleChainChanged = (hexChainId) => {
        const id = parseInt(hexChainId, 16);
        setWallet((prev) => ({
          ...prev,
          chainId: id,
        }));
      };

      window.ethereum.on?.('accountsChanged', handleAccountsChanged);
      window.ethereum.on?.('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener?.('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener?.('chainChanged', handleChainChanged);
      };
    }
  }, []);

  const handleDisconnectWallet = () => {
    setWallet({
      isConnected: false,
      address: '',
      balance: '0',
      chainId: null,
    });
  };

  // Switch Active Network Handler
  const handleSelectNetwork = async (netId) => {
    setSelectedNetworkId(netId);
    if (wallet.isConnected) {
      try {
        await switchNetworkTo(netId);
        const net = getNetworkConfig(netId);
        setWallet((prev) => ({
          ...prev,
          chainId: net.chainId,
        }));
      } catch (err) {
        console.error('Failed to switch network in wallet:', err);
      }
    }
  };

  // Scan Contract Handler
  const handleScan = async (address, networkId = selectedNetworkId) => {
    setIsScanning(true);
    setScanError(null);
    setCurrentAddress(address);

    const targetNetwork = getNetworkConfig(networkId);

    try {
      const report = await scanContract(address, targetNetwork.id);
      setScanResult(report);
      setActiveTab('scanner');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setScanError(err.message || `Failed to scan contract on ${targetNetwork.name}.`);
      setScanResult(null);
    } finally {
      setIsScanning(false);
    }
  };

  const handleSelectTestToken = (token, networkId = selectedNetworkId) => {
    handleScan(token.address, networkId);
  };

  const handleRescan = () => {
    if (currentAddress) {
      handleScan(currentAddress, scanResult?.networkId || selectedNetworkId);
    }
  };

  const handleBackToScanner = () => {
    setScanResult(null);
    setScanError(null);
  };

  const handleOpenInTestLab = (_data) => {
    setActiveTab('testnet');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentNetConfig = getNetworkConfig(selectedNetworkId);

  return (
    <div className="arb-app">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setScanError(null);
        }}
        wallet={wallet}
        isConnecting={isConnecting}
        onConnectWallet={() => handleConnectWallet(selectedNetworkId)}
        onDisconnectWallet={handleDisconnectWallet}
        selectedNetworkId={selectedNetworkId}
        onSelectNetwork={handleSelectNetwork}
      />

      {/* Main Content Area */}
      <main className="arb-main-container">
        {activeTab === 'scanner' && (
          <>
            {isScanning ? (
              <div className="scanner-loading-screen">
                <div className="scanner-loading-box">
                  <div className="simple-loader-circle" />
                  <h3 className="loading-title">Scanning Contract on {currentNetConfig.name}...</h3>
                  <p className="loading-sub font-mono">{currentAddress}</p>
                </div>
              </div>
            ) : scanError ? (
              <div className="scan-error-screen">
                <div className="error-card">
                  <div className="error-icon-box">
                    <AlertOctagon size={32} className="text-rose" />
                  </div>
                  <h2 className="error-title">Contract Scan Error</h2>
                  <p className="error-msg">{scanError}</p>
                  <div className="error-actions">
                    <button
                      type="button"
                      className="btn-error-retry"
                      onClick={handleBackToScanner}
                    >
                      <Search size={15} />
                      <span>Try Another Address</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : scanResult ? (
              <ScanResult
                scanData={scanResult}
                onBack={handleBackToScanner}
                onRescan={handleRescan}
                isScanning={isScanning}
                onOpenInTestLab={handleOpenInTestLab}
              />
            ) : (
              <HeroSearch
                onScan={handleScan}
                isScanning={isScanning}
                onSelectTestToken={handleSelectTestToken}
                selectedNetworkId={selectedNetworkId}
                onSelectNetwork={handleSelectNetwork}
              />
            )}
          </>
        )}

        {activeTab === 'testnet' && (
          <TestLab
            onScanToken={handleScan}
            wallet={wallet}
            onConnectWallet={() => handleConnectWallet(selectedNetworkId)}
            selectedNetworkId={selectedNetworkId}
            onSelectNetwork={handleSelectNetwork}
          />
        )}

        {activeTab === 'methodology' && <Methodology />}

        {activeTab === 'api' && <ApiExplorer />}
      </main>

      {/* Footer */}
      <Footer onNavigate={(tab) => {
        setActiveTab(tab);
        if (tab === 'scanner') setScanResult(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }} />
    </div>
  );
}
