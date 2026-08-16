/** Format a USD amount consistently across the app (rounds before formatting to avoid float artifacts). */
export function formatUsd(value: number, digits = 2): string {
  const rounded = Math.round(value * 10 ** digits) / 10 ** digits;
  return rounded.toLocaleString('en-US', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

/** Format a crypto token amount (up to 4 decimals, no trailing zeros). */
export function formatCrypto(value: number): string {
  return value.toLocaleString('en-US', { maximumFractionDigits: 4 });
}

/**
 * Format a ledger transaction amount: crypto-denominated rows display their
 * own unit (e.g. "-0.045 BTC"), everything else is USD ("-$100.40").
 */
export function formatTransactionAmount(amount: number, symbol?: string): string {
  const sign = amount < 0 ? '-' : '+';
  const abs = Math.abs(amount);
  if (symbol) {
    return `${sign}${formatCrypto(abs)} ${symbol}`;
  }
  return `${sign}$${formatUsd(abs)}`;
}
