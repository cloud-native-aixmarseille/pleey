import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { renderWithUiProvider } from '../../../../../test-utils/render-with-ui-provider';
import { PredictionManagementHeader } from './prediction-management-header';

const mocks = vi.hoisted(() => ({
  launchGameSessionButton: vi.fn(),
}));

vi.mock('../../../../game-session/shared/components/launch-game-session-button', () => ({
  LaunchGameSessionButton: (props: {
    gameId: number;
    createGameSession: (gameId: number) => Promise<unknown>;
    loadActiveSessions: () => Promise<unknown[]>;
  }) => {
    mocks.launchGameSessionButton(props);

    return <div>{`launch:${String(props.gameId)}`}</div>;
  },
}));

describe('PredictionManagementHeader', () => {
  it('renders the management copy, wires the launch button with the real game id, and handles back navigation', async () => {
    const user = userEvent.setup();
    const createGameSession = vi.fn();
    const loadActiveSessions = vi.fn();
    const onBack = vi.fn();

    renderWithUiProvider(
      <PredictionManagementHeader
        backActionLabel="Back to dashboard"
        createGameSession={createGameSession as never}
        eyebrow="Prediction"
        game={{
          gameId: 7,
          type: 'prediction',
          title: 'Q4 market forecast',
          description: 'Regional sales projection',
          createdAt: '2026-03-15T10:00:00.000Z',
          relatedGameId: 17,
          stageCount: 3,
        }}
        loadActiveSessions={loadActiveSessions as never}
        onBack={onBack}
        subtitle="Configure prompts before going live."
        title="Prediction management"
      />,
    );

    expect(screen.getByText('Prediction')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Prediction management' })).toBeInTheDocument();
    expect(screen.getByText('Configure prompts before going live.')).toBeInTheDocument();
    expect(screen.getByText('launch:7')).toBeInTheDocument();
    expect(mocks.launchGameSessionButton).toHaveBeenCalledWith(
      expect.objectContaining({
        gameId: 7,
        createGameSession,
        loadActiveSessions,
      }),
    );

    await user.click(screen.getByRole('button', { name: 'Back to dashboard' }));

    expect(onBack).toHaveBeenCalledTimes(1);
  });
});
