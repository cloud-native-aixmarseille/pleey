import { CYBER_ARCADE_THEME_PALETTE } from './cyber-arcade-theme-palette';
import { SOLAR_GRID_THEME_PALETTE } from './solar-grid-theme-palette';

// Editable curated colors mirrored across applications; verified against the UI seeds in tests.
export const CURATED_THEME_PALETTES = {
  'cyber-arcade': CYBER_ARCADE_THEME_PALETTE,
  'solar-grid': SOLAR_GRID_THEME_PALETTE,
} as const;
