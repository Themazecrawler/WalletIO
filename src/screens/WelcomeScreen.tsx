import React from 'react';
import { Wallet, Chrome, Apple, Mail } from 'lucide-react';
import Shuffle from '../components/Shuffle';

interface WelcomeScreenProps {
  onSocialLogin: (provider: string) => void;
  onNavigateSignIn: () => void;
  onNavigateSignUp: () => void;
}

export default function WelcomeScreen({ onSocialLogin, onNavigateSignIn, onNavigateSignUp }: WelcomeScreenProps) {
  return (
    <div className="flex-1 flex flex-col z-10 py-4 h-full relative justify-end">
      {/* Welcome text - slightly above the center of the page */}
      <div className="flex-1 flex flex-col items-center justify-center -translate-y-10 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-cyan-950/50 border border-cyan-500/30 flex items-center justify-center text-[#00f0ff] animate-pulse backdrop-blur-md">
          <Wallet className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <Shuffle
            text="WELCOME TO WALLETIO"
            shuffleDirection="right"
            duration={0.35}
            animationMode="evenodd"
            shuffleTimes={3}
            ease="power3.out"
            stagger={0.03}
            threshold={0.1}
            triggerOnce={false}
            triggerOnHover={false}
            loop={true}
            loopDelay={4}
            scrambleCharset="ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$"
            respectReducedMotion={true}
            tag="h1"
            className="font-display text-2xl font-bold tracking-tight text-slate-100"
          />
          <p className="font-sans text-xs text-slate-400">Your secure digital crypto wallet</p>
        </div>
      </div>

      {/* Authentication Providers - moved lower on the screen */}
      <div className="space-y-3.5 w-full mb-6">
        {/* Google Button */}
        <button
          onClick={() => onSocialLogin('Google')}
          className="w-full py-3.5 px-4 rounded-xl bg-zinc-950/70 border border-zinc-800/60 hover:border-cyan-500/40 text-slate-200 font-display text-xs font-medium tracking-wider active:scale-[0.98] transition-all flex items-center justify-center gap-3 cursor-pointer backdrop-blur-md uppercase"
        >
          <Chrome className="w-4.5 h-4.5 text-[#ea4335]" />
          <span>Sign In with Google</span>
        </button>

        {/* Apple Button */}
        <button
          onClick={() => onSocialLogin('Apple')}
          className="w-full py-3.5 px-4 rounded-xl bg-zinc-950/70 border border-zinc-800/60 hover:border-cyan-500/40 text-slate-200 font-display text-xs font-medium tracking-wider active:scale-[0.98] transition-all flex items-center justify-center gap-3 cursor-pointer backdrop-blur-md uppercase"
        >
          <Apple className="w-4.5 h-4.5 text-white" />
          <span>Sign In with Apple</span>
        </button>

        {/* Email Button */}
        <button
          onClick={onNavigateSignIn}
          className="w-full py-3.5 px-4 rounded-xl bg-[#00f0ff] text-slate-950 font-display text-xs font-bold tracking-wider hover:bg-cyan-300 active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 uppercase shadow-[0_0_20px_rgba(0,240,255,0.25)] cursor-pointer"
        >
          <Mail className="w-4.5 h-4.5" />
          <span>Sign In with Email</span>
        </button>
      </div>

      {/* Footer navigation */}
      <div className="text-center mb-2">
        <button
          onClick={onNavigateSignUp}
          className="font-mono text-[10px] text-slate-400 hover:text-cyan-400 uppercase tracking-widest cursor-pointer transition-colors"
        >
          Sign Up
        </button>
      </div>
    </div>
  );
}
