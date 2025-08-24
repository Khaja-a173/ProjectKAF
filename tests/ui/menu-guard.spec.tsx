// tests/ui/menu-guard.spec.tsx
import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { cartStore } from '../../src/state/cartStore';
import ModePrompt from '../../src/components/ModePrompt';

// Minimal fake "Menu" that triggers the guard when mode is unset
function FakeMenu({ hasTableSession }: { hasTableSession: boolean }) {
  const item = { id: 'm1', name: 'Burger', price: 10 };

  function onAdd() {
    try {
      if (!cartStore.mode) throw new (class extends Error {})();
      cartStore.add(item, 1);
    } catch {
      (window as any).__opened = true; // open modal
    }
  }

  return (
    <div>
      <button onClick={onAdd}>Add</button>
      <ModePrompt
        open={(window as any).__opened || false}
        hasTableSession={hasTableSession}
        onSelect={(m) => {
          cartStore.setMode(m);
          (window as any).__opened = false;
        }}
        onClose={() => {
          (window as any).__opened = false;
        }}
      />
    </div>
  );
}

describe('Menu add guard', () => {
  beforeEach(() => {
    // ensure no persisted mode from previous runs
    localStorage.clear();

    // give the store a scope so keys/persistence resolve
    // (adjust if your store uses different API names)
    cartStore.setContext?.('t1', 's1');
    cartStore.clearMode?.();

    (window as any).__opened = false;
  });

  it('opens prompt on first add until mode selected', () => {
    render(<FakeMenu hasTableSession={true} />);
    fireEvent.click(screen.getByText('Add'));
    expect((window as any).__opened).toBe(true);
  });

  it('allows add after choosing mode', async () => {
    render(<FakeMenu hasTableSession={true} />);

    // Open the mode prompt
    fireEvent.click(screen.getByText('Add'));

    // Wait until the guard reports it opened
    await waitFor(() => expect((window as any).__opened).toBe(true));

    // Don’t rely on heading text; match the modal by its accessible controls
    // Your earlier DOM dump showed aria-labels: "choose-dinein" and "choose-takeaway"
    const dineBtn =
      (await screen.findByRole('button', { name: /choose-dinein/i })) ??
      (await screen.findByLabelText(/choose-dinein/i));

    fireEvent.click(dineBtn);

    // Next add should NOT re-open the prompt
    fireEvent.click(screen.getByText('Add'));
    expect((window as any).__opened).toBe(false);
  });
});