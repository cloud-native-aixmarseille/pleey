import { type FormEvent, useEffect } from 'react';
import { usePresentationTranslation } from '../../../../../shared/i18n/use-presentation-translation';
import { Button } from '../../../../../shared/ui/actions/button';
import { UserAvatar } from '../../../../../shared/ui/data/user-avatar';
import { usePresentationToast } from '../../../../../shared/ui/feedback/presentation-toast';
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
  const toast = usePresentationToast();
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

    toast.error({
      durationMs: 4000,
      id: 'join-party-error-toast',
      message: t(errorMessage),
    });
    onDismissError();
  }, [errorMessage, onDismissError, t, toast]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isJoinDisabled) {
      return;
    }
    onJoinParty();
  };

  const guestIdentitySection = isAuthenticated ? null : (
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
  );

  const passwordSection = showPasswordInput ? (
    <>
      <FieldShell id="party-join-password" label={t('game.party.player.route.passwordLabel')}>
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
  ) : null;

  const submitButton = (
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
  );

  if (isMobile) {
    return (
      <section aria-label={t('game.party.player.route.joinPanelLabel')}>
        <ElevatedPanel padding="md">
          <form noValidate onSubmit={handleSubmit}>
            <ContentStack gap="md">
              <ContentStack align="center" gap="sm">
                <Heading level={2}>{t('game.party.player.route.joinHeroTitle')}</Heading>
                {pin ? (
                  <PartyPinPreview
                    ariaLabel={t('game.party.route.pinAriaLabel', { pin })}
                    label={t('game.party.player.route.joinPinPreviewLabel')}
                    pin={pin}
                  />
                ) : null}
              </ContentStack>

              {guestIdentitySection}
              {passwordSection}
              {submitButton}
            </ContentStack>
          </form>
        </ElevatedPanel>
      </section>
    );
  }

  return (
    <ContentStack gap="lg">
      <header>
        <HeroPanel padding="xl">
          <ContentStack align="center" gap="md">
            <AccentIconBadge>
              <AppIcon name="game" size={28} />
            </AccentIconBadge>
            <Eyebrow>{t('game.party.player.route.joinHeroEyebrow')}</Eyebrow>
            <Heading hero level={1}>
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
        <ElevatedPanel padding="lg">
          <form noValidate onSubmit={handleSubmit}>
            <ContentStack gap="lg">
              {guestIdentitySection}
              {passwordSection}
              {submitButton}
            </ContentStack>
          </form>
        </ElevatedPanel>
      </section>
    </ContentStack>
  );
}
