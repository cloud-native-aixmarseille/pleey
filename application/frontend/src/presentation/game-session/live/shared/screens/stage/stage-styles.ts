import type { CSSProperties } from 'react';
import { uiThemeTokens } from '../../../../../shared/ui/foundation/ui-theme';
import { uiTypeScale } from '../../../../../shared/ui/foundation/ui-typography';

export const stageTimerValueStyle: CSSProperties = {
  ...uiTypeScale.hero,
  color: uiThemeTokens.color.text.emphasis,
  fontVariantNumeric: 'tabular-nums',
  lineHeight: 1,
};

export const stageTimerUnitStyle: CSSProperties = {
  ...uiTypeScale.bodySmall,
  color: uiThemeTokens.color.text.soft,
  textTransform: 'uppercase',
};

export const stageTimerWarningStyle: CSSProperties = {
  ...stageTimerValueStyle,
  color: uiThemeTokens.color.text.danger,
};

export const stageHeaderBarStyle: CSSProperties = {
  alignItems: 'center',
  background: uiThemeTokens.color.surface.panel,
  border: `1px solid ${uiThemeTokens.color.border.subtle}`,
  borderRadius: uiThemeTokens.radius.panel,
  display: 'flex',
  flexWrap: 'wrap',
  gap: uiThemeTokens.spacing.sm,
  justifyContent: 'space-between',
  padding: `${uiThemeTokens.spacing.sm} ${uiThemeTokens.spacing.md}`,
};

export const stageCounterStyle: CSSProperties = {
  ...uiTypeScale.label,
  color: uiThemeTokens.color.text.secondary,
  textTransform: 'uppercase',
};

export const stagePinStyle: CSSProperties = {
  ...uiTypeScale.mono,
  color: uiThemeTokens.color.text.soft,
  letterSpacing: '0.15em',
};

export const hostStageContainerStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  gap: uiThemeTokens.spacing.lg,
  minHeight: 0,
};

export const resultStageContainerStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: uiThemeTokens.spacing.lg,
  minHeight: 0,
};

export const hostQuestionStyle: CSSProperties = {
  ...uiTypeScale.hero,
  alignItems: 'center',
  color: uiThemeTokens.color.text.emphasis,
  display: 'flex',
  justifyContent: 'center',
  margin: 0,
  minHeight: 'clamp(5rem, 16dvh, 10rem)',
  textAlign: 'center',
  padding: `${uiThemeTokens.spacing.xl} 0`,
};

export const actionGridStyle: CSSProperties = {
  alignContent: 'stretch',
  display: 'grid',
  flex: 1,
  gap: uiThemeTokens.spacing.sm,
  gridAutoRows: 'minmax(0, 1fr)',
  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 20rem), 26rem))',
  justifyContent: 'center',
  justifyItems: 'stretch',
  minHeight: 0,
  width: '100%',
};

export const playerStageContainerStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  gap: uiThemeTokens.spacing.md,
  minHeight: 0,
};

export const playerQuestionStyle: CSSProperties = {
  ...uiTypeScale.sectionTitle,
  alignItems: 'center',
  color: uiThemeTokens.color.text.emphasis,
  display: 'flex',
  justifyContent: 'center',
  margin: 0,
  minHeight: 'clamp(4.5rem, 14dvh, 8rem)',
  textAlign: 'center',
  padding: `${uiThemeTokens.spacing.md} 0`,
};

export const resultBannerCorrectStyle: CSSProperties = {
  alignItems: 'center',
  background: `linear-gradient(135deg, ${uiThemeTokens.color.surface.recessed}, ${uiThemeTokens.color.surface.accentPanel})`,
  border: `2px solid ${uiThemeTokens.color.border.success}`,
  borderRadius: uiThemeTokens.radius.panel,
  boxShadow: uiThemeTokens.shadow.successGlow,
  display: 'flex',
  flexDirection: 'column',
  gap: uiThemeTokens.spacing.xs,
  padding: uiThemeTokens.spacing.lg,
  textAlign: 'center',
};

export const resultBannerIncorrectStyle: CSSProperties = {
  ...resultBannerCorrectStyle,
  border: `2px solid ${uiThemeTokens.color.border.danger}`,
  boxShadow: 'none',
};

export const resultPointsStyle: CSSProperties = {
  ...uiTypeScale.hero,
  color: uiThemeTokens.color.brand.success,
  margin: 0,
};

export const resultLabelStyle: CSSProperties = {
  ...uiTypeScale.sectionTitle,
  color: uiThemeTokens.color.text.emphasis,
  margin: 0,
};

export const resultSublabelStyle: CSSProperties = {
  ...uiTypeScale.body,
  color: uiThemeTokens.color.text.secondary,
  margin: 0,
};

export function createDistributionBarStyle(
  slotIndex: number,
  percent: number,
  isCorrect: boolean,
): CSSProperties {
  return {
    alignItems: 'center',
    background: uiThemeTokens.color.surface.panel,
    border: `1px solid ${isCorrect ? uiThemeTokens.color.border.success : uiThemeTokens.color.border.subtle}`,
    borderRadius: uiThemeTokens.radius.field,
    display: 'grid',
    gap: uiThemeTokens.spacing.sm,
    gridTemplateColumns: 'auto 1fr auto',
    overflow: 'hidden',
    padding: '0.6rem 1rem',
    position: 'relative',
  };
}

export const distributionTextStyle: CSSProperties = {
  ...uiTypeScale.bodySmall,
  color: uiThemeTokens.color.text.primary,
  position: 'relative',
  zIndex: 1,
};

export const distributionPercentStyle: CSSProperties = {
  ...uiTypeScale.cardTitle,
  color: uiThemeTokens.color.text.emphasis,
  fontVariantNumeric: 'tabular-nums',
  position: 'relative',
  textAlign: 'right',
  zIndex: 1,
};

export const distributionCountStyle: CSSProperties = {
  ...uiTypeScale.caption,
  color: uiThemeTokens.color.text.soft,
  position: 'relative',
  zIndex: 1,
};

export const pauseOverlayStyle: CSSProperties = {
  alignItems: 'center',
  backdropFilter: 'blur(8px)',
  background: uiThemeTokens.color.surface.overlay,
  borderRadius: uiThemeTokens.radius.panel,
  display: 'flex',
  inset: 0,
  justifyContent: 'center',
  position: 'absolute',
  zIndex: 10,
};

export const pauseLabelStyle: CSSProperties = {
  ...uiTypeScale.sectionTitle,
  color: uiThemeTokens.color.text.emphasis,
};

export const resultTransitionOverlayStyle: CSSProperties = {
  alignItems: 'center',
  backdropFilter: 'blur(12px)',
  background:
    'radial-gradient(circle at center, rgba(255,255,255,0.12) 0%, rgba(8,11,26,0.88) 58%, rgba(4,6,18,0.94) 100%)',
  borderRadius: uiThemeTokens.radius.panel,
  display: 'flex',
  inset: 0,
  justifyContent: 'center',
  overflow: 'hidden',
  pointerEvents: 'none',
  position: 'absolute',
  zIndex: 1200,
};

export const resultTransitionContentStyle: CSSProperties = {
  alignItems: 'center',
  display: 'flex',
  flexDirection: 'column',
  gap: uiThemeTokens.spacing.md,
  justifyContent: 'center',
  textAlign: 'center',
};

export const resultTransitionPulseStyle: CSSProperties = {
  animation: 'stage-result-transition-pulse 1.4s ease-out infinite',
  background: 'linear-gradient(135deg, rgba(255,255,255,0.18), rgba(255,255,255,0.04))',
  border: `1px solid ${uiThemeTokens.color.border.accent}`,
  borderRadius: '999px',
  boxShadow: uiThemeTokens.shadow.successGlow,
  height: '7rem',
  position: 'relative',
  width: '7rem',
};

export const resultTransitionPulseInnerStyle: CSSProperties = {
  animation: 'stage-result-transition-core 0.9s ease-in-out infinite alternate',
  background: `linear-gradient(135deg, ${uiThemeTokens.color.brand.primary}, ${uiThemeTokens.color.brand.accent})`,
  borderRadius: '999px',
  inset: '1.1rem',
  position: 'absolute',
};

export const resultTransitionTitleStyle: CSSProperties = {
  ...uiTypeScale.hero,
  color: uiThemeTokens.color.text.emphasis,
  margin: 0,
};

export const resultTransitionSubtitleStyle: CSSProperties = {
  ...uiTypeScale.body,
  color: uiThemeTokens.color.text.secondary,
  margin: 0,
  maxWidth: '28rem',
};

export const waitingContainerStyle: CSSProperties = {
  alignItems: 'center',
  display: 'flex',
  flexDirection: 'column',
  gap: uiThemeTokens.spacing.md,
  justifyContent: 'center',
  minHeight: '60dvh',
  textAlign: 'center',
};

export const STAGE_RESPONSIVE_CSS = `
  @keyframes stage-result-transition-pulse {
    0% { transform: scale(0.88); opacity: 0.55; }
    70% { transform: scale(1.1); opacity: 1; }
    100% { transform: scale(1.24); opacity: 0; }
  }

  @keyframes stage-result-transition-core {
    0% { transform: scale(0.82); filter: saturate(0.9); }
    100% { transform: scale(1); filter: saturate(1.2); }
  }

  [data-stage-fill-grid] > * {
    height: 100%;
  }

  @media (max-width: 48em) {
    [data-stage-action-grid] { grid-template-columns: 1fr !important; }
    [data-stage-fill-layout] { min-height: 0 !important; }
    [data-host-question] { font-size: clamp(1.25rem, 5vw, 2rem) !important; }
  }
`;
