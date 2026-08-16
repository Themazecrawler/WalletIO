import React, { useState } from 'react';
import { ChevronLeft, Mail } from 'lucide-react';

interface ResetScreenProps {
  onBack: () => void;
  /** Called with the validated email so the app can send the reset link. */
  onReset: (email: string) => void;
  showNotification: (msg: string) => void;
}

export default function ResetScreen({ onBack, onReset, showNotification }: ResetScreenProps) {
  const [email, setEmail] = useState('');

  return (
    <div className="flex-1 flex flex-col z-10 py-2 h-full">
      {/* Back Arrow */}
      <div className="flex items-center mb-4">
        <button
          onClick={onBack}
          className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800/80 hover:border-cyan-400/40 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
          title="Back to Sign In"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="font-mono text-[9px] text-slate-500 uppercase ml-3 tracking-widest">PASSWORD RESET</span>
      </div>

      {/* Heading */}
      <div className="text-center mb-6">
        <h2 className="font-display text-xl font-bold text-slate-100">RESET PASSWORD</h2>
        <p className="font-sans text-xs text-slate-400 mt-1 leading-relaxed px-4">
          Enter your email address below, and we will send you a secure link to reset your password and restore access to your account.
        </p>
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

        {/* Primary Button */}
        <button
          onClick={() => {
            if (!email.includes('@')) {
              showNotification('Please enter a valid email address.');
            } else {
              onReset(email);
            }
          }}
          className="w-full py-2.5 px-4 mt-2 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-cyan-400 font-display text-xs font-bold tracking-wider hover:border-[#00f0ff] hover:text-[#00f0ff] active:scale-[0.98] transition-all flex items-center justify-center gap-2 uppercase cursor-pointer"
        >
          Send Reset Link
        </button>
      </div>

      {/* Footer link */}
      <div className="text-center mt-auto pt-6">
        <button
          onClick={onBack}
          className="font-mono text-[9px] text-slate-500 hover:text-slate-300 uppercase tracking-wide transition-colors cursor-pointer focus:outline-none"
        >
          Remember your password? Back to Login
        </button>
      </div>
    </div>
  );
}
