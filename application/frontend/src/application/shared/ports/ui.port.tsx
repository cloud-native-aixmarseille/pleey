import type { ThemeId } from '@pleey/domain/theme';
import type { ComponentType, PropsWithChildren } from 'react';
import type { ThemeDocument } from '../../../domains/theme/entities/theme-document';

type UiThemeId = ThemeId;
type UiColorScheme = 'light' | 'dark';

interface PresentationUiProviderComponentProps extends PropsWithChildren {}

interface PresentationUiThemeOption {
  readonly id: UiThemeId;
  readonly name: string;
}

export interface PresentationUiThemeState {
  readonly applyScopedTheme: (document: ThemeDocument) => () => void;
  readonly brandAssets?: { readonly logoUrl: string | null; readonly backgroundImage: string };
  readonly brandColors?: { readonly primary: string; readonly highlight: string; readonly success: string };
  readonly activeColorScheme: UiColorScheme;
  readonly activeThemeId: UiThemeId;
  readonly activeThemeName: string;
  readonly availableColorSchemes: readonly UiColorScheme[];
  readonly availableThemes: readonly PresentationUiThemeOption[];
  readonly setActiveColorScheme: (colorScheme: UiColorScheme) => void;
  readonly setActiveTheme: (themeId: UiThemeId) => void;
}

export interface ThemePreviewProps extends PropsWithChildren {
  readonly document: ThemeDocument;
  readonly colorScheme: UiColorScheme;
}

export interface UiPort {
  readonly ThemePreview: ComponentType<ThemePreviewProps>;
  readonly Provider: ComponentType<PresentationUiProviderComponentProps>;
  readonly useThemeState: () => PresentationUiThemeState;
}
