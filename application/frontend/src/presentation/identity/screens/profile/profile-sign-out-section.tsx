import { type ReactNode, useId, useRef, useState } from 'react';
import { usePresentationTranslation } from '../../../shared/i18n/use-presentation-translation';
import { Button } from '../../../shared/ui/actions/button';
import { StatusBanner } from '../../../shared/ui/feedback/status-banner';
import { ActionRow, ContentStack } from '../../../shared/ui/layout/containers';
import { Heading, SupportingText } from '../../../shared/ui/layout/typography';

interface ProfileSignOutSectionProps {
  readonly onSignOut: () => Promise<void> | void;
  readonly children?: ReactNode;
}

export function ProfileSignOutSection({ onSignOut, children }: ProfileSignOutSectionProps) {
  const { t } = usePresentationTranslation();
  const titleId = useId();
  const pendingSignOut = useRef(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [hasError, setHasError] = useState(false);

  async function handleSignOut() {
    if (pendingSignOut.current) {
      return;
    }

    pendingSignOut.current = true;
    setIsSigningOut(true);
    setHasError(false);

    try {
      await onSignOut();
    } catch {
      setHasError(true);
    } finally {
      pendingSignOut.current = false;
      setIsSigningOut(false);
    }
  }

  return (
    <section aria-labelledby={titleId}>
      <ContentStack gap="lg">
        <div>
          <Heading id={titleId} level={2}>
            {t('auth.profile.security.sessionTitle')}
          </Heading>
          <SupportingText>{t('auth.profile.signOutDescription')}</SupportingText>
        </div>
        {children}
        <StatusBanner tone="error">{hasError ? t('auth.profile.security.signOutError') : null}</StatusBanner>
        <ActionRow>
          <Button
            aria-busy={isSigningOut}
            disabled={isSigningOut}
            intent="ghost"
            onClick={() => void handleSignOut()}
            type="button"
          >
            {t(isSigningOut ? 'auth.profile.security.signingOut' : 'auth.profile.signOutCta')}
          </Button>
        </ActionRow>
      </ContentStack>
    </section>
  );
}
