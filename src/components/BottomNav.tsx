import { Wallet, ArrowLeftRight, Bitcoin, Activity, History } from 'lucide-react';
import { Page } from '../types';

interface BottomNavProps {
  activePage: Page;
  onPageChange: (page: Page) => void;
}

export default function BottomNav({ activePage, onPageChange }: BottomNavProps) {
  const tabs = [
    { id: 'vault' as Page, label: 'Vault', icon: Wallet },
    { id: 'transfers' as Page, label: 'Send', icon: ArrowLeftRight },
    { id: 'crypto' as Page, label: 'Crypto', icon: Bitcoin },
    { id: 'market' as Page, label: 'Market', icon: Activity }
  ];

  return (
    <nav className="sticky bottom-0 w-full z-40 bg-[#1e1f25]/45 backdrop-blur-2xl border-t border-[#00f0ff]/10 rounded-t-2xl shadow-[0_-4px_30px_rgba(0,240,255,0.08)] flex justify-around items-center h-20 px-2 pb-safe">
      {tabs.map((tab) => {
        const IconComponent = tab.icon;
        const isActive = activePage === tab.id;
        
        return (
          <button
            key={tab.id}
            onClick={() => onPageChange(tab.id)}
            className={`flex flex-col items-center justify-center w-14 h-14 transition-all duration-300 ease-out focus:outline-none ${
              isActive 
                ? 'text-[#00f0ff] scale-110 drop-shadow-[0_0_8px_rgba(0,240,255,0.6)] font-bold' 
                : 'text-slate-400 hover:text-cyan-300/80 active:scale-95'
            }`}
          >
            <IconComponent className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'scale-110' : ''}`} />
            <span className="text-[10px] mt-1.5 font-mono tracking-wider">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
