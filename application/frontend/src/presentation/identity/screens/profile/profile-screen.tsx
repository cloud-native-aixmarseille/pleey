import { usePresentationTranslation } from '../../../shared/i18n/use-presentation-translation';
import { AuthFormCard } from '../shared/components/auth-form-card';
import { AuthLayout } from '../shared/components/auth-layout';
import { ProfileDetailsForm } from './profile-details-form';
import { ProfileIdentitySection } from './profile-identity-section';
import { ProfileSignOutSection } from './profile-sign-out-section';
import { useProfileScreenState } from './use-profile-screen-state';

export function ProfileScreen() {
  const { t } = usePresentationTranslation();
  const {
    errorMessage,
    form,
    handleRegenerateAvatar,
    isAuthenticated,
    isRegenerating,
    signOut,
    successMessage,
    user,
  } = useProfileScreenState();

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <AuthLayout>
      <AuthFormCard
        eyebrow={t('auth.profile.eyebrow')}
        title={t('auth.profile.title')}
        subtitle={t('auth.profile.subtitle')}
      >
        <ProfileIdentitySection
          isRegenerating={isRegenerating}
          onRegenerateAvatar={handleRegenerateAvatar}
          user={user}
        />
        <ProfileDetailsForm
          errorMessage={errorMessage}
          form={form}
          successMessage={successMessage}
        />
        <ProfileSignOutSection onSignOut={signOut} />
      </AuthFormCard>
    </AuthLayout>
  );
}
