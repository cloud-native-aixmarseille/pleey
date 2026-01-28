import { useEffect, useState } from 'react';
import {
  type DashboardActiveSessionItem,
  GameSessionParticipantRole,
} from '../../../../domains/game-session/entities/active-game-session';

interface UseDashboardActiveSessionOptions {
  readonly loadActiveSessions: () => Promise<DashboardActiveSessionItem[]>;
  readonly leaveCurrentPlayerSession: () => Promise<boolean>;
  readonly resumeGameSession: (sessionId: number) => Promise<DashboardActiveSessionItem>;
  readonly stopGameSession: (sessionId: number) => Promise<DashboardActiveSessionItem>;
}

interface UseDashboardActiveSessionResult {
  readonly session: DashboardActiveSessionItem | null;
  readonly isLoading: boolean;
  readonly errorMessage: string | null;
  readonly isActionPending: boolean;
  readonly handleResumeSession: () => Promise<void>;
  readonly handleStopSession: () => Promise<void>;
}

export function useDashboardActiveSession({
  loadActiveSessions,
  leaveCurrentPlayerSession,
  resumeGameSession,
  stopGameSession,
}: UseDashboardActiveSessionOptions): UseDashboardActiveSessionResult {
  const [session, setSession] = useState<DashboardActiveSessionItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isActionPending, setIsActionPending] = useState(false);

  useEffect(() => {
    let ignore = false;

    const load = async () => {
      setErrorMessage(null);
      setIsLoading(true);

      try {
        const loaded = await loadActiveSessions();

        if (!ignore) {
          setSession(loaded[0] ?? null);
        }
      } catch (error) {
        if (!ignore) {
          setSession(null);
          setErrorMessage(error instanceof Error ? error.message : 'dashboard.errors.loadFailed');
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    };

    void load();

    return () => {
      ignore = true;
    };
  }, [loadActiveSessions]);

  const handleResumeSession = async () => {
    if (!session) {
      return;
    }

    setErrorMessage(null);
    setIsActionPending(true);

    try {
      setSession(await resumeGameSession(session.sessionId));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'dashboard.sessions.actionFailed');
    } finally {
      setIsActionPending(false);
    }
  };

  const handleStopSession = async () => {
    if (!session) {
      return;
    }

    setErrorMessage(null);
    setIsActionPending(true);

    try {
      if (session.participantRole === GameSessionParticipantRole.PLAYER) {
        await leaveCurrentPlayerSession();
        setSession(null);
      } else {
        setSession(await stopGameSession(session.sessionId));
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'dashboard.sessions.actionFailed');
    } finally {
      setIsActionPending(false);
    }
  };

  return {
    session,
    isLoading,
    errorMessage,
    isActionPending,
    handleResumeSession,
    handleStopSession,
  };
}
