import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import Transfers from './Transfers';
import { WalletProvider, initialWalletState, useWallet } from '../store/walletStore';

function StoreProbe() {
  const { liquidityBalance, transactions } = useWallet();
  return (
    <div data-testid="probe">
      {liquidityBalance}|{transactions.length}|{transactions[0]?.title ?? ''}
    </div>
  );
}

function renderTransfers(twoFactorProtocol: boolean) {
  const notify = vi.fn();
  const request2FA = vi.fn();
  render(
    <WalletProvider
      initialState={{
        ...initialWalletState,
        securityState: { biometricUnlock: true, twoFactorProtocol },
      }}
      persist={false}
    >
      <Transfers onShowNotification={notify} onScanQRCode={() => {}} onRequest2FA={request2FA} />
      <StoreProbe />
    </WalletProvider>,
  );
  return { notify, request2FA };
}

function enterAmount(amount: string) {
  for (const digit of amount) {
    fireEvent.click(screen.getByRole('button', { name: digit }));
  }
}

describe('Transfers beam', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('blocks a beam with no amount entered', () => {
    const { notify } = renderTransfers(false);
    fireEvent.click(screen.getByRole('button', { name: /secure beam/i }));
    expect(notify).toHaveBeenCalledWith('Enter a positive transfer amount first.');
  });

  it('settles a beam: liquidity is deducted and a transaction is recorded', () => {
    const { notify } = renderTransfers(false);

    enterAmount('100');
    expect(screen.getByText('100')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /secure beam/i }));
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    // 42069 - 100 = 41969; one new transaction at the front
    expect(screen.getByTestId('probe')).toHaveTextContent('41969|9|To: @kaelen');
    expect(notify).toHaveBeenCalledWith(expect.stringContaining('Successfully beamed $100.00 to Kaelen securely!'));
    // Keypad resets after success
    expect(screen.getByText('0.00')).toBeInTheDocument();
  });

  it('gates the beam behind 2FA and settles only after authorization', () => {
    const { notify, request2FA } = renderTransfers(true);

    enterAmount('50');
    fireEvent.click(screen.getByRole('button', { name: /secure beam/i }));

    expect(request2FA).toHaveBeenCalledWith(expect.any(Function), 'Authorize Outbound Beam');
    // Nothing settled while waiting for authorization
    expect(screen.getByTestId('probe')).toHaveTextContent('42069|8|');

    // Simulate the user authorizing through the 2FA modal
    const authorize = request2FA.mock.calls[0][0] as () => void;
    act(() => authorize());
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(screen.getByTestId('probe')).toHaveTextContent('42019|9|To: @kaelen');
  });
});
