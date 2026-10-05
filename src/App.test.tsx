import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import App from './App.tsx';
import { renderWithStore } from './test/render.tsx';

afterEach(() => {
  vi.restoreAllMocks();
  window.history.replaceState(null, '', '/');
});

function mockClipboard() {
  const writeText = vi.fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
  return writeText;
}

const configText = () => screen.getByLabelText('Cap config', { selector: 'pre' });

describe('App', () => {
  it('CH1: with no inputs shows the title, four panes and both empty states', () => {
    renderWithStore(<App />);

    expect(screen.getByRole('heading', { level: 1, name: 'Estimate' })).toBeInTheDocument();
    expect(screen.queryByText(/Know the worst case/)).not.toBeInTheDocument();
    for (const index of ['01', '02', '03'])
      expect(screen.queryByText(index)).not.toBeInTheDocument();
    for (const name of ['Inputs', 'Estimate', 'Cap config', 'Limits']) {
      expect(screen.getByRole('region', { name })).toBeInTheDocument();
    }
    expect(screen.getByRole('button', { name: 'Example run' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Copy link' })).toBeInTheDocument();
    expect(screen.getByText('No estimate yet')).toBeInTheDocument();
    expect(screen.getByText('Nothing to generate yet')).toBeInTheDocument();
  });

  it('CH2: the meta line and Copy link follow the estimate', async () => {
    renderWithStore(<App />);
    expect(screen.getByText('Fill in the inputs, or try the example.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Copy link' })).toBeDisabled();

    await userEvent.click(screen.getByRole('button', { name: 'Example run' }));
    expect(screen.getByText('Worst case $33.00 if every agent retries')).toBeInTheDocument();
    const pane = within(screen.getByRole('region', { name: 'Estimate' }));
    expect(pane.getByText(/Typical/)).toBeInTheDocument();
    expect(pane.getByText(/Worst case/)).toBeInTheDocument();
    expect(pane.getByText('Reported fan-out: 826 agents, worst case')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Copy link' })).toBeEnabled();
  });

  it('CH3: hydrates from the query string and writes changes back', async () => {
    window.history.replaceState(null, '', '/?ip=3&op=15&it=1000&ot=500&t=10&a=2&r=1');
    renderWithStore(<App />);
    for (const [label, value] of [
      ['Input price', '3'],
      ['Output price', '15'],
      ['Input tokens per turn', '1000'],
      ['Output tokens per turn', '500'],
      ['Turns per agent', '10'],
      ['Parallel agents', '2'],
      ['Retries per agent', '1'],
    ] as const) {
      expect(screen.getByLabelText(label)).toHaveValue(value);
    }
    const estimate = within(screen.getByRole('region', { name: 'Estimate' }));
    expect(estimate.getByText('$0.21')).toBeInTheDocument();
    expect(estimate.getByText('$0.42')).toBeInTheDocument();

    const turns = screen.getByLabelText('Turns per agent');
    await userEvent.clear(turns);
    await userEvent.type(turns, '25');
    expect(window.location.search).toContain('t=25');
    expect(window.location.search).toContain('ip=3');
    expect(window.location.search).toContain('a=2');
  });

  it('CH4: the config follows the tool and the spend cap', async () => {
    renderWithStore(<App />);
    await userEvent.click(screen.getByRole('button', { name: 'Example run' }));
    const seen = new Set<string>();
    for (const name of ['claude code', 'codex', 'generic']) {
      await userEvent.click(screen.getByRole('button', { name }));
      seen.add(configText().textContent ?? '');
      expect(screen.getByText(/Unchecked example/)).toBeInTheDocument();
    }
    expect(seen.size).toBe(3);
    expect(configText()).toHaveTextContent('33.00');
    await userEvent.type(screen.getByLabelText('Spend cap (USD)'), '5');
    expect(configText()).toHaveTextContent('5.00');
  });

  it('CH5: copy actions report in the one status region', async () => {
    const writeText = mockClipboard();
    renderWithStore(<App />);
    await userEvent.click(screen.getByRole('button', { name: 'Example run' }));

    await userEvent.click(screen.getByRole('button', { name: 'Copy config' }));
    expect(writeText).toHaveBeenCalledTimes(1);
    expect(writeText).toHaveBeenCalledWith(configText().textContent);
    expect(screen.getByRole('status')).toHaveTextContent('Copied');

    await userEvent.click(screen.getByRole('button', { name: 'Copy link' }));
    expect(writeText).toHaveBeenLastCalledWith(window.location.href);
    expect(screen.getByRole('status')).toHaveTextContent('Link copied');
  });

  it('CH5: falls back to selecting the text when the clipboard is unavailable', async () => {
    Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable: true });
    renderWithStore(<App />);
    await userEvent.click(screen.getByRole('button', { name: 'Example run' }));
    await userEvent.click(screen.getByRole('button', { name: 'Copy config' }));
    expect(screen.getByRole('status')).toHaveTextContent(/Clipboard unavailable/);
  });

  it('CH6: an invalid value alerts and leaves the estimate empty', async () => {
    renderWithStore(<App />);
    await userEvent.type(screen.getByLabelText('Input price'), 'abc');
    expect(screen.getByRole('alert')).toHaveTextContent('Enter a number from 0 to 1,000,000.');
    expect(screen.getByText('No estimate yet')).toBeInTheDocument();
  });

  it('CH8: the footer has both notes and the suggestion link, and the bar has the theme switch', () => {
    renderWithStore(<App />);
    const footer = within(screen.getByRole('contentinfo'));
    expect(
      footer.getByText('Nothing leaves your browser. The only thing stored is your theme choice.'),
    ).toBeInTheDocument();
    expect(
      footer.getByText('It estimates and writes text. It cannot stop a run.'),
    ).toBeInTheDocument();
    expect(footer.getByRole('link', { name: /Suggest a change/ })).toHaveAttribute(
      'href',
      expect.stringMatching(/\/agent-spend-cap\/issues\/new$/),
    );
    expect(within(screen.getByRole('banner')).getByRole('button')).toBeInTheDocument();
  });
});
