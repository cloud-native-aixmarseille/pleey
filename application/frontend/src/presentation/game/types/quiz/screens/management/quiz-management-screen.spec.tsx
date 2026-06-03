import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { GameTypeId } from '../../../../../../domains/game/types/shared/game-type';
import { GameTypeIdentifierMockFactory } from '../../../../../../test-utils/mocks/game-type-identifier-mock-factory';
import { QuizManagementScreen } from './quiz-management-screen';

const routeParams = vi.hoisted(() => ({ current: { quizId: '9' } }));
const gameTypeIdentifier = new GameTypeIdentifierMockFactory().create();
const quizId = gameTypeIdentifier.parse(9);

vi.mock('../../../../../shared/routing/router', () => ({
  PresentationRedirect: ({ to }: { readonly to: string }) => (
    <span data-testid="redirect">{to}</span>
  ),
  usePresentationParams: () => routeParams.current,
}));

vi.mock('../../../shared/management/playable-content-management-screen', () => ({
  PlayableContentManagementScreen: ({
    gameTypeId,
    itemKindConfig,
    translationRoot,
  }: {
    readonly gameTypeId: GameTypeId;
    readonly itemKindConfig?: { readonly defaultKind: string };
    readonly translationRoot: string;
  }) => (
    <span
      data-game-type-id={gameTypeId}
      data-has-kind-config={String(itemKindConfig !== undefined)}
      data-item-kind-default={itemKindConfig?.defaultKind}
      data-testid="editor"
    >
      {translationRoot}
    </span>
  ),
}));

describe('QuizManagementScreen', () => {
  it('renders the shared editor for a valid quiz id', () => {
    routeParams.current = { quizId: '9' };

    render(<QuizManagementScreen gameTypeIdentifier={gameTypeIdentifier} gateway={{} as never} />);

    expect(screen.getByTestId('editor')).toHaveAttribute('data-game-type-id', quizId);
    expect(screen.getByTestId('editor')).toHaveAttribute('data-has-kind-config', 'true');
    expect(screen.getByTestId('editor')).toHaveAttribute('data-item-kind-default', 'multiple');
    expect(screen.getByText('game.types.quiz.management')).toBeInTheDocument();
  });

  it('redirects when the quiz id is invalid', () => {
    routeParams.current = { quizId: 'invalid' };

    render(<QuizManagementScreen gameTypeIdentifier={gameTypeIdentifier} gateway={{} as never} />);

    expect(screen.getByTestId('redirect')).toHaveTextContent('/workspace/dashboard');
  });
});
