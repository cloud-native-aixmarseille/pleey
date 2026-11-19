export { ThemeDocumentNormalizerCore } from './theme-document-normalizer-core.js';
export {
  CURATED_THEME_PALETTES,
} from './curated-theme-palettes.js';
export {
  CYBER_ARCADE_THEME_PALETTE,
} from './cyber-arcade-theme-palette.js';
export {
  SOLAR_GRID_THEME_PALETTE,
} from './solar-grid-theme-palette.js';
export const CURATED_THEME_IDS = ['cyber-arcade', 'solar-grid'];

export const DEFAULT_THEME_ID = 'cyber-arcade';

export const THEME_ID_PATTERN =
  /^(?:cyber-arcade|solar-grid|custom:[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})$/;
