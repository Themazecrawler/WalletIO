import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CryptoVault from './CryptoVault';
import { WalletProvider, initialWalletState } from '../store/walletStore';
import { PriceFeedProvider } from '../store/priceFeed';

function renderVault() {
  const notify = vi.fn();
  render(
    <WalletProvider initialState={initialWalletState} persist={false}>
      <PriceFeedProvider>
        <CryptoVault onShowNotification={notify} onNavigateToHistory={() => {}} />
      </PriceFeedProvider>
    </WalletProvider>,
  );
  return { notify };
}

describe('CryptoVault', () => {
  it('rejects a withdraw larger than the held balance', () => {
    const { notify } = renderVault();

    fireEvent.click(screen.getByRole('button', { name: 'WITHDRAW' }));
    fireEvent.change(screen.getByPlaceholderText('0.05'), { target: { value: '5' } });
    fireEvent.click(screen.getByRole('button', { name: /confirm quantum withdrawal/i }));

    expect(notify).toHaveBeenCalledWith(expect.stringMatching(/insufficient btc balance/i));
    // BTC balance unchanged at 1.248
    expect(screen.getAllByText(/1\.248/).length).toBeGreaterThan(0);
  });

  it('deposits increase the asset balance', () => {
    const { notify } = renderVault();

    fireEvent.click(screen.getByRole('button', { name: 'DEPOSIT' }));
    fireEvent.change(screen.getByPlaceholderText('0.05'), { target: { value: '0.5' } });
    fireEvent.click(screen.getByRole('button', { name: /confirm quantum deposit/i }));

    expect(notify).toHaveBeenCalledWith(expect.stringMatching(/successfully deposited 0.5 btc/i));
    expect(screen.getAllByText(/1\.748/).length).toBeGreaterThan(0);
  });

  it('rejects non-numeric or non-positive amounts', () => {
    const { notify } = renderVault();

    fireEvent.click(screen.getByRole('button', { name: 'DEPOSIT' }));
    fireEvent.change(screen.getByPlaceholderText('0.05'), { target: { value: '-2' } });
    fireEvent.click(screen.getByRole('button', { name: /confirm quantum deposit/i }));

    expect(notify).toHaveBeenCalledWith('Enter a valid positive number.');
    expect(screen.getAllByText(/1\.248/).length).toBeGreaterThan(0);
  });
});
