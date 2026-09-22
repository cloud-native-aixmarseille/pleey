import { useState } from 'react';
import type { PresentationFormApi } from '../../../../application/shared/ports/form.port';
import type { UpdateProfileInput } from '../../../../domains/identity/ports/auth-repository';
import { usePresentationForm } from '../../../shared/forms/use-presentation-form';
import { usePresentationTranslation } from '../../../shared/i18n/use-presentation-translation';
import { useAuth } from '../../contexts/auth-context';
import { useAuthFormSubmit } from '../../hooks/use-auth-form-submit';
import type { ProfileFormValues } from './profile-form-values';

interface ProfileScreenState {
  readonly avatarError: string | null;
  readonly avatarSuccess: string | null;
  readonly discardChanges: () => void;
  readonly errorMessage: string | null;
  readonly form: PresentationFormApi<ProfileFormValues>;
  readonly handleRegenerateAvatar: () => Promise<void>;
  readonly isRegenerating: boolean;
  readonly successMessage: string | null;
  readonly user: ReturnType<typeof useAuth>['user'];
}

export function useProfileScreenState(): ProfileScreenState {
  const { user, regenerateAvatar, updateProfile } = useAuth();
  const { t } = usePresentationTranslation();
  const { errorMessage, clearError, handleError } = useAuthFormSubmit();
  const avatarFeedback = useAuthFormSubmit();
  const [avatarSuccess, setAvatarSuccess] = useState<string | null>(null);
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

        if (Object.keys(input).length === 0) return;
        await updateProfile(input);
        form.reset(value);
        setSuccessMessage(t('auth.profile.successMessage'));
      } catch (error) {
        handleError(error);
      }
    },
  });

  async function handleRegenerateAvatar() {
    if (isRegenerating) return;
    avatarFeedback.clearError();
    setAvatarSuccess(null);
    setIsRegenerating(true);

    try {
      await regenerateAvatar();
      setAvatarSuccess(t('auth.profile.avatarSection.success'));
    } catch (error) {
      avatarFeedback.handleError(error);
    } finally {
      setIsRegenerating(false);
    }
  }

  return {
    avatarError: avatarFeedback.errorMessage,
    avatarSuccess,
    discardChanges: () => {
      form.reset({ username: user?.username ?? '', email: user?.email ?? '' });
      clearError();
      setSuccessMessage(null);
    },
    errorMessage,
    form,
    handleRegenerateAvatar,
    isRegenerating,
    successMessage,
    user,
  };
}
