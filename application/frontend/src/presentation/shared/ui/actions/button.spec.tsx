import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '../../../../test-utils/render-with-providers';
import { renderWithUiProvider } from '../../../../test-utils/render-with-ui-provider';
import { Button } from './button';

describe('Button', () => {
  it('associates a visible denial reason with the disabled action', () => {
    // Arrange
    const onClick = vi.fn();
    renderWithProviders(
      <Button
        permission={{ allowed: false, reason: 'MEMBER_REQUIRED' }}
        permissionReason="Join the organization first."
        onClick={onClick}
      >
        Create project
      </Button>,
    );
    const button = screen.getByRole('button', { name: 'Create project' });
    // Act
    fireEvent.click(button);
    // Assert
    expect(button).toBeDisabled();
    expect(button).toHaveAccessibleDescription('Join the organization first.');
    expect(screen.getByText('Join the organization first.')).toBeVisible();
    expect(onClick).not.toHaveBeenCalled();
  });

  describe('render()', () => {
    it('defaults to a button type', () => {
      // Arrange + Act
      renderWithUiProvider(<Button>Launch game</Button>);

      // Assert
      expect(screen.getByRole('button', { name: 'Launch game' })).toHaveAttribute('type', 'button');
    });

    it('forwards click handlers', () => {
      // Arrange
      const onClick = vi.fn();
      renderWithUiProvider(<Button onClick={onClick}>Open dashboard</Button>);

      // Act
      fireEvent.click(screen.getByRole('button', { name: 'Open dashboard' }));

      // Assert
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('renders optional icon sections without affecting the label', () => {
      // Arrange + Act
      renderWithUiProvider(
        <Button leftSection={<span aria-hidden="true">L</span>} rightSection={<span aria-hidden="true">R</span>}>
          Open dashboard
        </Button>,
      );

      // Assert
      expect(screen.getByRole('button', { name: 'Open dashboard' })).toBeInTheDocument();
    });

    it('exposes busy state when loading feedback is active', () => {
      // Arrange + Act
      renderWithUiProvider(<Button loading>Submit</Button>);

      // Assert
      expect(screen.getByRole('button', { name: 'Submit' })).toHaveAttribute('aria-busy', 'true');
    });

    it('supports secondary intent for outlined actions', () => {
      // Arrange + Act
      renderWithUiProvider(<Button intent="secondary">Manage</Button>);

      // Assert
      expect(screen.getByRole('button', { name: 'Manage' })).toBeInTheDocument();
    });
  });
});
