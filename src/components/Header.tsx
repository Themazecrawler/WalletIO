import { Plus, QrCode } from 'lucide-react';

interface HeaderProps {
  onProfileClick: () => void;
  onAddWallet: () => void;
  isWalletConnected?: boolean;
  walletAddress?: string | null;
  onScanQRCode: () => void;
}

export default function Header({ 
  onProfileClick, 
  onAddWallet,
  isWalletConnected = false,
  walletAddress = null,
  onScanQRCode
}: HeaderProps) {
  return (
    <header className="sticky top-0 w-full z-40 bg-[#0A0B10]/70 backdrop-blur-xl border-b border-cyan-500/15 shadow-[0_4px_30px_rgba(0,0,0,0.1)] flex justify-between items-center px-6 py-3.5">
      <div className="flex items-center gap-3">
        {/* Profile Avatar Clickable */}
        <button 
          onClick={onProfileClick}
          className="relative group transition-all duration-300 focus:outline-none"
        >
          <div className="w-10 h-10 rounded-full border-2 border-[#00f0ff] p-0.5 transition-transform duration-300 group-active:scale-95 cursor-pointer">
            <img 
              className="w-full h-full rounded-full object-cover bg-zinc-900" 
              alt="Elite user avatar"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAQDUqvtfdOO6piJXwsnkCzV7curGwm4Y7FkMvQKeAiUJx2z50KtJyEBts9dTdLxc6vWgpcXgf6_0_f9FJHm-HFl5tK5TZIux5WKe45s_82bZxaODjl0K6F2MR4rw0iBRRy8s15N5lJf5INODaIDcV-Q7HxRMHFup_KzH2BSHM_Z781rD9G99wdDEv7rG1OwxwlUgH8-bySFB96QJTfY1aQtTy3vfmZqXpVbfsr1Io1jlqSrB_3giBbJaXWLeEFjH8OQGtHcwwdgVw"
            />
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#0a0b10] animate-pulse" />
        </button>
        <span className="font-display text-2xl font-bold tracking-tighter text-[#00f0ff] bg-gradient-to-r from-cyan-400 to-teal-300 bg-clip-text text-transparent">
          WalletIO
        </span>
      </div>

      <div className="flex items-center gap-2">
        {/* Interactive Add Wallet button or AppKit Connection Status */}
        {isWalletConnected && walletAddress ? (
          <button
            onClick={onAddWallet}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/20 border border-emerald-500/40 hover:border-emerald-400 text-emerald-400 font-mono text-[11px] font-bold tracking-wide active:scale-95 transition-all duration-300"
            title="Wallet Connected via Reown AppKit - Click to Manage"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
            <span>
              {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
            </span>
          </button>
        ) : (
          <button
            onClick={onAddWallet}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-950/20 border border-cyan-500/30 hover:border-[#00f0ff] text-cyan-400 hover:text-cyan-300 hover:shadow-[0_0_12px_rgba(0,240,255,0.2)] transition-all duration-300 font-mono text-[11px] font-bold tracking-wide active:scale-95"
            title="Connect Web3 Wallet via Reown AppKit"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>CONNECT</span>
          </button>
        )}

        {/* Interactive QR Code scanner */}
        <button 
          onClick={onScanQRCode}
          className="p-2 rounded-xl text-slate-400 hover:text-[#00f0ff] hover:bg-[#00f0ff]/5 transition-all duration-300 active:scale-90 border border-transparent"
          title="Scan QR Code"
        >
          <QrCode className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
