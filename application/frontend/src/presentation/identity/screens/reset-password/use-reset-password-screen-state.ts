import { useEffect, useState } from 'react';
import { PASSWORD_INPUT_MIN_LENGTH, isPasswordInputWithinUtf8ByteLimit } from '@pleey/domain/identity';
import { usePresentationForm } from '../../../shared/forms/use-presentation-form';
import { usePresentationTranslation } from '../../../shared/i18n/use-presentation-translation';
import { useAuth } from '../../contexts/auth-context';
import { useAuthFormSubmit } from '../../hooks/use-auth-form-submit';

export function useResetPasswordScreenState() {
  const { resetPassword } = useAuth();
  const { t } = usePresentationTranslation();
  const { errorMessage, clearError, handleError } = useAuthFormSubmit();
  const [token] = useState(() => new URLSearchParams(window.location.hash.slice(1)).get('token') ?? '');
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    window.history.replaceState(window.history.state, '', `${window.location.pathname}${window.location.search}`);
  }, []);

  const form = usePresentationForm({
    defaultValues: { password: '', confirmPassword: '' },
    validators: {
      onChange: ({ value }) => ({
        fields: {
          password:
            value.password.length < PASSWORD_INPUT_MIN_LENGTH ||
            !isPasswordInputWithinUtf8ByteLimit(value.password)
              ? t('auth.resetPassword.passwordPolicy')
              : undefined,
          confirmPassword:
            value.password !== value.confirmPassword ? t('auth.resetPassword.passwordMismatch') : undefined,
        },
      }),
    },
    onSubmit: async ({ value }) => {
      clearError();
      try {
        await resetPassword(token, value.password);
        setIsSubmitted(true);
      } catch (error) {
        handleError(error);
      }
    },
  });

  return { form, isSubmitted, hasToken: /^[a-f0-9]{64}$/.test(token), errorMessage };
}
