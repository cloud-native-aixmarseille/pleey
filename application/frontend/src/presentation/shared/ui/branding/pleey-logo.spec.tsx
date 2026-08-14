import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { PleeyLogo } from './pleey-logo';

vi.mock('../../i18n/use-presentation-translation', async () => {
  const { PresentationTranslationMockFactory } = await import(
    'src/test-utils/mocks/presentation-translation-mock-factory'
  );

  return new PresentationTranslationMockFactory().createModule();
});

describe('PleeyLogo', () => {
  it('renders an accessible image with the translated alt text', () => {
    // Arrange
    render(<PleeyLogo size="lg" src="/brand/custom-logo.png" />);

    // Act
    const image = screen.getByRole('img', { name: 'shared.branding.logoAlt' });

    // Assert
    expect(image).toHaveAttribute('src', '/brand/custom-logo.png');
    expect(image).toHaveStyle({ height: '56px', width: '56px' });
  });

  it('marks decorative logos as hidden from assistive technology', () => {
    // Arrange + Act
    const { container } = render(<PleeyLogo decorative />);

    // Assert
    expect(screen.queryByRole('img', { name: 'shared.branding.logoAlt' })).not.toBeInTheDocument();

    const image = container.querySelector('img');

    expect(image).not.toBeNull();
    expect(image).toHaveAttribute('alt', '');
    expect(image).toHaveAttribute('aria-hidden', 'true');
  });

  it('supports the accent glow preset', () => {
    // Arrange + Act
    render(<PleeyLogo glow="accent" />);

    // Assert
    expect(screen.getByRole('img', { name: 'shared.branding.logoAlt' })).toHaveStyle({
      filter: 'drop-shadow(0 0 24px var(--ui-color-brand-accent))',
    });
  });
});
