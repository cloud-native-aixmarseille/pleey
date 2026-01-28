import type { CSSProperties } from 'react';
import { uiThemeTokens } from './ui-theme';

interface UiTypeStyle {
  readonly fontFamily: string;
  readonly fontSize: string;
  readonly fontWeight: number;
  readonly letterSpacing: string;
  readonly lineHeight: number;
}

/**
 * Named type-scale entries for the design system.
 *
 * Each entry resolves to CSS-variable font families so it stays theme-reactive.
 * Combine with semantic color tokens for full text treatment:
 *
 * ```ts
 * <h1 style={{ ...uiTypeScale.pageTitle, color: uiThemeTokens.color.text.emphasis }}>
 * ```
 */
export const uiTypeScale = {
  /** Hero headline — landing pages, major intros */
  hero: {
    fontFamily: uiThemeTokens.typography.displayFamily,
    fontSize: 'clamp(2.25rem, 4vw, 3.25rem)',
    fontWeight: 800,
    letterSpacing: '-0.02em',
    lineHeight: 1.08,
  },

  /** Standard page title */
  pageTitle: {
    fontFamily: uiThemeTokens.typography.displayFamily,
    fontSize: 'clamp(1.75rem, 3vw, 2.25rem)',
    fontWeight: 800,
    letterSpacing: '-0.01em',
    lineHeight: 1.12,
  },

  /** Section heading inside a page */
  sectionTitle: {
    fontFamily: uiThemeTokens.typography.displayFamily,
    fontSize: '1.25rem',
    fontWeight: 700,
    letterSpacing: '0',
    lineHeight: 1.2,
  },

  /** Card or sub-section heading */
  cardTitle: {
    fontFamily: uiThemeTokens.typography.displayFamily,
    fontSize: '1rem',
    fontWeight: 700,
    letterSpacing: '0.01em',
    lineHeight: 1.3,
  },

  /** Default body text */
  body: {
    fontFamily: uiThemeTokens.typography.bodyFamily,
    fontSize: '0.9375rem',
    fontWeight: 400,
    letterSpacing: '0.01em',
    lineHeight: 1.55,
  },

  /** Smaller body for secondary content */
  bodySmall: {
    fontFamily: uiThemeTokens.typography.bodyFamily,
    fontSize: '0.8125rem',
    fontWeight: 400,
    letterSpacing: '0.015em',
    lineHeight: 1.5,
  },

  /** Form labels, column headers */
  label: {
    fontFamily: uiThemeTokens.typography.bodyFamily,
    fontSize: '0.72rem',
    fontWeight: 700,
    letterSpacing: '0.24em',
    lineHeight: 1.3,
  },

  /** Eyebrow text above headings */
  overline: {
    fontFamily: uiThemeTokens.typography.overlineFamily,
    fontSize: '0.55rem',
    fontWeight: 400,
    letterSpacing: '0.35em',
    lineHeight: 1.4,
  },

  /** Small microcopy, captions, timestamps */
  caption: {
    fontFamily: uiThemeTokens.typography.bodyFamily,
    fontSize: '0.6875rem',
    fontWeight: 500,
    letterSpacing: '0.02em',
    lineHeight: 1.4,
  },

  /** Large monospace for PINs, codes, numeric emphasis */
  mono: {
    fontFamily: uiThemeTokens.typography.monoFamily,
    fontSize: '1.5rem',
    fontWeight: 400,
    letterSpacing: '0.08em',
    lineHeight: 1.1,
  },

  /** Small monospace for inline code or data values */
  monoSmall: {
    fontFamily: uiThemeTokens.typography.monoFamily,
    fontSize: '0.8125rem',
    fontWeight: 400,
    letterSpacing: '0.04em',
    lineHeight: 1.4,
  },

  /** Large numeric values in metric panels */
  metric: {
    fontFamily: uiThemeTokens.typography.displayFamily,
    fontSize: '2rem',
    fontWeight: 800,
    letterSpacing: '-0.01em',
    lineHeight: 1.1,
  },
} as const satisfies Record<string, UiTypeStyle>;

type UiTypeScaleKey = keyof typeof uiTypeScale;

/**
 * Resolves a type-scale entry to a full CSSProperties object with semantic color.
 *
 * ```ts
 * <p style={resolveTypeStyle('body', uiThemeTokens.color.text.primary)}>…</p>
 * ```
 */
export function resolveTypeStyle(entry: UiTypeScaleKey, color: string): CSSProperties {
  return { ...uiTypeScale[entry], color };
}
