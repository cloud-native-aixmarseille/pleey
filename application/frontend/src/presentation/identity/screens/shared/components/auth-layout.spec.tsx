import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '../../../../../test-utils/render-with-providers';
import { AuthLayout } from './auth-layout';

vi.mock('../../../../shared/i18n/use-presentation-translation', async (importOriginal) => {
  const { PresentationTranslationMockFactory } = await import(
    'src/test-utils/mocks/presentation-translation-mock-factory'
  );

  return new PresentationTranslationMockFactory().createPartialModule(importOriginal);
});

describe('AuthLayout', () => {
  it('renders children inside the main content area', () => {
    renderWithProviders(
      <AuthLayout>
        <p>test content</p>
      </AuthLayout>,
    );

    expect(screen.getByText('test content')).toBeInTheDocument();
  });

  it('renders the branding eyebrow i18n key', () => {
    renderWithProviders(
      <AuthLayout>
        <p>content</p>
      </AuthLayout>,
    );

    expect(screen.getByText('auth.branding.eyebrow')).toBeInTheDocument();
  });

  it('renders the default branding title i18n key', () => {
    renderWithProviders(
      <AuthLayout>
        <p>content</p>
      </AuthLayout>,
    );

    expect(screen.getByText('auth.branding.title')).toBeInTheDocument();
  });

  it('renders a custom branding title when provided', () => {
    renderWithProviders(
      <AuthLayout brandingTitle="Custom Title">
        <p>content</p>
      </AuthLayout>,
    );

    expect(screen.getByText('Custom Title')).toBeInTheDocument();
  });

  it('renders a main landmark for the content panel', () => {
    renderWithProviders(
      <AuthLayout>
        <p>content</p>
      </AuthLayout>,
    );

    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('does not render a separate complementary hero aside', () => {
    renderWithProviders(
      <AuthLayout>
        <p>content</p>
      </AuthLayout>,
    );

    expect(screen.queryByRole('complementary')).not.toBeInTheDocument();
  });

  it('renders trust features in the branding panel', () => {
    renderWithProviders(
      <AuthLayout>
        <p>content</p>
      </AuthLayout>,
    );

    expect(screen.getByText('auth.branding.feature1')).toBeInTheDocument();
    expect(screen.getByText('auth.branding.feature2')).toBeInTheDocument();
    expect(screen.getByText('auth.branding.feature3')).toBeInTheDocument();
  });
});
