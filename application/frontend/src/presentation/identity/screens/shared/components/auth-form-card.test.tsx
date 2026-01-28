import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithProviders } from '../../../../../test-utils/render-with-providers';
import { AuthFormCard } from './auth-form-card';

describe('AuthFormCard', () => {
  it('renders the title as a heading', () => {
    renderWithProviders(<AuthFormCard title="Test Title">content</AuthFormCard>);

    expect(screen.getByRole('heading', { name: 'Test Title' })).toBeInTheDocument();
  });

  it('renders the eyebrow text when provided', () => {
    renderWithProviders(
      <AuthFormCard eyebrow="Eyebrow" title="Title">
        content
      </AuthFormCard>,
    );

    expect(screen.getByText('Eyebrow')).toBeInTheDocument();
  });

  it('renders the subtitle when provided', () => {
    renderWithProviders(
      <AuthFormCard title="Title" subtitle="Sub">
        content
      </AuthFormCard>,
    );

    expect(screen.getByText('Sub')).toBeInTheDocument();
  });

  it('does not render an eyebrow when none is provided', () => {
    renderWithProviders(<AuthFormCard title="Title">content</AuthFormCard>);

    expect(screen.queryByText('Eyebrow')).not.toBeInTheDocument();
  });

  it('renders children inside the card', () => {
    renderWithProviders(
      <AuthFormCard title="Title">
        <p>child content</p>
      </AuthFormCard>,
    );

    expect(screen.getByText('child content')).toBeInTheDocument();
  });
});
