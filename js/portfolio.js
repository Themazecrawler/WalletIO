// ============================================
// Portfolio Data & Rendering
// ============================================

import { getProvider } from './wallet.js';
import { formatAddress, formatNumber, formatCurrency, timeAgo } from './ui.js';

// Known token list with addresses for mainnet
const TOKEN_LIST = [
  {
    symbol: 'ETH',
    name: 'Ethereum',
    address: null, // Native
    decimals: 18,
    price: 2450.00,
    change24h: 2.4
  },
  {
    symbol: 'USDC',
    name: 'USD Coin',
    address: '0xA0b86a33E6441e0A421e56E4773C3C4b0Db7E5f0', // Sepolia test
    decimals: 6,
    price: 1.00,
    change24h: 0.0
  },
  {
    symbol: 'USDT',
    name: 'Tether',
    address: null,
    decimals: 6,
    price: 1.00,
    change24h: 0.01
  },
  {
    symbol: 'WBTC',
    name: 'Wrapped Bitcoin',
    address: null,
    decimals: 8,
    price: 67500.00,
    change24h: -1.2
  },
  {
    symbol: 'LINK',
    name: 'Chainlink',
    address: null,
    decimals: 18,
    price: 14.20,
    change24h: 5.6
  }
];

// ERC-20 ABI (minimal)
const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)'
];

export async function renderPortfolio(state) {
  const valueEl = document.getElementById('portfolio-value');
  const changeEl = document.getElementById('portfolio-change');
  
  if (!state.isConnected) {
    valueEl.textContent = '—';
    changeEl.classList.add('hidden');
    return;
  }
  
  // Calculate total from ETH + tokens
  const ethValue = parseFloat(state.balance) * 2450; // Mock price
  const totalValue = ethValue + 1240 + 450 + 560; // Mock token values
  
  valueEl.textContent = formatCurrency(totalValue);
  
  // Mock 24h change
  const change = 823.45;
  const changePct = 7.1;
  changeEl.textContent = `+${formatCurrency(change)} (+${changePct}%) 24h`;
  changeEl.className = 'portfolio-change positive';
  changeEl.classList.remove('hidden');
}

export async function renderTokens(state) {
  const tbody = document.getElementById('token-list');
  
  if (!state.isConnected) {
    tbody.innerHTML = `
      <tr><td colspan="4">
        <div class="empty-state">
          <div class="empty-state-icon">◈</div>
          Connect your wallet to view balances
        </div>
      </td></tr>
    `;
    return;
  }
  
  const provider = getProvider();
  const rows = [];
  
  // ETH (native)
  const ethBalance = parseFloat(state.balance);
  const ethValue = ethBalance * 2450;
  rows.push(renderTokenRow({
    symbol: 'ETH',
    name: 'Ethereum',
    balance: ethBalance,
    value: ethValue,
    change: 2.4,
    iconClass: 'eth'
  }));
  
  // Mock other tokens for now (would fetch real balances via provider)
  const mockBalances = [
    { symbol: 'USDC', name: 'USD Coin', balance: 1240.00, value: 1240.00, change: 0.0, iconClass: 'usdc' },
    { symbol: 'USDT', name: 'Tether', balance: 500.00, value: 500.00, change: 0.01, iconClass: 'usdt' },
    { symbol: 'WBTC', name: 'Wrapped Bitcoin', balance: 0.0083, value: 560.32, change: -1.2, iconClass: 'wbtc' },
    { symbol: 'LINK', name: 'Chainlink', balance: 31.69, value: 450.00, change: 5.6, iconClass: 'link' }
  ];
  
  for (const token of mockBalances) {
    rows.push(renderTokenRow(token));
  }
  
  tbody.innerHTML = rows.join('');
}

function renderTokenRow(token) {
  const changeClass = token.change >= 0 ? 'positive' : 'negative';
  const changeSign = token.change >= 0 ? '+' : '';
  
  return `
    <tr>
      <td>
        <div class="token-cell">
          <div class="token-icon ${token.iconClass}">${token.symbol[0]}</div>
          <div class="token-info">
            <span class="token-symbol">${token.symbol}</span>
            <span class="token-name">${token.name}</span>
          </div>
        </div>
      </td>
      <td class="token-balance">${formatNumber(token.balance)} ${token.symbol}</td>
      <td class="token-value">${formatCurrency(token.value)}</td>
      <td class="token-change ${changeClass}">${changeSign}${token.change}%</td>
    </tr>
  `;
}

export async function renderTransactions(state) {
  const tbody = document.getElementById('tx-list');
  
  if (!state.isConnected) {
    tbody.innerHTML = `
      <tr><td colspan="4">
        <div class="empty-state">
          <div class="empty-state-icon">◈</div>
          No transactions to display
        </div>
      </td></tr>
    `;
    return;
  }
  
  // Mock transactions (would fetch from Etherscan API or subgraph)
  const txs = [
    {
      type: 'send',
      description: `0.5 ETH → ${formatAddress('0x7a2f3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a')}`,
      time: Date.now() - 120000, // 2 min ago
      status: 'Confirmed'
    },
    {
      type: 'receive',
      description: `120 USDC ← ${formatAddress('0x9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e')}`,
      time: Date.now() - 3600000, // 1 hour ago
      status: 'Confirmed'
    },
    {
      type: 'approve',
      description: 'Approve LINK spender',
      time: Date.now() - 10800000, // 3 hours ago
      status: 'Confirmed'
    },
    {
      type: 'send',
      description: `0.12 ETH → ${formatAddress('0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b')}`,
      time: Date.now() - 86400000, // 1 day ago
      status: 'Confirmed'
    }
  ];
  
  tbody.innerHTML = txs.map(tx => `
    <tr>
      <td><span class="tx-type ${tx.type}">${tx.type}</span></td>
      <td class="tx-hash">${tx.description}</td>
      <td class="tx-time">${timeAgo(tx.time)}</td>
      <td class="tx-status">${tx.status}</td>
    </tr>
  `).join('');
}