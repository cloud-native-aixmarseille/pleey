import { useState } from 'react';
import { usePresentationTranslation } from '../../shared/i18n/use-presentation-translation';

interface AuthFormSubmitState {
  readonly errorMessage: string | null;
  readonly clearError: () => void;
  readonly handleError: (error: unknown) => void;
}

export function useAuthFormSubmit(): AuthFormSubmitState {
  const { t } = usePresentationTranslation();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function clearError() {
    setErrorMessage(null);
  }

  function handleError(error: unknown) {
    setErrorMessage(error instanceof Error ? error.message : t('auth.errors.generic'));
  }

  return { errorMessage, clearError, handleError };
}
