export type Page = 'vault' | 'transfers' | 'crypto' | 'market' | 'ledger' | 'profile';

export interface Transaction {
  id: string;
  title: string;
  subtitle: string;
  amount: number;
  time: string;
  date: string;
  category: string;
  status: 'PENDING' | 'SETTLED' | 'SECURED';
  type: 'inbound' | 'outbound';
  iconName: string;
  currencySymbol?: string;
}

export interface CryptoAsset {
  id: string;
  name: string;
  symbol: string;
  balance: number;
  priceUsd: number;
  change24h: number;
  sparkline: number[];
  icon: string;
  bgClass: string;
  borderClass: string;
  textClass: string;
}

export interface Contact {
  id: string;
  name: string;
  username: string;
  avatarUrl: string;
  active: boolean;
}

export interface SecurityHubState {
  biometricUnlock: boolean;
  twoFactorProtocol: boolean;
}
