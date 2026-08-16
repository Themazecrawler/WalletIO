import React, { useState } from 'react';
import { ChevronLeft, Mail, Lock, Fingerprint, ScanFace } from 'lucide-react';

interface SignInScreenProps {
  onBack: () => void;
  onForgot: () => void;
  /** Called with the validated email; App gates on 2FA. */
  onSignIn: (email: string) => void;
  /** Called after the simulated biometric scan completes. */
  onBiometricLogin: (type: 'fingerprint' | 'face') => void;
  onNavigateSignUp: () => void;
  showNotification: (msg: string) => void;
  /** Prefills the email field (set after sign-up). */
  initialEmail?: string | null;
}

export default function SignInScreen({
  onBack,
  onForgot,
  onSignIn,
  onBiometricLogin,
  onNavigateSignUp,
  showNotification,
  initialEmail
}: SignInScreenProps) {
  const [email, setEmail] = useState(initialEmail ?? '');
  const [password, setPassword] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanningType, setScanningType] = useState<'fingerprint' | 'face' | null>(null);

  const triggerUnlockBiometric = (type: 'fingerprint' | 'face') => {
    setIsScanning(true);
    setScanningType(type);
    showNotification(`Initializing device ${type === 'face' ? 'Face ID' : 'fingerprint'} scan...`);
    setTimeout(() => {
      setIsScanning(false);
      setScanningType(null);
      onBiometricLogin(type);
    }, 1800);
  };

  return (
    <div className="flex-1 flex flex-col z-10 py-2 h-full">
      {/* Back Arrow */}
      <div className="flex items-center mb-4">
        <button
          onClick={onBack}
          className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800/80 hover:border-cyan-400/40 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
          title="Back to Welcome"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="font-mono text-[9px] text-slate-500 uppercase ml-3 tracking-widest">SIGN IN</span>
      </div>

      {/* Heading */}
      <div className="text-center mb-6">
        <h2 className="font-display text-xl font-bold text-slate-100">SIGN IN</h2>
        <p className="font-sans text-xs text-slate-400 mt-1">Access your digital assets secure wallet.</p>
      </div>

      {/* Form fields */}
      <div className="space-y-4">
        <div className="flex flex-col gap-1.5">
          <label className="font-mono text-[9px] text-slate-400 tracking-wider uppercase">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-900/50 border border-zinc-800 focus:border-[#00f0ff] focus:ring-1 focus:ring-[#00f0ff] outline-none text-xs text-slate-100 placeholder-slate-600 transition-all font-sans"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between items-center">
            <label className="font-mono text-[9px] text-slate-400 tracking-wider uppercase">Password</label>
            <button
              onClick={onForgot}
              className="font-mono text-[9px] text-cyan-400 hover:text-cyan-300 uppercase tracking-wide focus:outline-none cursor-pointer"
            >
              Forgot password?
            </button>
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-900/50 border border-zinc-800 focus:border-[#00f0ff] focus:ring-1 focus:ring-[#00f0ff] outline-none text-xs text-slate-100 placeholder-slate-600 transition-all font-sans"
            />
          </div>
        </div>

        {/* Primary Button */}
        <button
          onClick={() => {
            if (!email.includes('@') || password.length < 4) {
              showNotification('Please enter a valid email address and password.');
            } else {
              onSignIn(email);
            }
          }}
          className="w-full py-2.5 px-4 mt-1 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-cyan-400 font-display text-xs font-bold tracking-wider hover:border-[#00f0ff] hover:text-[#00f0ff] active:scale-[0.98] transition-all flex items-center justify-center gap-2 uppercase cursor-pointer"
        >
          Sign In
        </button>
      </div>

      {/* Biometric login option */}
      <div className="mt-6 pt-5 border-t border-zinc-900 grid grid-cols-2 justify-items-center w-full relative">
        <span className="col-span-2 font-mono text-[9px] text-slate-500 uppercase tracking-widest mb-4 text-center">Biometric Login</span>

        {/* Fingerprint / Touch ID Button */}
        <button
          onClick={() => triggerUnlockBiometric('fingerprint')}
          disabled={isScanning}
          className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500 ${
            isScanning && scanningType === 'fingerprint'
              ? 'bg-[#00f0ff]/10 border-2 border-[#00f0ff] shadow-[0_0_20px_rgba(0,240,255,0.3)] scale-105'
              : 'bg-zinc-900/60 border border-zinc-800/80 hover:border-cyan-500/40 hover:bg-zinc-900 shadow-md cursor-pointer'
          }`}
          title="Trigger Fingerprint Scan"
        >
          {isScanning && scanningType === 'fingerprint' ? (
            <>
              <Fingerprint className="w-8 h-8 text-[#00f0ff] animate-pulse" />
              <div className="absolute inset-0 border-2 border-transparent border-t-cyan-400 rounded-full animate-spin" />
            </>
          ) : (
            <Fingerprint className="w-8 h-8 text-slate-400 hover:text-[#00f0ff] transition-colors" />
          )}
        </button>

        {/* Face ID Button */}
        <button
          onClick={() => triggerUnlockBiometric('face')}
          disabled={isScanning}
          className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500 ${
            isScanning && scanningType === 'face'
              ? 'bg-[#00f0ff]/10 border-2 border-[#00f0ff] shadow-[0_0_20px_rgba(0,240,255,0.3)] scale-105'
              : 'bg-zinc-900/60 border border-zinc-800/80 hover:border-cyan-500/40 hover:bg-zinc-900 shadow-md cursor-pointer'
          }`}
          title="Trigger Face ID Scan"
        >
          {isScanning && scanningType === 'face' ? (
            <>
              <ScanFace className="w-8 h-8 text-[#00f0ff] animate-pulse" />
              <div className="absolute inset-0 border-2 border-transparent border-t-cyan-400 rounded-full animate-spin" />
            </>
          ) : (
            <ScanFace className="w-8 h-8 text-slate-400 hover:text-[#00f0ff] transition-colors" />
          )}
        </button>

        {/* Label Touch ID */}
        <span className="font-mono text-[8px] text-slate-500 text-center mt-2.5 uppercase tracking-wide">
          {isScanning && scanningType === 'fingerprint' ? 'Scanning...' : 'Touch ID'}
        </span>

        {/* Label Face ID */}
        <span className="font-mono text-[8px] text-slate-500 text-center mt-2.5 uppercase tracking-wide">
          {isScanning && scanningType === 'face' ? 'Scanning...' : 'Face ID'}
        </span>
      </div>

      {/* Footer link */}
      <div className="text-center mt-auto pt-4">
        <button
          onClick={onNavigateSignUp}
          className="font-mono text-[9px] text-slate-500 hover:text-slate-300 uppercase tracking-wide transition-colors cursor-pointer focus:outline-none"
        >
          Don't have an account? Sign Up
        </button>
      </div>
    </div>
  );
}
