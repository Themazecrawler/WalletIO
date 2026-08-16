import React, { useState } from 'react';
import { Shield, Fingerprint, Smartphone, QrCode } from 'lucide-react';
import { SecurityHubState } from '../types';

interface TwoFactorOnboardingModalProps {
  /** Called with the security state the user chose (biometric, authenticator, or skipped). */
  onComplete: (state: SecurityHubState) => void;
  showNotification: (msg: string) => void;
}

export default function TwoFactorOnboardingModal({ onComplete, showNotification }: TwoFactorOnboardingModalProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [authCode, setAuthCode] = useState('');

  return (
    <div className="absolute inset-0 bg-zinc-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 select-none animate-fade-in">
      <div className="w-full max-w-sm bg-zinc-900 border border-cyan-500/30 rounded-2xl p-5 relative overflow-hidden shadow-[0_0_30px_rgba(0,240,255,0.15)] flex flex-col gap-4">
        {/* Header */}
        <div className="text-center space-y-1">
          <div className="inline-flex p-2.5 rounded-full bg-cyan-950/40 border border-cyan-500/30 text-cyan-400 mb-1">
            <Shield className="w-6 h-6 animate-pulse" />
          </div>
          <h3 className="font-display text-base font-bold text-slate-100 uppercase tracking-wide">Secure Your Account</h3>
          <p className="font-sans text-xs text-slate-400 max-w-[280px] mx-auto">
            Set up an extra layer of defense for your cryptographically sealed assets.
          </p>
        </div>

        {/* Core Onboarding Options */}
        <div className="space-y-3">
          {/* Option A: Biometric Face ID / Fingerprint */}
          <button
            onClick={() => {
              setIsScanning(true);
              showNotification('Initializing Secure Enclave biometric scan...');
              setTimeout(() => {
                setIsScanning(false);
                onComplete({ biometricUnlock: true, twoFactorProtocol: true });
              }, 1800);
            }}
            disabled={isScanning}
            className="w-full text-left p-3.5 rounded-xl border border-zinc-800 hover:border-cyan-500/40 bg-zinc-950/40 hover:bg-zinc-900/60 transition-all flex items-center gap-3.5 cursor-pointer group"
          >
            <div className="p-2 rounded-lg bg-zinc-900 group-hover:bg-cyan-950/30 group-hover:text-cyan-400 text-slate-400 transition-colors">
              <Fingerprint className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-display text-xs font-bold text-slate-200 uppercase tracking-wider">Use Biometric Protection</h4>
              <p className="font-sans text-[10px] text-slate-500 mt-0.5">Use Face ID or Fingerprint for immediate verification</p>
            </div>
          </button>

          {/* Option B: Authenticator App */}
          <div className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-950/40 flex flex-col gap-3">
            <div className="flex items-center gap-3.5">
              <div className="p-2 rounded-lg bg-zinc-900 text-slate-400">
                <Smartphone className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-display text-xs font-bold text-slate-200 uppercase tracking-wider">Authenticator App</h4>
                <p className="font-sans text-[10px] text-slate-500 mt-0.5">Verify via Google Authenticator or Duo</p>
              </div>
            </div>

            {/* QR Code and code validation view */}
            <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-900 flex flex-col items-center gap-3">
              <div className="relative p-1.5 bg-white rounded-lg">
                <QrCode className="w-24 h-24 text-zinc-950" />
              </div>
              <div className="text-center">
                <span className="font-mono text-[8px] text-slate-500 uppercase">Secret Setup Key</span>
                <p className="font-mono text-[9px] text-cyan-400 font-bold select-all tracking-wider">WIO-SEC-8849-CYBER</p>
              </div>

              {/* Enter Code input */}
              <div className="w-full flex gap-1.5">
                <input
                  type="text"
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  value={authCode}
                  onChange={(e) => setAuthCode(e.target.value)}
                  aria-label="Enter 6-digit code"
                  className="flex-1 min-w-0 px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-center font-mono text-xs text-slate-100 placeholder-slate-600 focus:border-cyan-500 outline-none transition-all"
                />
                <button
                  onClick={() => {
                    if (authCode.trim().length < 6) {
                      showNotification('Enter a valid 6-digit authenticator code.');
                      return;
                    }
                    onComplete({ biometricUnlock: false, twoFactorProtocol: true });
                  }}
                  className="px-3 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono text-[10px] font-bold uppercase transition-all cursor-pointer"
                >
                  Verify
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Skip for now options */}
        <div className="text-center pt-2">
          <button
            onClick={() => onComplete({ biometricUnlock: false, twoFactorProtocol: false })}
            className="font-mono text-[9px] text-slate-500 hover:text-slate-300 uppercase tracking-widest transition-colors cursor-pointer focus:outline-none"
          >
            Skip account protection (Not Recommended)
          </button>
        </div>
      </div>
    </div>
  );
}
