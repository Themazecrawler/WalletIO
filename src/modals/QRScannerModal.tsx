import React, { useState } from 'react';
import { QrCode, X, Camera, CheckCircle2 } from 'lucide-react';

interface QRScannerModalProps {
  onClose: () => void;
  onUseAddress: (handle: string) => void;
  showNotification: (msg: string) => void;
}

export default function QRScannerModal({ onClose, onUseAddress, showNotification }: QRScannerModalProps) {
  const [qrScanResult, setQrScanResult] = useState<string | null>(null);

  return (
    <div className="absolute inset-0 bg-zinc-950/85 backdrop-blur-md flex flex-col items-center justify-center p-6 select-none animate-fade-in">
      <div className="w-full max-w-sm bg-zinc-900 border border-cyan-500/30 rounded-2xl p-5 relative overflow-hidden shadow-[0_0_30px_rgba(0,240,255,0.15)] flex flex-col gap-4">
        {/* Header */}
        <div className="flex justify-between items-center text-cyan-400">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5" />
            <span className="font-display text-sm font-bold tracking-wide uppercase">QR Scanner</span>
          </div>
          <button
            onClick={() => {
              setQrScanResult(null);
              onClose();
            }}
            className="p-1 rounded-lg border border-zinc-800 bg-zinc-950/50 hover:bg-zinc-800 text-slate-400 hover:text-slate-100 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Instruction */}
        <p className="font-sans text-xs text-slate-400 text-center">
          Scan recipient's public key address to prepopulate inbound transfers.
        </p>

        {/* Scanner Area */}
        <div className="relative aspect-square w-full rounded-xl bg-zinc-950 border border-zinc-800/80 overflow-hidden flex flex-col items-center justify-center p-4">
          {/* Target bracket overlays */}
          <div className="absolute top-4 left-4 w-5 h-5 border-t-2 border-l-2 border-cyan-400 rounded-tl" />
          <div className="absolute top-4 right-4 w-5 h-5 border-t-2 border-r-2 border-cyan-400 rounded-tr" />
          <div className="absolute bottom-4 left-4 w-5 h-5 border-b-2 border-l-2 border-cyan-400 rounded-bl" />
          <div className="absolute bottom-4 right-4 w-5 h-5 border-b-2 border-r-2 border-cyan-400 rounded-br" />

          {/* Animating laser line */}
          <div className="absolute left-4 right-4 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_8px_rgba(0,240,255,0.8)] animate-bounce" style={{ animationDuration: '3s' }} />

          {/* Scanning visual states */}
          {!qrScanResult ? (
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="relative">
                <Camera className="w-12 h-12 text-zinc-700 animate-pulse" />
                <QrCode className="w-6 h-6 text-cyan-500/40 absolute -bottom-1 -right-1" />
              </div>
              <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest">
                ALIGN CODE WITHIN BRACKETS
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 text-center p-2 animate-fade-in">
              <div className="w-12 h-12 rounded-full bg-cyan-950/40 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                <CheckCircle2 className="w-6 h-6 animate-pulse" />
              </div>
              <div className="space-y-1">
                <span className="font-mono text-[9px] text-cyan-400 uppercase tracking-widest font-bold">
                  DECODED SUCCESS
                </span>
                <p className="font-mono text-[10px] text-slate-300 bg-zinc-900/80 px-2 py-1 rounded border border-zinc-800 select-all max-w-[220px] truncate">
                  {qrScanResult}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Presets and Simulator Actions */}
        <div className="flex flex-col gap-2">
          {!qrScanResult ? (
            <>
              <button
                onClick={() => {
                  const mockAddresses = [
                    'alex.opt - 0x71C...49a1',
                    'jamie.eth - 0x3Fd...c092',
                    'morgan.sol - 0x9aA...a112',
                    'taylor.base - 0x51E...0a87'
                  ];
                  const chosen = mockAddresses[Math.floor(Math.random() * mockAddresses.length)];
                  setQrScanResult(chosen);
                  showNotification('QR scan simulation completed!');
                }}
                className="w-full py-2 px-3 rounded-xl bg-cyan-950/20 border border-cyan-500/30 text-cyan-400 hover:border-cyan-400 font-mono text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Scan Mock Public Key</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setQrScanResult('alex.opt - 0x71C...49a1');
                    showNotification("Scanned Alex Rivera's public key.");
                  }}
                  className="py-1.5 px-2 rounded-lg bg-zinc-950/60 border border-zinc-800 hover:border-zinc-700 text-slate-300 font-mono text-[9px] uppercase tracking-wide transition-all cursor-pointer"
                >
                  Scan Alex Rivera
                </button>
                <button
                  onClick={() => {
                    setQrScanResult('jamie.eth - 0x3Fd...c092');
                    showNotification("Scanned Jamie Vance's public key.");
                  }}
                  className="py-1.5 px-2 rounded-lg bg-zinc-950/60 border border-zinc-800 hover:border-zinc-700 text-slate-300 font-mono text-[9px] uppercase tracking-wide transition-all cursor-pointer"
                >
                  Scan Jamie Vance
                </button>
              </div>
            </>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onUseAddress(qrScanResult)}
                className="py-2 px-3 rounded-xl bg-cyan-500 text-slate-950 font-display text-[10px] font-bold uppercase tracking-wider transition-all hover:bg-cyan-400 text-center cursor-pointer"
              >
                Use Address
              </button>
              <button
                onClick={() => setQrScanResult(null)}
                className="py-2 px-3 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-slate-300 font-mono text-[10px] uppercase tracking-wider transition-all text-center cursor-pointer"
              >
                Rescan
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
