import React, { useState } from 'react';
import { ChevronLeft, User, Mail, Lock } from 'lucide-react';

interface SignUpScreenProps {
  onBack: () => void;
  /** Called after validation passes; App opens the 2FA onboarding modal. */
  onSignUp: (username: string, email: string) => void;
  onNavigateSignIn: () => void;
}

interface SignUpErrors {
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export default function SignUpScreen({ onBack, onSignUp, onNavigateSignIn }: SignUpScreenProps) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<SignUpErrors>({});

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
        <span className="font-mono text-[9px] text-slate-500 uppercase ml-3 tracking-widest">SIGN UP</span>
      </div>

      {/* Heading */}
      <div className="text-center mb-5">
        <h2 className="font-display text-xl font-bold text-slate-100">SIGN UP</h2>
        <p className="font-sans text-xs text-slate-400 mt-1">Create an account to start managing your assets.</p>
      </div>

      {/* Form fields */}
      <div className="space-y-3">
        <div className="flex flex-col gap-1.5">
          <label className="font-mono text-[9px] text-slate-400 tracking-wider uppercase">Full Name</label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setErrors((prev) => ({ ...prev, username: undefined }));
              }}
              placeholder="e.g. Alex Rivera"
              className={`w-full pl-10 pr-4 py-2 rounded-xl bg-zinc-900/50 border outline-none text-xs text-slate-100 placeholder-slate-600 transition-all font-sans ${
                errors.username
                  ? 'border-red-500/80 focus:border-red-500 focus:ring-1 focus:ring-red-500/50'
                  : 'border-zinc-800 focus:border-[#00f0ff] focus:ring-1 focus:ring-[#00f0ff]'
              }`}
            />
          </div>
          {errors.username && (
            <span className="font-mono text-[9px] text-red-400 uppercase tracking-wider pl-1">
              {errors.username}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="font-mono text-[9px] text-slate-400 tracking-wider uppercase">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrors((prev) => ({ ...prev, email: undefined }));
              }}
              placeholder="name@example.com"
              className={`w-full pl-10 pr-4 py-2 rounded-xl bg-zinc-900/50 border outline-none text-xs text-slate-100 placeholder-slate-600 transition-all font-sans ${
                errors.email
                  ? 'border-red-500/80 focus:border-red-500 focus:ring-1 focus:ring-red-500/50'
                  : 'border-zinc-800 focus:border-[#00f0ff] focus:ring-1 focus:ring-[#00f0ff]'
              }`}
            />
          </div>
          {errors.email && (
            <span className="font-mono text-[9px] text-red-400 uppercase tracking-wider pl-1">
              {errors.email}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="font-mono text-[9px] text-slate-400 tracking-wider uppercase">Password</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrors((prev) => ({ ...prev, password: undefined }));
              }}
              placeholder="••••••••"
              className={`w-full pl-10 pr-4 py-2 rounded-xl bg-zinc-900/50 border outline-none text-xs text-slate-100 placeholder-slate-600 transition-all font-sans ${
                errors.password
                  ? 'border-red-500/80 focus:border-red-500 focus:ring-1 focus:ring-red-500/50'
                  : 'border-zinc-800 focus:border-[#00f0ff] focus:ring-1 focus:ring-[#00f0ff]'
              }`}
            />
          </div>
          {errors.password && (
            <span className="font-mono text-[9px] text-red-400 uppercase tracking-wider pl-1">
              {errors.password}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="font-mono text-[9px] text-slate-400 tracking-wider uppercase">Confirm Password</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
              }}
              placeholder="••••••••"
              className={`w-full pl-10 pr-4 py-2 rounded-xl bg-zinc-900/50 border outline-none text-xs text-slate-100 placeholder-slate-600 transition-all font-sans ${
                errors.confirmPassword
                  ? 'border-red-500/80 focus:border-red-500 focus:ring-1 focus:ring-red-500/50'
                  : 'border-zinc-800 focus:border-[#00f0ff] focus:ring-1 focus:ring-[#00f0ff]'
              }`}
            />
          </div>
          {errors.confirmPassword && (
            <span className="font-mono text-[9px] text-red-400 uppercase tracking-wider pl-1">
              {errors.confirmPassword}
            </span>
          )}
        </div>

        {/* Primary Button */}
        <button
          onClick={() => {
            const nextErrors: SignUpErrors = {};
            if (!username.trim()) {
              nextErrors.username = 'Full name is required.';
            }
            if (!email.trim()) {
              nextErrors.email = 'Email address is required.';
            } else if (!email.includes('@')) {
              nextErrors.email = 'Please enter a valid email address.';
            }
            if (!password) {
              nextErrors.password = 'Password is required.';
            } else if (password.length < 6) {
              nextErrors.password = 'Password must be at least 6 characters.';
            }
            if (password !== confirmPassword) {
              nextErrors.confirmPassword = 'Passwords do not match.';
            }

            if (Object.keys(nextErrors).length > 0) {
              setErrors(nextErrors);
            } else {
              setErrors({});
              onSignUp(username.trim(), email.trim());
            }
          }}
          className="w-full py-2.5 px-4 mt-3 rounded-xl bg-[#00f0ff] text-slate-950 font-display text-xs font-bold tracking-wider hover:bg-cyan-300 active:scale-[0.98] transition-all flex items-center justify-center gap-2 uppercase shadow-[0_0_15px_rgba(0,240,255,0.2)] cursor-pointer"
        >
          Sign Up
        </button>
      </div>

      {/* Footer link */}
      <div className="text-center mt-auto pt-5">
        <button
          onClick={onNavigateSignIn}
          className="font-mono text-[9px] text-slate-500 hover:text-slate-300 uppercase tracking-wide transition-colors cursor-pointer focus:outline-none"
        >
          Already have an account? Sign In
        </button>
      </div>
    </div>
  );
}
