import { usePresentationTranslation } from '../../shared/i18n/use-presentation-translation';
import { usePresentationFeedbackChannel } from '../../shared/ui/feedback/use-presentation-feedback-channel';

interface AuthFormSubmitState {
  readonly errorMessage: string | null;
  readonly clearError: () => void;
  readonly handleError: (error: unknown) => void;
}

export function useAuthFormSubmit(): AuthFormSubmitState {
  const { t } = usePresentationTranslation();
  const feedback = usePresentationFeedbackChannel();

  function handleError(error: unknown) {
    feedback.handleError(error, {
      fallbackMessage: t('auth.errors.generic'),
    });
  }

  return {
    clearError: feedback.clearError,
    errorMessage: feedback.errorMessage,
    handleError,
  };
}
