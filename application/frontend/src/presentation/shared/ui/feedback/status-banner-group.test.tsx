import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithProviders } from '../../../../test-utils/render-with-providers';
import { StatusBannerGroup } from './status-banner-group';

describe('StatusBannerGroup', () => {
  it('renders nothing when no messages are provided', () => {
    renderWithProviders(<StatusBannerGroup />);

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('renders each provided message with the matching status role', () => {
    renderWithProviders(
      <StatusBannerGroup error="Something failed" success="Saved" info="Syncing" />,
    );

    expect(screen.getByRole('alert')).toHaveTextContent('Something failed');
    expect(screen.getAllByRole('status')).toHaveLength(2);
    expect(screen.getByText('Saved')).toBeInTheDocument();
    expect(screen.getByText('Syncing')).toBeInTheDocument();
  });
});
