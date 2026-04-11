import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithUiProvider } from '../../../../test-utils/render-with-ui-provider';
import { AccentIconBadge } from './accent-icon-badge';

describe('AccentIconBadge', () => {
  it('renders its icon content', () => {
    renderWithUiProvider(
      <AccentIconBadge>
        <span>Icon</span>
      </AccentIconBadge>,
    );

    expect(screen.getByText('Icon')).toBeInTheDocument();
  });
});
