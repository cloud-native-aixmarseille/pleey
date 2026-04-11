import { useState } from 'react';
import { usePresentationForm } from '../../../shared/forms/use-presentation-form';

export function useForgotPasswordScreenState() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const form = usePresentationForm({
    defaultValues: {
      email: '',
    },
    onSubmit: async () => {
      setIsSubmitted(true);
    },
  });

  return {
    form,
    isSubmitted,
  };
}
