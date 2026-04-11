import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithUiProvider } from '../../../../test-utils/render-with-ui-provider';
import { Separator } from './separator';

describe('Separator', () => {
  it('renders a horizontal rule', () => {
    renderWithUiProvider(<Separator />);

    expect(screen.getByRole('separator')).toBeInTheDocument();
  });

  it('applies custom style', () => {
    renderWithUiProvider(<Separator style={{ marginTop: 16 }} />);

    expect(screen.getByRole('separator')).toBeInTheDocument();
  });
});
