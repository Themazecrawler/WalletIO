import React from 'react';
import { X, Wallet, Globe, Copy, ExternalLink, LogOut } from 'lucide-react';

export interface ConnectWalletInfo {
  name: string;
  symbol: string;
  color: string;
  address: string;
  net: string;
}

interface AppKitModalProps {
  isWalletConnected: boolean;
  walletAddress: string | null;
  walletNetwork: string;
  walletName: string | null;
  onConnectWalletConnect: () => void;
  onConnectWallet: (wallet: ConnectWalletInfo) => void;
  onSwitchNetwork: (network: string) => void;
  onDisconnect: () => void;
  onClose: () => void;
  showNotification: (msg: string) => void;
}

const WALLETS: ConnectWalletInfo[] = [
  { name: 'MetaMask', symbol: 'MM', color: 'from-[#F6851B] to-[#E2761B]', address: '0x71C35c1f543e88888e404CcfF497E1fC1b1bF9Ea', net: 'Ethereum' },
  { name: 'Phantom', symbol: 'PH', color: 'from-[#AB9FF2] to-[#512DA8]', address: '0x8bF91F793EaF9Ea543e8888804CcfF497E1fC1b1', net: 'Solana Mainnet' },
  { name: 'Coinbase', symbol: 'CB', color: 'from-[#0052FF] to-[#003BFF]', address: '0x32A35c1f1fc1b1bF9Ea543e888888e404CcfF497', net: 'Base Network' },
  { name: 'Trust Wallet', symbol: 'TW', color: 'from-[#3375BB] to-[#14498C]', address: '0x04CCffF497E1fC1b1bF9Ea543e88888804Cc21Fa', net: 'Optimism' }
];

const EXPLORER_BY_NETWORK: Record<string, string> = {
  Ethereum: 'https://etherscan.io/address/',
  'Arbitrum One': 'https://arbiscan.io/address/',
  'Base Network': 'https://basescan.org/address/',
  Optimism: 'https://optimistic.etherscan.io/address/',
  Polygon: 'https://polygonscan.com/address/',
  Solana: 'https://solscan.io/address/',
};

const NETWORKS = [
  { name: 'Ethereum', color: 'border-cyan-500/10' },
  { name: 'Arbitrum One', color: 'border-blue-500/10' },
  { name: 'Base Network', color: 'border-indigo-500/10' },
  { name: 'Optimism', color: 'border-red-500/10' },
  { name: 'Polygon', color: 'border-purple-500/10' },
  { name: 'Solana', color: 'border-violet-500/10' }
];

export default function AppKitModal({
  isWalletConnected,
  walletAddress,
  walletNetwork,
  walletName,
  onConnectWalletConnect,
  onConnectWallet,
  onSwitchNetwork,
  onDisconnect,
  onClose,
  showNotification
}: AppKitModalProps) {
  return (
    <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-md flex items-end sm:items-center justify-center p-4 animate-fade-in">
      {/* Modal Container */}
      <div className="bg-[#191a22] border border-zinc-800 rounded-t-[28px] sm:rounded-[28px] w-full max-w-sm p-5 relative text-slate-100 shadow-[0_24px_50px_rgba(0,0,0,0.8)] overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            {/* Simulated Reown AppKit Sphere logo */}
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-500 p-0.5 flex items-center justify-center shadow-[0_0_10px_rgba(6,182,212,0.5)]">
              <div className="w-full h-full bg-[#191a22] rounded-full flex items-center justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              </div>
            </div>
            <h3 className="font-display font-bold text-sm text-slate-100 tracking-wide flex items-center gap-1.5">
              <span>AppKit</span>
              <span className="text-[10px] bg-cyan-950/40 text-[#00f0ff] border border-cyan-800/40 px-1.5 py-0.5 rounded-md font-mono tracking-wider font-semibold">
                v4.1.8
              </span>
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-zinc-800 text-slate-400 hover:text-slate-100 transition-colors"
            title="Close AppKit"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content: Not connected state vs Connected state */}
        {!isWalletConnected ? (
          <div className="pt-4 space-y-4">
            <div className="text-center pb-2">
              <p className="text-xs text-slate-400 font-mono">Connect your Web3 crypto wallet to unlock real-time blockchain tracking and smart contract operations on WalletIO.</p>
            </div>

            {/* Simulated Web3 Wallet options */}
            <div className="space-y-2">
              <div className="font-mono text-[9px] text-slate-500 uppercase tracking-widest px-1">Connect Methods</div>

              {/* Option 1: Simulated QR Code connection scanner */}
              <div
                className="p-3.5 rounded-2xl bg-zinc-900/35 border border-zinc-800/50 hover:border-cyan-500/30 transition-all duration-300 flex items-center justify-between group cursor-pointer"
                onClick={onConnectWalletConnect}
              >
                <div className="flex items-center gap-3">
                  {/* Interactive mock QR Code block */}
                  <div className="w-9 h-9 rounded-lg bg-white p-1 flex items-center justify-center relative">
                    <div className="w-full h-full bg-zinc-950 rounded flex flex-wrap p-0.5 relative overflow-hidden">
                      {/* Simulated QR blocks */}
                      <div className="w-2.5 h-2.5 bg-white m-0.5 rounded-sm" />
                      <div className="w-1.5 h-1.5 bg-cyan-400 m-0.5 rounded-sm" />
                      <div className="w-2.5 h-2.5 bg-white m-0.5 rounded-sm" />
                      <div className="w-1.5 h-1.5 bg-fuchsia-400 m-0.5 rounded-sm" />
                      {/* Animated scanning laser beam */}
                      <div className="absolute left-0 right-0 h-0.5 bg-emerald-400 top-1/2 -translate-y-1/2 animate-bounce" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-100 group-hover:text-cyan-400 transition-colors">WalletConnect Mobile</h4>
                    <p className="text-[10px] font-mono text-slate-400 mt-0.5">Scan dynamic QR code inside mobile app</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/20 px-2 py-0.5 rounded-full border border-cyan-800/20 group-hover:bg-cyan-500/10 group-hover:border-cyan-500/40 transition-all font-bold">SCAN QR</span>
              </div>

              {/* Desktop / Core wallet list */}
              <div className="grid grid-cols-2 gap-2 mt-3">
                {WALLETS.map((w) => (
                  <button
                    key={w.name}
                    onClick={() => onConnectWallet(w)}
                    className="p-3 rounded-xl bg-zinc-900/30 border border-zinc-800/80 hover:border-cyan-500/30 hover:bg-zinc-800/40 text-left transition-all flex flex-col gap-2 group active:scale-95 text-slate-200"
                  >
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-tr ${w.color} flex items-center justify-center font-bold text-xs text-white`}>
                      {w.symbol}
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-slate-200 group-hover:text-cyan-400 transition-colors block">{w.name}</span>
                      <span className="text-[9px] font-mono text-slate-500">Browser Extension</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-zinc-800/80 pt-3 text-center">
              <p className="text-[9px] font-mono text-slate-500 flex items-center justify-center gap-1">
                <span>Secured by Reown AppKit technology.</span>
                <Globe className="w-2.5 h-2.5 text-[#00f0ff] animate-spin" style={{ animationDuration: '6s' }} />
              </p>
            </div>
          </div>
        ) : (
          /* Connected user view */
          <div className="pt-4 space-y-4">
            {/* Active Wallet status */}
            <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800 relative">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-100">{walletName || 'Connected Wallet'}</h4>
                    <p className="font-mono text-[9px] text-emerald-400 flex items-center gap-1 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>Active Connection</span>
                    </p>
                  </div>
                </div>

                <span className="text-[9px] font-mono bg-zinc-800 text-slate-300 border border-zinc-700 px-2 py-0.5 rounded">
                  {walletNetwork}
                </span>
              </div>

              {/* Connected address copyable row */}
              <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between">
                <span className="font-mono text-xs text-slate-300 select-all" title="Click to Select All">
                  {walletAddress ? `${walletAddress.slice(0, 10)}...${walletAddress.slice(-8)}` : ''}
                </span>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => {
                      if (walletAddress) {
                        navigator.clipboard.writeText(walletAddress);
                        showNotification('Wallet address copied to clipboard!');
                      }
                    }}
                    className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-slate-400 hover:text-slate-100 transition-all active:scale-90"
                    title="Copy Address"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <a
                    href={`${EXPLORER_BY_NETWORK[walletNetwork] ?? EXPLORER_BY_NETWORK.Ethereum}${walletAddress}`}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-slate-400 hover:text-slate-100 transition-all flex items-center justify-center"
                    title="View address on block explorer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>

            {/* Network Switcher inside AppKit */}
            <div className="space-y-2">
              <div className="font-mono text-[9px] text-slate-500 uppercase tracking-widest px-1">Switch Chain Network</div>
              <div className="grid grid-cols-3 gap-1.5">
                {NETWORKS.map((network) => {
                  const isActive = walletNetwork === network.name;
                  return (
                    <button
                      key={network.name}
                      onClick={() => onSwitchNetwork(network.name)}
                      className={`py-2 px-1 text-[9px] font-mono rounded-lg border text-center transition-all ${
                        isActive
                          ? 'bg-[#00f0ff]/10 border-cyan-400 text-cyan-400 font-bold'
                          : 'bg-zinc-900 border-zinc-800/80 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {network.name.split(' ')[0]}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Actions: Disconnect */}
            <div className="pt-2">
              <button
                onClick={onDisconnect}
                className="w-full py-3 rounded-xl bg-rose-950/20 hover:bg-rose-900/20 border border-rose-500/30 hover:border-rose-400 text-rose-400 font-mono text-[11px] font-bold tracking-wider uppercase transition-all flex items-center justify-center gap-1.5 active:scale-[0.98]"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Disconnect Wallet</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
