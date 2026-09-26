// =============================================================================
// ARBCheck - Multi-Chain Networks & Risk Constants
// Networks: Arbitrum Sepolia, Arbitrum One, Ethereum Mainnet, Ethereum Sepolia
// =============================================================================

export const ARBITRUM_SEPOLIA_CHAIN_ID = 421614;
export const ARBITRUM_SEPOLIA_HEX_ID = '0x66eee';
export const ARBITRUM_SEPOLIA_RPC = 'https://sepolia-rollup.arbitrum.io/rpc';
export const ARBITRUM_SEPOLIA_EXPLORER = 'https://sepolia.arbiscan.io';

export const SUPPORTED_NETWORKS = {
  'arbitrum-sepolia': {
    id: 'arbitrum-sepolia',
    name: 'Arbitrum Sepolia',
    shortName: 'Arb Sepolia',
    chainId: 421614,
    hexId: '0x66eee',
    rpc: 'https://sepolia-rollup.arbitrum.io/rpc',
    fallbackRpcs: [
      'https://arbitrum-sepolia-rpc.publicnode.com',
      'https://endpoints.omniatech.io/v1/arbitrum/sepolia/public',
    ],
    explorer: 'https://sepolia.arbiscan.io',
    isTestnet: true,
    nativeCurrency: {
      name: 'Arbitrum Sepolia Ether',
      symbol: 'ETH',
      decimals: 18,
    },
  },
  'arbitrum-one': {
    id: 'arbitrum-one',
    name: 'Arbitrum One',
    shortName: 'Arb Mainnet',
    chainId: 42161,
    hexId: '0xa4b1',
    rpc: 'https://arb1.arbitrum.io/rpc',
    fallbackRpcs: [
      'https://arbitrum-one-rpc.publicnode.com',
      'https://1rpc.io/arb',
    ],
    explorer: 'https://arbiscan.io',
    isTestnet: false,
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
  },
  'ethereum-mainnet': {
    id: 'ethereum-mainnet',
    name: 'Ethereum Mainnet',
    shortName: 'ETH Mainnet',
    chainId: 1,
    hexId: '0x1',
    rpc: 'https://ethereum-rpc.publicnode.com',
    fallbackRpcs: [
      'https://eth.drpc.org',
      'https://1rpc.io/eth',
    ],
    explorer: 'https://etherscan.io',
    isTestnet: false,
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
  },
  'ethereum-sepolia': {
    id: 'ethereum-sepolia',
    name: 'Ethereum Sepolia',
    shortName: 'ETH Sepolia',
    chainId: 11155111,
    hexId: '0xaa36a7',
    rpc: 'https://ethereum-sepolia-rpc.publicnode.com',
    fallbackRpcs: [
      'https://rpc2.sepolia.org',
      'https://1rpc.io/sepolia',
    ],
    explorer: 'https://sepolia.etherscan.io',
    isTestnet: true,
    nativeCurrency: {
      name: 'Sepolia Ether',
      symbol: 'ETH',
      decimals: 18,
    },
  },
};

export const DEFAULT_NETWORK_ID = 'arbitrum-sepolia';

// Helper to look up network by chainId or id
export function getNetworkConfig(networkKeyOrChainId) {
  if (typeof networkKeyOrChainId === 'string' && SUPPORTED_NETWORKS[networkKeyOrChainId]) {
    return SUPPORTED_NETWORKS[networkKeyOrChainId];
  }
  const numericId = Number(networkKeyOrChainId);
  const found = Object.values(SUPPORTED_NETWORKS).find((n) => n.chainId === numericId);
  return found || SUPPORTED_NETWORKS[DEFAULT_NETWORK_ID];
}

// PRD Section 7: Risk Scoring Engine Weights
export const RISK_WEIGHTS = {
  MINTABLE: { points: 20, code: 'MINTABLE', label: 'Mintable Supply' },
  ACTIVE_OWNER: { points: 15, code: 'ACTIVE_OWNER', label: 'Active Owner / Admin' },
  BLACKLIST: { points: 20, code: 'BLACKLIST', label: 'Blacklist Function Detected' },
  HIGH_SELL_TAX: { points: 20, code: 'HIGH_SELL_TAX', label: 'High Sell Tax (>10%)' },
  PAUSE: { points: 10, code: 'PAUSE', label: 'Pausable Transfers' },
  HIGH_HOLDER_CONCENTRATION: { points: 15, code: 'HIGH_HOLDER_CONCENTRATION', label: 'High Holder Concentration (>50% Top 10)' },
  LIQUIDITY_UNLOCKED: { points: 15, code: 'LIQUIDITY_UNLOCKED', label: 'Liquidity Unlocked / Not Verified' },
};

// 1-10 Rating Scale Helper
export function calculate10ScaleRating(riskScore) {
  // Score 0 (no risk) -> 10.0 / 10
  // Score 100 (critical risk) -> 1.0 / 10
  const rawRating = (100 - riskScore) / 10;
  const rating = Math.max(1.0, Math.min(10.0, Number(rawRating.toFixed(1))));

  let grade = 'A+';
  let label = 'Maximum Security';
  let tier = 'safe';

  if (rating >= 9.0) {
    grade = 'A+';
    label = 'Exceptional Security';
    tier = 'safe';
  } else if (rating >= 8.0) {
    grade = 'A';
    label = 'Strong Security Profile';
    tier = 'safe';
  } else if (rating >= 7.0) {
    grade = 'B+';
    label = 'Standard Safeguards';
    tier = 'moderate';
  } else if (rating >= 5.5) {
    grade = 'B-';
    label = 'Moderate Privilege Risk';
    tier = 'moderate';
  } else if (rating >= 4.0) {
    grade = 'C';
    label = 'Elevated Risk Factors';
    tier = 'risk';
  } else if (rating >= 2.5) {
    grade = 'D';
    label = 'High Hazard / Restrictive';
    tier = 'danger';
  } else {
    grade = 'F';
    label = 'Critical Risk / Honeypot Vector';
    tier = 'danger';
  }

  return {
    rating,
    grade,
    label,
    tier,
    scoreFraction: `${rating} / 10`,
  };
}

// Classification Thresholds
export const RISK_LEVELS = {
  LOW: {
    label: 'LOW RISK',
    min: 0,
    max: 30,
    color: 'emerald',
    description: 'Contract parameters show standard safeguards and no critical backdoors.',
  },
  MEDIUM: {
    label: 'MEDIUM RISK',
    min: 31,
    max: 60,
    color: 'amber',
    description: 'Contract contains centralized privileges or tax mechanics requiring caution.',
  },
  HIGH: {
    label: 'HIGH RISK',
    min: 61,
    max: 100,
    color: 'rose',
    description: 'Critical risk vectors detected such as honeypot logic, arbitrary mint, or blacklists.',
  },
};

import CONTRACT_ABIS, {
  SafeTokenABI,
  MintableTokenABI,
  TaxTokenABI,
  HoneypotTestTokenABI,
  ERC20ABI,
} from '../abi/index.js';

export {
  CONTRACT_ABIS,
  SafeTokenABI,
  MintableTokenABI,
  TaxTokenABI,
  HoneypotTestTokenABI,
  ERC20ABI,
};

// Standard ERC20 & Privileged Method ABI
export const ERC20_ABI = ERC20ABI;

// Curated Test & Reference Tokens for All 4 Networks
export const MULTICHAIN_TOKENS = {
  'arbitrum-sepolia': [
    {
      id: 'safe',
      networkId: 'arbitrum-sepolia',
      name: 'Arbitrum Safe Token',
      symbol: 'SAFE',
      address: '0x71C82B4628E46bF5E7B78096236b9074a3D4B662',
      decimals: 18,
      totalSupply: '1,000,000 SAFE',
      riskScore: 0,
      riskLevel: 'LOW',
      tag: 'Safe Reference',
      description: 'ERC20 fixed supply, no mint(), no blacklist, no pause, ownership renounced.',
      checks: {
        verification: { status: 'PASS', label: 'Verified Arbiscan', detail: 'Contract source verified on Arbiscan Sepolia.' },
        ownership: { status: 'PASS', label: 'Renounced (No Admin)', detail: 'Ownership renounced to 0x0000...0000. No admin privileges.' },
        mintability: { status: 'PASS', label: 'Fixed Supply (No Mint)', detail: 'Total supply capped at 1,000,000 SAFE. No mint() function in bytecode.' },
        tax: { status: 'PASS', label: '0% / 0% (Standard)', detail: 'Buy tax 0%, Sell tax 0%. Standard ERC20 transfer.' },
        blacklist: { status: 'PASS', label: 'Clean (No Blacklist)', detail: 'Verified clean: No address blacklisting or trading restrictions found in bytecode.' },
        pause: { status: 'PASS', label: 'Clean (Unpausable)', detail: 'Verified clean: Transfer execution cannot be paused or frozen.' },
        holders: { status: 'PASS', label: 'Healthy (18%)', detail: 'Top 10 holders own 18% of total supply. Fair decentralized distribution.' },
        liquidity: { status: 'PASS', label: 'Locked Liquidity', detail: 'LP tokens locked in DEX time-lock contract.' },
      },
      scoringBreakdown: [],
    },
    {
      id: 'mintable',
      networkId: 'arbitrum-sepolia',
      name: 'Arbitrum Mintable Token',
      symbol: 'MINT',
      address: '0x3A8F20349E7C051bBe145d2e0b57C602F485B011',
      decimals: 18,
      totalSupply: '5,000,000 MINT',
      riskScore: 35,
      riskLevel: 'MEDIUM',
      tag: 'Mintable Risk',
      description: 'Contains mint() function controlled by active owner. Supply can be inflated arbitrarily.',
      checks: {
        verification: { status: 'PASS', label: 'Verified', detail: 'Contract source verified on Arbiscan Sepolia.' },
        ownership: { status: 'CAUTION', label: 'Active Owner', detail: 'Owner is 0x84F2...3910 with privileged access.' },
        mintability: { status: 'RISK', label: 'Mintable Supply', detail: 'Function mint(address,uint256) allows owner to create unlimited tokens.' },
        tax: { status: 'PASS', label: '0% / 0%', detail: 'Buy tax 0%, Sell tax 0%.' },
        blacklist: { status: 'PASS', label: 'Not Detected', detail: 'No blacklist function detected.' },
        pause: { status: 'PASS', label: 'Not Detected', detail: 'Transfers cannot be paused.' },
        holders: { status: 'PASS', label: 'Moderate (28%)', detail: 'Top 10 holders control 28% of current supply.' },
        liquidity: { status: 'PASS', label: 'Locked (6 Mos)', detail: 'Liquidity pair verified on Uniswap V3 Arbitrum Sepolia.' },
      },
      scoringBreakdown: [
        { rule: 'Mintable', points: 20, reason: 'Owner can mint unlimited new tokens, diluting current holders.' },
        { rule: 'Active owner', points: 15, reason: 'Owner key has special privileges to alter state.' },
      ],
    },
    {
      id: 'tax',
      networkId: 'arbitrum-sepolia',
      name: 'Arbitrum Tax Token',
      symbol: 'TAX',
      address: '0x9E2aF0C4113D667Fa98102e3CeE7bEc0959E9274',
      decimals: 18,
      totalSupply: '10,000,000 TAX',
      riskScore: 55,
      riskLevel: 'MEDIUM',
      tag: 'High Tax Warning',
      description: 'Deducts 5% fee on buys and heavy 20% tax on sells with unlocked liquidity pool.',
      checks: {
        verification: { status: 'PASS', label: 'Verified', detail: 'Verified Solidity 0.8.20 compiler.' },
        ownership: { status: 'CAUTION', label: 'Active Owner', detail: 'Owner address 0x93B1...41E9 can modify fee limits.' },
        mintability: { status: 'PASS', label: 'Fixed Supply', detail: 'No mint() function found.' },
        tax: { status: 'RISK', label: '5% Buy / 20% Sell', detail: 'High sell fee (20%) significantly reduces exit value for traders.' },
        blacklist: { status: 'PASS', label: 'Not Detected', detail: 'No explicit address blacklist.' },
        pause: { status: 'PASS', label: 'Not Detected', detail: 'No pause contract mechanism.' },
        holders: { status: 'CAUTION', label: 'High (45%)', detail: 'Deployer and treasury wallet hold 45% of tokens.' },
        liquidity: { status: 'RISK', label: 'Unlocked (Camelot)', detail: 'LP pool contains 4.2 ETH but LP tokens remain unlocked in deployer wallet.' },
      },
      scoringBreakdown: [
        { rule: 'High sell tax', points: 20, reason: 'Sell tax is 20%, exceeding safe thresholds (>10%).' },
        { rule: 'Active owner', points: 15, reason: 'Contract has active owner with fee adjustment powers.' },
        { rule: 'Liquidity unlocked', points: 15, reason: 'LP tokens are not locked in a verified locker contract.' },
      ],
    },
    {
      id: 'honeypot',
      networkId: 'arbitrum-sepolia',
      name: 'Arbitrum Honeypot Simulator',
      symbol: 'HONEY',
      address: '0xFA4889c256a00dE4b5A60bFd2a4De0045437C091',
      decimals: 18,
      totalSupply: '100,000,000 HONEY',
      riskScore: 85,
      riskLevel: 'HIGH',
      tag: 'Critical Honeypot Vector',
      description: 'Simulates transfer restriction where sells revert or are blacklisted. Testing purpose only.',
      checks: {
        verification: { status: 'UNKNOWN', label: 'Unverified Bytecode', detail: 'Source code not verified on explorer; disassembled from bytecode.' },
        ownership: { status: 'CAUTION', label: 'Active Owner', detail: 'Owner 0xDE4D...BEEF retains full proxy control.' },
        mintability: { status: 'RISK', label: 'Mintable', detail: 'Hidden mint selector 0x40c10f19 detected in bytecode.' },
        tax: { status: 'RISK', label: 'Dynamic (Up to 99%)', detail: 'Sell tax logic can be dynamically adjusted up to 99% by admin.' },
        blacklist: { status: 'RISK', label: 'Blacklist Detected', detail: 'Selective transfer denial detected in _beforeTokenTransfer hook.' },
        pause: { status: 'RISK', label: 'Pausable', detail: 'Admin can freeze all token transfers at will.' },
        holders: { status: 'RISK', label: 'Extreme (84%)', detail: 'Creator wallet controls 84% of circulating supply.' },
        liquidity: { status: 'RISK', label: 'Unlocked / Vulnerable', detail: 'Liquidity can be withdrawn by owner without timelock.' },
      },
      scoringBreakdown: [
        { rule: 'Blacklist', points: 20, reason: 'Transfer restrictions prevent non-whitelisted buyers from selling.' },
        { rule: 'High sell tax', points: 20, reason: 'Transfer fees can reach confiscatory rates.' },
        { rule: 'Mintable', points: 20, reason: 'Supply can be inflated arbitrarily.' },
        { rule: 'Active owner', points: 15, reason: 'Admin retains unilateral control over transfer gates.' },
        { rule: 'Pause', points: 10, reason: 'Emergency pause function halts user transactions.' },
      ],
    },
  ],
  'arbitrum-one': [
    {
      id: 'arb-token',
      networkId: 'arbitrum-one',
      name: 'Arbitrum',
      symbol: 'ARB',
      address: '0x912CE59144191C1204E64559FE8253a0e49E6548',
      decimals: 18,
      totalSupply: '10,000,000,000 ARB',
      riskScore: 10,
      riskLevel: 'LOW',
      tag: 'Official Governance Token',
      description: 'Official Arbitrum DAO governance token with decentralized timelock administration.',
      checks: {
        verification: { status: 'PASS', label: 'Verified Arbiscan', detail: 'Publicly verified source code audited by OpenZeppelin.' },
        ownership: { status: 'PASS', label: 'DAO Timelock', detail: 'Controlled by Arbitrum DAO Timelock contract with 7-day governance delay.' },
        mintability: { status: 'PASS', label: 'Capped / DAO Governed', detail: 'Inflation strictly capped at maximum 2% per year via DAO vote.' },
        tax: { status: 'PASS', label: '0% / 0% (Standard)', detail: 'Zero buy tax, zero sell tax standard ERC20.' },
        blacklist: { status: 'PASS', label: 'Clean (No Blacklist)', detail: 'Verified clean: No blacklist or selective address freeze functions present in bytecode.' },
        pause: { status: 'PASS', label: 'Clean (Unpausable)', detail: 'Verified clean: Transfers cannot be paused or stopped by any admin.' },
        holders: { status: 'PASS', label: 'Decentralized', detail: 'Widely dispersed across DAO treasury and hundreds of thousands of holders.' },
        liquidity: { status: 'PASS', label: 'Deep Liquidity', detail: 'Massive decentralized liquidity across Uniswap, Camelot, and Binance.' },
      },
      scoringBreakdown: [
        { rule: 'DAO Controlled', points: 10, reason: 'Upgradable via DAO voting delay mechanism.' },
      ],
    },
    {
      id: 'weth-arb',
      networkId: 'arbitrum-one',
      name: 'Wrapped Ether',
      symbol: 'WETH',
      address: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
      decimals: 18,
      totalSupply: 'Dynamic (1:1 ETH)',
      riskScore: 0,
      riskLevel: 'LOW',
      tag: 'Canonical Wrapped Asset',
      description: 'Canonical canonical WETH9 contract on Arbitrum One with immutable 1:1 backing.',
      checks: {
        verification: { status: 'PASS', label: 'Verified Canonical', detail: 'Verified canonical WETH9 contract.' },
        ownership: { status: 'PASS', label: 'Immutable (No Owner)', detail: 'Contract is immutable without owner or upgrade proxy.' },
        mintability: { status: 'PASS', label: 'Deposit Backed (1:1)', detail: 'Mints exclusively when native ETH is deposited into the contract.' },
        tax: { status: 'PASS', label: '0% / 0% (Standard)', detail: 'Zero tax wrapping / unwrapping.' },
        blacklist: { status: 'PASS', label: 'Clean (No Blacklist)', detail: 'Verified clean: No blacklist or freezing functions.' },
        pause: { status: 'PASS', label: 'Clean (Unpausable)', detail: 'Verified clean: Permissionless 24/7 unwrap mechanism.' },
        holders: { status: 'PASS', label: 'Decentralized', detail: 'Held across thousands of DeFi protocols.' },
        liquidity: { status: 'PASS', label: 'Full 1:1 Reserves', detail: '100% backed on-chain by native ETH.' },
      },
      scoringBreakdown: [],
    },
  ],
  'ethereum-mainnet': [
    {
      id: 'uni-token',
      networkId: 'ethereum-mainnet',
      name: 'Uniswap',
      symbol: 'UNI',
      address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
      decimals: 18,
      totalSupply: '1,000,000,000 UNI',
      riskScore: 5,
      riskLevel: 'LOW',
      tag: 'DeFi Benchmark',
      description: 'Canonical Uniswap governance token on Ethereum Mainnet with audited timelock.',
      checks: {
        verification: { status: 'PASS', label: 'Verified Etherscan', detail: 'Fully verified source audited by Trail of Bits.' },
        ownership: { status: 'PASS', label: 'Timelock Controlled', detail: 'Admin is Uniswap Governance Timelock.' },
        mintability: { status: 'PASS', label: 'Inflation Cap 2%', detail: 'Perpetual inflation cap of 2%/year after year 4 via governance.' },
        tax: { status: 'PASS', label: '0% / 0% (Standard)', detail: '0% buy tax, 0% sell tax.' },
        blacklist: { status: 'PASS', label: 'Clean (No Blacklist)', detail: 'Verified clean: No transfer denial hooks.' },
        pause: { status: 'PASS', label: 'Clean (Unpausable)', detail: 'Verified clean: No pause mechanism.' },
        holders: { status: 'PASS', label: 'Healthy Distribution', detail: 'Distributed across global community and DEX liquidity.' },
        liquidity: { status: 'PASS', label: 'Deep Global Pools', detail: 'Deep multi-million dollar liquidity across Uniswap V2 & V3.' },
      },
      scoringBreakdown: [],
    },
    {
      id: 'usdt-token',
      networkId: 'ethereum-mainnet',
      name: 'Tether USD',
      symbol: 'USDT',
      address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      decimals: 6,
      totalSupply: '115,000,000,000 USDT',
      riskScore: 45,
      riskLevel: 'MEDIUM',
      tag: 'Centralized Stablecoin',
      description: 'Tether USD contract with active owner, blacklist, and pause capabilities.',
      checks: {
        verification: { status: 'PASS', label: 'Verified Etherscan', detail: 'Verified on Etherscan.' },
        ownership: { status: 'CAUTION', label: 'Active Owner', detail: 'Owner is Tether Multi-Sig with upgrade authorization.' },
        mintability: { status: 'RISK', label: 'Centralized Mint', detail: 'Tether Treasury can issue and redeem tokens according to reserves.' },
        tax: { status: 'PASS', label: '0% / 0% (Standard)', detail: 'Standard transfer.' },
        blacklist: { status: 'RISK', label: 'Blacklist Detected (Risk)', detail: 'Includes addBlackList(address) for regulatory compliance.' },
        pause: { status: 'CAUTION', label: 'Pausable by Admin', detail: 'Emergency pause functionality exists.' },
        holders: { status: 'PASS', label: 'Global Dispersion', detail: 'Distributed among millions of wallets and exchanges.' },
        liquidity: { status: 'PASS', label: 'Deep Reserves', detail: 'Largest stablecoin liquidity pool in crypto.' },
      },
      scoringBreakdown: [
        { rule: 'Blacklist', points: 20, reason: 'Tether retains power to freeze arbitrary addresses.' },
        { rule: 'Active owner', points: 15, reason: 'Privileged multisig controls contract state.' },
        { rule: 'Pause', points: 10, reason: 'Emergency pause function halts transfers.' },
      ],
    },
    {
      id: 'ondo-token',
      networkId: 'ethereum-mainnet',
      name: 'Ondo',
      symbol: 'ONDO',
      address: '0xfAbA6f8e4a5E8Ab82F62fe7C39859FA577269BE3',
      decimals: 18,
      totalSupply: '10,000,000,000 ONDO',
      riskScore: 10,
      riskLevel: 'LOW',
      tag: 'RWA & Governance',
      description: 'Ondo Finance governance token bridging institutional-grade financial assets on-chain.',
      checks: {
        verification: { status: 'PASS', label: 'Verified Etherscan', detail: 'Publicly verified source code audited by leading security firms.' },
        ownership: { status: 'PASS', label: 'Multi-Sig / Timelock', detail: 'Governed by Ondo Foundation multi-sig with timelock protection.' },
        mintability: { status: 'PASS', label: 'Fixed Supply (No Mint)', detail: 'Total supply capped at 10,000,000,000 ONDO. No arbitrary minting function.' },
        tax: { status: 'PASS', label: '0% / 0% (Standard)', detail: '0% buy tax, 0% sell tax standard ERC20.' },
        blacklist: { status: 'PASS', label: 'Clean (No Blacklist)', detail: 'Verified clean: No blacklist or selective freeze functions present in bytecode.' },
        pause: { status: 'PASS', label: 'Clean (Unpausable)', detail: 'Verified clean: Transfers cannot be paused.' },
        holders: { status: 'PASS', label: 'Decentralized', detail: 'Dispersed across global community, foundation reserve, and DEX liquidity.' },
        liquidity: { status: 'PASS', label: 'Deep Liquidity', detail: 'Uniswap V2 / V3 and top tier liquidity verified on Ethereum Mainnet.' },
      },
      scoringBreakdown: [],
    },
  ],
  'ethereum-sepolia': [
    {
      id: 'sepolia-weth',
      networkId: 'ethereum-sepolia',
      name: 'Wrapped Ether (Sepolia)',
      symbol: 'WETH',
      address: '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14',
      decimals: 18,
      totalSupply: 'Dynamic (1:1 ETH)',
      riskScore: 0,
      riskLevel: 'LOW',
      tag: 'Sepolia Test Asset',
      description: 'Standard WETH9 testnet wrapper for Ethereum Sepolia.',
      checks: {
        verification: { status: 'PASS', label: 'Verified Sepolia', detail: 'Verified WETH9 bytecode on Sepolia Etherscan.' },
        ownership: { status: 'PASS', label: 'No Owner (Immutable)', detail: 'Immutable contract logic.' },
        mintability: { status: 'PASS', label: '1:1 Wrapped', detail: 'Mints strictly on ETH deposit.' },
        tax: { status: 'PASS', label: '0% / 0% (Standard)', detail: '0% tax.' },
        blacklist: { status: 'PASS', label: 'Clean (No Blacklist)', detail: 'Verified clean: No blacklist.' },
        pause: { status: 'PASS', label: 'Clean (Unpausable)', detail: 'Verified clean: No pause.' },
        holders: { status: 'PASS', label: 'Testnet Distribution', detail: 'Open testnet distribution.' },
        liquidity: { status: 'PASS', label: 'Test Reserves', detail: 'Backed by Sepolia ETH reserves.' },
      },
      scoringBreakdown: [],
    },
  ],
};

// Flattened list of test tokens for backwards compatibility
export const TEST_TOKENS = MULTICHAIN_TOKENS['arbitrum-sepolia'];
