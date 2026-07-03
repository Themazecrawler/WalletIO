// ============================================
// Network Info & Transaction Details
// ============================================

import { getProvider } from './wallet.js';
import { formatNumber } from './ui.js';

export async function renderNetworkInfo(state) {
  const provider = getProvider();
  
  document.getElementById('net-name').textContent = state.networkName || '—';
  document.getElementById('net-chain-id').textContent = state.chainId || '—';
  document.getElementById('net-currency').textContent = 'ETH';
  
  if (!provider) {
    document.getElementById('net-block').textContent = '—';
    document.getElementById('net-gas').textContent = '—';
    document.getElementById('net-rpc').textContent = '—';
    return;
  }
  
  try {
    const blockNumber = await provider.getBlockNumber();
    const feeData = await provider.getFeeData();
    
    document.getElementById('net-block').textContent = formatNumber(blockNumber);
    
    const gasGwei = feeData.gasPrice ? (Number(feeData.gasPrice) / 1e9).toFixed(2) : '—';
    document.getElementById('net-gas').textContent = `${gasGwei} Gwei`;
    
    document.getElementById('net-rpc').textContent = 'Connected';
    document.getElementById('net-rpc').style.color = 'var(--positive)';
    
  } catch (err) {
    document.getElementById('net-block').textContent = '—';
    document.getElementById('net-gas').textContent = '—';
    document.getElementById('net-rpc').textContent = 'Error';
    document.getElementById('net-rpc').style.color = 'var(--negative)';
  }
}