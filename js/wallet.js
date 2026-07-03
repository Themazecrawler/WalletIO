// ============================================
// Wallet Connection & State
// ============================================

import { ethers } from 'https://cdn.jsdelivr.net/npm/ethers@6.9.0/dist/ethers.esm.min.js';

let provider = null;
let signer = null;
let state = {
  isConnected: false,
  address: null,
  ensName: null,
  networkName: null,
  chainId: null,
  balance: null
};

// Check if MetaMask is available
function hasMetaMask() {
  return typeof window.ethereum !== 'undefined';
}

// Initialize — check for existing connection
export async function initWallet() {
  if (!hasMetaMask()) return;
  
  try {
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    if (accounts.length > 0) {
      await setupConnection(accounts[0]);
    }
    
    // Event listeners
    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);
    
  } catch (err) {
    console.error('Init error:', err);
  }
}

// Connect wallet
export async function connectWallet() {
  if (!hasMetaMask()) {
    throw new Error('MetaMask not installed');
  }
  
  try {
    const accounts = await window.ethereum.request({ 
      method: 'eth_requestAccounts' 
    });
    
    if (accounts.length === 0) {
      throw new Error('No accounts found');
    }
    
    await setupConnection(accounts[0]);
    dispatchEvent('wallet-connected');
    
  } catch (err) {
    console.error('Connect error:', err);
    throw err;
  }
}

// Setup connection after getting account
async function setupConnection(address) {
  provider = new ethers.BrowserProvider(window.ethereum);
  signer = await provider.getSigner();
  
  const network = await provider.getNetwork();
  const balance = await provider.getBalance(address);
  
  // Try to resolve ENS
  let ensName = null;
  try {
    ensName = await provider.lookupAddress(address);
  } catch {
    // ENS not available on this network
  }
  
  state = {
    isConnected: true,
    address,
    ensName,
    networkName: getNetworkName(Number(network.chainId)),
    chainId: Number(network.chainId),
    balance: ethers.formatEther(balance)
  };
}

// Disconnect
export async function disconnectWallet() {
  provider = null;
  signer = null;
  state = {
    isConnected: false,
    address: null,
    ensName: null,
    networkName: null,
    chainId: null,
    balance: null
  };
  
  dispatchEvent('wallet-disconnected');
}

// Event handlers
function handleAccountsChanged(accounts) {
  if (accounts.length === 0) {
    disconnectWallet();
  } else if (accounts[0] !== state.address) {
    setupConnection(accounts[0]).then(() => {
      dispatchEvent('accounts-changed');
    });
  }
}

function handleChainChanged() {
  // MetaMask recommends page reload on chain change
  window.location.reload();
}

// Helpers
function getNetworkName(chainId) {
  const networks = {
    1: 'Ethereum',
    5: 'Goerli',
    11155111: 'Sepolia',
    137: 'Polygon',
    80001: 'Mumbai',
    56: 'BSC',
    42161: 'Arbitrum',
    10: 'Optimism',
    43114: 'Avalanche',
    250: 'Fantom'
  };
  return networks[chainId] || `Chain ${chainId}`;
}

function dispatchEvent(name) {
  window.dispatchEvent(new CustomEvent(name, { detail: state }));
}

// Getters
export function getWalletState() {
  return { ...state };
}

export function getProvider() {
  return provider;
}

export function getSigner() {
  return signer;
}