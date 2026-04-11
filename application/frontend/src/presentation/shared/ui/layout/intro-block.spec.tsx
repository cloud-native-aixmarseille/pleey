import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithUiProvider } from '../../../../test-utils/render-with-ui-provider';
import { IntroBlock } from './intro-block';

describe('IntroBlock', () => {
  it('renders eyebrow, title, and subtitle content', () => {
    renderWithUiProvider(<IntroBlock eyebrow="Eyebrow" subtitle="Subtitle" title="Title" />);

    expect(screen.getByText('Eyebrow')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Title' })).toBeInTheDocument();
    expect(screen.getByText('Subtitle')).toBeInTheDocument();
  });

  it('renders hero titles at level 1', () => {
    renderWithUiProvider(<IntroBlock hero level={1} title="Hero Title" />);

    expect(screen.getByRole('heading', { level: 1, name: 'Hero Title' })).toBeInTheDocument();
  });
});
