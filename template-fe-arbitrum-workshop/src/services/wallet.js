import { ethers } from 'ethers';
import {
  DEFAULT_NETWORK_ID,
  getNetworkConfig,
  ERC20_ABI,
} from '../constants/arbitrum';

/**
 * Checks if window.ethereum is available
 */
export function hasEthereum() {
  return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
}

/**
 * Connects user wallet and syncs with preferred network
 */
export async function connectWallet(preferredNetworkId = DEFAULT_NETWORK_ID) {
  if (!hasEthereum()) {
    throw new Error('No Ethereum wallet detected. Please install MetaMask or another Web3 extension.');
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  const accounts = await provider.send('eth_requestAccounts', []);

  if (!accounts || accounts.length === 0) {
    throw new Error('No accounts selected.');
  }

  const network = await provider.getNetwork();
  const currentChainId = Number(network.chainId);
  const targetNet = getNetworkConfig(preferredNetworkId);

  const isMatched = currentChainId === targetNet.chainId;

  const signer = await provider.getSigner();
  const address = await signer.getAddress();
  const balanceRaw = await provider.getBalance(address);
  const balance = ethers.formatEther(balanceRaw);

  return {
    address,
    balance: Number(balance).toFixed(4),
    chainId: currentChainId,
    isMatched,
  };
}

/**
 * Switches network to any of the 4 supported networks
 */
export async function switchNetworkTo(networkId) {
  if (!hasEthereum()) return;
  const net = getNetworkConfig(networkId);

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: net.hexId }],
    });
  } catch (error) {
    if (error.code === 4902 || error.data?.originalError?.code === 4902) {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: net.hexId,
            chainName: net.name,
            nativeCurrency: net.nativeCurrency,
            rpcUrls: [net.rpc],
            blockExplorerUrls: [net.explorer],
          },
        ],
      });
    } else {
      throw error;
    }
  }
}

/**
 * Fetches token balance for a specific wallet and token address
 */
export async function getTokenBalance(tokenAddress, userAddress, networkId = DEFAULT_NETWORK_ID) {
  if (!hasEthereum() || !tokenAddress || !userAddress) return '0';

  try {
    const net = getNetworkConfig(networkId);
    const provider = new ethers.JsonRpcProvider(net.rpc);
    const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
    const [decimals, balance] = await Promise.all([
      contract.decimals().catch(() => 18),
      contract.balanceOf(userAddress),
    ]);
    return ethers.formatUnits(balance, decimals);
  } catch {
    return '0';
  }
}

/**
 * Reads live on-chain state for a token (balance, owner, taxes, pause status)
 */
export async function readOnChainTokenState(tokenAddress, userAddress, networkId = DEFAULT_NETWORK_ID) {
  try {
    const net = getNetworkConfig(networkId);
    const provider = new ethers.JsonRpcProvider(net.rpc);
    const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);

    const [decimals, balance, supply, owner, bTax, sTax, paused] = await Promise.allSettled([
      contract.decimals(),
      userAddress ? contract.balanceOf(userAddress) : 0n,
      contract.totalSupply(),
      contract.owner(),
      contract.buyTax(),
      contract.sellTax(),
      contract.paused(),
    ]);

    const dec = decimals.status === 'fulfilled' ? Number(decimals.value) : 18;
    const balFormatted = balance.status === 'fulfilled' ? ethers.formatUnits(balance.value, dec) : '0';
    const supplyFormatted = supply.status === 'fulfilled' ? ethers.formatUnits(supply.value, dec) : 'Unknown';

    return {
      decimals: dec,
      balance: balFormatted,
      totalSupply: supplyFormatted,
      owner: owner.status === 'fulfilled' ? owner.value : null,
      buyTax: bTax.status === 'fulfilled' ? Number(bTax.value) : null,
      sellTax: sTax.status === 'fulfilled' ? Number(sTax.value) : null,
      paused: paused.status === 'fulfilled' ? Boolean(paused.value) : null,
    };
  } catch {
    return null;
  }
}

/**
 * Interacts directly with token smart contracts on-chain
 */
export async function executeTestContractAction({
  tokenAddress,
  action,
  amount = '0',
  recipient,
  extraParams = {},
}) {
  if (!hasEthereum()) {
    throw new Error('Please connect your Web3 wallet first.');
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const contract = new ethers.Contract(tokenAddress, ERC20_ABI, signer);

  const decimals = await contract.decimals().catch(() => 18);
  const userAddr = await signer.getAddress();

  if (action === 'mint') {
    const targetAddr = recipient && ethers.isAddress(recipient) ? recipient : userAddr;
    const parsedAmount = ethers.parseUnits(amount.toString(), decimals);
    const tx = await contract.mint(targetAddr, parsedAmount);
    return await tx.wait();
  }

  if (action === 'transfer') {
    const targetAddr = recipient && ethers.isAddress(recipient) ? recipient : userAddr;
    const parsedAmount = ethers.parseUnits(amount.toString(), decimals);
    const tx = await contract.transfer(targetAddr, parsedAmount);
    return await tx.wait();
  }

  if (action === 'approve') {
    const targetAddr = recipient && ethers.isAddress(recipient) ? recipient : userAddr;
    const parsedAmount = ethers.parseUnits(amount.toString(), decimals);
    const tx = await contract.approve(targetAddr, parsedAmount);
    return await tx.wait();
  }

  if (action === 'renounce') {
    const tx = await contract.renounceOwnership();
    return await tx.wait();
  }

  if (action === 'setTaxes') {
    const buyBps = extraParams.buyTaxBps ?? 500;
    const sellBps = extraParams.sellTaxBps ?? 2000;
    const tx = await contract.setTaxes(buyBps, sellBps);
    return await tx.wait();
  }

  if (action === 'setBlacklist') {
    const targetAddr = recipient && ethers.isAddress(recipient) ? recipient : userAddr;
    const status = extraParams.status ?? true;
    const tx = await contract.setBlacklist(targetAddr, status);
    return await tx.wait();
  }

  if (action === 'setPaused') {
    const status = extraParams.paused ?? true;
    const tx = await contract.setPaused(status);
    return await tx.wait();
  }

  throw new Error(`Unsupported smart contract action: ${action}`);
}
