import React, { useState } from 'react';
import { ShieldAlert, ArrowUpRight, ArrowDownLeft, Shield, Lock, Coins, TrendingUp, Sparkles, CheckCircle2 } from 'lucide-react';
import { CryptoAsset, Transaction } from '../types';

interface CryptoVaultProps {
  assets: CryptoAsset[];
  transactions: Transaction[];
  onUpdateAssetBalance: (assetId: string, newBalance: number) => void;
  onShowNotification: (msg: string) => void;
  onNavigateToHistory: () => void;
}

export default function CryptoVault({ assets, transactions, onUpdateAssetBalance, onShowNotification, onNavigateToHistory }: CryptoVaultProps) {
  const [activeAction, setActiveAction] = useState<'none' | 'deposit' | 'withdraw'>('none');
  const [selectedAssetId, setSelectedAssetId] = useState<string>('asset-btc');
  const [actionAmount, setActionAmount] = useState<string>('');

  // Calculate live total valuation based on assets balance * price
  const totalValuation = assets.reduce((sum, asset) => sum + (asset.balance * asset.priceUsd), 0);

  const handleActionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(actionAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      onShowNotification('Enter a valid positive number.');
      return;
    }

    const currentAsset = assets.find(a => a.id === selectedAssetId);
    if (!currentAsset) return;

    if (activeAction === 'withdraw' && currentAsset.balance < parsedAmount) {
      onShowNotification(`Insufficient ${currentAsset.symbol} balance inside the secure vault.`);
      return;
    }

    const delta = activeAction === 'deposit' ? parsedAmount : -parsedAmount;
    const newBal = currentAsset.balance + delta;

    onUpdateAssetBalance(selectedAssetId, newBal);
    onShowNotification(
      `Successfully ${activeAction === 'deposit' ? 'deposited' : 'withdrawn'} ${parsedAmount} ${currentAsset.symbol} ${
        activeAction === 'deposit' ? 'into' : 'from'
      } the Quantum Vault!`
    );

    // Reset
    setActiveAction('none');
    setActionAmount('');
  };

  return (
    <div className="flex flex-col gap-6 p-6 animate-fade-in pb-10">
      
      {/* Total Valuation Header */}
      <section className="glass-card rounded-[24px] p-6 shimmer relative overflow-hidden bg-gradient-to-br from-zinc-900/95 to-zinc-950/90 border border-cyan-500/20 shadow-[0_4px_30px_rgba(0,240,255,0.05)]">
        <div className="flex justify-between items-start mb-4">
          <div className="space-y-1">
            <p className="font-mono text-[10px] text-slate-400 uppercase tracking-widest">Total Valuation</p>
            <h1 className="font-display text-3xl font-bold text-[#00f0ff] tracking-tight">
              ${totalValuation.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h1>
          </div>
          
          <div className="bg-emerald-950/40 px-2 py-1 rounded border border-emerald-500/30 flex items-center gap-1 text-emerald-400">
            <TrendingUp className="w-3.5 h-3.5" />
            <span className="font-mono text-[11px] font-semibold">+4.2%</span>
          </div>
        </div>

        {/* Status indicator row */}
        <div className="flex items-center gap-2 mt-6">
          <div className="flex -space-x-1.5">
            <div className="w-6 h-6 rounded-full border border-zinc-900 bg-cyan-950/60 flex items-center justify-center text-cyan-400">
              <Shield className="w-3.5 h-3.5" />
            </div>
            <div className="w-6 h-6 rounded-full border border-zinc-900 bg-fuchsia-950/60 flex items-center justify-center text-fuchsia-400">
              <Lock className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="font-mono text-[9px] text-slate-400">Quantum-Encrypted Vault Active</p>
        </div>
      </section>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={() => setActiveAction('deposit')}
          className="flex flex-col items-center justify-center py-5 px-4 rounded-2xl glass-card border-cyan-500/20 hover:border-cyan-400/50 hover:bg-cyan-500/5 transition-all duration-300 active:scale-95 group"
        >
          <div className="w-10 h-10 rounded-full bg-cyan-950/50 border border-cyan-500/20 flex items-center justify-center mb-2.5 text-cyan-400 group-hover:scale-105 transition-transform">
            <ArrowDownLeft className="w-4 h-4" />
          </div>
          <span className="font-mono text-[11px] font-bold text-cyan-400 tracking-wider">DEPOSIT</span>
        </button>

        <button 
          onClick={() => setActiveAction('withdraw')}
          className="flex flex-col items-center justify-center py-5 px-4 rounded-2xl glass-card border-fuchsia-500/20 hover:border-fuchsia-400/50 hover:bg-fuchsia-500/5 transition-all duration-300 active:scale-95 group"
        >
          <div className="w-10 h-10 rounded-full bg-fuchsia-950/50 border border-fuchsia-500/20 flex items-center justify-center mb-2.5 text-fuchsia-400 group-hover:scale-105 transition-transform">
            <ArrowUpRight className="w-4 h-4" />
          </div>
          <span className="font-mono text-[11px] font-bold text-fuchsia-400 tracking-wider">WITHDRAW</span>
        </button>
      </div>

      {/* Assets List */}
      <section className="space-y-3">
        <div className="flex justify-between items-center px-1">
          <h2 className="font-display text-md font-bold text-slate-100">Vault Assets</h2>
          <span className="font-mono text-[10px] text-slate-500">Secure Protocol Ledger</span>
        </div>

        <div className="space-y-2.5">
          {assets.map((asset) => {
            const assetTotalValue = asset.balance * asset.priceUsd;
            return (
              <div 
                key={asset.id}
                className="glass-card rounded-2xl p-4 flex items-center justify-between transition-all hover:bg-zinc-800/20 border-l-4 border-l-cyan-500/40"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${asset.bgClass} border ${asset.borderClass} ${asset.textClass}`}>
                    <Coins className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-display text-sm font-semibold text-slate-100">{asset.name}</h3>
                    <p className="font-mono text-[10px] text-slate-400">
                      {asset.balance.toLocaleString('en-US', { maximumFractionDigits: 4 })} {asset.symbol}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1.5">
                  {/* Miniature Sparkline SVG path */}
                  <div className="w-14 h-5">
                    <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
                      <path 
                        d={asset.sparkline.reduce((pathStr, val, i) => `${pathStr} ${i === 0 ? 'M' : 'L'} ${i * (100 / (asset.sparkline.length - 1))}, ${val}`, '')}
                        fill="none" 
                        stroke={asset.symbol === 'BTC' ? '#F7931A' : asset.symbol === 'ETH' ? '#00f0ff' : '#b600f8'} 
                        strokeWidth="2" 
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                  <span className="font-mono text-xs font-bold text-cyan-400">
                    ${assetTotalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Transaction History Section (Replacing Market Distribution) */}
      <section className="space-y-3">
        <div className="flex justify-between items-center px-1">
          <h2 className="font-display text-md font-bold text-slate-100">Transaction History</h2>
          <button 
            onClick={onNavigateToHistory}
            className="font-mono text-[10px] text-cyan-400 hover:text-cyan-300 uppercase tracking-wider transition-colors"
          >
            View All →
          </button>
        </div>

        <div className="space-y-2.5">
          {transactions.slice(0, 3).map((tx) => {
            const isNegative = tx.amount < 0;
            return (
              <div 
                key={tx.id}
                onClick={onNavigateToHistory}
                className="glass-card rounded-2xl p-4 flex items-center justify-between transition-all hover:bg-zinc-800/20 cursor-pointer border-l-4 border-l-cyan-500/10 hover:border-l-cyan-500/40"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
                    isNegative 
                      ? 'bg-fuchsia-950/20 border-fuchsia-800/20 text-fuchsia-400' 
                      : 'bg-cyan-950/20 border-cyan-800/20 text-cyan-400'
                  }`}>
                    {isNegative ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                  </div>
                  <div>
                    <h3 className="font-display text-sm font-semibold text-slate-100">{tx.title}</h3>
                    <p className="font-mono text-[10px] text-slate-400">
                      {tx.subtitle} • {tx.time}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`font-mono text-xs font-bold ${isNegative ? 'text-fuchsia-400' : 'text-cyan-400'}`}>
                    {isNegative ? '-' : '+'}${Math.abs(tx.amount).toFixed(2)}
                  </span>
                  <p className="font-mono text-[8px] text-slate-500 uppercase tracking-widest mt-0.5">
                    {tx.status}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <button 
          onClick={onNavigateToHistory}
          className="w-full mt-2 py-3 rounded-xl bg-zinc-900/50 border border-zinc-800/80 hover:border-cyan-500/30 text-cyan-400 hover:text-cyan-300 font-mono text-[10px] font-bold uppercase tracking-wider transition-all"
        >
          View More Transactions
        </button>
      </section>

      {/* Action overlay Modal for Deposit/Withdraw */}
      {activeAction !== 'none' && (
        <div className="absolute inset-0 bg-[#0A0B10]/95 backdrop-blur-xl z-50 flex flex-col justify-center p-6 animate-fade-in">
          <div className="glass-card p-6 rounded-2xl border border-cyan-500/20 bg-zinc-950/80 max-w-sm mx-auto w-full space-y-4">
            
            <div className="flex justify-between items-center border-b border-cyan-500/10 pb-3">
              <h4 className="font-display font-bold text-md text-[#00f0ff] uppercase tracking-wider">
                Quantum Vault {activeAction}
              </h4>
              <button 
                onClick={() => setActiveAction('none') || setActionAmount('')}
                className="text-slate-400 hover:text-slate-200 font-mono text-xs"
              >
                CLOSE
              </button>
            </div>

            <form onSubmit={handleActionSubmit} className="space-y-4">
              <div>
                <label className="block font-mono text-[10px] text-slate-400 uppercase mb-1">Select Vault Token</label>
                <div className="grid grid-cols-3 gap-2">
                  {assets.map((asset) => (
                    <button
                      key={asset.id}
                      type="button"
                      onClick={() => setSelectedAssetId(asset.id)}
                      className={`py-2 px-1 text-xs font-mono rounded-lg border text-center transition-all ${
                        selectedAssetId === asset.id
                          ? 'bg-cyan-500/15 border-cyan-400 text-cyan-400 font-bold'
                          : 'bg-zinc-900 border-zinc-800 text-slate-400'
                      }`}
                    >
                      {asset.symbol}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-mono text-[10px] text-slate-400 uppercase mb-1">
                  Amount to {activeAction === 'deposit' ? 'deposit into' : 'withdraw from'} Vault
                </label>
                <div className="relative">
                  <input 
                    type="number" 
                    step="0.0001"
                    value={actionAmount} 
                    onChange={(e) => setActionAmount(e.target.value)}
                    placeholder="0.05"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-3 pr-14 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-cyan-400 font-mono"
                    required
                  />
                  <span className="absolute right-3 top-3 font-mono text-xs text-slate-400">
                    {assets.find(a => a.id === selectedAssetId)?.symbol}
                  </span>
                </div>
                <p className="font-mono text-[9px] text-slate-500 mt-1">
                  Available in Wallet: {assets.find(a => a.id === selectedAssetId)?.balance.toLocaleString('en-US', { maximumFractionDigits: 4 })} {assets.find(a => a.id === selectedAssetId)?.symbol}
                </p>
              </div>

              <button 
                type="submit"
                className="w-full h-11 bg-[#00f0ff] hover:bg-cyan-400 text-slate-900 font-bold rounded-xl text-sm transition-colors mt-2"
              >
                Confirm Quantum {activeAction === 'deposit' ? 'Deposit' : 'Withdrawal'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
