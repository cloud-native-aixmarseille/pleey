import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '../../../../../../../test-utils/render-with-providers';
import { StageHeaderBar } from './stage-header-bar';

vi.mock('src/presentation/shared/i18n/use-presentation-translation', async (importOriginal) => {
  const { PresentationTranslationMockFactory } = await import(
    'src/test-utils/factories/presentation-translation-mock-factory'
  );

  return new PresentationTranslationMockFactory().createPartialModule(importOriginal);
});

describe('StageHeaderBar', () => {
  it('renders the first stage as stage 1 in the header counter', () => {
    renderWithProviders(
      <StageHeaderBar
        gameTypeTitleKey="quiz.gameType.title"
        gameTitle={null}
        sessionPin="AB12CD"
        stagePosition={1}
        totalStages={2}
        activePlayerCount={4}
        timeLeft={18}
        isPaused={false}
        isHost={false}
        onLeaveSession={vi.fn()}
      />,
    );

    expect(screen.getByText('game.stage.counter (stage=1, total=2)')).toBeInTheDocument();
    expect(screen.getByText('quiz.gameType.title')).toBeInTheDocument();
  });

  it('renders the active player count in the live header', () => {
    renderWithProviders(
      <StageHeaderBar
        gameTypeTitleKey="prediction.gameType.title"
        gameTitle={null}
        sessionPin="AB12CD"
        stagePosition={2}
        totalStages={5}
        activePlayerCount={7}
        timeLeft={18}
        isPaused={false}
        isHost={false}
        onLeaveSession={vi.fn()}
      />,
    );

    expect(screen.getByText('game.stage.activePlayers (count=7)')).toBeInTheDocument();
  });
});
