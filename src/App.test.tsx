import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from './App.tsx';
import { renderWithStore } from './test/render.tsx';

describe('App', () => {
  it('AC10: with no inputs shows the headline, empty state, three sections and Example run', () => {
    renderWithStore(<App />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Know the worst case before the agents start.',
    );
    expect(screen.getByText('No estimate yet')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Example run' })).toBeInTheDocument();
    for (const name of [
      'Size the run before it starts',
      'Copy a cap config',
      'What the numbers leave out',
    ]) {
      expect(screen.getByRole('heading', { level: 2, name })).toBeInTheDocument();
    }
    for (const index of ['01', '02', '03']) expect(screen.getByText(index)).toBeInTheDocument();
  });
});
