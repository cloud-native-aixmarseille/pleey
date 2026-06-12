import { type FormEvent, useEffect } from 'react';
import { usePresentationTranslation } from '../../../../../shared/i18n/use-presentation-translation';
import { Button } from '../../../../../shared/ui/actions/button';
import { UserAvatar } from '../../../../../shared/ui/data/user-avatar';
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
  readonly guestAvatarPreviewUri: string | null;
  readonly guestName: string;
  readonly isAuthenticated: boolean;
  readonly isJoinSubmitting: boolean;
  readonly onDismissError: () => void;
  readonly onGenerateGuestName: () => void;
  readonly onGuestNameChange: (value: string) => void;
  readonly onJoinParty: () => void;
  readonly onJoinPasswordChange: (value: string) => void;
  readonly onRegenerateGuestAvatar: () => void;
  readonly password: string;
  readonly pin: string;
  readonly showPasswordInput: boolean;
}

const GUEST_NAME_MAX_LENGTH = 30;

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
  guestAvatarPreviewUri,
  guestName,
  isAuthenticated,
  isJoinSubmitting,
  onDismissError,
  onGenerateGuestName,
  onGuestNameChange,
  onJoinParty,
  onJoinPasswordChange,
  onRegenerateGuestAvatar,
  password,
  pin,
  showPasswordInput,
}: JoinPartySurfaceProps) {
  const { t } = usePresentationTranslation();
  const isMobile = usePresentationMediaQuery();
  const trimmedGuestName = guestName.trim();
  const isJoinDisabled = isJoinSubmitting || (!isAuthenticated && trimmedGuestName.length === 0);
  const guestAvatarAltLabel = t('game.party.player.route.guestAvatarAlt', {
    username:
      trimmedGuestName.length > 0
        ? trimmedGuestName
        : t('game.party.player.route.guestAvatarFallbackName'),
  });

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

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isJoinDisabled) {
      return;
    }
    onJoinParty();
  };

  return (
    <>
      {errorMessage ? (
        <div data-testid="join-party-error-toast" style={errorToastStyle}>
          <StatusBanner tone="error">{t(errorMessage)}</StatusBanner>
        </div>
      ) : null}

      <ContentStack gap={isMobile ? 'md' : 'lg'}>
        <header>
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
            <form noValidate onSubmit={handleSubmit}>
              <ContentStack gap={isMobile ? 'md' : 'lg'}>
                {isAuthenticated ? null : (
                  <ContentStack align="center" gap={isMobile ? 'sm' : 'md'}>
                    <UserAvatar
                      alt={guestAvatarAltLabel}
                      size={isMobile ? 96 : 112}
                      src={guestAvatarPreviewUri}
                    />

                    <ActionRow justify="center">
                      <Button
                        disabled={isJoinSubmitting}
                        intent="ghost"
                        leftSection={<AppIcon name="feature" size={16} />}
                        onClick={onRegenerateGuestAvatar}
                        size="sm"
                      >
                        {t('game.party.player.route.shuffleGuestAvatarCta')}
                      </Button>
                      <Button
                        disabled={isJoinSubmitting}
                        intent="ghost"
                        leftSection={<AppIcon name="profile" size={16} />}
                        onClick={onGenerateGuestName}
                        size="sm"
                      >
                        {t('game.party.player.route.generateGuestNameCta')}
                      </Button>
                    </ActionRow>

                    <FieldShell
                      id="party-join-guest-name"
                      label={t('game.party.player.route.guestNameLabel')}
                      required
                    >
                      <Input
                        aria-label={t('game.party.player.route.guestNameLabel')}
                        autoComplete="nickname"
                        autoFocus
                        disabled={isJoinSubmitting}
                        enterKeyHint="go"
                        id="party-join-guest-name"
                        inputMode="text"
                        maxLength={GUEST_NAME_MAX_LENGTH}
                        onChange={(event) => onGuestNameChange(event.currentTarget.value)}
                        placeholder={t('game.party.player.route.guestNamePlaceholder')}
                        value={guestName}
                      />
                    </FieldShell>
                  </ContentStack>
                )}

                {showPasswordInput ? (
                  <>
                    <FieldShell
                      id="party-join-password"
                      label={t('game.party.player.route.passwordLabel')}
                    >
                      <Input
                        aria-label={t('game.party.player.route.passwordLabel')}
                        autoComplete="current-password"
                        disabled={isJoinSubmitting}
                        id="party-join-password"
                        onChange={(event) => onJoinPasswordChange(event.currentTarget.value)}
                        placeholder={t('game.party.player.route.passwordPlaceholder')}
                        type="password"
                        value={password}
                      />
                    </FieldShell>
                    <SupportingText>{t('game.party.player.route.passwordHint')}</SupportingText>
                  </>
                ) : null}

                <Button
                  disabled={isJoinDisabled}
                  intent="primary"
                  rightSection={<AppIcon name="arrow-right" size={18} />}
                  type="submit"
                  width="full"
                >
                  {isAuthenticated
                    ? t('game.party.player.route.joinWithAccountCta')
                    : t('game.party.player.route.joinAsGuestCta')}
                </Button>
              </ContentStack>
            </form>
          </ElevatedPanel>
        </section>
      </ContentStack>
    </>
  );
}
