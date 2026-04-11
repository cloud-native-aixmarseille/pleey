import { useState } from 'react';
import { usePresentationForm } from '../../../shared/forms/use-presentation-form';
import { useAuth } from '../../contexts/auth-context';
import { useAuthFormSubmit } from '../../hooks/use-auth-form-submit';

export function useRegisterScreenState() {
  const { register } = useAuth();
  const { errorMessage, clearError, handleError } = useAuthFormSubmit();
  const [isRegistered, setIsRegistered] = useState(false);

  const form = usePresentationForm({
    defaultValues: {
      username: '',
      email: '',
      password: '',
    },
    onSubmit: async ({ value }) => {
      clearError();

      try {
        await register(value);
        setIsRegistered(true);
        form.reset();
      } catch (error) {
        handleError(error);
      }
    },
  });

  return {
    errorMessage,
    form,
    isRegistered,
  };
}
