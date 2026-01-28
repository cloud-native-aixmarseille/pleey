import { MantineProvider } from '@mantine/core';
import {
  type CSSProperties,
  createContext,
  type PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from 'react';
import type { PresentationUiThemeState, UiPort } from '../../application/shared/contracts/ui.port';
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
        throw new Error('Mantine theme state provider is required.');
      }

      return state;
    }

    function MantineUiProvider({ children }: PropsWithChildren) {
      const [activeThemeId, setActiveTheme] = useState<UiThemeId>(initialThemeId);
      const [activeColorScheme, setActiveColorScheme] = useState<UiColorScheme>(defaultColorScheme);
      const activeTheme =
        themes.find((theme) => theme.id === activeThemeId) ?? findUiTheme(initialThemeId);
      const activeMantineTheme = activeTheme.mantineThemes[activeColorScheme];
      const activeThemeTokens = activeTheme.tokensByColorScheme[activeColorScheme];
      const themeState: PresentationUiThemeState = {
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
            <CssVariableSync variables={createUiThemeCssVariables(activeThemeTokens)} />
            <div
              data-ui-color-scheme={activeColorScheme}
              data-ui-theme={activeTheme.id}
              style={createUiThemeCssVariables(activeThemeTokens)}
            >
              {children}
            </div>
          </MantineProvider>
        </MantineThemeStateContext.Provider>
      );
    }

    return {
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
