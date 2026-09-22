import type { User } from '../../../../domains/identity/entities/user';
import { usePresentationTranslation } from '../../../shared/i18n/use-presentation-translation';
import { Button } from '../../../shared/ui/actions/button';
import { UserAvatar } from '../../../shared/ui/data/user-avatar';
import { StatusBanner } from '../../../shared/ui/feedback/status-banner';
import { AppIcon } from '../../../shared/ui/icons/app-icon';
import { ContentStack, FlexGrowItem, SplitWrapRow, StretchRow } from '../../../shared/ui/layout/containers';
import { HeroPanel } from '../../../shared/ui/layout/panels';
import { Heading, SupportingText } from '../../../shared/ui/layout/typography';
import { usePresentationMediaQuery } from '../../../shared/ui/layout/use-presentation-media-query';

interface ProfileIdentitySectionProps {
  readonly errorMessage?: string | null;
  readonly successMessage?: string | null;
  readonly isRegenerating: boolean;
  readonly onRegenerateAvatar: () => Promise<void>;
  readonly user: User;
}

export function ProfileIdentitySection({
  errorMessage,
  successMessage,
  isRegenerating,
  onRegenerateAvatar,
  user,
}: ProfileIdentitySectionProps) {
  const isMobile = usePresentationMediaQuery('(max-width: 48em)');
  const { t, currentLanguage } = usePresentationTranslation();
  return (
    <section aria-label={t('auth.profile.avatarSection.label')}>
      <HeroPanel padding={isMobile ? 'lg' : 'xl'}>
        <ContentStack>
          <SplitWrapRow>
            <FlexGrowItem>
              <StretchRow>
                <UserAvatar alt={user.username} size={isMobile ? 56 : 80} src={user.avatarUri} />
                <FlexGrowItem>
                  <ContentStack gap="xs">
                    <Heading level={2}>{user.username}</Heading>
                    <SupportingText>{user.email}</SupportingText>
                    {user.createdAt && (
                      <SupportingText tone="soft">
                        {t('auth.profile.memberSince', {
                          date: new Intl.DateTimeFormat(currentLanguage, { month: 'long', year: 'numeric' }).format(
                            new Date(user.createdAt),
                          ),
                        })}
                      </SupportingText>
                    )}
                  </ContentStack>
                </FlexGrowItem>
              </StretchRow>
            </FlexGrowItem>
            <Button
              disabled={isRegenerating}
              loading={isRegenerating}
              intent="secondary"
              leftSection={<AppIcon name="feature" size={17} />}
              onClick={() => void onRegenerateAvatar()}
              size="sm"
              width={isMobile ? 'full' : 'auto'}
            >
              {isRegenerating
                ? t('auth.profile.avatarSection.regeneratingCta')
                : t('auth.profile.avatarSection.regenerateCta')}
            </Button>
          </SplitWrapRow>
          {(errorMessage || successMessage) && (
            <ContentStack gap="xs">
              <StatusBanner tone="error">{errorMessage}</StatusBanner>
              <StatusBanner tone="success">{successMessage}</StatusBanner>
            </ContentStack>
          )}
        </ContentStack>
      </HeroPanel>
    </section>
  );
}
