import { useState } from 'react';
import type { PresentationFormApi } from '../../../../application/shared/contracts/form.port';
import type { UpdateProfileInput } from '../../../../domains/auth/ports/auth-repository';
import { usePresentationForm } from '../../../shared/forms/use-presentation-form';
import { usePresentationTranslation } from '../../../shared/i18n/use-presentation-translation';
import { useAuth } from '../../contexts/auth-context';
import { useAuthFormSubmit } from '../../hooks/use-auth-form-submit';
import type { ProfileFormValues } from './profile-form-values';

interface ProfileScreenState {
  readonly errorMessage: string | null;
  readonly form: PresentationFormApi<ProfileFormValues>;
  readonly handleRegenerateAvatar: () => Promise<void>;
  readonly isAuthenticated: boolean;
  readonly isRegenerating: boolean;
  readonly signOut: () => Promise<void> | void;
  readonly successMessage: string | null;
  readonly user: ReturnType<typeof useAuth>['user'];
}

export function useProfileScreenState(): ProfileScreenState {
  const { user, isAuthenticated, regenerateAvatar, updateProfile, signOut } = useAuth();
  const { t } = usePresentationTranslation();
  const { errorMessage, clearError, handleError } = useAuthFormSubmit();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const form = usePresentationForm<ProfileFormValues>({
    defaultValues: {
      username: user?.username ?? '',
      email: user?.email ?? '',
    },
    onSubmit: async ({ value }) => {
      clearError();
      setSuccessMessage(null);

      try {
        const input: UpdateProfileInput = {
          ...(value.username !== user?.username ? { username: value.username } : {}),
          ...(value.email !== user?.email ? { email: value.email } : {}),
        };

        await updateProfile(input);
        setSuccessMessage(t('auth.profile.successMessage'));
      } catch (error) {
        handleError(error);
      }
    },
  });

  async function handleRegenerateAvatar() {
    setIsRegenerating(true);

    try {
      await regenerateAvatar();
    } catch (error) {
      handleError(error);
    } finally {
      setIsRegenerating(false);
    }
  }

  return {
    errorMessage,
    form,
    handleRegenerateAvatar,
    isAuthenticated,
    isRegenerating,
    signOut,
    successMessage,
    user,
  };
}
