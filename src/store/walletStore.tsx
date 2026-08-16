import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useCallback,
  type Dispatch,
  type ReactNode,
} from 'react';
import { CryptoAsset, SecurityHubState, Transaction } from '../types';
import { INITIAL_ASSETS, INITIAL_TRANSACTIONS } from '../data';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import {
  applyServerMovement,
  fetchServerBalances,
  recordServerLedger,
  type ServerBalances,
} from '../lib/balances';

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
  | { type: 'SET_SECURITY'; state: SecurityHubState }
  | { type: 'HYDRATE_BALANCES'; balances: ServerBalances };

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
    case 'HYDRATE_BALANCES':
      // Server values win over local demo data; 'USD' is the cash liquidity.
      return {
        ...state,
        liquidityBalance: Number.isFinite(action.balances.USD)
          ? action.balances.USD
          : state.liquidityBalance,
        assets: state.assets.map((asset) =>
          Number.isFinite(action.balances[asset.symbol])
            ? { ...asset, balance: action.balances[asset.symbol] }
            : asset,
        ),
      };
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
  /** Surfaced when the server rejects a balance movement (e.g. insufficient funds). */
  onServerError?: (message: string) => void;
}

export function WalletProvider({ children, initialState, persist = true, onServerError }: WalletProviderProps) {
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

  // Latest confirmed state (used to compute deltas for server movements).
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const onServerErrorRef = useRef(onServerError);
  useEffect(() => {
    onServerErrorRef.current = onServerError;
  }, [onServerError]);

  // True only when a real Supabase session exists — set on sign-in, cleared
  // on sign-out. Demo mode (no backend, or no server session) stays a plain
  // synchronous local store, exactly as before.
  const supabaseSessionRef = useRef(false);

  const dispatchRef = useRef(dispatch);

  /**
   * Money mutations are applied through the server RPC first when a Supabase
   * session is live, and local state is updated from the server-confirmed
   * balance — so balances are server-authoritative and can't go negative.
   * Transactions are recorded best-effort to the server ledger.
   */
  const serverAwareDispatch = useCallback((action: WalletAction) => {
    const baseDispatch = dispatchRef.current;
    if (!supabaseSessionRef.current) {
      baseDispatch(action);
      return;
    }

    if (action.type === 'SET_LIQUIDITY') {
      const delta = action.balance - stateRef.current.liquidityBalance;
      if (delta === 0) return;
      void applyServerMovement('USD', delta).then((newBalance) => {
        if (newBalance === null) {
          onServerErrorRef.current?.('Balance change rejected by the server. Your funds were not moved.');
          return;
        }
        baseDispatch({ type: 'SET_LIQUIDITY', balance: newBalance });
      });
      return;
    }

    if (action.type === 'UPDATE_ASSET_BALANCE') {
      const asset = stateRef.current.assets.find((a) => a.id === action.assetId);
      if (!asset) return;
      const delta = action.newBalance - asset.balance;
      if (delta === 0) return;
      void applyServerMovement(asset.symbol, delta).then((newBalance) => {
        if (newBalance === null) {
          onServerErrorRef.current?.(`${asset.symbol} balance change rejected by the server.`);
          return;
        }
        baseDispatch({ type: 'UPDATE_ASSET_BALANCE', assetId: action.assetId, newBalance });
      });
      return;
    }

    if (action.type === 'ADD_TRANSACTION') {
      baseDispatch(action);
      void recordServerLedger(action.transaction);
      return;
    }

    baseDispatch(action);
  }, []);

  // Track the Supabase session and hydrate balances from the server whenever
  // a real session exists (initial load with a persisted session, or sign-in).
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;
    const hydrate = async () => {
      const balances = await fetchServerBalances();
      if (balances && Object.keys(balances).length > 0) {
        dispatchRef.current({ type: 'HYDRATE_BALANCES', balances });
      }
    };
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      supabaseSessionRef.current = Boolean(session);
      if (session) void hydrate();
    });
    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        supabaseSessionRef.current = true;
        void hydrate();
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const value = useMemo<WalletContextValue>(
    () => ({ ...state, dispatch: serverAwareDispatch }),
    [state, serverAwareDispatch],
  );
  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet(): WalletContextValue {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used within a WalletProvider');
  return ctx;
}
