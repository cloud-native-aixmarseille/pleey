import type { CSSProperties } from 'react';
import { uiThemeTokens } from './ui-theme';
import { uiTypeScale } from './ui-typography';

/* ────────────────────────────────────────────────────────────
 * Surface Recipes
 *
 * Pre-composed surface treatments that combine background,
 * border, radius, and shadow into a single CSSProperties.
 * ──────────────────────────────────────────────────────────── */

export const surfaceRecipes = {
  /** Main app background layer */
  canvas: {
    background: uiThemeTokens.color.surface.canvas,
  },

  /** Primary content card — panels, dialogs, drawers */
  elevated: {
    backdropFilter: 'blur(16px)',
    background: uiThemeTokens.color.surface.panel,
    border: `1px solid ${uiThemeTokens.color.border.subtle}`,
    borderRadius: uiThemeTokens.radius.panel,
    boxShadow: uiThemeTokens.shadow.elevated,
  },

  /** Nested / secondary surface — code blocks, nested cards */
  inset: {
    background: uiThemeTokens.color.surface.recessed,
    border: `1px solid ${uiThemeTokens.color.border.subtle}`,
    borderRadius: uiThemeTokens.radius.inset,
  },

  /** Hero gradient surface — marketing sections, feature highlights */
  hero: {
    background: `linear-gradient(135deg, ${uiThemeTokens.color.surface.accentPanel}, ${uiThemeTokens.color.surface.strongAccent})`,
    border: `1px solid ${uiThemeTokens.color.border.accent}`,
    borderRadius: uiThemeTokens.radius.panel,
    boxShadow: uiThemeTokens.shadow.accentGlow,
  },

  /** Modal / drawer backdrop overlay */
  overlay: {
    backdropFilter: 'blur(8px)',
    background: uiThemeTokens.color.surface.overlay,
  },

  /** Live game-state surface — pulsing / active indicator */
  live: {
    background: uiThemeTokens.color.surface.live,
    border: `1px solid ${uiThemeTokens.color.border.live}`,
    borderRadius: uiThemeTokens.radius.panel,
    boxShadow: uiThemeTokens.shadow.liveGlow,
  },

  /** Subtle lift for interactive cards — default resting state */
  interactive: {
    background: uiThemeTokens.color.surface.panel,
    border: `1px solid ${uiThemeTokens.color.border.subtle}`,
    borderRadius: uiThemeTokens.radius.panel,
    boxShadow: uiThemeTokens.shadow.subtle,
  },
} as const satisfies Record<string, CSSProperties>;

/* ────────────────────────────────────────────────────────────
 * Status Tone Recipes
 *
 * Background + border + text colour combinations for each
 * semantic status.  Apply to banners, badges, inline notices.
 * ──────────────────────────────────────────────────────────── */

export const statusToneRecipes = {
  info: {
    background: uiThemeTokens.color.surface.accentMuted,
    borderColor: uiThemeTokens.color.border.info,
    color: uiThemeTokens.color.text.status,
  },
  success: {
    background: uiThemeTokens.color.surface.recessed,
    borderColor: uiThemeTokens.color.border.success,
    color: uiThemeTokens.color.text.statusSoft,
  },
  warning: {
    background: uiThemeTokens.color.surface.warning,
    borderColor: uiThemeTokens.color.border.warning,
    color: uiThemeTokens.color.text.warning,
  },
  error: {
    background: uiThemeTokens.color.surface.danger,
    borderColor: uiThemeTokens.color.border.danger,
    color: uiThemeTokens.color.text.danger,
  },
  live: {
    background: uiThemeTokens.color.surface.live,
    borderColor: uiThemeTokens.color.border.live,
    color: uiThemeTokens.color.text.live,
  },
} as const;

/* ────────────────────────────────────────────────────────────
 * Form Recipes
 *
 * Pre-composed form element styles that combine type scale,
 * color tokens, and spacing into reusable CSSProperties.
 * ──────────────────────────────────────────────────────────── */

export const formRecipes = {
  /** Form root container — vertical grid with consistent gap */
  root: {
    display: 'grid',
    gap: uiThemeTokens.spacing.lg,
  } satisfies CSSProperties,

  /** Fieldset grouping — borderless grid */
  fieldset: {
    border: 0,
    display: 'grid',
    gap: uiThemeTokens.spacing.md,
    margin: 0,
    padding: 0,
  } satisfies CSSProperties,

  /** Fieldset legend — section-level heading for form groups */
  legend: {
    ...uiTypeScale.cardTitle,
    color: uiThemeTokens.color.text.emphasis,
    padding: 0,
  } satisfies CSSProperties,

  /** Field label — small uppercase label above inputs */
  fieldLabel: {
    ...uiTypeScale.label,
    color: uiThemeTokens.color.text.secondary,
    textTransform: 'uppercase',
  } satisfies CSSProperties,

  /** Field description / help text below the input */
  fieldDescription: {
    ...uiTypeScale.caption,
    color: uiThemeTokens.color.text.quiet,
    margin: 0,
  } satisfies CSSProperties,

  /** Field validation error */
  fieldError: {
    ...uiTypeScale.caption,
    color: uiThemeTokens.color.text.danger,
    margin: 0,
  } satisfies CSSProperties,

  /** Field shell layout — vertical grid wrapping label, input, description, error */
  fieldShell: {
    display: 'grid',
    gap: uiThemeTokens.spacing.xs,
  } satisfies CSSProperties,
} as const;
