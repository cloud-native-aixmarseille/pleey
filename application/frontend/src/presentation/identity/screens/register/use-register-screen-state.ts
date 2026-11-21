import { useState } from 'react';
import { usePresentationForm } from '../../../shared/forms/use-presentation-form';
import { useAuth } from '../../contexts/auth-context';
import { useAuthFormSubmit } from '../../hooks/use-auth-form-submit';
import { useCaptcha } from '../../hooks/use-captcha';

export function useRegisterScreenState() {
  const { register } = useAuth();
  const { errorMessage, clearError, handleError } = useAuthFormSubmit();
  const [isRegistered, setIsRegistered] = useState(false);

  const captcha = useCaptcha();
  const form = usePresentationForm({
    defaultValues: {
      username: '',
      email: '',
      password: '',
    },
    onSubmit: async ({ value }) => {
      const captchaToken = captcha.consumeToken();
      if (!captchaToken) return;
      clearError();

      try {
        await register({ ...value, captchaToken });
        setIsRegistered(true);
        form.reset();
      } catch (error) {
        handleError(error);
      }
    },
  });

  return {
    captcha,
    errorMessage,
    form,
    isRegistered,
  };
}
