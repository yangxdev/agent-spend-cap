import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { makeStore } from '../../app/store.ts';
import { useCopy } from '../../lib/useCopy.ts';
import { loadExample } from '../estimate/estimateSlice.ts';
import { renderWithStore } from '../../test/render.tsx';
import { CapConfigPane } from './CapConfigPane.tsx';

afterEach(() => vi.restoreAllMocks());

function Harness() {
  const { copy, preRef } = useCopy();
  return <CapConfigPane copy={copy} preRef={preRef} />;
}

function exampleStore() {
  const store = makeStore();
  store.dispatch(loadExample());
  return store;
}

const configText = () => screen.getByLabelText('Cap config', { selector: 'pre' });

describe('CapConfigPane', () => {
  it('shows an empty state before an estimate exists', () => {
    renderWithStore(<Harness />);
    expect(screen.getByText('Nothing to generate yet')).toBeInTheDocument();
  });

  it('AC9: shows the unchecked note while verifiedOn is null, for every tool', async () => {
    renderWithStore(<Harness />, { store: exampleStore() });
    for (const name of ['claude code', 'codex', 'generic']) {
      await userEvent.click(screen.getByRole('button', { name }));
      expect(screen.getByText(/Unchecked example/)).toBeInTheDocument();
    }
  });

  it('AC8: derives the cap from the worst case unless the user types one', async () => {
    renderWithStore(<Harness />, { store: exampleStore() });
    // example worst case: 0.055 * 40 * 5 * 3 = 33
    expect(configText()).toHaveTextContent('33.00');
    await userEvent.type(screen.getByLabelText('Spend cap (USD)'), '5');
    expect(configText()).toHaveTextContent('5.00');
  });

  it('AC11: Copy config writes the rendered config', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
    renderWithStore(<Harness />, { store: exampleStore() });
    await userEvent.click(screen.getByRole('button', { name: 'Copy config' }));
    expect(writeText).toHaveBeenCalledTimes(1);
    expect(writeText).toHaveBeenCalledWith(configText().textContent);
  });
});
