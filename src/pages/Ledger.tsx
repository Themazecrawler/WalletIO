import React, { useState } from 'react';
import {
  Search,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  AlertTriangle,
  FileSpreadsheet,
  ChevronLeft
} from 'lucide-react';
import { useWallet } from '../store/walletStore';
import { filterTransactions } from '../lib/filterTransactions';
import { formatTransactionAmount } from '../lib/format';

interface LedgerProps {
  onBack: () => void;
  showNotification: (msg: string) => void;
}

export default function Ledger({ onBack, showNotification }: LedgerProps) {
  const { transactions } = useWallet();
  const [search, setSearch] = useState('');
  const [assetFilter, setAssetFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [isExporting, setIsExporting] = useState(false);

  const filteredTransactions = filterTransactions(transactions, {
    search,
    asset: assetFilter,
    type: typeFilter,
  });

  const triggerLedgerExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      showNotification('Secure audit ledger exported to CSV file successfully!');
    }, 1500);
  };

  return (
    <div className="flex flex-col gap-6 p-6 animate-fade-in pb-10">
      {/* Title block with back button */}
      <div className="flex justify-between items-center px-1">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-cyan-400/40 text-slate-400 hover:text-slate-200 transition-colors"
            title="Back"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="font-display text-xl font-bold text-slate-100">Transaction History</h2>
            <p className="font-mono text-[9px] text-slate-500 uppercase mt-0.5 tracking-wider">SECURE TRACE HISTORY</p>
          </div>
        </div>

        <button
          onClick={triggerLedgerExport}
          disabled={isExporting}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-cyan-400/40 hover:bg-zinc-800 text-xs font-mono text-cyan-400 transition-all focus:outline-none"
        >
          {isExporting ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <FileSpreadsheet className="w-3.5 h-3.5" />
          )}
          <span>EXPORT CSV</span>
        </button>
      </div>

      {/* Filtering controls panel */}
      <div className="glass-card p-4 rounded-xl space-y-3 bg-zinc-900/20">
        {/* Search Input bar */}
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search transactions, tags..."
            className="w-full bg-zinc-950/70 border border-zinc-800/80 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
          />
        </div>

        {/* Multi filters row */}
        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <label className="block font-mono text-[8px] text-slate-500 uppercase mb-1">Type</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800/80 rounded-lg p-2 text-[11px] font-mono text-slate-300 focus:outline-none"
            >
              <option value="all">All directions</option>
              <option value="inbound">Inbound</option>
              <option value="outbound">Outbound</option>
            </select>
          </div>

          <div>
            <label className="block font-mono text-[8px] text-slate-500 uppercase mb-1">Asset Filter</label>
            <select
              value={assetFilter}
              onChange={(e) => setAssetFilter(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800/80 rounded-lg p-2 text-[11px] font-mono text-slate-300 focus:outline-none focus:border-cyan-500"
            >
              <option value="all">All assets</option>
              <option value="BTC">BTC (Bitcoin)</option>
              <option value="ETH">ETH (Ethereum)</option>
              <option value="WIO">WIO (WalletIO Coin)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Ledger dynamic lists block */}
      <div className="space-y-2.5">
        <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 px-1">
          <span>RECORD ({filteredTransactions.length} items)</span>
          <span>SECURED LEVEL</span>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="p-8 text-center rounded-xl border border-dashed border-zinc-800">
            <AlertTriangle className="w-6 h-6 text-slate-600 mx-auto mb-2" />
            <p className="text-xs text-slate-500 font-mono">No transaction traces found for queries.</p>
          </div>
        ) : (
          filteredTransactions.map((tx) => {
            const isNegative = tx.amount < 0;
            return (
              <div
                key={tx.id}
                className="glass-card p-3.5 rounded-xl flex items-center justify-between hover:bg-zinc-800/10 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center border text-xs ${
                    tx.category === 'Stock' ? 'bg-purple-950/20 border-purple-800/20 text-purple-400' :
                    tx.category === 'Rent' ? 'bg-emerald-950/20 border-emerald-800/20 text-emerald-400' :
                    tx.category === 'Coffee' ? 'bg-amber-950/20 border-amber-800/20 text-amber-500' :
                    'bg-cyan-950/20 border-cyan-800/20 text-cyan-400'
                  }`}>
                    {tx.type === 'inbound' ? (
                      <ArrowDownLeft className="w-3.5 h-3.5" />
                    ) : (
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    )}
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-slate-100">{tx.title}</p>
                    <p className="font-mono text-[9px] text-slate-400">{tx.subtitle} • {tx.time}</p>
                  </div>
                </div>

                <div className="text-right">
                  <p className={`font-mono text-xs font-bold ${isNegative ? 'text-slate-200' : 'text-[#00f0ff]'}`}>
                    {formatTransactionAmount(tx.amount, tx.currencySymbol)}
                  </p>
                  <span className="inline-block px-1.5 py-0.5 rounded text-[8px] bg-cyan-950/40 text-[#00f0ff] border border-cyan-500/20 font-mono tracking-wider font-semibold uppercase mt-1">
                    {tx.status}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
