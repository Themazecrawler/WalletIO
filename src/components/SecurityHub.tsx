import React from 'react';
import { ChevronRight, LogOut, ShieldCheck, Key, X } from 'lucide-react';
import { SecurityHubState } from '../types';

interface SecurityHubProps {
  securityState: SecurityHubState;
  onToggleSecurity: (key: keyof SecurityHubState) => void;
  onClose: () => void;
  onDeauthenticate: () => void;
}

export default function SecurityHub({ securityState, onToggleSecurity, onClose, onDeauthenticate }: SecurityHubProps) {
  return (
    <div className="flex flex-col gap-6 p-6 animate-fade-in pb-10 bg-[#0A0B10] min-h-full">
      
      {/* Top Close Row */}
      <div className="flex justify-between items-center select-none pb-2 border-b border-zinc-800/40">
        <span className="font-mono text-xs text-slate-500 uppercase tracking-widest">SYSTEM PROFILE</span>
        <button 
          onClick={onClose}
          className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800/60 hover:border-cyan-400/40 text-slate-400 hover:text-slate-200 transition-all focus:outline-none active:scale-95"
          title="Back to Dashboard"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Profile Header */}
      <section className="flex flex-col items-center text-center gap-2 mt-2">
        <div className="relative">
          {/* Animated gradient ring around avatar */}
          <div className="w-24 h-24 rounded-full bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-cyan-400 p-[3px] mb-3 relative animate-[spin_8s_linear_infinite]">
            <div className="w-full h-full rounded-full bg-[#0A0B10]" />
          </div>
          <div className="absolute top-[3px] left-[3px] w-[90px] h-[90px] rounded-full overflow-hidden">
            <img 
              className="w-full h-full object-cover" 
              alt="Cyber avatar enhanced" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuC3MsP770LwnYb3zzAupDkrSC3AAgeJbIs0c1RDpHEElg3ahv1dzGhJ1_rTrp10a_kjH4dR3jbS1tNVXEVMt_-Ae6mDfs1G6mtRKj0R7CGRnLllTVBCvFmWlQNcwl_xPrKgsS6hZtvPqp_osIcuNRPeyVUw5c2_3PTOUZ0743jliAtaOsOMB4MY6QMM8jylbIZzQ3vfrM4IpLDdW32rx85VkZE7cQhCeU6s6nzt0AvxW7z2-pVRs6TA6FUCbUgyX7S6LAqG9UGfbuU" 
            />
          </div>

          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-cyan-400 text-slate-950 px-3 py-0.5 rounded-full text-[9px] font-mono font-bold tracking-wider flex items-center gap-1 border border-[#0A0B10] uppercase shadow-lg select-none">
            Elite Token
          </div>
        </div>

        <h1 className="font-display text-xl font-bold text-slate-100 mt-2">@neocyber</h1>
        <p className="font-mono text-[10px] text-slate-400 leading-snug">
          Quantum Protocol Tier 7 Authorized
        </p>
      </section>

      {/* Account stats bento style */}
      <div className="grid grid-cols-2 gap-4 select-none">
        <div className="glass-card p-4 rounded-2xl flex flex-col gap-1 border border-zinc-800 bg-zinc-900/30">
          <span className="font-mono text-[9px] text-slate-500 uppercase flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Lifetime Yield
          </span>
          <span className="font-display text-lg font-bold text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]">
            12.4%
          </span>
          <div className="w-full h-1 bg-zinc-800 mt-1.5 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-400 w-3/4 shadow-[0_0_6px_#34d399]" />
          </div>
        </div>

        <div className="glass-card p-4 rounded-2xl flex flex-col gap-1 border border-zinc-800 bg-zinc-900/30">
          <span className="font-mono text-[9px] text-slate-500 uppercase flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            Trust Score
          </span>
          <span className="font-display text-lg font-bold text-cyan-400 drop-shadow-[0_0_8px_rgba(0,240,255,0.3)]">
            994
          </span>
          <div className="w-full h-1 bg-zinc-800 mt-1.5 rounded-full overflow-hidden">
            <div className="h-full bg-[#00f0ff] w-[90%] shadow-[0_0_6px_#00f0ff]" />
          </div>
        </div>
      </div>

      {/* Security Hub switches */}
      <section className="flex flex-col gap-3">
        <h2 className="font-mono text-[10px] text-slate-500 uppercase tracking-widest px-1">SECURITY HUB</h2>
        
        <div className="glass-card rounded-2xl overflow-hidden divide-y divide-zinc-800/40 bg-zinc-900/10">
          {/* Biometric Unlock */}
          <div className="flex items-center justify-between p-4 hover:bg-zinc-900/20 transition-colors group">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400 border border-cyan-500/20">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-slate-200">Biometric Unlock</span>
                <span className="font-mono text-[9px] text-slate-400">FaceID and Haptic Auth</span>
              </div>
            </div>

            <button 
              type="button"
              onClick={() => onToggleSecurity('biometricUnlock')}
              className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors outline-none focus:outline-none ${
                securityState.biometricUnlock ? 'bg-cyan-500' : 'bg-zinc-800'
              }`}
            >
              <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                securityState.biometricUnlock ? 'translate-x-5.5' : 'translate-x-1'
              }`} />
            </button>
          </div>

          {/* 2FA Protocol */}
          <div className="flex items-center justify-between p-4 hover:bg-zinc-900/20 transition-colors group">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center text-[#26f979] border border-emerald-500/20">
                <Key className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-slate-200">2FA Protocol</span>
                <span className="font-mono text-[9px] text-slate-400">Active Hardware Token</span>
              </div>
            </div>

            <button 
              type="button"
              onClick={() => onToggleSecurity('twoFactorProtocol')}
              className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors outline-none focus:outline-none ${
                securityState.twoFactorProtocol ? 'bg-[#26f979]' : 'bg-zinc-800'
              }`}
            >
              <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                securityState.twoFactorProtocol ? 'translate-x-5.5' : 'translate-x-1'
              }`} />
            </button>
          </div>
        </div>
      </section>

      {/* Preferences links */}
      <section className="flex flex-col gap-3">
        <h2 className="font-mono text-[10px] text-slate-500 uppercase tracking-widest px-1">PREFERENCES</h2>
        <div className="glass-card rounded-2xl overflow-hidden bg-zinc-900/10 divide-y divide-zinc-800/40">
          <button className="w-full flex items-center justify-between p-4 hover:bg-zinc-900/20 transition-all select-none">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-slate-300">Privacy Tunnels</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </button>

          <button className="w-full flex items-center justify-between p-4 hover:bg-zinc-900/20 transition-all select-none">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-slate-300">Notification Matrix</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </button>

          <button className="w-full flex items-center justify-between p-4 hover:bg-zinc-900/20 transition-all select-none">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-slate-300">Language</span>
            </div>
            <div className="flex items-center gap-1 text-cyan-400 font-mono text-[11px] font-bold">
              <span>English (US)</span>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </div>
          </button>
        </div>
      </section>

      {/* Logout button */}
      <button 
        onClick={onDeauthenticate}
        className="w-full py-3.5 mt-2 rounded-xl bg-rose-500/10 border border-rose-500/25 hover:bg-rose-500/15 text-rose-400 flex items-center justify-center gap-2 text-sm font-semibold transition-all active:scale-[0.98]"
      >
        <LogOut className="w-4 h-4" />
        De-authenticate Session
      </button>

    </div>
  );
}
export interface FaceIconProps {}
export interface HubProps {}
export interface KeyProps {}
export interface WorkspacePremiumProps {}
