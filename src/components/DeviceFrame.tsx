import React, { useState, useEffect } from 'react';
import { Wifi, Battery, ShieldAlert, X } from 'lucide-react';

interface DeviceFrameProps {
  children: React.ReactNode;
  onCloseNotification?: () => void;
  notificationMessage?: string | null;
}

export default function DeviceFrame({ children, notificationMessage, onCloseNotification }: DeviceFrameProps) {
  const [time, setTime] = useState('09:41');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      setTime(`${hours}:${minutes} ${ampm}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-10 bg-[#06070a] text-slate-100 selection:bg-cyan-500/30 font-sans p-4 relative overflow-hidden">
      {/* Background ambient neon glows */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-cyan-500/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-fuchsia-500/10 blur-[150px] rounded-full pointer-events-none" />

      {/* Main Container */}
      <div className="relative w-full max-w-[412px] h-[860px] bg-[#0c0d12] rounded-[52px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] border-[10px] border-zinc-800 flex flex-col overflow-hidden select-none">
        
        {/* Simulated Speaker / Camera Island (Dynamic Island / Notch) */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-8 bg-zinc-900 rounded-b-2xl z-50 flex items-center justify-between px-5">
          <div className="w-2.5 h-2.5 bg-zinc-800 rounded-full border border-zinc-700/50" />
          <div className="w-16 h-1.5 bg-zinc-800 rounded-full" />
          <div className="w-2.5 h-2.5 bg-blue-900/60 rounded-full border border-blue-800/40" />
        </div>

        {/* Status Bar */}
        <div className="h-12 bg-transparent flex justify-between items-center px-7 pt-2 text-[12px] font-mono tracking-tight font-medium text-slate-300 z-40 select-none">
          <div>{time}</div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] bg-cyan-950/50 text-cyan-400 px-1.5 py-0.5 rounded border border-cyan-800/50">5G</span>
            <Wifi className="w-3.5 h-3.5" />
            <Battery className="w-4 h-4 text-emerald-400" />
          </div>
        </div>

        {/* Interactive In-App Notification Toast */}
        {notificationMessage && (
          <div className="absolute top-14 left-4 right-4 z-50 animate-bounce">
            <div className="bg-zinc-900/95 border border-cyan-500/30 backdrop-blur-xl p-3.5 rounded-2xl shadow-lg flex items-center justify-between gap-3 text-sm">
              <div className="flex items-center gap-2.5 text-cyan-400">
                <ShieldAlert className="w-5 h-5" />
                <span className="text-xs text-slate-200 leading-snug">{notificationMessage}</span>
              </div>
              <button 
                onClick={onCloseNotification} 
                className="text-slate-400 hover:text-slate-200 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Device Viewport / Canvas Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden relative flex flex-col bg-[#0A0B10]">
          {children}
        </div>

        {/* Simulated Physical Bottom Indicator Bar */}
        <div className="h-6 bg-transparent flex justify-center items-center z-40">
          <div className="w-32 h-1 bg-zinc-700 rounded-full" />
        </div>
      </div>

      {/* Under-phone metadata note */}
      <div className="mt-4 text-center">
        <p className="text-xs text-slate-500 font-mono tracking-wider uppercase">WalletIO OS v1.42 • Tier 7 Encryption</p>
      </div>
    </div>
  );
}
