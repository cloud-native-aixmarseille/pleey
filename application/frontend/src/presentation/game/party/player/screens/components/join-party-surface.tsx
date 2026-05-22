import { useEffect } from 'react';
import { usePresentationTranslation } from '../../../../../shared/i18n/use-presentation-translation';
import { Button } from '../../../../../shared/ui/actions/button';
import { StatusBanner } from '../../../../../shared/ui/feedback/status-banner';
import { FieldShell } from '../../../../../shared/ui/forms/field-shell';
import { Input } from '../../../../../shared/ui/forms/input';
import { AccentIconBadge } from '../../../../../shared/ui/icons/accent-icon-badge';
import { AppIcon } from '../../../../../shared/ui/icons/app-icon';
import { ActionRow, ContentStack } from '../../../../../shared/ui/layout/containers';
import { ElevatedPanel, HeroPanel } from '../../../../../shared/ui/layout/panels';
import { Eyebrow, Heading, SupportingText } from '../../../../../shared/ui/layout/typography';
import { usePresentationMediaQuery } from '../../../../../shared/ui/layout/use-presentation-media-query';
import { PartyPinPreview } from '../../../shared/screens/components/party-pin-preview';

interface JoinPartySurfaceProps {
  readonly errorMessage: string | null;
  readonly guestName: string;
  readonly isAuthenticated: boolean;
  readonly isJoinSubmitting: boolean;
  readonly onDismissError: () => void;
  readonly onGuestNameChange: (value: string) => void;
  readonly onJoinParty: () => void;
  readonly pin: string;
}

const errorToastStyle = {
  maxWidth: '24rem',
  position: 'fixed',
  right: 'var(--mantine-spacing-lg)',
  top: 'var(--mantine-spacing-lg)',
  width: 'calc(100vw - (2 * var(--mantine-spacing-lg)))',
  zIndex: 400,
} as const;

export function JoinPartySurface({
  errorMessage,
  guestName,
  isAuthenticated,
  isJoinSubmitting,
  onDismissError,
  onGuestNameChange,
  onJoinParty,
  pin,
}: JoinPartySurfaceProps) {
  const { t } = usePresentationTranslation();
  const isMobile = usePresentationMediaQuery('(max-width: 48em)');
  const isJoinDisabled = isJoinSubmitting || (!isAuthenticated && guestName.trim().length === 0);

  useEffect(() => {
    if (!errorMessage) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      onDismissError();
    }, 4000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [errorMessage, onDismissError]);

  return (
    <>
      {errorMessage ? (
        <div data-testid="join-party-error-toast" style={errorToastStyle}>
          <StatusBanner tone="error">{t(errorMessage)}</StatusBanner>
        </div>
      ) : null}

      <ContentStack gap={isMobile ? 'md' : 'lg'}>
        <header role="banner">
          <HeroPanel padding={isMobile ? 'lg' : 'xl'}>
            <ContentStack align="center" gap={isMobile ? 'sm' : 'md'}>
              {isMobile ? null : (
                <AccentIconBadge>
                  <AppIcon name="game" size={28} />
                </AccentIconBadge>
              )}
              {isMobile ? null : <Eyebrow>{t('game.party.player.route.joinHeroEyebrow')}</Eyebrow>}
              <Heading hero={!isMobile} level={isMobile ? 2 : 1}>
                {t('game.party.player.route.joinHeroTitle')}
              </Heading>
              {isMobile ? null : (
                <SupportingText maxWidth={512} size="md" tone="soft">
                  {t('game.party.player.route.joinHeroSubtitle')}
                </SupportingText>
              )}
              {pin ? (
                <PartyPinPreview
                  ariaLabel={t('game.party.route.pinAriaLabel', { pin })}
                  label={t('game.party.player.route.joinPinPreviewLabel')}
                  pin={pin}
                />
              ) : null}
            </ContentStack>
          </HeroPanel>
        </header>

        <section aria-label={t('game.party.player.route.joinPanelLabel')}>
          <ElevatedPanel padding={isMobile ? 'md' : 'lg'}>
            <ContentStack gap={isMobile ? 'md' : 'lg'}>
              <Heading level={3}>{t('game.party.player.route.entryHeading')}</Heading>

              {isAuthenticated ? null : (
                <FieldShell
                  description={t('game.party.player.route.entrySubtitle')}
                  id="party-join-guest-name"
                  label={t('game.party.player.route.guestNameLabel')}
                  required
                >
                  <Input
                    aria-label={t('game.party.player.route.guestNameLabel')}
                    disabled={isJoinSubmitting}
                    id="party-join-guest-name"
                    onChange={(event) => onGuestNameChange(event.currentTarget.value)}
                    placeholder={t('game.party.player.route.guestNamePlaceholder')}
                    value={guestName}
                  />
                </FieldShell>
              )}

              <ActionRow justify={isMobile ? 'center' : 'end'}>
                <Button
                  disabled={isJoinDisabled}
                  intent={isAuthenticated ? 'outline' : 'primary'}
                  onClick={onJoinParty}
                  width="wide"
                >
                  {isAuthenticated
                    ? t('game.party.player.route.joinWithAccountCta')
                    : t('game.party.player.route.joinAsGuestCta')}
                </Button>
              </ActionRow>
            </ContentStack>
          </ElevatedPanel>
        </section>
      </ContentStack>
    </>
  );
}
