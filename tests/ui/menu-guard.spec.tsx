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
    localStorage.clear();
    cartStore.setContext?.('t1', 's1');
    cartStore.clearMode?.();
    (window as any).__opened = false;
  });

  it('opens prompt on first add until mode selected', () => {
    render(<FakeMenu hasTableSession={true} />);
    // Choose the first "Add" button explicitly
    fireEvent.click(screen.getAllByText('Add')[0]);
    expect((window as any).__opened).toBe(true);
  });

  it('allows add after choosing mode', async () => {
    render(<FakeMenu hasTableSession={true} />);

    // Open the mode prompt — click the first "Add"
    fireEvent.click(screen.getAllByText('Add')[0]);

    // Wait until the guard reports it opened
    await waitFor(() => expect((window as any).__opened).toBe(true));

    // Find and click the Dine-in button by accessible name
    const dineBtn =
      (await screen.findByRole('button', { name: /choose-dinein/i })) ??
      (await screen.findByLabelText(/choose-dinein/i));
    fireEvent.click(dineBtn);

    // Next add should NOT re-open the prompt
    fireEvent.click(screen.getAllByText('Add')[0]);
    expect((window as any).__opened).toBe(false);
  });
});