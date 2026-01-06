import {
  useMemo,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from "react";
import { ThemeContext } from "./ThemeContext";
import {
  LIGHT_THEME_TOKENS,
  mergeThemeTokensWithBase,
  NEON_THEME_TOKENS,
} from "./tokens";
import { useColorScheme } from "./ColorSchemeProvider";
import type { ThemeTokenOverrides, ThemeTokens } from "./types";

interface ThemeProviderProps {
  children: ReactNode;
  tokens?: ThemeTokenOverrides;
}

function tokensToCssVariables(tokens: ThemeTokens): Record<string, string> {
  const variables: Record<string, string> = {};

  const assignScale = (prefix: string, scale: Record<string, string>) => {
    for (const [step, value] of Object.entries(scale)) {
      variables[`--arcade-color-${prefix}-${step}`] = value;
    }
  };

  assignScale("primary", tokens.palette.primary);
  assignScale("secondary", tokens.palette.secondary);
  assignScale("accent", tokens.palette.accent);
  assignScale("success", tokens.palette.success);
  assignScale("danger", tokens.palette.danger);
  assignScale("neutral", tokens.palette.neutral);

  variables["--arcade-color-surface-base"] = tokens.palette.surface.base;
  variables["--arcade-color-surface-elevated"] =
    tokens.palette.surface.elevated;
  variables["--arcade-color-surface-overlay"] = tokens.palette.surface.overlay;
  variables["--arcade-color-surface-inverted"] =
    tokens.palette.surface.inverted;
  variables["--arcade-color-surface-muted"] = tokens.palette.surface.muted;
  variables["--arcade-color-surface-gradient"] =
    tokens.palette.surface.gradient;

  variables["--arcade-color-text-primary"] = tokens.palette.text.primary;
  variables["--arcade-color-text-secondary"] = tokens.palette.text.secondary;
  variables["--arcade-color-text-muted"] = tokens.palette.text.muted;
  variables["--arcade-color-text-inverted"] = tokens.palette.text.inverted;
  variables["--arcade-color-text-accent"] = tokens.palette.text.accent;
  variables["--arcade-color-text-success"] = tokens.palette.text.success;
  variables["--arcade-color-text-danger"] = tokens.palette.text.danger;

  variables["--arcade-radius-none"] = tokens.radii.none;
  variables["--arcade-radius-sm"] = tokens.radii.sm;
  variables["--arcade-radius-md"] = tokens.radii.md;
  variables["--arcade-radius-lg"] = tokens.radii.lg;
  variables["--arcade-radius-xl"] = tokens.radii.xl;
  variables["--arcade-radius-pill"] = tokens.radii.pill;

  variables["--arcade-space-xxs"] = tokens.spacing.xxs;
  variables["--arcade-space-xs"] = tokens.spacing.xs;
  variables["--arcade-space-sm"] = tokens.spacing.sm;
  variables["--arcade-space-md"] = tokens.spacing.md;
  variables["--arcade-space-lg"] = tokens.spacing.lg;
  variables["--arcade-space-xl"] = tokens.spacing.xl;
  variables["--arcade-space-xxl"] = tokens.spacing.xxl;

  variables["--arcade-font-display"] = tokens.typography.family.display;
  variables["--arcade-font-body"] = tokens.typography.family.body;
  variables["--arcade-font-mono"] = tokens.typography.family.mono;

  variables["--arcade-letter-spacing-tight"] =
    tokens.typography.letterSpacing.tight;
  variables["--arcade-letter-spacing-normal"] =
    tokens.typography.letterSpacing.normal;
  variables["--arcade-letter-spacing-wide"] =
    tokens.typography.letterSpacing.wide;
  variables["--arcade-letter-spacing-wider"] =
    tokens.typography.letterSpacing.wider;
  variables["--arcade-text-transform"] = tokens.typography.textTransform;

  variables["--arcade-effect-glow"] = tokens.effects.glow;
  variables["--arcade-effect-glow-hover"] = tokens.effects.glowHover;
  variables["--arcade-effect-retro"] = tokens.effects.retro;
  variables["--arcade-effect-retro-hover"] = tokens.effects.retroHover;
  variables["--arcade-effect-focus-ring"] = tokens.effects.focusRing;
  variables["--arcade-effect-focus-ring-color"] = tokens.effects.focusRingColor;
  variables["--arcade-effect-panel"] = tokens.effects.panel;

  variables["--arcade-border-thin"] = tokens.borderWidths.thin;
  variables["--arcade-border-regular"] = tokens.borderWidths.regular;
  variables["--arcade-border-thick"] = tokens.borderWidths.thick;

  variables["--arcade-transition-fast"] = tokens.transitions.fast;
  variables["--arcade-transition-base"] = tokens.transitions.base;
  variables["--arcade-transition-slow"] = tokens.transitions.slow;

  return variables;
}

export function ThemeProvider({
  children,
  tokens,
}: ThemeProviderProps): ReactElement {
  const { resolved } = useColorScheme();
  const baseTokens =
    resolved === "dark" ? NEON_THEME_TOKENS : LIGHT_THEME_TOKENS;

  const mergedTokens = useMemo(
    () => mergeThemeTokensWithBase(baseTokens, tokens),
    [baseTokens, tokens]
  );

  const cssVariables = useMemo(
    () => tokensToCssVariables(mergedTokens),
    [mergedTokens]
  );

  const style = cssVariables as CSSProperties;

  return (
    <ThemeContext.Provider value={mergedTokens}>
      <div data-arcade-theme={resolved} style={style}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function getDefaultThemeTokens(): ThemeTokens {
  return { ...NEON_THEME_TOKENS };
}
