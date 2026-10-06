import { useEffect, useEffectEvent, useRef, useState } from 'react';
import type { ThemeDocument } from '../../../domains/theme/entities/theme-document';
import { useAuth } from '../../identity/contexts/auth-context';
import { useWorkspaceDependencies } from '../../workspace/shared/contexts/workspace-dependencies-context';

export function useThemeDraft({
  organizationId,
  themeId,
  revision,
  document,
  dirty,
  blocked,
}: {
  readonly organizationId: string;
  readonly themeId: string;
  readonly revision: number | null;
  readonly document: ThemeDocument;
  readonly dirty: boolean;
  readonly blocked: boolean;
}) {
  const { user } = useAuth();
  const { themeManagementFacade: facade } = useWorkspaceDependencies();
  const scope = { userId: user?.id ?? '', organizationId, themeId };
  const [recoverable, setRecoverable] = useState(() => (user ? facade.readDraft(scope) : null));
  const [unavailable, setUnavailable] = useState(false);
  const dismissed = useRef(false);
  const sourceRevision = useRef(revision);
  useEffect(() => {
    if (!dirty) sourceRevision.current = revision;
  }, [dirty, revision]);
  const persist = useEffectEvent(() => {
    if (!user || dismissed.current || recoverable || blocked) return;
    if (dirty)
      setUnavailable(
        !facade.writeDraft(scope, { document, sourceRevision: sourceRevision.current, updatedAt: Date.now() }),
      );
    else facade.removeDraft(scope);
  });
  useEffect(() => {
    const timer = window.setTimeout(persist, 300);
    return () => window.clearTimeout(timer);
  }, [document, dirty, revision, recoverable, blocked]);
  useEffect(() => {
    window.addEventListener('pagehide', persist);
    return () => window.removeEventListener('pagehide', persist);
  }, []);

  const discard = () => {
    facade.removeDraft(scope);
    setRecoverable(null);
  };
  const clear = () => {
    dismissed.current = true;
    discard();
  };
  return {
    recoverable,
    unavailable,
    discard,
    clear,
    accept: () => {
      if (recoverable) sourceRevision.current = recoverable.sourceRevision;
      setRecoverable(null);
    },
  };
}
