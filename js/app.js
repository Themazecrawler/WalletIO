// ============================================
// App Entry Point
// ============================================

import { initWallet, connectWallet, disconnectWallet, getWalletState } from './wallet.js';
import { renderPortfolio, renderTokens, renderTransactions } from './portfolio.js';
import { renderNetworkInfo } from './transactions.js';
import { formatAddress, copyToClipboard } from './ui.js';

// DOM refs
const btnConnect = document.getElementById('btn-connect');
const walletInfo = document.getElementById('wallet-info');
const addressBtn = document.getElementById('address-btn');
const addressDisplay = document.getElementById('address-display');
const ensDisplay = document.getElementById('ens-display');
const networkBadge = document.getElementById('network-badge');
const networkDot = document.getElementById('network-dot');
const networkName = document.getElementById('network-name');
const connectionStatus = document.getElementById('connection-status');
const navItems = document.querySelectorAll('.nav-item');
const views = document.querySelectorAll('.view');

// Navigation
navItems.forEach(item => {
  item.addEventListener('click', () => {
    const viewName = item.dataset.view;
    switchView(viewName);
    
    navItems.forEach(n => n.classList.remove('active'));
    item.classList.add('active');
  });
});

function switchView(viewName) {
  views.forEach(v => v.classList.add('hidden'));
  const target = document.getElementById(`view-${viewName}`);
  if (target) target.classList.remove('hidden');
  
  const titles = {
    portfolio: 'Portfolio Overview',
    assets: 'Asset Breakdown',
    history: 'Transaction History',
    network: 'Network Status'
  };
  document.getElementById('page-title').textContent = titles[viewName] || '';
}

// Wallet connection
btnConnect.addEventListener('click', async () => {
  const state = getWalletState();
  
  if (state.isConnected) {
    await disconnectWallet();
    updateUI();
    return;
  }
  
  btnConnect.disabled = true;
  btnConnect.textContent = 'Connecting...';
  
  try {
    await connectWallet();
    updateUI();
  } catch (err) {
    console.error('Connection failed:', err);
    btnConnect.textContent = 'Connect Wallet';
  } finally {
    btnConnect.disabled = false;
  }
});

// Copy address
addressBtn.addEventListener('click', () => {
  const state = getWalletState();
  if (state.address) {
    copyToClipboard(state.address);
    const original = addressDisplay.textContent;
    addressDisplay.textContent = 'Copied';
    setTimeout(() => {
      addressDisplay.textContent = original;
    }, 1200);
  }
});

// Update UI based on wallet state
async function updateUI() {
  const state = getWalletState();
  
  if (state.isConnected) {
    btnConnect.classList.add('hidden');
    walletInfo.classList.remove('hidden');
    
    addressDisplay.textContent = formatAddress(state.address);
    
    if (state.ensName) {
      ensDisplay.textContent = state.ensName;
      ensDisplay.classList.remove('hidden');
    } else {
      ensDisplay.classList.add('hidden');
    }
    
    networkDot.classList.remove('disconnected');
    networkName.textContent = state.networkName || 'Unknown';
    
    connectionStatus.textContent = `Connected: ${formatAddress(state.address)}`;
    connectionStatus.style.color = 'var(--accent-cyan)';
    
    await renderPortfolio(state);
    await renderTokens(state);
    await renderTransactions(state);
    await renderNetworkInfo(state);
    
  } else {
    btnConnect.classList.remove('hidden');
    btnConnect.textContent = 'Connect Wallet';
    walletInfo.classList.add('hidden');
    
    networkDot.classList.add('disconnected');
    networkName.textContent = 'No Network';
    
    connectionStatus.textContent = 'Disconnected';
    connectionStatus.style.color = 'var(--text-muted)';
    
    document.getElementById('portfolio-value').textContent = '—';
    document.getElementById('portfolio-change').classList.add('hidden');
  }
}

// Listen for wallet events
window.addEventListener('wallet-connected', updateUI);
window.addEventListener('wallet-disconnected', updateUI);
window.addEventListener('network-changed', updateUI);
window.addEventListener('accounts-changed', updateUI);

// Init
initWallet().then(() => {
  updateUI();
});