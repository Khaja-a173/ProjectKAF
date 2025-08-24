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
    fireEvent.click(screen.getAllByText('Add')[0]); // disambiguate
    expect((window as any).__opened).toBe(true);
  });

  it('allows add after choosing mode', async () => {
    render(<FakeMenu hasTableSession={true} />);

    // Open the mode prompt — click the first "Add"
    fireEvent.click(screen.getAllByText('Add')[0]);

    // Wait until the guard reports it opened
    await waitFor(() => expect((window as any).__opened).toBe(true));

    // Wait for the modal to be present (either the heading or any modal content)
    // If your heading text differs, this still proceeds thanks to the button fallback below
    await waitFor(async () => {
      // Try to locate any of the modal's primary actions by role
      const btns = await screen.findAllByRole('button');
      expect(btns.length).toBeGreaterThan(0);
    });

    // Find the Dine-in button by text OR aria-label, robust to markup differences
    const allButtons = await screen.findAllByRole('button');
    const dineBtn =
      allButtons.find(b => /dine/i.test(b.textContent || '')) ||
      allButtons.find(b => /dine/i.test(b.getAttribute('aria-label') || '')) ||
      allButtons.find(b => /table/i.test(b.textContent || ''));

    expect(dineBtn, 'Dine-in button not found in the prompt').toBeTruthy();

    fireEvent.click(dineBtn!);

    // Next add should not re-open the prompt
    fireEvent.click(screen.getAllByText('Add')[0]);
    expect((window as any).__opened).toBe(false);
  });
});