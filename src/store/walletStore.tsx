import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type Dispatch,
  type ReactNode,
} from 'react';
import { CryptoAsset, SecurityHubState, Transaction } from '../types';
import { INITIAL_ASSETS, INITIAL_TRANSACTIONS } from '../data';

export interface WalletState {
  transactions: Transaction[];
  assets: CryptoAsset[];
  /** USD cash available for transfers and market swaps. */
  liquidityBalance: number;
  securityState: SecurityHubState;
}

export type WalletAction =
  | { type: 'ADD_TRANSACTION'; transaction: Transaction }
  | { type: 'UPDATE_ASSET_BALANCE'; assetId: string; newBalance: number }
  | { type: 'SET_LIQUIDITY'; balance: number }
  | { type: 'TOGGLE_SECURITY'; key: keyof SecurityHubState }
  | { type: 'SET_SECURITY'; state: SecurityHubState };

export const initialWalletState: WalletState = {
  transactions: INITIAL_TRANSACTIONS,
  assets: INITIAL_ASSETS,
  liquidityBalance: 42069,
  securityState: { biometricUnlock: true, twoFactorProtocol: true },
};

export function walletReducer(state: WalletState, action: WalletAction): WalletState {
  switch (action.type) {
    case 'ADD_TRANSACTION':
      return { ...state, transactions: [action.transaction, ...state.transactions] };
    case 'UPDATE_ASSET_BALANCE':
      return {
        ...state,
        assets: state.assets.map((asset) =>
          asset.id === action.assetId ? { ...asset, balance: action.newBalance } : asset,
        ),
      };
    case 'SET_LIQUIDITY':
      return { ...state, liquidityBalance: action.balance };
    case 'TOGGLE_SECURITY':
      return {
        ...state,
        securityState: { ...state.securityState, [action.key]: !state.securityState[action.key] },
      };
    case 'SET_SECURITY':
      return { ...state, securityState: action.state };
  }
}

// --- Versioned persistence -------------------------------------------------

// v2: seed asset id changed from 'asset-aur' to 'asset-wio' (AUR unified into WIO).
export const WALLET_STORAGE_KEY = 'walletio:wallet:v2';

function isWalletState(value: unknown): value is WalletState {
  if (!value || typeof value !== 'object') return false;
  const s = value as Record<string, unknown>;
  return (
    Array.isArray(s.transactions) &&
    Array.isArray(s.assets) &&
    typeof s.liquidityBalance === 'number' &&
    !!s.securityState &&
    typeof s.securityState === 'object'
  );
}

/** Read persisted wallet state, falling back to `null` on missing/malformed data. */
export function hydrateWalletState(): WalletState | null {
  try {
    const raw = localStorage.getItem(WALLET_STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isWalletState(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export interface WalletContextValue extends WalletState {
  dispatch: Dispatch<WalletAction>;
}

const WalletContext = createContext<WalletContextValue | null>(null);

interface WalletProviderProps {
  children: ReactNode;
  /** Overrides hydration (used by tests to inject a known starting state). */
  initialState?: WalletState;
  /** Set false to skip reading/writing localStorage (used by tests). */
  persist?: boolean;
}

export function WalletProvider({ children, initialState, persist = true }: WalletProviderProps) {
  const [state, dispatch] = useReducer(walletReducer, undefined, () => {
    if (initialState) return initialState;
    return hydrateWalletState() ?? initialWalletState;
  });

  useEffect(() => {
    if (!persist) return;
    try {
      localStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Storage unavailable or full — demo data only, ignore.
    }
  }, [state, persist]);

  const value = useMemo<WalletContextValue>(() => ({ ...state, dispatch }), [state]);
  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet(): WalletContextValue {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used within a WalletProvider');
  return ctx;
}
