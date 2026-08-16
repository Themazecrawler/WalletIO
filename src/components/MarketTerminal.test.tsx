import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import MarketTerminal from './MarketTerminal';
import { WalletProvider, initialWalletState, useWallet, type WalletState } from '../store/walletStore';
import { PriceFeedProvider } from '../store/priceFeed';
import { INITIAL_ASSETS } from '../data';

function makeInitial(): WalletState {
  return {
    ...initialWalletState,
    liquidityBalance: 1000,
    assets: INITIAL_ASSETS.map((a) =>
      a.id === 'asset-wio' ? { ...a, balance: 100 } : a,
    ),
  };
}

function StoreProbe() {
  const { liquidityBalance, assets, transactions } = useWallet();
  const wio = assets.find((a) => a.id === 'asset-wio')?.balance ?? 0;
  return (
    <div data-testid="probe">
      {liquidityBalance}|{wio}|{transactions.length}
    </div>
  );
}

function renderMarket() {
  const notify = vi.fn();
  render(
    <WalletProvider initialState={makeInitial()} persist={false}>
      <PriceFeedProvider>
        <MarketTerminal onShowNotification={notify} />
        <StoreProbe />
      </PriceFeedProvider>
    </WalletProvider>,
  );
  return { notify };
}

function openDeskAndSwap(amount: string, sellLabel?: string) {
  fireEvent.click(screen.getByRole('button', { name: /open trading desk/i }));
  if (sellLabel) {
    fireEvent.click(screen.getByRole('button', { name: sellLabel }));
  }
  fireEvent.change(screen.getByPlaceholderText('100.00'), { target: { value: amount } });
  fireEvent.click(screen.getByRole('button', { name: /execute swap/i }));
}

describe('MarketTerminal swaps', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('blocks a buy that exceeds USD liquidity', () => {
    const { notify } = renderMarket();

    openDeskAndSwap('5000');

    expect(notify).toHaveBeenCalledWith(expect.stringContaining('Insufficient USD'));
    expect(screen.getByTestId('probe')).toHaveTextContent('1000|100|8');
  });

  it('executes a buy and moves WIO into the vault', () => {
    const { notify } = renderMarket();

    openDeskAndSwap('100');
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    // 1000 - 100 USD; WIO 100 + 100 / 0.18; one swap transaction recorded
    expect(screen.getByTestId('probe')).toHaveTextContent(/^900\|65[0-9.]+\|9$/);
    expect(notify).toHaveBeenCalledWith(expect.stringContaining('Succeeded! Swapped $100.00'));
  });

  it('blocks selling more WIO than held', () => {
    const { notify } = renderMarket();

    openDeskAndSwap('500', 'WIO → USD (Sell)');

    expect(notify).toHaveBeenCalledWith(expect.stringContaining('Insufficient WIO'));
    expect(screen.getByTestId('probe')).toHaveTextContent('1000|100|8');
  });

  it('executes a sell, credits USD, and debits WIO', () => {
    const { notify } = renderMarket();

    openDeskAndSwap('50', 'WIO → USD (Sell)');
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    // 1000 + 50 * 0.18 = 1009; WIO 100 - 50 = 50; one transaction
    expect(screen.getByTestId('probe')).toHaveTextContent('1009|50|9');
    expect(notify).toHaveBeenCalledWith(expect.stringContaining('Succeeded! Sold 50 WIO'));
  });
});
