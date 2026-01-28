import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithUiProvider } from '../../../../../../../test-utils/render-with-ui-provider';
import { LeaderboardSessionBar } from './leaderboard-session-bar';

vi.mock('src/presentation/shared/i18n/use-presentation-translation', async (importOriginal) => {
  const { PresentationTranslationMockFactory } = await import(
    'src/test-utils/factories/presentation-translation-mock-factory'
  );

  return new PresentationTranslationMockFactory().createPartialModule(importOriginal);
});

describe('LeaderboardSessionBar', () => {
  function renderBar(props: Partial<Parameters<typeof LeaderboardSessionBar>[0]> = {}) {
    return renderWithUiProvider(
      <LeaderboardSessionBar
        gameTypeTitleKey={null}
        gameTitle={null}
        sessionPin="XY34ZW"
        rankLabel="#1 · 420 pts"
        {...props}
      />,
    );
  }

  it('renders the session PIN and rank label', () => {
    renderBar();

    expect(screen.getByText('XY34ZW')).toBeInTheDocument();
    expect(screen.getByText('#1 · 420 pts')).toBeInTheDocument();
  });

  it('omits the rank label when null', () => {
    renderBar({ rankLabel: null });

    expect(screen.getByText('XY34ZW')).toBeInTheDocument();
    expect(screen.queryByText('#1 · 420 pts')).not.toBeInTheDocument();
  });

  it('has a banner role for accessibility', () => {
    renderBar();

    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  it('renders the translated game type when available', () => {
    renderBar({ gameTypeTitleKey: 'prediction.gameType.title' });

    expect(screen.getByText('prediction.gameType.title')).toBeInTheDocument();
  });
});
