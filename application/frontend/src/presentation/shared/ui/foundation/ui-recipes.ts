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
 * Focus Recipes
 * ──────────────────────────────────────────────────────────── */

export const focusRecipes = {
  /** Visible keyboard focus ring — typically applied on :focus-visible */
  ring: {
    boxShadow: uiThemeTokens.shadow.focusRing,
    outline: 'none',
  },
} as const satisfies Record<string, CSSProperties>;

/* ────────────────────────────────────────────────────────────
 * Border Recipes
 * ──────────────────────────────────────────────────────────── */

export const borderRecipes = {
  subtle: { border: `1px solid ${uiThemeTokens.color.border.subtle}` },
  accent: { border: `1px solid ${uiThemeTokens.color.border.accent}` },
  strong: { border: `1px solid ${uiThemeTokens.color.border.strong}` },
  success: { border: `1px solid ${uiThemeTokens.color.border.success}` },
  danger: { border: `1px solid ${uiThemeTokens.color.border.danger}` },
  info: { border: `1px solid ${uiThemeTokens.color.border.info}` },
  warning: { border: `1px solid ${uiThemeTokens.color.border.warning}` },
  live: { border: `1px solid ${uiThemeTokens.color.border.live}` },
} as const satisfies Record<string, CSSProperties>;

/* ────────────────────────────────────────────────────────────
 * Motion Recipes
 *
 * Each factory returns a `{ transition }` object for a given
 * CSS property.  Use `resolveMotionStyle` with Mantine's
 * `useReducedMotion()` hook for accessibility.
 * ──────────────────────────────────────────────────────────── */

function createMotionStyle(property: string, timing: string): { transition: string } {
  return { transition: `${property} ${timing}` };
}

export const motionRecipes = {
  /** Quick interaction feedback (hover, press) */
  quick: (property: string) => createMotionStyle(property, uiThemeTokens.motion.quick),
  /** Standard state transitions */
  standard: (property: string) => createMotionStyle(property, uiThemeTokens.motion.standard),
  /** Page / section reveal animations */
  reveal: (property: string) => createMotionStyle(property, uiThemeTokens.motion.reveal),
  /** Emphasis pulse or highlight */
  emphasis: (property: string) => createMotionStyle(property, uiThemeTokens.motion.emphasis),
  /** Modal / overlay transitions */
  modal: (property: string) => createMotionStyle(property, uiThemeTokens.motion.modal),
} as const;

/**
 * Returns a style object that suppresses animation when reduced motion is
 * preferred.  Pair with Mantine's `useReducedMotion()` hook:
 *
 * ```ts
 * const reduced = useReducedMotion() ?? false;
 * const style = resolveMotionStyle(reduced, motionRecipes.reveal('opacity'));
 * ```
 */
export function resolveMotionStyle(reducedMotion: boolean, standard: CSSProperties): CSSProperties {
  if (reducedMotion) {
    return { ...standard, animation: 'none', transition: 'none' };
  }
  return standard;
}

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

export const managementConsoleRecipes = {
  headerSurface: {
    ...surfaceRecipes.elevated,
    overflow: 'hidden',
    position: 'relative',
  } satisfies CSSProperties,
  commandCard: {
    ...surfaceRecipes.inset,
    alignItems: 'flex-start',
    display: 'grid',
    gap: uiThemeTokens.spacing.sm,
    minHeight: '9rem',
    padding: uiThemeTokens.spacing.md,
  } satisfies CSSProperties,
  checklist: {
    display: 'grid',
    gap: uiThemeTokens.spacing.sm,
    margin: 0,
    padding: 0,
  } satisfies CSSProperties,
  checklistItem: {
    alignItems: 'flex-start',
    display: 'grid',
    gap: uiThemeTokens.spacing.sm,
    gridTemplateColumns: '1.5rem minmax(0, 1fr)',
  } satisfies CSSProperties,
  checkIndicator: {
    alignItems: 'center',
    borderRadius: uiThemeTokens.radius.pill,
    display: 'inline-flex',
    height: '1.5rem',
    justifyContent: 'center',
    width: '1.5rem',
  } satisfies CSSProperties,
  timeline: {
    display: 'grid',
    gap: uiThemeTokens.spacing.sm,
    listStyle: 'none',
    margin: 0,
    padding: 0,
  } satisfies CSSProperties,
  timelineItem: {
    borderLeft: `1px solid ${uiThemeTokens.color.border.subtle}`,
    display: 'grid',
    gap: uiThemeTokens.spacing.xxs,
    paddingLeft: uiThemeTokens.spacing.md,
  } satisfies CSSProperties,
  previewOption: {
    ...surfaceRecipes.inset,
    alignItems: 'center',
    display: 'flex',
    gap: uiThemeTokens.spacing.sm,
    padding: `${uiThemeTokens.spacing.sm} ${uiThemeTokens.spacing.md}`,
  } satisfies CSSProperties,
  kpiGrid: {
    display: 'grid',
    gap: uiThemeTokens.spacing.sm,
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 10rem), 1fr))',
  } satisfies CSSProperties,
} as const;
