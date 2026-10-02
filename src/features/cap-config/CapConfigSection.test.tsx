import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { makeStore } from '../../app/store.ts';
import { loadExample } from '../estimate/estimateSlice.ts';
import { renderWithStore } from '../../test/render.tsx';
import { CapConfigSection } from './CapConfigSection.tsx';

afterEach(() => vi.restoreAllMocks());

function mockClipboard() {
  const writeText = vi.fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
  return writeText;
}

describe('CapConfigSection', () => {
  it('shows an empty state before an estimate exists', () => {
    renderWithStore(<CapConfigSection />);
    expect(screen.getByText('Nothing to generate yet')).toBeInTheDocument();
  });

  it('AC9: shows the unchecked note while verifiedOn is null, for every tool', async () => {
    const store = makeStore();
    store.dispatch(loadExample());
    renderWithStore(<CapConfigSection />, { store });
    for (const name of ['claude code', 'codex', 'generic']) {
      await userEvent.click(screen.getByRole('button', { name }));
      expect(screen.getByText(/Unchecked example/)).toBeInTheDocument();
    }
  });

  it('AC8: derives the cap from the worst case unless the user types one', async () => {
    const store = makeStore();
    store.dispatch(loadExample());
    renderWithStore(<CapConfigSection />, { store });
    // example worst case: 0.055 * 40 * 5 * 3 = 33
    expect(screen.getByLabelText('Cap config')).toHaveTextContent('33.00');
    await userEvent.type(screen.getByLabelText('Spend cap (USD)'), '5');
    expect(screen.getByLabelText('Cap config')).toHaveTextContent('5.00');
  });

  it('AC11: Copy config writes the rendered config and announces Copied', async () => {
    const writeText = mockClipboard();
    const store = makeStore();
    store.dispatch(loadExample());
    renderWithStore(<CapConfigSection />, { store });
    await userEvent.click(screen.getByRole('button', { name: 'Copy config' }));
    expect(writeText).toHaveBeenCalledTimes(1);
    expect(writeText).toHaveBeenCalledWith(screen.getByLabelText('Cap config').textContent);
    expect(screen.getByRole('status')).toHaveTextContent('Copied');
  });

  it('copies the link', async () => {
    const writeText = mockClipboard();
    const store = makeStore();
    store.dispatch(loadExample());
    renderWithStore(<CapConfigSection />, { store });
    await userEvent.click(screen.getByRole('button', { name: 'Copy link' }));
    expect(writeText).toHaveBeenCalledWith(window.location.href);
  });

  it('falls back to selecting the text when the clipboard is unavailable', async () => {
    Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable: true });
    const store = makeStore();
    store.dispatch(loadExample());
    renderWithStore(<CapConfigSection />, { store });
    await userEvent.click(screen.getByRole('button', { name: 'Copy config' }));
    expect(screen.getByRole('status')).toHaveTextContent(/selected/);
  });
});
