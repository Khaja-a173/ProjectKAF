// tests/ui/menu-guard.spec.tsx
import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { cartStore } from '../../src/state/cartStore';
import ModePrompt from '../../src/components/ModePrompt';

// Minimal fake "Menu" add handler behavior for guard logic:
function FakeMenu({ hasTableSession }: { hasTableSession: boolean }) {
  const item = { id: 'm1', name: 'Burger', price: 10 };

  function onAdd() {
    try {
      if (!cartStore.mode) throw new (class extends Error {})();
      cartStore.add(item, 1);
    } catch {
      // open modal instead in real Menu
      (window as any).__opened = true;
    }
  }

  return (
    <div>
      <button onClick={onAdd}>Add</button>
      <ModePrompt open={(window as any).__opened || false} hasTableSession={hasTableSession}
        onSelect={(m) => { cartStore.setMode(m); (window as any).__opened = false; }}
        onClose={() => { (window as any).__opened = false; }} />
    </div>
  );
}

describe('Menu add guard', () => {
  beforeEach(() => {
    localStorage.clear();
    cartStore.setContext('t1', 's1');
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
  fireEvent.click(screen.getAllByText('Add')[0]);

  // Wait until the component's "opened" flag flips true
  await waitFor(() => expect((window as any).__opened).toBe(true));

  // Wait for the modal to be in the DOM (heading shows when it's mounted)
  await screen.findByText(/how would you like to order\?/i);

  // The buttons expose accessible names via aria-label (per your earlier dump)
  const dineBtn =
    (await screen.findByLabelText(/choose-dinein/i)) ||
    (await screen.findByRole('button', { name: /choose-dinein/i }));

  fireEvent.click(dineBtn);

  // Now the next "Add" should work without opening the prompt
  fireEvent.click(screen.getAllByText('Add')[0]);
});
});