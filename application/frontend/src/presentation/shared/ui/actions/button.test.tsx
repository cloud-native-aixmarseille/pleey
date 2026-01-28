import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithUiProvider } from '../../../../test-utils/render-with-ui-provider';
import { Button } from './button';

describe('Button', () => {
  describe('render()', () => {
    it('defaults to a button type', () => {
      renderWithUiProvider(<Button>Launch session</Button>);

      expect(screen.getByRole('button', { name: 'Launch session' })).toHaveAttribute(
        'type',
        'button',
      );
    });

    it('forwards click handlers', () => {
      const onClick = vi.fn();
      renderWithUiProvider(<Button onClick={onClick}>Open dashboard</Button>);

      fireEvent.click(screen.getByRole('button', { name: 'Open dashboard' }));

      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('renders optional icon sections without affecting the label', () => {
      renderWithUiProvider(
        <Button
          leftSection={<span aria-hidden="true">L</span>}
          rightSection={<span aria-hidden="true">R</span>}
        >
          Open dashboard
        </Button>,
      );

      expect(screen.getByRole('button', { name: 'Open dashboard' })).toBeInTheDocument();
    });
  });
});
