import { supabase, isSupabaseConfigured } from './supabase';
import type { Transaction } from '../types';

/**
 * Server-authoritative balances. When Supabase is configured and the user
 * has a real session these functions talk to the `wallet_balances` /
 * `ledger_entries` tables (RLS-enforced, seeded by supabase/migrations).
 * Every method returns null/false when the backend isn't available so the
 * app falls back to the local simulated demo behavior unchanged.
 */

export type ServerBalances = Record<string, number>;

/** Fetch the signed-in user's balances keyed by symbol ('USD' = liquidity). */
export async function fetchServerBalances(): Promise<ServerBalances | null> {
  if (!isSupabaseConfigured || !supabase) return null;
  const { data, error } = await supabase
    .from('wallet_balances')
    .select('symbol, balance');
  if (error) return null;
  const balances: ServerBalances = {};
  for (const row of data ?? []) {
    const value = Number(row.balance);
    if (Number.isFinite(value)) balances[String(row.symbol)] = value;
  }
  return balances;
}

/**
 * Apply a signed delta to a balance through the `walletio_apply_movement`
 * RPC. Returns the new server-confirmed balance, or null when the movement
 * was rejected (insufficient funds, not authenticated, RPC unavailable).
 */
export async function applyServerMovement(symbol: string, delta: number): Promise<number | null> {
  if (!isSupabaseConfigured || !supabase) return null;
  if (!Number.isFinite(delta) || delta === 0) return null;
  const { data, error } = await supabase.rpc('walletio_apply_movement', {
    p_symbol: symbol,
    p_delta: delta,
  });
  if (error) return null;
  const balance = Number(data);
  return Number.isFinite(balance) ? balance : null;
}

/** Best-effort append of a transaction to the server ledger. */
export async function recordServerLedger(tx: Transaction): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;
  const { error } = await supabase.from('ledger_entries').insert({
    title: tx.title,
    subtitle: tx.subtitle,
    amount: tx.amount,
    category: tx.category,
    status: tx.status,
    type: tx.type,
    currency_symbol: tx.currencySymbol ?? 'USD',
  });
  return !error;
}
