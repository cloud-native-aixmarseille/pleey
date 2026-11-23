import { useAccount } from '../../contexts/account-context';
import { useAccountPage } from '../../hooks/use-account-page';

export function useProfileGameHistory(active: boolean) {
  const account = useAccount();
  const history = useAccountPage({
    active,
    pageSize: 20,
    load: (query) => account.gameHistory(query),
    cacheOnReturn: true,
  });
  return { ...history, retry: () => history.refresh() };
}
