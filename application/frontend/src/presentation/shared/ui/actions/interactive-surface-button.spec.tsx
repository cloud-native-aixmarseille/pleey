import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithUiProvider } from '../../../../test-utils/render-with-ui-provider';
import { InteractiveSurfaceButton } from './interactive-surface-button';

describe('InteractiveSurfaceButton', () => {
  it('lets the Mantine label container shrink and wrap long content', () => {
    renderWithUiProvider(
      <InteractiveSurfaceButton>
        <div data-testid="surface-content">Paris Paris Paris Paris Paris Paris Paris Paris Paris Paris</div>
      </InteractiveSurfaceButton>,
    );

    const label = screen.getByTestId('surface-content').parentElement;

    expect(label).not.toBeNull();
    expect(label).toHaveStyle({
      alignItems: 'stretch',
      display: 'flex',
      minWidth: '0',
      whiteSpace: 'normal',
      width: '100%',
    });
  });
});
