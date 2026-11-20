import { useEffect, useEffectEvent, useId, useRef, useState } from 'react';
import { usePresentationTranslation } from '../../../shared/i18n/use-presentation-translation';
import { Button } from '../../../shared/ui/actions/button';
import { StatusBanner } from '../../../shared/ui/feedback/status-banner';
import { AppIcon } from '../../../shared/ui/icons/app-icon';
import { ActionRow, ContentStack } from '../../../shared/ui/layout/containers';
import { InsetPanel } from '../../../shared/ui/layout/panels';
import { Heading, SummaryText, SupportingText } from '../../../shared/ui/layout/typography';
import { useAuth } from '../../contexts/auth-context';
import { useCaptcha } from '../../hooks/use-captcha';
import { SecurityCheck } from '../shared/components/security-check';
import { ProfileSessionsSection } from './profile-sessions-section';

export function ProfileSecuritySection({ active }: { readonly active: boolean }) {
  const { user, requestPasswordReset } = useAuth();
  const { t, currentLanguage } = usePresentationTranslation();
  const captcha = useCaptcha();
  const passwordTitleId = useId();
  const pendingRequest = useRef(false);
  const [isSending, setIsSending] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);

  const clearCaptcha = useEffectEvent(() => captcha.updateToken(null));
  useEffect(() => {
    if (!active) clearCaptcha();
  }, [active]);

  if (user === null) {
    return null;
  }

  const email = user.email;
  const isSent = sentTo === email;

  async function handlePasswordReset() {
    if (!active || pendingRequest.current || isSent) {
      return;
    }

    const captchaToken = captcha.consumeToken();
    if (!captchaToken) return;
    pendingRequest.current = true;
    setIsSending(true);
    setHasError(false);

    try {
      await requestPasswordReset(email, currentLanguage.startsWith('fr') ? 'fr' : 'en', captchaToken);
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
          {active && !isSent && <SecurityCheck action="password-recovery" captcha={captcha} />}
          <ActionRow>
            <Button
              aria-busy={isSending}
              disabled={!active || isSending || isSent || !captcha.isVerified}
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
