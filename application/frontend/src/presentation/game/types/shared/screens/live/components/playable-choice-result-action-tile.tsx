import { usePresentationTranslation } from '../../../../../../shared/i18n/use-presentation-translation';
import { InteractiveSurfaceButton } from '../../../../../../shared/ui/actions/interactive-surface-button';
import { findUiTheme } from '../../../../../../shared/ui/foundation/ui-theme';
import { ContentStack, SplitWrapRow } from '../../../../../../shared/ui/layout/containers';
import { Heading, SupportingText } from '../../../../../../shared/ui/layout/typography';
import { usePresentationMediaQuery } from '../../../../../../shared/ui/layout/use-presentation-media-query';
import { usePresentationThemeState } from '../../../../../../shared/ui/provider';
import { resolvePlayableChoiceActionSlotIdentity } from './playable-choice-action-slot-identity';
import {
  buildCorrectMarkerStyle,
  buildSlotBadgeStyle,
  buildTileStyle,
  buildYourPickBadgeStyle,
  compactAnswerTextStyle,
  compactCenteredHeaderStyle,
  slotHeaderStyle,
  yourPickRibbonStyle,
} from './playable-choice-result-action-tile.styles';

export interface PlayableChoiceResultActionTileCopy {
  readonly actionSlotLabel: string;
  readonly correctBadge: string;
  readonly voteCount: string;
  readonly yourPickBadge: string;
}

interface PlayableChoiceResultActionTileProps {
  readonly actionCount?: number;
  readonly actionPercent?: number;
  readonly ariaKeyShortcuts?: string;
  readonly copy: PlayableChoiceResultActionTileCopy;
  readonly disabled?: boolean;
  /**
   * When true, the tile fills its parent (height + width) so it can stretch
   * inside a CSS grid that distributes viewport height across rows. Used by
   * the mobile player stage to avoid scrolling regardless of option count.
   */
  readonly fillParent?: boolean;
  readonly index: number;
  readonly isCorrect: boolean;
  readonly isSelected: boolean;
  readonly onClick?: () => void;
  readonly slotCount: number;
  readonly testId?: string;
  readonly text: string;
}

export function PlayableChoiceResultActionTile({
  actionCount,
  actionPercent,
  ariaKeyShortcuts,
  copy,
  disabled = false,
  fillParent = false,
  index,
  isCorrect,
  isSelected,
  onClick,
  slotCount,
  testId,
  text,
}: PlayableChoiceResultActionTileProps) {
  const { activeColorScheme, activeThemeId } = usePresentationThemeState();
  const { t } = usePresentationTranslation();
  const isMobile = usePresentationMediaQuery();
  const theme = findUiTheme(activeThemeId).mantineThemes[activeColorScheme];
  const slot = resolvePlayableChoiceActionSlotIdentity(index, slotCount, theme);
  const isResultTile = typeof actionCount === 'number' && typeof actionPercent === 'number';
  const isCompact = isMobile && !isResultTile;
  const isMobileResultTile = isMobile && isResultTile;
  const useCompactBadge = isCompact || isMobileResultTile;
  const tileStyle = buildTileStyle(slot, {
    disabled,
    fillParent,
    isCompact,
    isCorrect,
    isResultTile,
    isSelected,
  });
  const tileContent = (
    <>
      {isCorrect ? <div style={buildCorrectMarkerStyle(slot)}>{t(copy.correctBadge)}</div> : null}
      <ContentStack gap="sm">
        <div
          style={
            (isCompact && fillParent) || isMobileResultTile
              ? compactCenteredHeaderStyle
              : slotHeaderStyle
          }
        >
          <div
            aria-label={t(copy.actionSlotLabel, { letter: slot.letter })}
            style={buildSlotBadgeStyle(slot, useCompactBadge)}
          >
            {slot.letter}
          </div>
          {useCompactBadge ? (
            <span style={compactAnswerTextStyle}>{text}</span>
          ) : (
            <Heading level={3}>{text}</Heading>
          )}
        </div>
        {typeof actionCount === 'number' && typeof actionPercent === 'number' ? (
          <SplitWrapRow>
            <SupportingText tone="soft">
              {t(copy.voteCount, { count: String(actionCount) })}
            </SupportingText>
            <SupportingText tone="soft">{actionPercent}%</SupportingText>
          </SplitWrapRow>
        ) : null}
      </ContentStack>
      {isSelected && isResultTile ? (
        <div style={yourPickRibbonStyle}>
          <div style={buildYourPickBadgeStyle(slot)}>{t(copy.yourPickBadge)}</div>
        </div>
      ) : null}
    </>
  );

  if (onClick) {
    return (
      <InteractiveSurfaceButton
        aria-label={text}
        aria-keyshortcuts={ariaKeyShortcuts}
        aria-pressed={isSelected}
        data-testid={testId}
        disabled={disabled}
        onClick={onClick}
        surfaceStyle={tileStyle}
      >
        {tileContent}
      </InteractiveSurfaceButton>
    );
  }

  return (
    <div data-testid={testId} style={tileStyle}>
      {tileContent}
    </div>
  );
}
