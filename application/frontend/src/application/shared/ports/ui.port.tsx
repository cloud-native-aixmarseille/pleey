import type { ComponentType, PropsWithChildren } from 'react';

type UiThemeId = 'cyber-arcade' | 'solar-grid';
type UiColorScheme = 'light' | 'dark';

interface PresentationUiProviderComponentProps extends PropsWithChildren {}

interface PresentationUiThemeOption {
  readonly id: UiThemeId;
  readonly name: string;
}

export interface PresentationUiThemeState {
  readonly activeColorScheme: UiColorScheme;
  readonly activeThemeId: UiThemeId;
  readonly activeThemeName: string;
  readonly availableColorSchemes: readonly UiColorScheme[];
  readonly availableThemes: readonly PresentationUiThemeOption[];
  readonly setActiveColorScheme: (colorScheme: UiColorScheme) => void;
  readonly setActiveTheme: (themeId: UiThemeId) => void;
}

export interface UiPort {
  readonly Provider: ComponentType<PresentationUiProviderComponentProps>;
  readonly useThemeState: () => PresentationUiThemeState;
}
