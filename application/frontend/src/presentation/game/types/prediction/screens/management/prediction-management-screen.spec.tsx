import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { GameTypeId } from '../../../../../../domains/game/types/shared/game-type';
import { GameTypeIdentifierMockFactory } from '../../../../../../test-utils/mocks/game-type-identifier-mock-factory';
import { PredictionManagementScreen } from './prediction-management-screen';

const routeParams = vi.hoisted(() => ({ current: { predictionId: '12' } }));
const gameTypeIdentifier = new GameTypeIdentifierMockFactory().create();

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
      data-testid="editor"
    >
      {translationRoot}
    </span>
  ),
}));

describe('PredictionManagementScreen', () => {
  it('renders the shared editor for a valid prediction id', () => {
    routeParams.current = { predictionId: '12' };

    render(
      <PredictionManagementScreen gameTypeIdentifier={gameTypeIdentifier} gateway={{} as never} />,
    );

    expect(screen.getByTestId('editor')).toHaveAttribute('data-game-type-id', '12');
    expect(screen.getByTestId('editor')).toHaveAttribute('data-has-kind-config', 'false');
    expect(screen.getByText('game.types.prediction.management')).toBeInTheDocument();
  });

  it('redirects when the prediction id is invalid', () => {
    routeParams.current = { predictionId: 'invalid' };

    render(
      <PredictionManagementScreen gameTypeIdentifier={gameTypeIdentifier} gateway={{} as never} />,
    );

    expect(screen.getByTestId('redirect')).toHaveTextContent('/workspace/dashboard');
  });
});
