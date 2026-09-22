import { useId, useRef, useState } from 'react';
import { usePresentationTranslation } from '../../../shared/i18n/use-presentation-translation';
import { Button } from '../../../shared/ui/actions/button';
import { StatusBanner } from '../../../shared/ui/feedback/status-banner';
import { AppIcon } from '../../../shared/ui/icons/app-icon';
import { ActionRow, ContentStack } from '../../../shared/ui/layout/containers';
import { InsetPanel } from '../../../shared/ui/layout/panels';
import { Heading, SummaryText, SupportingText } from '../../../shared/ui/layout/typography';
import { useAuth } from '../../contexts/auth-context';
import { ProfileSessionsSection } from './profile-sessions-section';

export function ProfileSecuritySection({ active }: { readonly active: boolean }) {
  const { user, requestPasswordReset } = useAuth();
  const { t, currentLanguage } = usePresentationTranslation();
  const passwordTitleId = useId();
  const pendingRequest = useRef(false);
  const [isSending, setIsSending] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);

  if (user === null) {
    return null;
  }

  const email = user.email;
  const isSent = sentTo === email;

  async function handlePasswordReset() {
    if (pendingRequest.current || isSent) {
      return;
    }

    pendingRequest.current = true;
    setIsSending(true);
    setHasError(false);

    try {
      await requestPasswordReset(email, currentLanguage.startsWith('fr') ? 'fr' : 'en');
      setSentTo(email);
    } catch {
      setHasError(true);
    } finally {
      pendingRequest.current = false;
      setIsSending(false);
    }
  }

  return (
    <ContentStack gap="xl">
      <ProfileSessionsSection active={active} key={user.id} />
      <section aria-labelledby={passwordTitleId}>
        <ContentStack gap="lg">
          <div>
            <Heading id={passwordTitleId} level={2}>
              {t('auth.profile.security.passwordTitle')}
            </Heading>
            <SupportingText>{t('auth.profile.security.passwordDescription')}</SupportingText>
          </div>
          <InsetPanel>
            <ContentStack gap="xs">
              <SupportingText size="sm">{t('auth.form.emailLabel')}</SupportingText>
              <SummaryText>{email}</SummaryText>
            </ContentStack>
          </InsetPanel>
          <StatusBanner tone="error">{hasError ? t('auth.profile.security.resetError') : null}</StatusBanner>
          <StatusBanner tone="success">{isSent ? t('auth.profile.security.resetSent', { email }) : null}</StatusBanner>
          <ActionRow>
            <Button
              aria-busy={isSending}
              disabled={isSending || isSent}
              intent="primary"
              leftSection={isSent ? <AppIcon name="success" /> : undefined}
              onClick={() => void handlePasswordReset()}
              type="button"
            >
              {t(
                isSending
                  ? 'auth.profile.security.sendingReset'
                  : isSent
                    ? 'auth.profile.security.resetRequested'
                    : 'auth.profile.security.sendReset',
              )}
            </Button>
          </ActionRow>
        </ContentStack>
      </section>
    </ContentStack>
  );
}
