import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AppIcon } from './app-icon';

describe('AppIcon', () => {
  it('renders the requested icon as svg', () => {
    // Arrange + Act
    const { container } = render(<AppIcon name="dashboard" />);

    // Assert
    expect(container.querySelector('svg')).not.toBeNull();
  });

  it('marks icons as decorative by default', () => {
    // Arrange + Act
    const { container } = render(<AppIcon name="game" />);

    // Assert
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });
});
