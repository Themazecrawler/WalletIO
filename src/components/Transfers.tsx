import React, { useState } from 'react';
import { Bolt, CheckCircle2, Loader2, Plus, QrCode } from 'lucide-react';
import { CONTACTS } from '../data';
import { Contact, Transaction } from '../types';

interface TransfersProps {
  onAddTransaction: (tx: Transaction) => void;
  onShowNotification: (msg: string) => void;
  onSettleTransfer: (amount: number) => void;
  onScanQRCode: () => void;
  is2FAActive: boolean;
  onRequest2FA: (action: () => void, title: string) => void;
}

export default function Transfers({ onAddTransaction, onShowNotification, onSettleTransfer, onScanQRCode, is2FAActive, onRequest2FA }: TransfersProps) {
  const [selectedContact, setSelectedContact] = useState<Contact>(CONTACTS[0]);
  const [enteringAmount, setEnteringAmount] = useState('0.00');
  const [beamState, setBeamState] = useState<'idle' | 'beaming' | 'success'>('idle');

  const handleNumClick = (digit: string) => {
    if (beamState !== 'idle') return;

    if (enteringAmount === '0.00' || enteringAmount === '0') {
      if (digit === '.') {
        setEnteringAmount('0.');
      } else {
        setEnteringAmount(digit);
      }
    } else {
      // Decimal checks
      if (digit === '.' && enteringAmount.includes('.')) return;
      if (enteringAmount.includes('.') && enteringAmount.split('.')[1].length >= 2) return;
      if (enteringAmount.length >= 8) return; // limit size
      setEnteringAmount(prev => prev + digit);
    }
  };

  const handleBackspace = () => {
    if (beamState !== 'idle') return;

    if (enteringAmount.length <= 1) {
      setEnteringAmount('0.00');
    } else {
      setEnteringAmount(prev => prev.slice(0, -1));
    }
  };

  const handleSecureBeam = () => {
    const amountVal = parseFloat(enteringAmount);
    if (isNaN(amountVal) || amountVal <= 0) {
      onShowNotification('Enter a positive transfer amount first.');
      return;
    }

    const executeBeam = () => {
      setBeamState('beaming');
      
      // Simulate high-tech encryption secure tunnel setup and beaming
      setTimeout(() => {
        setBeamState('success');
        onSettleTransfer(amountVal);

        // Create a transaction record
        const newTx: Transaction = {
          id: `tx-beam-${Date.now()}`,
          title: `To: ${selectedContact.username}`,
          subtitle: 'Outbound Beam',
          amount: -amountVal,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          date: 'Today',
          category: 'P2P',
          status: 'SECURED',
          type: 'outbound',
          iconName: 'bolt'
        };
        onAddTransaction(newTx);

        // Notify
        onShowNotification(`Successfully beamed $${amountVal.toFixed(2)} to ${selectedContact.name} securely!`);

        // Reset
        setTimeout(() => {
          setEnteringAmount('0.00');
          setBeamState('idle');
        }, 2000);

      }, 2500);
    };

    if (is2FAActive) {
      onRequest2FA(executeBeam, "Authorize Outbound Beam");
    } else {
      executeBeam();
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6 animate-fade-in pb-10">
      
      {/* Top Section / Header */}
      <section className="flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <h2 className="font-display text-xl font-bold text-slate-100">Transfers</h2>
          <div className="flex items-center gap-2">
            <button 
              onClick={onScanQRCode}
              className="flex items-center gap-1 px-2 py-1 rounded-lg border border-cyan-500/30 bg-cyan-950/20 text-cyan-400 hover:border-cyan-400 font-mono text-[9px] font-semibold active:scale-95 transition-all cursor-pointer"
              title="Scan recipient's address QR Code"
            >
              <QrCode className="w-3 h-3" />
              <span>SCAN QR</span>
            </button>
            <span className="font-mono text-[10px] text-slate-500 bg-zinc-900/30 px-2.5 py-1 rounded-full border border-zinc-800/30">
              RECENT
            </span>
          </div>
        </div>

        {/* Contacts Horizontal Scroll */}
        <div className="flex gap-4 overflow-x-auto py-2 pr-2 scrollbar-none select-none">
          {CONTACTS.map((contact) => {
            const isSelected = selectedContact.id === contact.id;
            return (
              <button
                key={contact.id}
                onClick={() => setBeamState('idle') || setSelectedContact(contact)}
                className={`flex flex-col items-center gap-2 group focus:outline-none transition-all duration-300 min-w-[70px] ${
                  isSelected ? 'scale-105' : 'opacity-60 hover:opacity-90'
                }`}
              >
                <div className={`w-14 h-14 rounded-full p-0.5 relative transition-transform duration-300 group-active:scale-95 ${
                  isSelected 
                    ? 'border-2 border-cyan-400 shadow-[0_0_12px_rgba(0,240,255,0.4)]' 
                    : 'border border-zinc-800'
                }`}>
                  <img 
                    className="w-full h-full rounded-full object-cover" 
                    alt={contact.name} 
                    src={contact.avatarUrl} 
                  />
                  {contact.active && (
                    <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-[#0a0b10]" />
                  )}
                </div>
                <span className={`text-[11px] font-mono font-medium ${
                  isSelected ? 'text-[#00f0ff] font-bold' : 'text-slate-400'
                }`}>
                  {contact.name}
                </span>
              </button>
            );
          })}

          {/* Invite Contact Button */}
          <button className="flex flex-col items-center gap-2 focus:outline-none">
            <div className="w-14 h-14 rounded-full border border-dashed border-zinc-700 flex items-center justify-center text-slate-500 hover:border-cyan-400/50 hover:text-cyan-400 transition-colors">
              <Plus className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-mono text-slate-500">Invite</span>
          </button>
        </div>
      </section>

      {/* Amount Entry Panel */}
      <section className="glass-card rounded-[24px] p-6 flex flex-col items-center gap-5 bg-zinc-900/30">
        <div className="flex flex-col items-center select-none text-center">
          <span className="font-mono text-[9px] text-[#00f0ff]/60 uppercase tracking-widest">
            Entering Amount
          </span>
          <div className="flex items-baseline mt-1.5">
            <span className="font-display text-xl text-[#00f0ff] opacity-60 mr-1.5">$</span>
            <span className="font-display text-4xl text-slate-100 tracking-tight font-bold" id="amount-display">
              {enteringAmount}
            </span>
            <span className="w-0.5 h-7 bg-cyan-400 ml-1.5 animate-pulse rounded-full" />
          </div>
        </div>

        {/* Numeric Keyboard */}
        <div className="grid grid-cols-3 gap-y-3.5 gap-x-8 w-full max-w-[240px] mt-2 font-display">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0'].map((val) => (
            <button
              key={val}
              onClick={() => handleNumClick(val)}
              className="h-10 flex items-center justify-center text-lg text-slate-100 font-medium rounded-full bg-zinc-900/20 border border-zinc-800/10 hover:bg-zinc-800/55 active:bg-cyan-500/10 active:scale-95 transition-all outline-none"
            >
              {val}
            </button>
          ))}
          {/* Backspace Button */}
          <button
            onClick={handleBackspace}
            className="h-10 flex items-center justify-center text-slate-400 hover:text-slate-100 rounded-full bg-zinc-900/20 active:bg-cyan-500/10 active:scale-95 transition-all outline-none"
            title="Backspace"
          >
            <span className="font-mono text-xs uppercase font-semibold">DEL</span>
          </button>
        </div>
      </section>

      {/* Action / Beam Trigger button */}
      <div className="flex flex-col gap-3.5 mt-2">
        <button 
          onClick={handleSecureBeam}
          disabled={beamState !== 'idle'}
          className={`w-full h-14 rounded-2xl flex items-center justify-center gap-2.5 shadow-lg select-none outline-none font-semibold transition-all duration-300 ${
            beamState === 'idle'
              ? 'bg-gradient-to-r from-cyan-400 to-fuchsia-500 text-slate-950 hover:brightness-110 active:scale-[0.98]'
              : beamState === 'beaming'
              ? 'bg-zinc-800 text-[#00f0ff] border border-cyan-500/20 cursor-wait'
              : 'bg-emerald-400 text-emerald-950 font-bold'
          }`}
        >
          {beamState === 'idle' && (
            <>
              <Bolt className="w-5 h-5 fill-slate-950" />
              <span className="font-display tracking-tight text-sm">Secure Beam</span>
            </>
          )}

          {beamState === 'beaming' && (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="font-display tracking-tight text-sm">Quantum Tunnel Setup...</span>
            </>
          )}

          {beamState === 'success' && (
            <>
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-display tracking-tight text-sm">Securely Beamed!</span>
            </>
          )}
        </button>

        <p className="text-center font-mono text-[9px] text-slate-400/60 leading-snug">
          Encrypted P2P tunnel active • ZERO network settlement fees
        </p>
      </div>

    </div>
  );
}
