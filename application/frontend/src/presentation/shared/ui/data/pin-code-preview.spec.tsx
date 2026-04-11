import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithUiProvider } from '../../../../test-utils/render-with-ui-provider';
import { PinCodePreview } from './pin-code-preview';

describe('PinCodePreview', () => {
  it('renders the label and each character of the code', () => {
    renderWithUiProvider(
      <PinCodePreview ariaLabel="Party pin" label="Enter this code" value="AB12" />,
    );

    expect(screen.getByText('Enter this code')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Party pin' })).toBeInTheDocument();
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });
});
