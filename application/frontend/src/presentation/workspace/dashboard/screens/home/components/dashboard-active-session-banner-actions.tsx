import type { DashboardActiveSessionItem } from '../../../../../../domains/game-session/entities/active-game-session';
import { GameSessionParticipantRole } from '../../../../../../domains/game-session/entities/active-game-session';
import { GameSessionStatus } from '../../../../../../domains/game-session/entities/game-session-status';
import { usePresentationTranslation } from '../../../../../shared/i18n/use-presentation-translation';
import { Button } from '../../../../../shared/ui/actions/button';
import { uiThemeTokens } from '../../../../../shared/ui/foundation/ui-theme';

const actionsStyle = {
  alignItems: 'center' as const,
  display: 'flex',
  gap: uiThemeTokens.spacing.xs,
};

interface DashboardActiveSessionBannerActionsProps {
  readonly isActionPending: boolean;
  readonly onOpenSession: (session: DashboardActiveSessionItem) => void;
  readonly onResumeSession: () => Promise<void>;
  readonly onStopSession: () => Promise<void>;
  readonly session: DashboardActiveSessionItem;
}

function getOpenLabelKey(status: string): string {
  return status === GameSessionStatus.WAITING || status === GameSessionStatus.PAUSED
    ? 'dashboard.sessions.actions.openLobby'
    : 'dashboard.sessions.actions.openLive';
}

function getStopLabelKey(session: DashboardActiveSessionItem, isActionPending: boolean): string {
  if (session.participantRole === GameSessionParticipantRole.PLAYER) {
    return isActionPending
      ? 'dashboard.sessions.actions.leaving'
      : 'dashboard.sessions.actions.leave';
  }

  return isActionPending
    ? 'dashboard.sessions.actions.stopping'
    : 'dashboard.sessions.actions.pause';
}

export function DashboardActiveSessionBannerActions({
  isActionPending,
  onOpenSession,
  onResumeSession,
  onStopSession,
  session,
}: DashboardActiveSessionBannerActionsProps) {
  const { t } = usePresentationTranslation();

  return (
    <div style={actionsStyle}>
      <Button size="sm" intent="outline" onClick={() => onOpenSession(session)}>
        {t(getOpenLabelKey(session.status))}
      </Button>
      {session.status === GameSessionStatus.ACTIVE ? (
        <Button
          disabled={isActionPending}
          intent="ghost"
          size="sm"
          onClick={() => void onStopSession()}
        >
          {t(getStopLabelKey(session, isActionPending))}
        </Button>
      ) : null}
      {session.participantRole === GameSessionParticipantRole.PLAYER &&
      session.status !== GameSessionStatus.ACTIVE ? (
        <Button
          disabled={isActionPending}
          intent="ghost"
          size="sm"
          onClick={() => void onStopSession()}
        >
          {t(getStopLabelKey(session, isActionPending))}
        </Button>
      ) : null}
      {session.status === GameSessionStatus.PAUSED ? (
        <Button
          disabled={
            isActionPending || session.participantRole === GameSessionParticipantRole.PLAYER
          }
          intent="success"
          size="sm"
          onClick={() => void onResumeSession()}
        >
          {isActionPending
            ? t('dashboard.sessions.actions.resuming')
            : t('dashboard.sessions.actions.resume')}
        </Button>
      ) : null}
    </div>
  );
}
