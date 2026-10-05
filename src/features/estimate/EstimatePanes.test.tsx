import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { makeStore } from '../../app/store.ts';
import { renderWithStore } from '../../test/render.tsx';
import { LimitsPane } from '../limits/LimitsPane.tsx';
import { EstimatePane } from './EstimatePane.tsx';
import { loadExample } from './estimateSlice.ts';
import { InputsPane } from './InputsPane.tsx';

describe('Estimate panes', () => {
  it('AC2: shows the empty state until prices and a run shape exist', () => {
    const store = makeStore();
    renderWithStore(<EstimatePane />, { store });
    expect(screen.getByText('No estimate yet')).toBeInTheDocument();
    act(() => {
      store.dispatch(loadExample());
    });
    expect(screen.queryByText('No estimate yet')).not.toBeInTheDocument();
    expect(screen.getByText(/Worst case/)).toBeInTheDocument();
    expect(screen.getByText(/Reported fan-out/)).toBeInTheDocument();
  });

  it('AC5: flags an invalid field with an alert', async () => {
    renderWithStore(<InputsPane />);
    await userEvent.type(screen.getByLabelText('Input price'), 'abc');
    expect(screen.getByRole('alert')).toHaveTextContent('Enter a number from 0 to 1,000,000.');
  });

  it('CH7: lists the five limits', () => {
    renderWithStore(<LimitsPane />);
    for (const label of ['Tokens per turn', 'Discounts', 'Retries', 'Enforcement', 'Prices']) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
    expect(screen.getByText(/Vendor prices change/)).toBeInTheDocument();
  });
});
