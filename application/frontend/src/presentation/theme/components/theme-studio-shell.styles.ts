import { uiThemeTokens } from '../../shared/ui/foundation/ui-theme';

// Studio-specific positioning only. Shared components own all visual treatments.
export const THEME_STUDIO_LAYOUT_CSS = `
.theme-studio { min-width: 0; }
.theme-studio-toolbar { position: sticky; top: var(--studio-header-height, 0px); z-index: 5; }
.theme-studio-inspector, .theme-studio-stage { min-width: 0; }
.theme-studio-preview-frame { max-width: 100%; margin-inline: auto; overflow: hidden; border-radius: ${uiThemeTokens.radius.panel}; }
.theme-studio-preview-frame[data-device=phone] { max-width: 390px; }
`;
