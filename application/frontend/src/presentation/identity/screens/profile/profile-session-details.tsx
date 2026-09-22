import type { UserSessionDetails } from '../../../../domains/identity/entities/user-session-details';
import { usePresentationTranslation } from '../../../shared/i18n/use-presentation-translation';
import { ContentStack, ResponsiveGrid } from '../../../shared/ui/layout/containers';
import { SummaryText, SupportingText } from '../../../shared/ui/layout/typography';
import { sessionClientLabels } from './session-client-labels';

export function ProfileSessionDetails({ session }: { readonly session: UserSessionDetails }) {
  const { t, currentLanguage } = usePresentationTranslation();
  const client = sessionClientLabels(session.userAgent);
  const format = new Intl.DateTimeFormat(currentLanguage, { dateStyle: 'medium', timeStyle: 'short' });
  const dates = [
    { label: 'auth.profile.sessions.signedIn', value: session.createdAt },
    { label: 'auth.profile.sessions.lastActive', value: session.lastActiveAt },
    { label: 'auth.profile.sessions.expires', value: session.expiresAt },
  ];

  return (
    <ContentStack gap="md">
      <SummaryText>
        {t('auth.profile.sessions.client', { browser: t(client.browser), system: t(client.system) })}
      </SummaryText>
      <ResponsiveGrid columns={{ base: 1, sm: 2 }} gap="md">
        {dates.map(({ label, value }) => (
          <ContentStack key={label} gap="xs">
            <SupportingText>{t(label)}</SupportingText>
            <SummaryText>
              {value ? (
                <time dateTime={value}>{format.format(new Date(value))}</time>
              ) : (
                t('auth.profile.sessions.unavailable')
              )}
            </SummaryText>
          </ContentStack>
        ))}
        <ContentStack gap="xs">
          <SupportingText>{t('auth.profile.sessions.ipAddress')}</SupportingText>
          <SummaryText>{session.ipAddress ?? t('auth.profile.sessions.unavailable')}</SummaryText>
        </ContentStack>
      </ResponsiveGrid>
    </ContentStack>
  );
}
