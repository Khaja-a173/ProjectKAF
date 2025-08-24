// tests/ui/mode-prompt.spec.tsx
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ModePrompt from '../../src/components/ModePrompt';

describe('ModePrompt', () => {
  it('disables dine-in when no table session', () => {
    const onSelect = vi.fn();
    render(<ModePrompt open hasTableSession={false} onSelect={onSelect} onClose={() => {}} />);
    const dineBtn = screen.getByRole('button', { name: /dine-in/i });
    expect(dineBtn).toBeDisabled();
    const takeBtn = screen.getByRole('button', { name: /takeaway/i });
    fireEvent.click(takeBtn);
    expect(onSelect).toHaveBeenCalledWith('takeaway');
  });
});