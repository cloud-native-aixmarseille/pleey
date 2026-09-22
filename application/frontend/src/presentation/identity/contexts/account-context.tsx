import { createContext, type PropsWithChildren, useContext } from 'react';
import type { AccountGateway } from '../../../application/identity/ports/account.gateway';
import { PresentationRuntimeDependencyProviderRequiredError } from '../../../domains/shared/errors/presentation-context-error-code';

const AccountContext = createContext<AccountGateway | null>(null);

interface AccountProviderProps extends PropsWithChildren {
  readonly value: AccountGateway;
}

export function AccountProvider({ children, value }: AccountProviderProps) {
  return <AccountContext.Provider value={value}>{children}</AccountContext.Provider>;
}

export function useAccount(): AccountGateway {
  const value = useContext(AccountContext);

  if (!value) {
    throw new PresentationRuntimeDependencyProviderRequiredError({
      consumer: 'useAccount',
      contextName: 'AccountContext',
    });
  }

  return value;
}
