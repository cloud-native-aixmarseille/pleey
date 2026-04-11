import type { CSSProperties } from 'react';
import { usePresentationTranslation } from '../../../../../../shared/i18n/use-presentation-translation';
import { Badge } from '../../../../../../shared/ui/feedback/badge';
import { findUiTheme, uiThemeTokens } from '../../../../../../shared/ui/foundation/ui-theme';
import { ContentStack, SplitWrapRow } from '../../../../../../shared/ui/layout/containers';
import { Heading, SupportingText } from '../../../../../../shared/ui/layout/typography';
import { usePresentationThemeState } from '../../../../../../shared/ui/provider';
import {
  type PlayableChoiceActionSlotIdentity,
  resolvePlayableChoiceActionSlotIdentity,
} from './playable-choice-action-slot-identity';

export interface PlayableChoiceResultActionTileCopy {
  readonly actionSlotLabel: string;
  readonly correctBadge: string;
  readonly voteCount: string;
  readonly yourPickBadge: string;
}

interface PlayableChoiceResultActionTileProps {
  readonly actionCount?: number;
  readonly actionPercent?: number;
  readonly copy: PlayableChoiceResultActionTileCopy;
  readonly disabled?: boolean;
  readonly index: number;
  readonly isCorrect: boolean;
  readonly isSelected: boolean;
  readonly onClick?: () => void;
  readonly slotCount: number;
  readonly testId?: string;
  readonly text: string;
}

const baseTileStyle: CSSProperties = {
  borderRadius: uiThemeTokens.radius.panel,
  minHeight: '7rem',
  padding: uiThemeTokens.spacing.md,
  position: 'relative',
  transition: 'transform 120ms ease',
  width: '100%',
};

const slotBadgeBaseStyle: CSSProperties = {
  alignItems: 'center',
  borderRadius: uiThemeTokens.radius.inset,
  display: 'flex',
  flexShrink: 0,
  fontSize: '1.25rem',
  fontWeight: 700,
  height: '2.75rem',
  justifyContent: 'center',
  width: '2.75rem',
};

const correctRibbonStyle: CSSProperties = {
  left: '50%',
  position: 'absolute',
  top: 0,
  transform: 'translate(-50%, -50%)',
};

const slotHeaderStyle: CSSProperties = {
  alignItems: 'center',
  display: 'flex',
  flexWrap: 'nowrap',
  gap: uiThemeTokens.spacing.md,
};

const interactiveTileStyle: CSSProperties = {
  appearance: 'none',
  color: 'inherit',
  font: 'inherit',
  textAlign: 'left',
};

function buildTileStyle(
  slot: PlayableChoiceActionSlotIdentity,
  options: {
    disabled: boolean;
    isCorrect: boolean;
    isResultTile: boolean;
    isSelected: boolean;
  },
): CSSProperties {
  if (options.isCorrect) {
    return {
      ...baseTileStyle,
      background: slot.surfaceBackground,
      border: `3px solid ${slot.surfaceBorder}`,
      boxShadow: `0 0 0 2px ${slot.surfaceBorder}, ${uiThemeTokens.shadow.subtle}`,
      cursor: options.disabled ? 'not-allowed' : undefined,
      opacity: options.disabled ? 0.6 : 1,
      transform: 'translateY(-2px)',
    };
  }

  if (options.isSelected) {
    return {
      ...baseTileStyle,
      background: slot.surfaceBackground,
      border: `2px solid ${slot.badgeBackground}`,
      boxShadow: `0 0 0 3px ${slot.surfaceBorder}`,
      cursor: options.disabled ? 'not-allowed' : undefined,
      opacity: options.disabled ? 0.6 : options.isResultTile ? 0.82 : 1,
    };
  }

  return {
    ...baseTileStyle,
    background: slot.surfaceBackground,
    border: `2px solid ${slot.surfaceBorder}`,
    cursor: options.disabled ? 'not-allowed' : undefined,
    opacity: options.disabled ? 0.6 : options.isResultTile ? 0.62 : 1,
  };
}

function buildSlotBadgeStyle(slot: PlayableChoiceActionSlotIdentity): CSSProperties {
  return {
    ...slotBadgeBaseStyle,
    background: slot.badgeBackground,
    color: slot.badgeText,
  };
}

function buildCorrectRibbonStyle(slot: PlayableChoiceActionSlotIdentity): CSSProperties {
  return {
    ...correctRibbonStyle,
    background: slot.badgeBackground,
    border: `1px solid ${slot.surfaceBorder}`,
    borderRadius: uiThemeTokens.radius.pill,
    boxShadow: uiThemeTokens.shadow.subtle,
    color: slot.badgeText,
    fontFamily: uiThemeTokens.typography.bodyFamily,
    fontSize: '0.75rem',
    fontWeight: 700,
    letterSpacing: '0.04em',
    lineHeight: 1,
    padding: `${uiThemeTokens.spacing.xs} ${uiThemeTokens.spacing.sm}`,
    textTransform: 'uppercase',
  };
}

export function PlayableChoiceResultActionTile({
  actionCount,
  actionPercent,
  copy,
  disabled = false,
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
  const theme = findUiTheme(activeThemeId).mantineThemes[activeColorScheme];
  const slot = resolvePlayableChoiceActionSlotIdentity(index, slotCount, theme);
  const isResultTile = typeof actionCount === 'number' && typeof actionPercent === 'number';
  const tileStyle = buildTileStyle(slot, {
    disabled,
    isCorrect,
    isResultTile,
    isSelected,
  });
  const tileContent = (
    <>
      {isCorrect ? <div style={buildCorrectRibbonStyle(slot)}>{t(copy.correctBadge)}</div> : null}
      <ContentStack gap="sm">
        <div style={slotHeaderStyle}>
          <div
            aria-label={t(copy.actionSlotLabel, { letter: slot.letter })}
            style={buildSlotBadgeStyle(slot)}
          >
            {slot.letter}
          </div>
          <Heading level={3}>{text}</Heading>
        </div>
        {typeof actionCount === 'number' && typeof actionPercent === 'number' ? (
          <SplitWrapRow>
            <SupportingText tone="soft">
              {t(copy.voteCount, { count: String(actionCount) })}
            </SupportingText>
            <SupportingText tone="soft">{actionPercent}%</SupportingText>
          </SplitWrapRow>
        ) : null}
        {isSelected ? <Badge tone="accent">{t(copy.yourPickBadge)}</Badge> : null}
      </ContentStack>
    </>
  );

  if (onClick) {
    return (
      <button
        aria-label={text}
        aria-pressed={isSelected}
        data-testid={testId}
        disabled={disabled}
        onClick={onClick}
        style={{
          ...interactiveTileStyle,
          ...tileStyle,
        }}
        type="button"
      >
        {tileContent}
      </button>
    );
  }

  return (
    <div data-testid={testId} style={tileStyle}>
      {tileContent}
    </div>
  );
}
