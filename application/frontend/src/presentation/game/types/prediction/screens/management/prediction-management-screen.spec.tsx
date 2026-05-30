import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { PlayableContentImportExampleProvider } from '../../../../../../application/game/types/shared/contracts/playable-content-import.gateway';
import type { GameTypeId } from '../../../../../../domains/game/types/shared/game-type';
import { GameTypeIdentifierMockFactory } from '../../../../../../test-utils/mocks/game-type-identifier-mock-factory';
import { PredictionManagementScreen } from './prediction-management-screen';

const routeParams = vi.hoisted(() => ({ current: { predictionId: '12' } }));
const gameTypeIdentifier = new GameTypeIdentifierMockFactory().create();
const exampleFactory: PlayableContentImportExampleProvider = {
  create: vi.fn(),
  listFormats: vi.fn().mockReturnValue([]),
};

vi.mock('../../../../../shared/routing/router', () => ({
  PresentationRedirect: ({ to }: { readonly to: string }) => (
    <span data-testid="redirect">{to}</span>
  ),
  usePresentationParams: () => routeParams.current,
}));

vi.mock('../../../shared/management/playable-content-management-screen', () => ({
  PlayableContentManagementScreen: ({
    gameTypeId,
    headerSupplement,
    itemKindConfig,
    translationRoot,
  }: {
    readonly gameTypeId: GameTypeId;
    readonly headerSupplement?: unknown;
    readonly itemKindConfig?: { readonly defaultKind: string };
    readonly translationRoot: string;
  }) => (
    <span
      data-game-type-id={gameTypeId}
      data-has-header-supplement={String(headerSupplement !== undefined)}
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
      <PredictionManagementScreen
        exampleFactory={exampleFactory}
        gameTypeIdentifier={gameTypeIdentifier}
        gateway={{} as never}
        importGateway={{} as never}
      />,
    );

    expect(screen.getByTestId('editor')).toHaveAttribute('data-game-type-id', '12');
    expect(screen.getByTestId('editor')).toHaveAttribute('data-has-header-supplement', 'true');
    expect(screen.getByTestId('editor')).toHaveAttribute('data-has-kind-config', 'false');
    expect(screen.getByText('game.types.prediction.management')).toBeInTheDocument();
  });

  it('redirects when the prediction id is invalid', () => {
    routeParams.current = { predictionId: 'invalid' };

    render(
      <PredictionManagementScreen
        exampleFactory={exampleFactory}
        gameTypeIdentifier={gameTypeIdentifier}
        gateway={{} as never}
        importGateway={{} as never}
      />,
    );

    expect(screen.getByTestId('redirect')).toHaveTextContent('/workspace/dashboard');
  });
});
