import { Transaction } from '../types';

export interface LedgerFilters {
  search: string;
  asset: string; // 'all' or an asset symbol
  type: string; // 'all' | 'inbound' | 'outbound'
}

/**
 * Filter the ledger by free-text search, asset symbol, and transfer direction.
 * Pure function so it can be unit tested and reused by any ledger view.
 */
export function filterTransactions(
  transactions: Transaction[],
  filters: LedgerFilters,
): Transaction[] {
  const query = filters.search.trim().toLowerCase();
  const asset = filters.asset.toLowerCase();
  const type = filters.type;

  return transactions.filter((tx) => {
    const matchesSearch =
      !query ||
      tx.title.toLowerCase().includes(query) ||
      tx.subtitle.toLowerCase().includes(query) ||
      tx.category.toLowerCase().includes(query) ||
      (tx.currencySymbol != null && tx.currencySymbol.toLowerCase().includes(query));

    const matchesAsset =
      asset === 'all' ||
      (tx.currencySymbol != null && tx.currencySymbol.toLowerCase() === asset);

    const matchesType = type === 'all' || tx.type === type;

    return matchesSearch && matchesAsset && matchesType;
  });
}
