import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { renderWithUiProvider } from '../../../../test-utils/render-with-ui-provider';
import { Tooltip } from './tooltip';

describe('Tooltip', () => {
  it('shows the tooltip label on hover when enabled', async () => {
    // Arrange
    const user = userEvent.setup();

    renderWithUiProvider(
      <Tooltip label="Helpful hint" withArrow>
        <button type="button">Hover me</button>
      </Tooltip>,
    );

    // Act
    await user.hover(screen.getByRole('button', { name: 'Hover me' }));

    // Assert
    expect(await screen.findByText('Helpful hint')).toBeInTheDocument();
  });

  it('shows the tooltip label when reached with keyboard focus', async () => {
    // Arrange
    const user = userEvent.setup();

    renderWithUiProvider(
      <Tooltip label="Helpful hint">
        <button type="button">Focus me</button>
      </Tooltip>,
    );

    // Act
    await user.tab();

    // Assert
    expect(screen.getByRole('button', { name: 'Focus me' })).toHaveFocus();
    expect(await screen.findByText('Helpful hint')).toBeInTheDocument();
  });

  it('does not show the tooltip label when disabled', async () => {
    // Arrange
    const user = userEvent.setup();

    renderWithUiProvider(
      <Tooltip disabled label="Hidden hint">
        <button type="button">Hover me</button>
      </Tooltip>,
    );

    // Act
    await user.hover(screen.getByRole('button', { name: 'Hover me' }));

    // Assert
    expect(screen.queryByText('Hidden hint')).not.toBeInTheDocument();
  });
});
