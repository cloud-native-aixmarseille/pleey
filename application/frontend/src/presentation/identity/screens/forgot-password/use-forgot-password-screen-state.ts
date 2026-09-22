import { useState } from 'react';
import { usePresentationForm } from '../../../shared/forms/use-presentation-form';
import { usePresentationTranslation } from '../../../shared/i18n/use-presentation-translation';
import { useAuth } from '../../contexts/auth-context';
import { useAuthFormSubmit } from '../../hooks/use-auth-form-submit';

export function useForgotPasswordScreenState() {
  const { requestPasswordReset } = useAuth();
  const { currentLanguage } = usePresentationTranslation();
  const { errorMessage, clearError, handleError } = useAuthFormSubmit();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const form = usePresentationForm({
    defaultValues: {
      email: '',
    },
    onSubmit: async ({ value }) => {
      clearError();
      try {
        await requestPasswordReset(value.email.trim(), currentLanguage.startsWith('fr') ? 'fr' : 'en');
        setIsSubmitted(true);
      } catch (error) {
        handleError(error);
      }
    },
  });

  return {
    errorMessage,
    form,
    isSubmitted,
  };
}
