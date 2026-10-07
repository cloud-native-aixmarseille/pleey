import { MantineProvider } from '@mantine/core';
import { useReducedMotion } from '@mantine/hooks';
import {
  type CSSProperties,
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useId,
  useState,
} from 'react';
import type { PresentationUiThemeState, ThemePreviewProps, UiPort } from '../../application/shared/ports/ui.port';
import { createDomainError } from '../../domains/shared/errors/domain-error';
import type { ThemeDocument } from '../../domains/theme/entities/theme-document';
import { createUiThemeFromDocument } from '../../presentation/shared/ui/foundation/document-ui-theme';
import {
  createUiThemeCssVariables,
  DEFAULT_UI_COLOR_SCHEME,
  DEFAULT_UI_THEME_ID,
  findUiTheme,
  UI_COLOR_SCHEMES,
  type UiColorScheme,
  type UiThemeDefinition,
  type UiThemeId,
  uiThemes,
} from '../../presentation/shared/ui/foundation/ui-theme';

interface MantineUiAdapterOptions {
  readonly defaultColorScheme?: UiColorScheme;
  readonly initialThemeId?: UiThemeId;
  readonly themes?: readonly UiThemeDefinition[];
}

const MantineThemeStateContext = createContext<PresentationUiThemeState | null>(null);

export class MantineUiAdapter {
  private readonly defaultColorScheme: UiColorScheme;

  private readonly initialThemeId: UiThemeId;

  private readonly themes: readonly UiThemeDefinition[];

  constructor({
    defaultColorScheme = DEFAULT_UI_COLOR_SCHEME,
    initialThemeId = DEFAULT_UI_THEME_ID,
    themes = uiThemes,
  }: MantineUiAdapterOptions = {}) {
    this.defaultColorScheme = defaultColorScheme;
    this.initialThemeId = initialThemeId;
    this.themes = themes;
  }

  createPort(): UiPort {
    const defaultColorScheme = this.defaultColorScheme;
    const initialThemeId = this.initialThemeId;
    const themes = this.themes;

    function useThemeState(): PresentationUiThemeState {
      const state = useContext(MantineThemeStateContext);

      if (!state) {
        throw createDomainError(
          {
            code: 'MANTINE_THEME_STATE_PROVIDER_REQUIRED',
            message: 'Mantine theme state provider is required.',
            messageKey: 'MANTINE_THEME_STATE_PROVIDER_REQUIRED',
          },
          {
            consumer: 'useThemeState',
            contextName: 'MantineThemeStateContext',
          },
        );
      }

      return state;
    }

    function MantineUiProvider({ children }: PropsWithChildren) {
      const reducedMotion = useReducedMotion();
      const [activeThemeId, setActiveTheme] = useState<UiThemeId>(initialThemeId);
      const [activeColorScheme, setActiveColorScheme] = useState<UiColorScheme>(defaultColorScheme);
      const [scopedThemes, setScopedThemes] = useState<
        readonly { readonly key: symbol; readonly document: ThemeDocument }[]
      >([]);
      // Stable registration keeps scope ownership across provider renders and route remounts.
      const applyScopedTheme = useCallback((document: ThemeDocument) => {
        const key = Symbol('theme-scope');
        setScopedThemes((current) => [...current, { key, document }]);
        return () => setScopedThemes((current) => current.filter((scope) => scope.key !== key));
      }, []);
      const themeDocument = scopedThemes.at(-1)?.document ?? null;
      const activeTheme = themeDocument
        ? createUiThemeFromDocument(themeDocument)
        : (themes.find((theme) => theme.id === activeThemeId) ?? findUiTheme(initialThemeId));
      const activeMantineTheme = activeTheme.mantineThemes[activeColorScheme];
      const activeThemeTokens = activeTheme.tokensByColorScheme[activeColorScheme];
      const themeState: PresentationUiThemeState = {
        applyScopedTheme,
        brandAssets: activeThemeTokens.assets,
        activeColorScheme,
        activeThemeId: activeTheme.id,
        activeThemeName: activeTheme.name,
        availableColorSchemes: UI_COLOR_SCHEMES,
        availableThemes: themes.map((theme) => ({ id: theme.id, name: theme.name })),
        setActiveColorScheme,
        setActiveTheme,
      };

      return (
        <MantineThemeStateContext.Provider value={themeState}>
          <MantineProvider
            defaultColorScheme={defaultColorScheme}
            forceColorScheme={activeColorScheme}
            theme={activeMantineTheme}
          >
            <CssVariableSync variables={createUiThemeCssVariables(activeThemeTokens, reducedMotion)} />
            <div
              data-ui-color-scheme={activeColorScheme}
              data-ui-theme={activeTheme.id}
              style={createUiThemeCssVariables(activeThemeTokens, reducedMotion)}
            >
              {children}
            </div>
          </MantineProvider>
        </MantineThemeStateContext.Provider>
      );
    }

    function ThemePreview({ document, colorScheme, children }: ThemePreviewProps) {
      const reducedMotion = useReducedMotion();
      const parentState = useThemeState();
      const previewId = useId().replace(/:/g, '');
      const theme = createUiThemeFromDocument(document);
      return (
        <MantineProvider
          forceColorScheme={colorScheme}
          theme={theme.mantineThemes[colorScheme]}
          cssVariablesSelector={`[data-theme-preview="${previewId}"]`}
          getRootElement={() => undefined}
        >
          <div
            data-theme-preview={previewId}
            data-mantine-color-scheme={colorScheme}
            data-ui-color-scheme={colorScheme}
            style={createUiThemeCssVariables(theme.tokensByColorScheme[colorScheme], reducedMotion)}
          >
            <MantineThemeStateContext.Provider
              value={{
                ...parentState,
                activeColorScheme: colorScheme,
                activeThemeId: theme.id,
                activeThemeName: theme.name,
                brandAssets: theme.tokensByColorScheme[colorScheme].assets,
              }}
            >
              {children}
            </MantineThemeStateContext.Provider>
          </div>
        </MantineProvider>
      );
    }
    return {
      ThemePreview,
      Provider: MantineUiProvider,
      useThemeState,
    };
  }
}

/**
 * Syncs UI theme CSS custom properties to `document.documentElement` so they
 * cascade into Mantine Portals (modals, drawers, tooltips) which render
 * outside the theme provider wrapper div.
 */
function CssVariableSync({ variables }: { readonly variables: CSSProperties }) {
  useEffect(() => {
    const root = document.documentElement;

    for (const [key, value] of Object.entries(variables)) {
      root.style.setProperty(key, String(value));
    }

    return () => {
      for (const key of Object.keys(variables)) {
        root.style.removeProperty(key);
      }
    };
  }, [variables]);

  return null;
}
