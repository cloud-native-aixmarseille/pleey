import { usePresentationTranslation } from '../../../shared/i18n/use-presentation-translation';
import { usePresentationParams } from '../../../shared/routing/router';
import { AppIcon, type AppIconName } from '../../../shared/ui/icons/app-icon';
import { ContentStack, ResponsiveGrid, SectionContainer, SidebarLayout } from '../../../shared/ui/layout/containers';
import { ElevatedPanel } from '../../../shared/ui/layout/panels';
import { Eyebrow, Heading, SupportingText } from '../../../shared/ui/layout/typography';
import { InlineTextLink, SectionNavigationLink } from '../../../shared/ui/navigation/links';
import { ProfileDetailsForm } from './profile-details-form';
import { ProfileGameHistorySection } from './profile-game-history-section';
import { ProfileIdentitySection } from './profile-identity-section';
import { ProfileSecuritySection } from './profile-security-section';
import { useProfileScreenState } from './use-profile-screen-state';

export function ProfileScreen() {
  const { t } = usePresentationTranslation();
  const { section: requestedSection } = usePresentationParams<'section'>();
  const section = requestedSection === 'security' || requestedSection === 'history' ? requestedSection : 'profile';
  const {
    avatarError,
    avatarSuccess,
    discardChanges,
    errorMessage,
    form,
    handleRegenerateAvatar,
    isRegenerating,
    successMessage,
    user,
  } = useProfileScreenState();

  if (user === null) return null;

  return (
    <SectionContainer gap="xl" maxWidth="72rem">
      <InlineTextLink leftSection={<AppIcon name="arrow-left" size={16} />} to="/workspace/dashboard">
        {t('auth.profile.backToWorkspace')}
      </InlineTextLink>
      <header>
        <ContentStack gap="xs">
          <Eyebrow>{t('auth.profile.eyebrow')}</Eyebrow>
          <Heading level={1}>{t('auth.profile.title')}</Heading>
          <SupportingText>{t('auth.profile.subtitle')}</SupportingText>
        </ContentStack>
      </header>
      <ProfileIdentitySection
        errorMessage={avatarError}
        successMessage={avatarSuccess}
        isRegenerating={isRegenerating}
        onRegenerateAvatar={handleRegenerateAvatar}
        user={user}
      />
      <SidebarLayout sidebar={<ProfileNavigation section={section} />}>
        <section aria-labelledby="profile-details-heading" hidden={section !== 'profile'}>
          <ElevatedPanel padding="lg">
            <ProfileDetailsForm
              errorMessage={errorMessage}
              form={form}
              onDiscard={discardChanges}
              successMessage={successMessage}
            />
          </ElevatedPanel>
        </section>
        <div hidden={section !== 'security'}>
          <ElevatedPanel padding="lg">
            <ProfileSecuritySection active={section === 'security'} key={`${user.id}:${user.email}`} />
          </ElevatedPanel>
        </div>
        <div hidden={section !== 'history'}>
          <ElevatedPanel padding="lg">
            <ProfileGameHistorySection active={section === 'history'} />
          </ElevatedPanel>
        </div>
      </SidebarLayout>
    </SectionContainer>
  );
}

interface ProfileNavigationProps {
  readonly section: string;
}

const sections = [
  { id: 'profile', path: '/identity/profile', icon: 'profile', label: 'auth.profile.navigation.profile' },
  { id: 'security', path: '/identity/profile/security', icon: 'settings', label: 'auth.profile.navigation.security' },
  { id: 'history', path: '/identity/profile/history', icon: 'game', label: 'auth.profile.navigation.history' },
] as const satisfies readonly { id: string; path: string; icon: AppIconName; label: string }[];

function ProfileNavigation({ section }: ProfileNavigationProps) {
  const { t } = usePresentationTranslation();
  return (
    <nav aria-label={t('auth.profile.navigation.label')}>
      <ResponsiveGrid columns={{ base: 3, sm: 1 }} gap="sm">
        {sections.map((item) => (
          <SectionNavigationLink
            active={section === item.id}
            key={item.id}
            leftSection={<AppIcon name={item.icon} size={19} />}
            to={item.path}
          >
            {t(item.label)}
          </SectionNavigationLink>
        ))}
      </ResponsiveGrid>
    </nav>
  );
}
