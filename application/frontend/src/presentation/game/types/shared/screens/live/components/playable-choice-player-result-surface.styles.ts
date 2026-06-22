import type { CSSProperties } from 'react';
import { uiThemeTokens } from '../../../../../../shared/ui/foundation/ui-theme';

export const mobileRootStyle: CSSProperties = {
  background: uiThemeTokens.color.surface.canvas,
  bottom: 0,
  boxSizing: 'border-box',
  display: 'flex',
  flexDirection: 'column',
  gap: uiThemeTokens.spacing.sm,
  left: 0,
  overflowY: 'auto',
  paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))',
  paddingLeft: 'max(0.5rem, env(safe-area-inset-left))',
  paddingRight: 'max(0.5rem, env(safe-area-inset-right))',
  paddingTop: 'max(0.5rem, env(safe-area-inset-top))',
  position: 'fixed',
  right: 0,
  top: 0,
  zIndex: 200,
};

const mobileHeroBaseStyle: CSSProperties = {
  borderRadius: uiThemeTokens.radius.panel,
  display: 'flex',
  flexDirection: 'column',
  gap: uiThemeTokens.spacing.sm,
  padding: uiThemeTokens.spacing.lg,
  textAlign: 'center',
};

const mobileHeroIconWrapperStyle: CSSProperties = {
  alignItems: 'center',
  borderRadius: '999px',
  display: 'inline-flex',
  height: '3.5rem',
  justifyContent: 'center',
  margin: '0 auto',
  width: '3.5rem',
};

export const mobileHeroTitleStyle: CSSProperties = {
  fontSize: '1.5rem',
  fontWeight: 700,
  lineHeight: 1.15,
  margin: 0,
};

export const mobileHeroPointsStyle: CSSProperties = {
  fontSize: '2.25rem',
  fontVariantNumeric: 'tabular-nums',
  fontWeight: 800,
  lineHeight: 1,
  margin: 0,
};

export const mobileHeroHintStyle: CSSProperties = {
  fontSize: '0.875rem',
  lineHeight: 1.4,
  margin: 0,
  opacity: 0.85,
};

export const mobileHeroMetaItemStyle: CSSProperties = {
  fontSize: '0.8125rem',
  fontWeight: 600,
  opacity: 0.85,
};

export const mobileHeroMetaRowStyle: CSSProperties = {
  alignItems: 'center',
  display: 'flex',
  flexWrap: 'wrap',
  gap: uiThemeTokens.spacing.sm,
  justifyContent: 'center',
};

export const mobileQuestionLabelStyle: CSSProperties = {
  color: uiThemeTokens.color.text.soft,
  fontSize: '0.75rem',
  fontWeight: 600,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
};

export const mobileQuestionTextStyle: CSSProperties = {
  fontSize: '1.05rem',
  fontWeight: 600,
  lineHeight: 1.35,
  margin: 0,
};

export function buildMobileHeroStyle(state: 'correct' | 'incorrect' | 'no-answer'): CSSProperties {
  if (state === 'no-answer') {
    return {
      ...mobileHeroBaseStyle,
      background: 'var(--mantine-color-gray-1)',
      border: '1px solid var(--mantine-color-gray-4)',
      color: 'var(--mantine-color-gray-9)',
    };
  }
  const isCorrect = state === 'correct';
  return {
    ...mobileHeroBaseStyle,
    background: isCorrect ? 'var(--mantine-color-teal-1)' : 'var(--mantine-color-yellow-1)',
    border: `1px solid ${isCorrect ? 'var(--mantine-color-teal-4)' : 'var(--mantine-color-yellow-4)'}`,
    color: isCorrect ? 'var(--mantine-color-teal-9)' : 'var(--mantine-color-yellow-9)',
  };
}

export function buildMobileHeroIconWrapperStyle(
  state: 'correct' | 'incorrect' | 'no-answer',
): CSSProperties {
  if (state === 'no-answer') {
    return {
      ...mobileHeroIconWrapperStyle,
      background: 'var(--mantine-color-gray-6)',
      color: 'white',
    };
  }
  const isCorrect = state === 'correct';
  return {
    ...mobileHeroIconWrapperStyle,
    background: isCorrect ? 'var(--mantine-color-teal-6)' : 'var(--mantine-color-yellow-6)',
    color: 'white',
  };
}
