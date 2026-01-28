import type { DashboardActiveSessionItem } from '../../../../../domains/game-session/entities/active-game-session';
import type { Quiz } from '../../../../../domains/quiz/entities/quiz';
import { LaunchGameSessionButton } from '../../../../game-session/shared/components/launch-game-session-button';
import { Button } from '../../../../shared/ui/actions/button';
import { SubpageHeader } from '../../../../shared/ui/layout/subpage-header';

interface QuizManagementHeaderProps {
  readonly quiz: Quiz;
  readonly eyebrow: string;
  readonly title: string;
  readonly subtitle: string;
  readonly backActionLabel: string;
  readonly createGameSession: (gameId: number) => Promise<DashboardActiveSessionItem>;
  readonly loadActiveSessions: () => Promise<DashboardActiveSessionItem[]>;
  readonly onBack: () => void;
}

export function QuizManagementHeader({
  quiz,
  eyebrow,
  title,
  subtitle,
  backActionLabel,
  createGameSession,
  loadActiveSessions,
  onBack,
}: QuizManagementHeaderProps) {
  return (
    <SubpageHeader
      kicker={eyebrow}
      title={title}
      subtitle={subtitle}
      actions={
        <>
          <LaunchGameSessionButton
            createGameSession={createGameSession}
            gameId={quiz.gameId}
            loadActiveSessions={loadActiveSessions}
          />
          <Button intent="ghost" onClick={onBack}>
            {backActionLabel}
          </Button>
        </>
      }
    />
  );
}
