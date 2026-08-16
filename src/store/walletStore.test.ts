import { describe, it, expect, beforeEach } from 'vitest';
import {
  walletReducer,
  initialWalletState,
  hydrateWalletState,
  WALLET_STORAGE_KEY,
  type WalletState,
} from './walletStore';
import { INITIAL_TRANSACTIONS, INITIAL_ASSETS } from '../data';

describe('walletReducer', () => {
  it('prepends new transactions', () => {
    const tx = { ...INITIAL_TRANSACTIONS[0], id: 'tx-test-1', title: 'Test Tx' };
    const next = walletReducer(initialWalletState, { type: 'ADD_TRANSACTION', transaction: tx });
    expect(next.transactions).toHaveLength(initialWalletState.transactions.length + 1);
    expect(next.transactions[0].id).toBe('tx-test-1');
  });

  it('updates only the matching asset balance', () => {
    const next = walletReducer(initialWalletState, {
      type: 'UPDATE_ASSET_BALANCE',
      assetId: 'asset-btc',
      newBalance: 2.5,
    });
    expect(next.assets.find((a) => a.id === 'asset-btc')?.balance).toBe(2.5);
    expect(next.assets.find((a) => a.id === 'asset-eth')?.balance).toBe(18.52);
    expect(next.assets).toHaveLength(initialWalletState.assets.length);
  });

  it('sets the liquidity balance', () => {
    const next = walletReducer(initialWalletState, { type: 'SET_LIQUIDITY', balance: 123.45 });
    expect(next.liquidityBalance).toBe(123.45);
  });

  it('toggles a security key without touching the other', () => {
    const next = walletReducer(initialWalletState, { type: 'TOGGLE_SECURITY', key: 'twoFactorProtocol' });
    expect(next.securityState.twoFactorProtocol).toBe(false);
    expect(next.securityState.biometricUnlock).toBe(true);
  });

  it('sets the full security state', () => {
    const next = walletReducer(initialWalletState, {
      type: 'SET_SECURITY',
      state: { biometricUnlock: false, twoFactorProtocol: true },
    });
    expect(next.securityState).toEqual({ biometricUnlock: false, twoFactorProtocol: true });
  });

  it('hydrates server balances by symbol, overriding local demo values', () => {
    const next = walletReducer(initialWalletState, {
      type: 'HYDRATE_BALANCES',
      balances: { USD: 1000, BTC: 0.5, WIO: 12345 },
    });
    expect(next.liquidityBalance).toBe(1000);
    expect(next.assets.find((a) => a.id === 'asset-btc')?.balance).toBe(0.5);
    expect(next.assets.find((a) => a.id === 'asset-wio')?.balance).toBe(12345);
    // Symbols not present in the server payload keep their local balance.
    expect(next.assets.find((a) => a.id === 'asset-eth')?.balance).toBe(18.52);
  });

  it('hydrate ignores malformed balances', () => {
    const next = walletReducer(initialWalletState, {
      type: 'HYDRATE_BALANCES',
      balances: { USD: Number.NaN, BTC: 2.5 },
    });
    expect(next.liquidityBalance).toBe(initialWalletState.liquidityBalance);
    expect(next.assets.find((a) => a.id === 'asset-btc')?.balance).toBe(2.5);
  });
});

describe('wallet persistence', () => {
  beforeEach(() => localStorage.clear());

  it('hydrates a previously persisted state', () => {
    const persisted: WalletState = {
      transactions: [INITIAL_TRANSACTIONS[0]],
      assets: INITIAL_ASSETS,
      liquidityBalance: 777,
      securityState: { biometricUnlock: false, twoFactorProtocol: false },
    };
    localStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify(persisted));
    expect(hydrateWalletState()).toEqual(persisted);
  });

  it('returns null when nothing is stored', () => {
    expect(hydrateWalletState()).toBeNull();
  });

  it('returns null for malformed JSON', () => {
    localStorage.setItem(WALLET_STORAGE_KEY, '{not json');
    expect(hydrateWalletState()).toBeNull();
  });

  it('returns null for data with the wrong shape', () => {
    localStorage.setItem(
      WALLET_STORAGE_KEY,
      JSON.stringify({ transactions: [], assets: [], liquidityBalance: 'nope' }),
    );
    expect(hydrateWalletState()).toBeNull();
  });
});
