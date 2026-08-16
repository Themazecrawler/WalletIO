import React, { useState } from 'react';
import { Lock, Fingerprint, Key } from 'lucide-react';
import { useWallet } from '../store/walletStore';

interface TwoFactorVerificationModalProps {
  title: string;
  /** Fired after successful verification; App executes the pending action. */
  onAuthorized: () => void;
  /** Fired when the user cancels. */
  onClose: () => void;
  showNotification: (msg: string) => void;
  /** For destructive actions (e.g. disabling security), skip the biometric
   * shortcut and demand the 6-digit authenticator code specifically. */
  requireCode?: boolean;
}

export default function TwoFactorVerificationModal({
  title,
  onAuthorized,
  onClose,
  showNotification,
  requireCode = false
}: TwoFactorVerificationModalProps) {
  const { securityState } = useWallet();
  const [isScanning, setIsScanning] = useState(false);
  const [authCode, setAuthCode] = useState('');
  // Choosing the code input for this verification is a local UI choice — it
  // must NOT mutate the user's security settings.
  const [useCodeInput, setUseCodeInput] = useState(false);
  const showBiometric = securityState.biometricUnlock && !requireCode && !useCodeInput;

  return (
    <div className="absolute inset-0 bg-zinc-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 select-none animate-fade-in">
      <div className="w-full max-w-sm bg-zinc-900 border border-cyan-500/30 rounded-2xl p-5 relative overflow-hidden shadow-[0_0_30px_rgba(0,240,255,0.15)] flex flex-col gap-4">
        {/* Header */}
        <div className="text-center space-y-1">
          <div className="inline-flex p-2 rounded-full bg-zinc-950 border border-zinc-800 text-cyan-400 mb-1">
            <Lock className="w-5 h-5 animate-pulse" />
          </div>
          <h3 className="font-display text-sm font-bold text-slate-100 uppercase tracking-wide">
            {title || 'Security Verification'}
          </h3>
          <p className="font-sans text-[11px] text-slate-400">
            Confirm your identity to authorize this important action.
          </p>
        </div>

        {/* Dynamic UI depending on biometric status */}
        <div className="py-2 flex flex-col items-center justify-center">
          {showBiometric ? (
            /* Biometric Scanning Prompter */
            <div className="flex flex-col items-center gap-4 text-center w-full">
              <button
                onClick={() => {
                  setIsScanning(true);
                  showNotification('Scanning fingerprint...');
                  setTimeout(() => {
                    setIsScanning(false);
                    onAuthorized();
                  }, 1600);
                }}
                disabled={isScanning}
                className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-500 ${
                  isScanning
                    ? 'bg-cyan-500/10 border-2 border-cyan-400 shadow-[0_0_20px_rgba(0,240,255,0.3)] scale-105'
                    : 'bg-zinc-950 border border-zinc-800 hover:border-cyan-500/40 hover:bg-zinc-900 cursor-pointer shadow-md'
                }`}
                title="Tap to verify biometric credentials"
              >
                {isScanning ? (
                  <>
                    <Fingerprint className="w-9 h-9 text-[#00f0ff] animate-pulse" />
                    <div className="absolute inset-0 border-2 border-transparent border-t-cyan-400 rounded-full animate-spin" />
                  </>
                ) : (
                  <Fingerprint className="w-9 h-9 text-slate-400 hover:text-cyan-400 transition-colors" />
                )}
              </button>
              <p className="font-mono text-[9px] text-slate-500 uppercase tracking-widest">
                {isScanning ? 'VERIFYING BIO-LATTICE...' : 'TAP TO COMPLETE BIOMETRIC SCAN'}
              </p>

              {/* Option to use Google Authenticator instead */}
              <button
                onClick={() => setUseCodeInput(true)}
                className="font-mono text-[8px] text-cyan-500 hover:text-cyan-400 uppercase tracking-widest mt-1 focus:outline-none cursor-pointer"
              >
                Use Authenticator Code Instead
              </button>
            </div>
          ) : (
            /* Authenticator 6-digit Code Prompter */
            <div className="w-full flex flex-col gap-4">
              <div className="flex flex-col gap-1.5 text-center">
                <span className="font-mono text-[9px] text-slate-500 uppercase tracking-wider">6-DIGIT VERIFICATION CODE</span>
                <input
                  type="text"
                  placeholder="••••••"
                  maxLength={6}
                  value={authCode}
                  onChange={(e) => setAuthCode(e.target.value)}
                  aria-label="6-DIGIT VERIFICATION CODE"
                  autoFocus
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-center font-mono text-lg text-cyan-400 tracking-[0.4em] placeholder-slate-800 outline-none focus:border-cyan-500/60 transition-all"
                />
              </div>

              <button
                onClick={() => {
                  if (authCode.trim().length < 6) {
                    showNotification('Enter a valid 6-digit authenticator code.');
                    return;
                  }
                  onAuthorized();
                }}
                className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-display text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Key className="w-3.5 h-3.5" />
                <span>Authorize Transaction</span>
              </button>

              {/* Quick autofill codes to assist testing */}
              <div className="flex gap-2 justify-center items-center">
                <span className="font-mono text-[8px] text-slate-600 uppercase">Test Codes:</span>
                <button
                  onClick={() => setAuthCode('123456')}
                  className="px-1.5 py-0.5 rounded border border-zinc-800 bg-zinc-950/60 font-mono text-[8px] text-slate-400 hover:text-slate-200"
                >
                  123456
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Cancel Button */}
        <div className="border-t border-zinc-900 pt-4 text-center">
          <button
            onClick={onClose}
            className="font-mono text-[9px] text-rose-500 hover:text-rose-400 uppercase tracking-widest transition-colors cursor-pointer"
          >
            Cancel Authorized Action
          </button>
        </div>
      </div>
    </div>
  );
}
