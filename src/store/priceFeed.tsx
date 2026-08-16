import React, { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { PriceMap } from '../types';

export const INITIAL_PRICES: PriceMap = {
  BTC: 64120.5,
  ETH: 3481.12,
  SOL: 145.22,
  WIO: 0.18,
};

const PRICE_FLOORS: PriceMap = { BTC: 1000, ETH: 100, SOL: 10, WIO: 0.12 };
const PRICE_JITTER: PriceMap = { BTC: 45, ETH: 2.5, SOL: 0.4, WIO: 0.005 };

const PriceFeedContext = createContext<PriceMap | null>(null);

/**
 * Single source of truth for live market prices. One interval drives every
 * screen that shows a valuation (dashboard, vault, market terminal) so the
 * whole app moves together.
 */
export function PriceFeedProvider({ children }: { children: ReactNode }) {
  const [prices, setPrices] = useState<PriceMap>(INITIAL_PRICES);

  useEffect(() => {
    const id = setInterval(() => {
      setPrices((prev) => {
        const next: PriceMap = {};
        for (const symbol of Object.keys(prev)) {
          const jitter = PRICE_JITTER[symbol] ?? 0;
          const floor = PRICE_FLOORS[symbol] ?? 0;
          next[symbol] = Math.max(floor, prev[symbol] + (Math.random() - 0.5) * jitter);
        }
        return next;
      });
    }, 3000);
    return () => clearInterval(id);
  }, []);

  const value = useMemo(() => prices, [prices]);
  return <PriceFeedContext.Provider value={value}>{children}</PriceFeedContext.Provider>;
}

export function usePriceFeed(): PriceMap {
  const ctx = useContext(PriceFeedContext);
  if (!ctx) throw new Error('usePriceFeed must be used within a PriceFeedProvider');
  return ctx;
}
