import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import {
  CreatePartyDisabledReason,
  LaunchReadinessDisabledReason,
} from '../../../../../../domains/game/management/entities/dashboard-game-list-item';
import { GameFixtureFactory } from '../../../../../../test-utils/fixtures/game-fixture-factory';
import { createGameTypeDescriptorFixture } from '../../../../../../test-utils/fixtures/game-type-descriptor-fixture-factory';
import { renderWithUiProvider } from '../../../../../../test-utils/render-with-ui-provider';
import { GameItemCard } from './game-item-card';

const gameFixtureFactory = new GameFixtureFactory();

vi.mock('../../../../../shared/i18n/use-presentation-translation', async () => {
  const { PresentationTranslationMockFactory } = await import(
    'src/test-utils/mocks/presentation-translation-mock-factory'
  );

  return new PresentationTranslationMockFactory().createModule();
});

vi.mock('../../../../../shared/routing/router', async (importOriginal) => {
  const { RoutingMockFactory } = await import('src/test-utils/mocks/routing-mock-factory');

  return new RoutingMockFactory().createPartialModule(importOriginal);
});

describe('GameItemCard', () => {
  it('renders the summary text when a descriptor is available', () => {
    const descriptor = createGameTypeDescriptorFixture({
      key: 'quiz',
      badge: 'QUIZ',
      titleKey: 'game.types.quiz.title',
    });

    renderWithUiProvider(
      <GameItemCard
        descriptor={descriptor}
        game={gameFixtureFactory.createDashboardGame({
          summary: {
            translationKey: 'game.types.quiz.management.questionSummary',
            values: {
              count: '14',
            },
          },
        })}
        showTypeBadge
      />,
    );

    expect(screen.getByText('Roadmap quiz')).toBeInTheDocument();
    expect(
      screen.getByText('game.types.quiz.management.questionSummary (count=14)'),
    ).toBeInTheDocument();
  });

  it('shows the disabled reason tooltip for blocked party creation', async () => {
    const user = userEvent.setup();

    renderWithUiProvider(
      <GameItemCard
        descriptor={createGameTypeDescriptorFixture({ key: 'quiz', badge: 'QUIZ' })}
        game={gameFixtureFactory.createBlockedDashboardGame({
          permissions: {
            createParty: {
              allowed: false,
              reason: CreatePartyDisabledReason.HOST_HAS_ACTIVE_PARTY,
            },
          },
        })}
        onCreateParty={vi.fn()}
      />,
    );

    await user.hover(
      screen.getByRole('button', { name: 'dashboard.games.actions.createParty' })
        .parentElement as HTMLElement,
    );

    expect(
      await screen.findByText('dashboard.games.permissions.createParty.hostHasActiveParty'),
    ).toBeInTheDocument();
  });

  it('shows the no-stages tooltip when the game has no configured stages', async () => {
    const user = userEvent.setup();

    renderWithUiProvider(
      <GameItemCard
        descriptor={createGameTypeDescriptorFixture({ key: 'quiz', badge: 'QUIZ' })}
        game={gameFixtureFactory.createBlockedDashboardGame({
          stageCount: 0,
          permissions: {
            createParty: {
              allowed: false,
              reason: CreatePartyDisabledReason.NO_STAGES_AVAILABLE,
            },
          },
        })}
        onCreateParty={vi.fn()}
      />,
    );

    await user.hover(
      screen.getByRole('button', { name: 'dashboard.games.actions.createParty' })
        .parentElement as HTMLElement,
    );

    expect(
      await screen.findByText('dashboard.games.permissions.createParty.noStagesAvailable'),
    ).toBeInTheDocument();
  });

  it('renders launch readiness from the backend permission entry', () => {
    renderWithUiProvider(
      <GameItemCard
        descriptor={createGameTypeDescriptorFixture({ key: 'quiz', badge: 'QUIZ' })}
        game={gameFixtureFactory.createDashboardGame({
          stageCount: 0,
          permissions: {
            createParty: {
              allowed: false,
              reason: CreatePartyDisabledReason.NO_STAGES_AVAILABLE,
            },
            launchReadiness: {
              allowed: false,
              reason: LaunchReadinessDisabledReason.NO_STAGES_AVAILABLE,
            },
          },
        })}
      />,
    );

    expect(screen.getByText('dashboard.games.readiness.needsStages')).toBeInTheDocument();
  });
});
