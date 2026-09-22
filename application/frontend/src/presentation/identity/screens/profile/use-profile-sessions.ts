import { useRef, useState } from 'react';
import { useAccount } from '../../contexts/account-context';
import { useAccountPage } from '../../hooks/use-account-page';

export function useProfileSessions(active: boolean) {
  const account = useAccount();
  const sessions = useAccountPage({ active, pageSize: 5, load: (query) => account.sessions(query) });
  const { userId } = sessions;
  const [mutation, setMutation] = useState<{
    userId: string;
    pending: boolean;
    failed: boolean;
    succeeded: boolean;
  } | null>(null);
  const pending = useRef(false);
  const currentMutation = mutation?.userId === userId ? mutation : null;

  async function revoke(sessionId: string | null): Promise<boolean> {
    if (pending.current || !userId) return false;
    pending.current = true;
    setMutation({ userId, pending: true, failed: false, succeeded: false });
    try {
      if (sessionId === null) await account.revokeOtherSessions();
      else await account.revokeSession(sessionId);
      setMutation({ userId, pending: false, failed: false, succeeded: true });
      sessions.refresh(1);
      return true;
    } catch {
      setMutation({ userId, pending: false, failed: true, succeeded: false });
      return false;
    } finally {
      pending.current = false;
    }
  }

  return {
    ...sessions,
    mutating: currentMutation?.pending ?? false,
    mutationFailed: currentMutation?.failed ?? false,
    succeeded: currentMutation?.succeeded ?? false,
    refresh: () => sessions.refresh(),
    revoke,
  };
}
