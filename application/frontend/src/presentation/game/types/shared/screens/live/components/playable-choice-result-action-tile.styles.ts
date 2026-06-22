import type { CSSProperties } from 'react';
import { uiThemeTokens } from '../../../../../../shared/ui/foundation/ui-theme';
import type { PlayableChoiceActionSlotIdentity } from './playable-choice-action-slot-identity';

const baseTileStyle: CSSProperties = {
  borderRadius: uiThemeTokens.radius.panel,
  minHeight: '7rem',
  padding: uiThemeTokens.spacing.md,
  position: 'relative',
  transition: 'transform 120ms ease',
  width: '100%',
};

const compactTileStyle: CSSProperties = {
  ...baseTileStyle,
  minHeight: '4rem',
  padding: uiThemeTokens.spacing.sm,
};

const fillParentTileStyle: CSSProperties = {
  alignItems: 'center',
  display: 'flex',
  height: '100%',
  justifyContent: 'center',
  minHeight: 0,
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

const compactSlotBadgeBaseStyle: CSSProperties = {
  ...slotBadgeBaseStyle,
  fontSize: '1rem',
  height: '2.25rem',
  width: '2.25rem',
};

const correctRibbonStyle: CSSProperties = {
  left: '50%',
  position: 'absolute',
  top: 0,
  transform: 'translate(-50%, -50%)',
  zIndex: 1,
};

export const yourPickRibbonStyle: CSSProperties = {
  bottom: 0,
  left: '50%',
  position: 'absolute',
  transform: 'translate(-50%, 50%)',
  zIndex: 1,
};

export function buildYourPickBadgeStyle(slot: PlayableChoiceActionSlotIdentity): CSSProperties {
  return {
    background: slot.badgeBackground,
    border: `1px solid ${slot.surfaceBorder}`,
    borderRadius: uiThemeTokens.radius.pill,
    boxShadow: uiThemeTokens.shadow.subtle,
    color: slot.badgeText,
    fontFamily: uiThemeTokens.typography.bodyFamily,
    fontSize: '0.75rem',
    fontWeight: 800,
    letterSpacing: '0.04em',
    lineHeight: 1,
    padding: `${uiThemeTokens.spacing.xs} ${uiThemeTokens.spacing.sm}`,
    textTransform: 'uppercase',
    whiteSpace: 'nowrap',
  };
}

export const compactAnswerTextStyle: CSSProperties = {
  display: 'block',
  fontSize: '1rem',
  fontWeight: 600,
  lineHeight: 1.2,
  margin: 0,
  overflowWrap: 'anywhere',
  textAlign: 'center',
  width: '100%',
};

export const slotHeaderStyle: CSSProperties = {
  alignItems: 'center',
  display: 'flex',
  flexWrap: 'nowrap',
  gap: uiThemeTokens.spacing.md,
};

export const compactCenteredHeaderStyle: CSSProperties = {
  alignItems: 'center',
  display: 'flex',
  flexDirection: 'column',
  flexWrap: 'nowrap',
  gap: uiThemeTokens.spacing.sm,
  justifyContent: 'center',
  textAlign: 'center',
  width: '100%',
};

export function buildTileStyle(
  slot: PlayableChoiceActionSlotIdentity,
  options: {
    readonly disabled: boolean;
    readonly fillParent: boolean;
    readonly isCompact: boolean;
    readonly isCorrect: boolean;
    readonly isResultTile: boolean;
    readonly isSelected: boolean;
  },
): CSSProperties {
  const base = {
    ...(options.isCompact ? compactTileStyle : baseTileStyle),
    ...(options.fillParent ? fillParentTileStyle : null),
  };

  if (options.isCorrect) {
    return {
      ...base,
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
      ...base,
      background: slot.surfaceBackground,
      border: `2px solid ${slot.badgeBackground}`,
      boxShadow: `0 0 0 3px ${slot.surfaceBorder}`,
      cursor: options.disabled ? 'not-allowed' : undefined,
      opacity: options.disabled ? 0.6 : 1,
    };
  }

  return {
    ...base,
    background: slot.surfaceBackground,
    border: `2px solid ${slot.surfaceBorder}`,
    cursor: options.disabled ? 'not-allowed' : undefined,
    opacity: options.disabled ? 0.6 : options.isResultTile ? 0.62 : 1,
  };
}

export function buildSlotBadgeStyle(
  slot: PlayableChoiceActionSlotIdentity,
  isCompact: boolean,
): CSSProperties {
  return {
    ...(isCompact ? compactSlotBadgeBaseStyle : slotBadgeBaseStyle),
    background: slot.badgeBackground,
    color: slot.badgeText,
  };
}

export function buildCorrectMarkerStyle(slot: PlayableChoiceActionSlotIdentity): CSSProperties {
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
