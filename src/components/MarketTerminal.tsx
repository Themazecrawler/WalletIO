import React, { useState, useEffect } from 'react';
import { Activity, Flame, TrendingUp, TrendingDown, HelpCircle, Newspaper, ArrowUpRight, DollarSign, Loader2 } from 'lucide-react';

interface MarketTerminalProps {
  onShowNotification: (msg: string) => void;
  liquidityBalance: number;
  onUpdateLiquidity: (newVal: number) => void;
}

export default function MarketTerminal({ onShowNotification, liquidityBalance, onUpdateLiquidity }: MarketTerminalProps) {
  const [activeInterval, setActiveInterval] = useState<'1H' | '4H' | '1D'>('4H');
  const [showSwapDesk, setShowSwapDesk] = useState(false);
  const [sellAsset, setSellAsset] = useState('USD');
  const [buyAsset, setBuyAsset] = useState('AUR');
  const [swapAmount, setSwapAmount] = useState('');
  const [swapLoading, setSwapSwapLoading] = useState(false);

  // Simulated live fluctuating pricing state
  const [aurPrice, setAurPrice] = useState(0.18);
  const [btcPrice, setBtcPrice] = useState(64120.50);
  const [ethPrice, setEthPrice] = useState(3481.12);
  const [solPrice, setSolPrice] = useState(145.22);

  useEffect(() => {
    const priceInterval = setInterval(() => {
      // Subtle fluctuations
      setAurPrice(prev => Math.max(0.12, prev + (Math.random() - 0.5) * 0.005));
      setBtcPrice(prev => prev + (Math.random() - 0.5) * 45);
      setEthPrice(prev => prev + (Math.random() - 0.5) * 2.5);
      setSolPrice(prev => prev + (Math.random() - 0.5) * 0.4);
    }, 3000);
    return () => clearInterval(priceInterval);
  }, []);

  const handleSwapExecute = (e: React.FormEvent) => {
    e.preventDefault();
    const amountVal = parseFloat(swapAmount);
    if (isNaN(amountVal) || amountVal <= 0) {
      onShowNotification('Please enter a valid positive trade amount.');
      return;
    }

    if (sellAsset === 'USD' && liquidityBalance < amountVal) {
      onShowNotification('Insufficient USD Liquidity balance inside your wallet.');
      return;
    }

    setSwapSwapLoading(true);

    setTimeout(() => {
      setSwapSwapLoading(false);
      setShowSwapDesk(false);

      if (sellAsset === 'USD') {
        const boughtCoins = amountVal / aurPrice;
        onUpdateLiquidity(liquidityBalance - amountVal);
        onShowNotification(`Succeeded! Swapped $${amountVal.toFixed(2)} for ${boughtCoins.toFixed(2)} AUR instantly!`);
      } else {
        const soldCoinsValue = amountVal * aurPrice;
        onUpdateLiquidity(liquidityBalance + soldCoinsValue);
        onShowNotification(`Succeeded! Sold ${amountVal} AUR for $${soldCoinsValue.toFixed(2)} USD!`);
      }
      setSwapAmount('');
    }, 1800);
  };

  return (
    <div className="flex flex-col gap-6 p-6 animate-fade-in pb-10">
      
      {/* Candlestick / Market Feed Header */}
      <section className="glass-card rounded-[24px] p-5 relative overflow-hidden bg-zinc-900/35 border border-cyan-500/15">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="font-display text-lg font-bold text-slate-100">AUR/USD</span>
              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-emerald-950/40 text-emerald-400 border border-emerald-800/30">
                +4.28%
              </span>
            </div>
            
            <div className="font-mono text-[9px] text-[#00f0ff] flex items-center gap-1.5 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              LIVE FEED • CYBER-TERM v7
            </div>
          </div>

          <div className="flex gap-1.5 bg-zinc-950/60 p-1 rounded-xl border border-zinc-800/40">
            {['1H', '4H', '1D'].map((interval) => (
              <button
                key={interval}
                onClick={() => setActiveInterval(interval as '1H' | '4H' | '1D')}
                className={`px-2.5 py-1 rounded-lg font-mono text-[10px] transition-all focus:outline-none ${
                  activeInterval === interval
                    ? 'bg-cyan-500/20 text-[#00f0ff] border border-cyan-500/20 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {interval}
              </button>
            ))}
          </div>
        </div>

        {/* Visual Chart Area */}
        <div className="h-44 relative bg-zinc-950/20 border border-zinc-800/20 rounded-xl overflow-hidden mt-3 p-4 flex items-end justify-between gap-1">
          {/* Mock vertical grid lines */}
          <div className="absolute inset-0 grid grid-cols-5 divide-x divide-zinc-800/10 pointer-events-none" />
          
          {/* simulated candlesticks */}
          {[
            { high: 80, low: 20, bodyTop: 40, bodyHeight: 30, color: 'bg-rose-500/80 shadow-[0_0_8px_rgba(244,63,94,0.3)]' },
            { high: 100, low: 30, bodyTop: 35, bodyHeight: 50, color: 'bg-emerald-500/80 shadow-[0_0_8px_rgba(16,185,129,0.3)]' },
            { high: 70, low: 10, bodyTop: 45, bodyHeight: 20, color: 'bg-rose-500/80 shadow-[0_0_8px_rgba(244,63,94,0.3)]' },
            { high: 120, low: 40, bodyTop: 25, bodyHeight: 65, color: 'bg-emerald-500/80 shadow-[0_0_8px_rgba(16,185,129,0.3)]' },
            { high: 90, low: 50, bodyTop: 30, bodyHeight: 40, color: 'bg-emerald-500/80 shadow-[0_0_8px_rgba(16,185,129,0.3)]' },
          ].map((bar, i) => (
            <div key={i} className="flex-1 flex flex-col items-center relative h-full justify-center">
              {/* High / Low line */}
              <div className="w-0.5 bg-zinc-700/60 absolute top-2 bottom-2" />
              {/* Main candle body */}
              <div 
                className={`w-4 rounded-sm absolute ${bar.color}`} 
                style={{ top: `${bar.bodyTop}px`, height: `${bar.bodyHeight}px` }}
              />
            </div>
          ))}

          {/* Real-time O/H/L/C Overlay */}
          <div className="absolute top-3 right-3 font-mono text-[9px] text-slate-400/80 text-right leading-relaxed select-none">
            <div>O: 42,392.12</div>
            <div>H: 43,105.00</div>
            <div>L: 41,980.50</div>
            <div className="text-emerald-400">C: 42,912.80</div>
          </div>

          {/* Glowing scanner horizontal guide bar */}
          <div className="absolute left-0 right-0 h-[1px] bg-cyan-400/30 shadow-[0_0_12px_rgba(0,240,255,0.7)] animate-bounce" style={{ top: '40%' }} />
        </div>

        {/* HUD summary */}
        <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-zinc-800/40 text-center select-none">
          <div className="flex flex-col">
            <span className="font-mono text-[9px] text-slate-500 uppercase">Vol (24h)</span>
            <span className="font-display text-sm font-bold text-slate-200">$1.24B</span>
          </div>
          <div className="flex flex-col border-x border-zinc-800/40">
            <span className="font-mono text-[9px] text-slate-500 uppercase">Market Cap</span>
            <span className="font-display text-sm font-bold text-slate-200">$84.9B</span>
          </div>
          <div className="flex flex-col">
            <span className="font-mono text-[9px] text-slate-500 uppercase">Sentiment</span>
            <span className="font-display text-sm font-bold text-emerald-400 uppercase">BULLISH</span>
          </div>
        </div>
      </section>

      {/* Trending Assets Section */}
      <section className="space-y-3">
        <h3 className="font-display text-md font-bold text-slate-100 flex items-center gap-1.5 px-1">
          <Activity className="w-4 h-4 text-cyan-400" />
          Trending Assets
        </h3>

        <div className="space-y-2">
          {/* BTC */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/40 border border-zinc-800/30 hover:bg-zinc-800/25 transition-all cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-orange-950/20 border border-orange-900/30 flex items-center justify-center text-orange-400 font-bold">
                B
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-slate-100">Bitcoin</span>
                <span className="font-mono text-[9px] text-slate-400">BTC</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs font-mono font-bold text-slate-200">
                ${btcPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="font-mono text-[10px] text-emerald-400 flex items-center justify-end gap-0.5">
                <TrendingUp className="w-2.5 h-2.5" /> +2.15%
              </div>
            </div>
          </div>

          {/* ETH */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/40 border border-zinc-800/30 hover:bg-zinc-800/25 transition-all cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-cyan-950/20 border border-cyan-900/30 flex items-center justify-center text-cyan-400 font-bold">
                E
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-slate-100">Ethereum</span>
                <span className="font-mono text-[9px] text-slate-400">ETH</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs font-mono font-bold text-slate-200">
                ${ethPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="font-mono text-[10px] text-rose-400 flex items-center justify-end gap-0.5">
                <TrendingDown className="w-2.5 h-2.5" /> -0.45%
              </div>
            </div>
          </div>

          {/* SOL */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/40 border border-zinc-800/30 hover:bg-zinc-800/25 transition-all cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-950/20 border border-emerald-900/30 flex items-center justify-center text-[#26f979] font-bold">
                S
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-slate-100">Solana</span>
                <span className="font-mono text-[9px] text-slate-400">SOL</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs font-mono font-bold text-slate-200">
                ${solPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="font-mono text-[10px] text-emerald-400 flex items-center justify-end gap-0.5">
                <TrendingUp className="w-2.5 h-2.5" /> +12.80%
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Market News Bento */}
      <section className="grid grid-cols-2 gap-4">
        <div className="glass-card p-4 rounded-2xl bg-zinc-900/40 hover:bg-zinc-800/20 transition-all cursor-pointer">
          <div className="h-20 rounded-lg overflow-hidden relative mb-2.5 bg-zinc-950">
            <img 
              className="w-full h-full object-cover opacity-80" 
              alt="Crypto hardware render"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuA66sB5Qh2WwrBHKDFcSIuWXbj09oYsPzzBckPZH6nsrqXx_O-NaG5gnUjs0qjSCBrhtl3T4LLDlTc4yG52-8YHGu2j6FCcir8uXXTQRgGluv3vw2qnM4tEQSFdupJ8jjVvHIYvdRvuZ-GGQrzbuK0Qu0WJFTrko9qKbWJ4NtwLy1Ni8HG_CTryTVWEXUXb7mXds-VPOaV1T62stHFWfcc6q67O0NXcW4nVakNAbqNqqVsc2z-mTt3LRuIE7b_2QxbvzK8t61NZ0wk"
            />
            <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 text-[8px] bg-cyan-400 text-slate-950 font-bold rounded">HOT</span>
          </div>
          <p className="font-mono text-[8px] text-slate-500 mb-1">2 MINS AGO</p>
          <h4 className="text-xs font-semibold text-slate-100 leading-snug">Institutional Adoption Spikes in Q3</h4>
        </div>

        <div className="glass-card p-4 rounded-2xl bg-zinc-900/40 hover:bg-zinc-800/20 transition-all cursor-pointer">
          <div className="h-20 rounded-lg overflow-hidden relative mb-2.5 bg-zinc-950">
            <img 
              className="w-full h-full object-cover opacity-80" 
              alt="Globe abstract network"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBhKQjRI5sMLXAd2Tt5EYtV1v4UppggNKBvYftnl_FLzHHLwqFd4daxCm_hOHvRlXsHeb8x7TCOlQPEs8xY19-V1277mh1YGR-ainobbFk-oiPKIFeaknctDEelJ2lVhynshrD7Q6BYH6wY4fmMuVP_Ru31Y_W74qTvo10fSnJUJ-rte0AlKVShheJIMMP2h6IW0VFrtbtJVA1VQJUsMFjdUA19MCo2FMOcXdgvxzO99Ig0Xqaa3xXoqV1JD4ZBUxbOTubXX-Fnr5I"
            />
            <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 text-[8px] bg-zinc-800 text-cyan-400 font-bold rounded border border-cyan-800/50">NEWS</span>
          </div>
          <p className="font-mono text-[8px] text-slate-500 mb-1">1 HOUR AGO</p>
          <h4 className="text-xs font-semibold text-slate-100 leading-snug">Predicting the Volatility Squeeze</h4>
        </div>
      </section>

      {/* Quick Swap CTA area */}
      <section className="relative rounded-2xl p-5 flex flex-col justify-center items-center bg-gradient-to-br from-cyan-950/20 to-zinc-950 border border-cyan-500/20 overflow-hidden shadow-[0_0_20px_rgba(0,240,255,0.02)]">
        <h4 className="font-display text-md font-bold tracking-tight text-slate-100 mb-1">Ready to trade?</h4>
        <p className="text-xs text-slate-400 text-center mb-4 leading-normal">
          Execute swaps with zero-lag lightning speed and custom slip protection.
        </p>
        <button 
          onClick={() => setShowSwapDesk(true)}
          className="w-full py-3 bg-[#00f0ff] hover:bg-cyan-400 text-slate-900 font-bold rounded-xl text-xs tracking-wide shadow-[0_0_20px_rgba(0,240,255,0.3)] hover:scale-[1.01] active:scale-95 transition-all"
        >
          OPEN TRADING DESK
        </button>
      </section>

      {/* Swap Desk simulation Modal */}
      {showSwapDesk && (
        <div className="absolute inset-0 bg-[#0A0B10]/95 backdrop-blur-xl z-50 flex flex-col justify-center p-6 animate-fade-in">
          <div className="glass-card p-6 rounded-2xl border border-cyan-500/20 bg-zinc-950/80 max-w-sm mx-auto w-full space-y-4">
            
            <div className="flex justify-between items-center border-b border-cyan-500/10 pb-3">
              <h4 className="font-display font-bold text-md text-[#00f0ff] uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                WalletIO Lightning Swap
              </h4>
              <button 
                onClick={() => setShowSwapDesk(false) || setSwapAmount('')}
                className="text-slate-400 hover:text-slate-200 font-mono text-xs"
              >
                CLOSE
              </button>
            </div>

            <form onSubmit={handleSwapExecute} className="space-y-4">
              <div>
                <label className="block font-mono text-[10px] text-slate-400 uppercase mb-1">Select Pair Direction</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => { setSellAsset('USD'); setBuyAsset('AUR'); }}
                    className={`py-2 px-1 text-xs font-mono rounded-lg border text-center transition-all ${
                      sellAsset === 'USD'
                        ? 'bg-cyan-500/15 border-cyan-400 text-cyan-400 font-bold'
                        : 'bg-zinc-900 border-zinc-800 text-slate-400'
                    }`}
                  >
                    USD → AUR (Buy)
                  </button>
                  <button
                    type="button"
                    onClick={() => { setSellAsset('AUR'); setBuyAsset('USD'); }}
                    className={`py-2 px-1 text-xs font-mono rounded-lg border text-center transition-all ${
                      sellAsset === 'AUR'
                        ? 'bg-cyan-500/15 border-cyan-400 text-cyan-400 font-bold'
                        : 'bg-zinc-900 border-zinc-800 text-slate-400'
                    }`}
                  >
                    AUR → USD (Sell)
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-mono text-[10px] text-slate-400 uppercase mb-1">
                  Amount of {sellAsset} to Swap
                </label>
                <div className="relative">
                  <input 
                    type="number" 
                    step="0.01"
                    value={swapAmount} 
                    onChange={(e) => setSwapAmount(e.target.value)}
                    placeholder="100.00"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-3 pr-14 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-cyan-400 font-mono"
                    required
                  />
                  <span className="absolute right-3 top-3 font-mono text-xs text-slate-400">
                    {sellAsset}
                  </span>
                </div>
                {sellAsset === 'USD' && (
                  <p className="font-mono text-[9px] text-slate-500 mt-1">
                    Available USD balance: ${liquidityBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                )}
              </div>

              <div className="bg-zinc-900/40 p-3 rounded-xl border border-zinc-800/50 space-y-1 select-none">
                <div className="flex justify-between text-[11px] font-mono text-slate-400">
                  <span>Rate:</span>
                  <span className="text-slate-200">1 AUR = ${aurPrice.toFixed(4)} USD</span>
                </div>
                <div className="flex justify-between text-[11px] font-mono text-slate-400">
                  <span>Slippage Protection:</span>
                  <span className="text-emerald-400">0.05% Enabled</span>
                </div>
              </div>

              <button 
                type="submit"
                disabled={swapLoading}
                className="w-full h-11 bg-gradient-to-r from-cyan-400 to-fuchsia-500 text-slate-900 font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-1.5"
              >
                {swapLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Routing Trade...</span>
                  </>
                ) : (
                  <span>Execute Swap</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
