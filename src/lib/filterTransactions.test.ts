import { describe, it, expect } from 'vitest';
import { filterTransactions } from './filterTransactions';
import { INITIAL_TRANSACTIONS } from '../data';

const noFilters = { search: '', asset: 'all', type: 'all' };

describe('filterTransactions', () => {
  it('returns everything for default filters', () => {
    expect(filterTransactions(INITIAL_TRANSACTIONS, noFilters)).toHaveLength(INITIAL_TRANSACTIONS.length);
  });

  it('filters by search across title, subtitle, category, and symbol', () => {
    const byTitle = filterTransactions(INITIAL_TRANSACTIONS, { ...noFilters, search: 'rent' }).map((t) => t.id);
    expect(byTitle).toEqual(['tx-2']);

    const bySubtitle = filterTransactions(INITIAL_TRANSACTIONS, { ...noFilters, search: 'nasdaq' }).map((t) => t.id);
    expect(bySubtitle).toEqual(['tx-1']);

    const byCategory = filterTransactions(INITIAL_TRANSACTIONS, { ...noFilters, search: 'subscription' }).map((t) => t.id);
    expect(byCategory).toEqual(['tx-8']);

    const bySymbol = filterTransactions(INITIAL_TRANSACTIONS, { ...noFilters, search: 'btc' }).map((t) => t.id);
    expect(bySymbol).toEqual(['tx-5']);
  });

  it('is case-insensitive', () => {
    const res = filterTransactions(INITIAL_TRANSACTIONS, { ...noFilters, search: 'NASDAQ' });
    expect(res.map((t) => t.id)).toEqual(['tx-1']);
  });

  it('filters by asset symbol', () => {
    const eth = filterTransactions(INITIAL_TRANSACTIONS, { ...noFilters, asset: 'ETH' });
    expect(eth.every((t) => t.currencySymbol === 'ETH')).toBe(true);
    expect(eth.map((t) => t.id)).toEqual(['tx-2', 'tx-3', 'tx-7']);
  });

  it('filters by type', () => {
    const inbound = filterTransactions(INITIAL_TRANSACTIONS, { ...noFilters, type: 'inbound' });
    expect(inbound.every((t) => t.type === 'inbound')).toBe(true);
    expect(inbound.map((t) => t.id)).toEqual(['tx-4', 'tx-6']);
  });

  it('combines asset and type filters', () => {
    const res = filterTransactions(INITIAL_TRANSACTIONS, { ...noFilters, asset: 'WIO', type: 'outbound' });
    expect(res.map((t) => t.id)).toEqual(['tx-1', 'tx-8']);
  });

  it('returns an empty list when nothing matches', () => {
    expect(filterTransactions(INITIAL_TRANSACTIONS, { ...noFilters, search: 'zzzz' })).toEqual([]);
  });
});
