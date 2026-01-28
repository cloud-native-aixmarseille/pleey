import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithUiProvider } from '../../../../../../../test-utils/render-with-ui-provider';
import { JoinGameGuidanceBar } from './join-game-guidance-bar';

vi.mock('src/presentation/shared/i18n/use-presentation-translation', async () => {
  const { PresentationTranslationMockFactory } = await import(
    'src/test-utils/factories/presentation-translation-mock-factory'
  );

  return new PresentationTranslationMockFactory().createModule();
});

describe('JoinGameGuidanceBar', () => {
  it('renders the step labels', () => {
    renderWithUiProvider(<JoinGameGuidanceBar currentStep={1} />);

    expect(screen.getByText('game.join.stepPin')).toBeInTheDocument();
    expect(screen.getByText('game.join.stepIdentity')).toBeInTheDocument();
    expect(screen.getByText('game.join.stepJoin')).toBeInTheDocument();
  });

  it('renders the compact guidance summary', () => {
    renderWithUiProvider(<JoinGameGuidanceBar currentStep={1} />);

    expect(screen.getByText('game.join.guidanceSummary')).toBeInTheDocument();
  });

  it('has a complementary role with an accessible label', () => {
    renderWithUiProvider(<JoinGameGuidanceBar currentStep={1} />);

    expect(
      screen.getByRole('complementary', { name: 'game.join.guidanceBarLabel' }),
    ).toBeInTheDocument();
  });
});
