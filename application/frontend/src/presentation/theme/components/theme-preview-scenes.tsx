import { useState } from 'react';
import type { PartyObservationPlayer } from '../../../domains/game/party/shared/entities/party-observation-player';
import { PartyPlayerIdentityKind } from '../../../domains/game/party/shared/entities/party-player-identity';
import type { GuestId } from '../../../domains/identity/entities/guest';
import { PartyLobbyPlayersPanel } from '../../game/party/shared/screens/components/party-lobby-players-panel';
import { PartyStandingsList } from '../../game/party/shared/screens/components/party-standings-list';
import { PlayableChoiceResultActionTile } from '../../game/types/shared/screens/live/components/playable-choice-result-action-tile';
import { usePresentationTranslation } from '../../shared/i18n/use-presentation-translation';
import { Button } from '../../shared/ui/actions/button';
import { StatusBanner } from '../../shared/ui/feedback/status-banner';
import { Input } from '../../shared/ui/forms/input';
import { AppIcon } from '../../shared/ui/icons/app-icon';
import { ContentStack, ResponsiveGrid, SplitWrapRow } from '../../shared/ui/layout/containers';
import { Eyebrow, Heading, SupportingText } from '../../shared/ui/layout/typography';

export function ThemePreviewScenes({
  scene,
  phone,
}: {
  readonly scene: 'lobby' | 'question' | 'results' | 'checks';
  readonly phone: boolean;
}) {
  const { t } = usePresentationTranslation();
  const [answer, setAnswer] = useState(3);
  const [submitted, setSubmitted] = useState(false);
  // Inert sample identities only; these players never reach a game command or transport.
  const players: PartyObservationPlayer[] = [2450, 2180, 1920].map((score, index) => ({
    identity: {
      kind: PartyPlayerIdentityKind.Guest,
      guestId: `01900000-0000-7000-8000-00000000000${index + 1}` as GuestId,
    },
    username: t(`theme.studio.preview.players.${index}`),
    avatarUri: null,
    correctStages: 8 - index,
    isCurrentPlayer: index === 1,
    isLive: true,
    totalScore: score,
  }));
  if (scene === 'lobby')
    return (
      <ContentStack gap="lg">
        <ContentStack align="center">
          <span>
            <AppIcon name="feature" size={48} />
          </span>
          <Heading>{t('theme.studio.preview.lobbyTitle')}</Heading>
          <SupportingText>{t('theme.studio.preview.lobbyHelp')}</SupportingText>
        </ContentStack>
        <PartyLobbyPlayersPanel
          players={players}
          title={t('theme.studio.preview.ready')}
          ariaLabel={t('theme.studio.preview.ready')}
          avatarAltLabel={(username) => t('theme.studio.preview.avatarAlt', { name: username })}
          emptyMessage={t('theme.studio.preview.emptyPlayers')}
          tileBadgeLabel={t('theme.studio.preview.player')}
          youBadgeLabel={t('theme.studio.preview.you')}
        />
      </ContentStack>
    );
  if (scene === 'results')
    return (
      <ContentStack gap="lg">
        <span>
          <AppIcon name="trophy" size={48} />
        </span>
        <Heading>{t('theme.studio.preview.resultsTitle')}</Heading>
        <PartyStandingsList
          players={players}
          totalStages={10}
          isMobile={phone}
          initialDelay={0}
          staggerDelay={0}
          testIdPrefix="theme-preview-standings"
          title={t('theme.studio.preview.standings')}
        />
      </ContentStack>
    );
  if (scene === 'checks')
    return (
      <ContentStack>
        <Heading>{t('theme.studio.preview.checksTitle')}</Heading>
        <Input
          form="theme-preview-only"
          label={t('theme.builder.previewField')}
          defaultValue={t('theme.builder.previewText')}
        />
        <Input
          form="theme-preview-only"
          label={t('theme.studio.preview.invalidField')}
          invalid
          aria-describedby="theme-preview-field-error"
        />
        <StatusBanner tone="error">
          <span id="theme-preview-field-error">{t('theme.builder.previewError')}</span>
        </StatusBanner>
        <StatusBanner tone="success">{t('theme.studio.preview.success')}</StatusBanner>
        <Button>{t('theme.builder.previewAction')}</Button>
        <Button disabled>{t('theme.studio.preview.disabledAction')}</Button>
        <SupportingText>{t('theme.studio.preview.focusHelp')}</SupportingText>
      </ContentStack>
    );
  return (
    <ContentStack gap="lg">
      <Eyebrow>{t('theme.studio.preview.round')}</Eyebrow>
      <Heading>{t('theme.studio.preview.question')}</Heading>
      <div role="group" aria-label={t('theme.studio.preview.answers')}>
        <ResponsiveGrid columns={phone ? { base: 1 } : { base: 1, sm: 2 }} gap="md">
          {[0, 1, 2, 3].map((index) => (
            <PlayableChoiceResultActionTile
              key={index}
              index={index}
              slotCount={4}
              text={t(`theme.studio.preview.answersCopy.${index}`)}
              isCorrect={false}
              isSelected={answer === index}
              onClick={() => {
                setAnswer(index);
                setSubmitted(false);
              }}
              copy={{
                actionSlotLabel: 'theme.studio.preview.slot',
                correctBadge: 'theme.studio.preview.correct',
                voteCount: 'theme.studio.preview.votes',
                yourPickBadge: 'theme.studio.preview.yourPick',
              }}
            />
          ))}
        </ResponsiveGrid>
      </div>
      <SplitWrapRow>
        <SupportingText>{t('theme.studio.preview.playingAs', { name: players[1].username })}</SupportingText>
        <Button onClick={() => setSubmitted(true)} rightSection={<AppIcon name="arrow-right" size={16} />}>
          {t('theme.studio.preview.lockAnswer')}
        </Button>
      </SplitWrapRow>
      {submitted && <StatusBanner tone="success">{t('theme.studio.preview.answerLocked')}</StatusBanner>}
    </ContentStack>
  );
}
