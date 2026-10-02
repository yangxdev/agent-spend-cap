import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { renderWithStore } from '../../test/render.tsx';
import { EstimateSection } from './EstimateSection.tsx';

afterEach(() => window.history.replaceState(null, '', '/'));

describe('EstimateSection', () => {
  it('AC2: shows the empty state until prices and a run shape exist', async () => {
    renderWithStore(<EstimateSection />);
    expect(screen.getByText('No estimate yet')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Example run' }));
    expect(screen.queryByText('No estimate yet')).not.toBeInTheDocument();
    expect(screen.getByText(/Worst case/)).toBeInTheDocument();
    expect(screen.getByText(/Reported fan-out/)).toBeInTheDocument();
  });

  it('AC6: hydrates from the query string, shows the worst case and writes changes back', async () => {
    window.history.replaceState(null, '', '/?ip=3&op=15&it=1000&ot=500&t=10&a=2&r=1');
    renderWithStore(<EstimateSection />);
    expect(screen.getByLabelText('Input price')).toHaveValue('3');
    expect(screen.getByLabelText('Retries per agent')).toHaveValue('1');
    // 0.0105 * 10 * 2 * (1 + 1)
    expect(screen.getByText('$0.42')).toBeInTheDocument();
    expect(window.location.search).toContain('ip=3');

    const turns = screen.getByLabelText('Turns per agent');
    await userEvent.clear(turns);
    await userEvent.type(turns, '25');
    expect(window.location.search).toContain('t=25');
  });

  it('AC5: flags an invalid field with an alert', async () => {
    renderWithStore(<EstimateSection />);
    await userEvent.type(screen.getByLabelText('Input price'), 'abc');
    expect(screen.getByRole('alert')).toHaveTextContent(/number/);
  });
});
