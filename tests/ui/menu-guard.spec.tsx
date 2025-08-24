// tests/ui/menu-guard.spec.tsx
import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
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

  it('allows add after choosing mode', () => {
    render(<FakeMenu hasTableSession={true} />);
    fireEvent.click(screen.getAllByText('Add')[0]);
    expect((window as any).__opened).toBe(true);
    // choose dine-in
    fireEvent.click(screen.getByRole('button', { name: /choose-dinein/i }));
    // next add should succeed
    fireEvent.click(screen.getAllByText('Add')[0]);
    expect(cartStore.items[0].qty).toBe(1);
  });
});