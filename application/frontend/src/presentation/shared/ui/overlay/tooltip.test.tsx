import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { renderWithUiProvider } from '../../../../test-utils/render-with-ui-provider';
import { Tooltip } from './tooltip';

describe('Tooltip', () => {
  it('shows the tooltip label on hover when enabled', async () => {
    const user = userEvent.setup();

    renderWithUiProvider(
      <Tooltip label="Helpful hint" withArrow>
        <button type="button">Hover me</button>
      </Tooltip>,
    );

    await user.hover(screen.getByRole('button', { name: 'Hover me' }));

    expect(await screen.findByText('Helpful hint')).toBeInTheDocument();
  });

  it('does not show the tooltip label when disabled', async () => {
    const user = userEvent.setup();

    renderWithUiProvider(
      <Tooltip disabled label="Hidden hint">
        <button type="button">Hover me</button>
      </Tooltip>,
    );

    await user.hover(screen.getByRole('button', { name: 'Hover me' }));

    expect(screen.queryByText('Hidden hint')).not.toBeInTheDocument();
  });
});
