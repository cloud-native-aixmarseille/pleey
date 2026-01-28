import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { PleeyLogo } from './pleey-logo';

vi.mock('../../i18n/use-presentation-translation', async () => {
  const { PresentationTranslationMockFactory } = await import(
    'src/test-utils/factories/presentation-translation-mock-factory'
  );

  return new PresentationTranslationMockFactory().createModule();
});

describe('PleeyLogo', () => {
  it('renders an accessible image with the translated alt text', () => {
    render(<PleeyLogo size="lg" src="/brand/custom-logo.png" />);

    const image = screen.getByRole('img', { name: 'shared.branding.logoAlt' });

    expect(image).toHaveAttribute('src', '/brand/custom-logo.png');
    expect(image).toHaveStyle({ height: '3.5rem', width: '3.5rem' });
  });

  it('marks decorative logos as hidden from assistive technology', () => {
    const { container } = render(<PleeyLogo decorative />);

    expect(screen.queryByRole('img', { name: 'shared.branding.logoAlt' })).not.toBeInTheDocument();

    const image = container.querySelector('img');

    expect(image).not.toBeNull();
    expect(image).toHaveAttribute('alt', '');
    expect(image).toHaveAttribute('aria-hidden', 'true');
  });
});
