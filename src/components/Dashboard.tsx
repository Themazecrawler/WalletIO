import React, { useState } from 'react';
import { Wallet, Bolt, Flame, Eye, EyeOff, PlusCircle, ArrowUpRight, CheckCircle2, Clock } from 'lucide-react';
import { Transaction } from '../types';

interface DashboardProps {
  transactions: Transaction[];
  portfolioValue: number;
  onAddTransaction: (tx: Transaction) => void;
  onNavigateToHistory: () => void;
  isBiometricAuthenticated: boolean;
}

export default function Dashboard({ 
  transactions, 
  portfolioValue, 
  onAddTransaction, 
  onNavigateToHistory, 
  isBiometricAuthenticated 
}: DashboardProps) {
  const [hideBalance, setHideBalance] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSubtitle, setNewSubtitle] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newCategory, setNewCategory] = useState('P2P');

  // Selected chart filter state
  const [activeFilter, setActiveFilter] = useState<'1D' | '1W' | '1M' | 'ALL'>('1D');
  // Selected point index state for hover readout
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Filter data configuration map (Percentage offsets relative to final value)
  const TREND_DATA = {
    '1D': [
      { label: '00:00', pct: -2.3 },
      { label: '04:00', pct: -1.8 },
      { label: '08:00', pct: -2.9 },
      { label: '12:00', pct: -0.9 },
      { label: '16:00', pct: 0.6 },
      { label: '20:00', pct: 1.2 },
      { label: '22:00', pct: 0.3 },
      { label: '23:59', pct: 0 }
    ],
    '1W': [
      { label: 'MON', pct: -5.2 },
      { label: 'TUE', pct: -3.8 },
      { label: 'WED', pct: -6.1 },
      { label: 'THU', pct: -2.5 },
      { label: 'FRI', pct: 0.8 },
      { label: 'SAT', pct: -1.0 },
      { label: 'SUN', pct: 0 }
    ],
    '1M': [
      { label: 'WK 1', pct: -9.5 },
      { label: 'WK 2', pct: -7.1 },
      { label: 'WK 3', pct: -11.2 },
      { label: 'WK 4', pct: -5.5 },
      { label: 'WK 5', pct: -2.0 },
      { label: 'WK 6', pct: 1.8 },
      { label: 'WK 7', pct: 0 }
    ],
    'ALL': [
      { label: 'Q1-25', pct: -18.4 },
      { label: 'Q2-25', pct: -14.2 },
      { label: 'Q3-25', pct: -22.5 },
      { label: 'Q4-25', pct: -11.8 },
      { label: 'Q1-26', pct: -5.2 },
      { label: 'Q2-26', pct: 3.5 },
      { label: 'NOW', pct: 0 }
    ]
  };

  const filterData = TREND_DATA[activeFilter];
  const pcts = filterData.map(d => d.pct);
  const minPct = Math.min(...pcts) - 0.5;
  const maxPct = Math.max(...pcts) + 0.5;
  const pctRange = maxPct - minPct || 1;

  // Scale data points to SVG coordinate space (viewBox: 0 0 380 135)
  const points = filterData.map((d, i) => {
    const x = 15 + (i * (350 / (filterData.length - 1)));
    const y = 115 - ((d.pct - minPct) / pctRange) * 85;
    const value = portfolioValue * (1 + d.pct / 100);
    return { x, y, label: d.label, pct: d.pct, value };
  });

  const pointsStr = points.map(p => `${p.x},${p.y}`).join(' ');
  const areaPath = `M 15,125 L ${pointsStr} L ${points[points.length - 1].x},125 Z`;
  const linePath = `M ${pointsStr}`;

  // Readout index calculations
  const activeIndex = hoveredIndex !== null ? hoveredIndex : points.length - 1;
  const activePoint = points[activeIndex];
  const isPositiveOffset = activePoint.pct >= 0;

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newAmount) return;

    const amt = parseFloat(newAmount);
    const newTx: Transaction = {
      id: `tx-custom-${Date.now()}`,
      title: newTitle,
      subtitle: newSubtitle || 'WalletIO Node',
      amount: amt,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: 'Today',
      category: newCategory,
      status: 'SECURED',
      type: amt >= 0 ? 'inbound' : 'outbound',
      iconName: amt >= 0 ? 'bolt' : 'monitoring'
    };

    onAddTransaction(newTx);
    setShowAddModal(false);
    setNewTitle('');
    setNewSubtitle('');
    setNewAmount('');
    setNewCategory('P2P');
  };

  return (
    <div className="flex flex-col gap-6 p-6 animate-fade-in pb-10">
      
      {/* Vault Card Section */}
      <section className="relative">
        <div className="glass-card shimmer relative overflow-hidden rounded-[24px] p-6 flex flex-col justify-between aspect-[1.6/1] border border-cyan-500/20 bg-gradient-to-br from-zinc-900/90 to-zinc-950/95 shadow-[0_0_30px_rgba(0,240,255,0.05)]">
          
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <p className="font-mono text-[10px] text-slate-400 uppercase tracking-[0.2em]">Portfolio Value</p>
                <button 
                  onClick={() => setHideBalance(!hideBalance)} 
                  className="text-slate-500 hover:text-cyan-400 transition-colors"
                >
                  {hideBalance ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                </button>
              </div>
              <h2 className="font-display text-3xl leading-tight font-bold text-slate-100 tracking-tight drop-shadow-[0_0_12px_rgba(0,240,255,0.3)]">
                {hideBalance ? '••••••' : `$${portfolioValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              </h2>
            </div>
            
            <div className="p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-500/20 text-[#00f0ff]">
              <Wallet className="w-5 h-5 fill-cyan-500/10" />
            </div>
          </div>

          <div className="flex justify-between items-end mt-4">
            <div className="flex gap-5">
              <div className="flex flex-col">
                <span className="font-mono text-[9px] text-slate-500 uppercase">Yield</span>
                <span className="text-xs font-mono font-semibold text-emerald-400">+4.2%</span>
              </div>
              <div className="flex flex-col">
                <span className="font-mono text-[9px] text-slate-500 uppercase">Limit</span>
                <span className="text-xs font-mono font-semibold text-slate-300">∞</span>
              </div>
            </div>

            {/* Badges */}
            <div className="flex -space-x-1.5">
              <div className="w-7 h-7 rounded-full border border-zinc-900 bg-purple-950/60 flex items-center justify-center text-purple-400 shadow-sm" title="WalletIO Coin native support">
                <Flame className="w-3.5 h-3.5" />
              </div>
              <div className="w-7 h-7 rounded-full border border-zinc-900 bg-cyan-950/60 flex items-center justify-center text-cyan-400 shadow-sm" title="Lightning fast settle enabled">
                <Bolt className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </div>
        
        {/* Glow ambient background */}
        <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-cyan-500/5 blur-[60px] rounded-full pointer-events-none" />
      </section>

      {/* Portfolio Trend (CRT Glow Shader Chart) */}
      <section className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="font-display text-lg font-semibold text-slate-100">Portfolio Trend</h3>
          
          {/* CRT Filter Selection Button Row */}
          <div className="flex gap-1.5 bg-zinc-950/60 p-0.5 rounded-lg border border-zinc-800/80">
            {(['1D', '1W', '1M', 'ALL'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => {
                  setActiveFilter(filter);
                  setHoveredIndex(null);
                }}
                className={`px-2.5 py-1 rounded-md font-mono text-[9px] font-bold tracking-wider transition-all duration-200 ${
                  activeFilter === filter
                    ? 'bg-[#00f0ff]/10 text-[#00f0ff] border border-[#00f0ff]/30 shadow-[0_0_8px_rgba(0,240,255,0.25)]'
                    : 'text-slate-500 hover:text-slate-300 border border-transparent'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
        
        {/* CRT Glow Screen Container */}
        <div className="crt-screen rounded-2xl p-4 relative border border-cyan-500/30 shadow-[0_0_15px_rgba(0,240,255,0.15)] bg-[#0C0D12] overflow-hidden select-none">
          {/* Real-time CRT Terminal HUD bar */}
          <div className="flex justify-between items-center mb-3 font-mono text-[9px] text-[#00f0ff]/70 tracking-widest border-b border-cyan-500/15 pb-1.5">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              CRT_TERMINAL::FEED_ACTIVE
            </span>
            <span className="opacity-60">RANGE: {activeFilter}</span>
          </div>

          {/* Interactive price readout HUD */}
          <div className="flex justify-between items-end mb-4">
            <div>
              <p className="font-mono text-[9px] text-slate-500 uppercase tracking-wider">
                PORTFOLIO VALUE @ {activePoint.label}
              </p>
              <h4 className="font-display text-2xl font-bold text-slate-100 tracking-tight">
                {hideBalance ? '••••••' : `$${activePoint.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              </h4>
            </div>
            
            <div className={`flex items-center gap-1 px-2 py-0.5 rounded border text-[9px] font-mono font-bold ${
              isPositiveOffset 
                ? 'bg-emerald-950/30 border-emerald-500/20 text-emerald-400' 
                : 'bg-rose-950/30 border-rose-500/20 text-rose-400'
            }`}>
              {isPositiveOffset ? '+' : ''}{activePoint.pct.toFixed(2)}%
            </div>
          </div>

          {/* Graph SVG canvas */}
          <div className="relative h-28 w-full mt-2">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 380 135" preserveAspectRatio="none">
              <defs>
                {/* CRT Glowing Line filter definition */}
                <filter id="crt-glow-filter" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3.5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                
                {/* Area Gradient */}
                <linearGradient id="crtAreaGradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="rgba(0, 240, 255, 0.20)" />
                  <stop offset="100%" stopColor="rgba(0, 240, 255, 0)" />
                </linearGradient>
              </defs>

              {/* Grid backdrop lines */}
              <g stroke="rgba(0, 240, 255, 0.05)" strokeWidth="0.5">
                <line x1="0" y1="30" x2="380" y2="30" />
                <line x1="0" y1="65" x2="380" y2="65" />
                <line x1="0" y1="100" x2="380" y2="100" />
                <line x1="95" y1="0" x2="95" y2="135" />
                <line x1="190" y1="0" x2="190" y2="135" />
                <line x1="285" y1="0" x2="285" y2="135" />
              </g>

              {/* Gradient filled area */}
              <path d={areaPath} fill="url(#crtAreaGradient)" />

              {/* Glowing Line Stroke */}
              <path 
                d={linePath} 
                fill="none" 
                stroke="#00f0ff" 
                strokeWidth="2.5" 
                strokeLinecap="round" 
                filter="url(#crt-glow-filter)"
                className="crt-phosphor"
              />

              {/* Interactive nodes and hotspots */}
              {points.map((p, idx) => (
                <g key={idx}>
                  {/* Point circle marker */}
                  <circle 
                    cx={p.x} 
                    cy={p.y} 
                    r={activeIndex === idx ? 4.5 : 2} 
                    fill={activeIndex === idx ? '#00f0ff' : 'rgba(0, 240, 255, 0.4)'}
                    className="transition-all duration-150"
                  />
                  
                  {/* Outer pulsating glow indicator */}
                  {activeIndex === idx && (
                    <circle 
                      cx={p.x} 
                      cy={p.y} 
                      r={8} 
                      fill="none" 
                      stroke="#00f0ff" 
                      strokeWidth="1.5" 
                      className="animate-ping opacity-50"
                    />
                  )}

                  {/* Hotspot slice for interactive hover tracker */}
                  <rect
                    x={p.x - 20}
                    y={0}
                    width={40}
                    height={135}
                    fill="transparent"
                    className="cursor-crosshair"
                    onMouseEnter={() => setHoveredIndex(idx)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  />
                </g>
              ))}
            </svg>
          </div>

          {/* X axis labels */}
          <div className="flex justify-between font-mono text-[8px] text-slate-500 mt-2 px-1">
            <span>{points[0].label}</span>
            <span>{points[Math.floor(points.length / 2)].label}</span>
            <span>{points[points.length - 1].label}</span>
          </div>
        </div>
      </section>

      {/* Floating Action Button (FAB) to Add Custom Transaction Mock */}
      <div className="absolute bottom-24 right-6 z-40">
        <button 
          onClick={() => setShowAddModal(true)}
          className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-fuchsia-500 flex items-center justify-center shadow-[0_0_15px_rgba(0,240,255,0.4)] hover:scale-105 active:scale-95 transition-transform"
          title="Simulate incoming/outgoing transaction"
        >
          <span className="text-slate-900 font-bold text-lg">+</span>
        </button>
      </div>

      {/* Add Transaction Modal overlay */}
      {showAddModal && (
        <div className="absolute inset-0 bg-[#0A0B10]/95 backdrop-blur-xl z-50 flex flex-col justify-center p-6 animate-fade-in">
          <div className="glass-card p-6 rounded-2xl border border-cyan-500/20 bg-zinc-950/80 max-w-sm mx-auto w-full space-y-4">
            <div className="flex justify-between items-center border-b border-cyan-500/10 pb-3">
              <h4 className="font-display font-bold text-md text-[#00f0ff]">Simulate Transaction</h4>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-200 font-mono text-xs"
              >
                CLOSE
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block font-mono text-[10px] text-slate-400 uppercase mb-1">Title</label>
                <input 
                  type="text" 
                  value={newTitle} 
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Amazon Web Services"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-400"
                  required
                />
              </div>

              <div>
                <label className="block font-mono text-[10px] text-slate-400 uppercase mb-1">Subtitle</label>
                <input 
                  type="text" 
                  value={newSubtitle} 
                  onChange={(e) => setNewSubtitle(e.target.value)}
                  placeholder="e.g. AWS Cloud • 12:44"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block font-mono text-[10px] text-slate-400 uppercase mb-1">Amount ($ USD, use negative for outbound)</label>
                <input 
                  type="number" 
                  step="0.01"
                  value={newAmount} 
                  onChange={(e) => setNewAmount(e.target.value)}
                  placeholder="-120.50"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-400 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block font-mono text-[10px] text-slate-400 uppercase mb-1">Category</label>
                <select 
                  value={newCategory} 
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-400"
                >
                  <option value="P2P">P2P Beam</option>
                  <option value="Stock">Stock Purchase</option>
                  <option value="Rent">Rent</option>
                  <option value="Coffee">Coffee</option>
                  <option value="Market">Market Order</option>
                </select>
              </div>

              <button 
                type="submit"
                className="w-full h-11 bg-[#00f0ff] hover:bg-cyan-400 text-slate-900 font-bold rounded-xl text-sm transition-colors mt-2"
              >
                Inject Simulator Activity
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
