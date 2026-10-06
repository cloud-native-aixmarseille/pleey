import type { ThemeOverrides } from '../../../domains/theme/entities/theme-document';

export const THEME_STYLE_PRESETS = {
  radius: {
    crisp: { field: '4px', inset: '4px', panel: '6px', pill: '6px' },
    soft: { field: '10px', inset: '12px', panel: '16px', pill: '32px' },
    round: { field: '20px', inset: '24px', panel: '28px', pill: '999px' },
  },
  spacing: {
    compact: { xxs: '2px', xs: '4px', sm: '8px', md: '12px', lg: '16px', xl: '24px', xxl: '32px', xxxl: '48px' },
    relaxed: { xxs: '4px', xs: '8px', sm: '12px', md: '18px', lg: '24px', xl: '32px', xxl: '48px', xxxl: '64px' },
  },
  motion: {
    calm: { emphasis: '0ms', modal: '0ms', quick: '0ms', reveal: '0ms', standard: '0ms' },
    playful: {
      emphasis: '240ms ease',
      modal: '220ms ease',
      quick: '120ms ease',
      reveal: '300ms ease',
      standard: '180ms ease',
    },
  },
} as const satisfies { [Group in 'radius' | 'spacing' | 'motion']: Record<string, ThemeOverrides[Group]> };
