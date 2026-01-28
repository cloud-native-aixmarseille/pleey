import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { renderWithUiProvider } from '../../../../../test-utils/render-with-ui-provider';
import { QuizManagementHeader } from './quiz-management-header';

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

describe('QuizManagementHeader', () => {
  it('renders the management copy, wires the launch button with the quiz game id, and handles back navigation', async () => {
    const user = userEvent.setup();
    const createGameSession = vi.fn();
    const loadActiveSessions = vi.fn();
    const onBack = vi.fn();

    renderWithUiProvider(
      <QuizManagementHeader
        backActionLabel="Back to dashboard"
        createGameSession={createGameSession as never}
        eyebrow="Quiz"
        loadActiveSessions={loadActiveSessions as never}
        onBack={onBack}
        quiz={{
          id: 17,
          gameId: 9,
          title: 'Roadmap quiz',
          description: 'Planning workshop',
          createdAt: '2026-03-19T08:30:00.000Z',
          questionCount: 4,
        }}
        subtitle="Review quiz metadata and questions."
        title="Quiz management"
      />,
    );

    expect(screen.getByText('Quiz')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Quiz management' })).toBeInTheDocument();
    expect(screen.getByText('Review quiz metadata and questions.')).toBeInTheDocument();
    expect(screen.getByText('launch:9')).toBeInTheDocument();
    expect(mocks.launchGameSessionButton).toHaveBeenCalledWith(
      expect.objectContaining({
        gameId: 9,
        createGameSession,
        loadActiveSessions,
      }),
    );

    await user.click(screen.getByRole('button', { name: 'Back to dashboard' }));

    expect(onBack).toHaveBeenCalledTimes(1);
  });
});
