import React, { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

export type ModalId = 'appkit' | 'qrScanner' | 'twoFAOnboarding' | 'twoFAVerification';

interface ModalManagerValue {
  openModals: ModalId[];
  open: (id: ModalId) => void;
  close: (id: ModalId) => void;
}

const ModalManagerContext = createContext<ModalManagerValue | null>(null);

/**
 * Tracks which modals are open and in what order. Modals are rendered by
 * <ModalHost />, which layers them by open order instead of hand-maintained
 * z-index classes scattered through the tree.
 */
export function ModalManagerProvider({ children }: { children: ReactNode }) {
  const [openModals, setOpenModals] = useState<ModalId[]>([]);

  const open = useCallback((id: ModalId) => {
    setOpenModals((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }, []);

  const close = useCallback((id: ModalId) => {
    setOpenModals((prev) => prev.filter((m) => m !== id));
  }, []);

  const value = useMemo(() => ({ openModals, open, close }), [openModals, open, close]);
  return <ModalManagerContext.Provider value={value}>{children}</ModalManagerContext.Provider>;
}

export function useModalManager(): ModalManagerValue {
  const ctx = useContext(ModalManagerContext);
  if (!ctx) throw new Error('useModalManager must be used within a ModalManagerProvider');
  return ctx;
}

/**
 * Renders the currently-open modals stacked in open order. Each layer is an
 * absolutely positioned sibling whose z-index is derived from its position,
 * so the last-opened modal always wins the stacking.
 */
export function ModalHost({ modals }: { modals: Partial<Record<ModalId, ReactNode>> }) {
  const { openModals } = useModalManager();
  return (
    <>
      {openModals.map((id, index) => (
        <div key={id} className="absolute inset-0" style={{ zIndex: 50 + index * 10 }}>
          {modals[id]}
        </div>
      ))}
    </>
  );
}
