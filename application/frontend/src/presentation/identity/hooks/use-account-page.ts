import { useEffect, useEffectEvent, useState } from 'react';
import type { PaginationQuery } from '../../../domains/shared/value-objects/pagination-query';
import { useAuth } from '../contexts/auth-context';

interface AccountPageOptions<TResult> {
  readonly active: boolean;
  readonly pageSize: number;
  readonly load: (query: PaginationQuery) => Promise<TResult>;
  readonly cacheOnReturn?: boolean;
}

interface AccountPageState<TResult> {
  readonly userId: string;
  readonly page: number;
  readonly revision: number;
  readonly result: TResult | null;
  readonly loading: boolean;
  readonly failed: boolean;
}

export function useAccountPage<TResult>({
  active,
  pageSize,
  load,
  cacheOnReturn = false,
}: AccountPageOptions<TResult>) {
  const { user } = useAuth();
  const userId = user?.id;
  const [selection, setSelection] = useState({ userId, page: 1, revision: 0 });
  const [state, setState] = useState<AccountPageState<TResult> | null>(null);
  const page = selection.userId === userId ? selection.page : 1;
  const revision = selection.userId === userId ? selection.revision : 0;
  const current = state?.userId === userId && state?.page === page && state?.revision === revision ? state : null;
  const loadPage = useEffectEvent(() => load({ page, pageSize }));
  const hasCachedPage = useEffectEvent(() => current?.result != null);

  useEffect(() => {
    setSelection({ userId, page: 1, revision: 0 });
  }, [userId]);

  useEffect(() => {
    if (!active || !userId || (cacheOnReturn && hasCachedPage())) return;
    let isCurrent = true;
    const request = { userId, page, revision };
    setState({ ...request, result: null, loading: true, failed: false });
    void loadPage().then(
      (result) => {
        if (isCurrent) setState({ ...request, result, loading: false, failed: false });
      },
      () => {
        if (isCurrent) setState({ ...request, result: null, loading: false, failed: true });
      },
    );
    return () => {
      isCurrent = false;
    };
  }, [active, userId, page, pageSize, revision, cacheOnReturn]);

  return {
    userId,
    result: current?.result ?? null,
    loading: Boolean(active && userId && (!current || current.loading)),
    failed: current?.failed ?? false,
    page,
    setPage: (nextPage: number) => setSelection({ userId, page: nextPage, revision }),
    refresh: (nextPage = page) =>
      setSelection((previous) => ({ userId, page: nextPage, revision: previous.revision + 1 })),
  };
}
