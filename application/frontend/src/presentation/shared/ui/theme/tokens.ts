import type { ThemeTokens, ThemeTokenOverrides } from "./types";

const NEON_COLOR_PRIMARY = {
  50: "#f0f0ff",
  100: "#e0dcff",
  200: "#c7c0ff",
  300: "#a89dff",
  400: "#8a73ff",
  500: "#6b48ff",
  600: "#5c3ad6",
  700: "#4d2db3",
  800: "#3e2090",
  900: "#2f1870",
} as const;

const LIGHT_COLOR_PRIMARY = {
  50: "#eef9ff",
  100: "#d7f0ff",
  200: "#b1e2ff",
  300: "#7fceff",
  400: "#42b4ff",
  500: "#1f8bff",
  600: "#146ee6",
  700: "#0f56bf",
  800: "#0b3f8f",
  900: "#082e66",
} as const;

const NEON_COLOR_SECONDARY = {
  50: "#fff0fb",
  100: "#ffd6f3",
  200: "#ffade8",
  300: "#ff85dd",
  400: "#ff5cd1",
  500: "#ff33c6",
  600: "#d62ba3",
  700: "#b32387",
  800: "#901b6b",
  900: "#6d144f",
} as const;

const NEON_COLOR_ACCENT = {
  50: "#e6fff9",
  100: "#b3fff0",
  200: "#80ffe6",
  300: "#4dffdd",
  400: "#1affd4",
  500: "#00ffcc",
  600: "#00d6ad",
  700: "#00b38f",
  800: "#009070",
  900: "#006d52",
} as const;

const NEON_COLOR_SUCCESS = {
  50: "#e6ffed",
  100: "#b3ffc8",
  200: "#80ffa3",
  300: "#4dff7e",
  400: "#1aff59",
  500: "#00ff41",
  600: "#00d636",
  700: "#00b32c",
  800: "#009022",
  900: "#006d18",
} as const;

const NEON_COLOR_DANGER = {
  50: "#ffe6e6",
  100: "#ffb3b3",
  200: "#ff8080",
  300: "#ff4d4d",
  400: "#ff1a1a",
  500: "#ff0000",
  600: "#d60000",
  700: "#b30000",
  800: "#900000",
  900: "#6d0000",
} as const;

const NEON_COLOR_NEUTRAL = {
  50: "#f9f9ff",
  100: "#f2f2ff",
  200: "#dedff7",
  300: "#c5c6e0",
  400: "#9da0c1",
  500: "#73769f",
  600: "#595d82",
  700: "#444764",
  800: "#2f3146",
  900: "#191a2a",
} as const;

const SURFACE_BASE = "#101024";
const SURFACE_ELEVATED = "#17173a";
const SURFACE_OVERLAY = "rgba(23, 23, 58, 0.85)";
const SURFACE_INVERTED = "#f5f5ff";
const SURFACE_MUTED = "rgba(15, 13, 35, 0.65)";
const SURFACE_GRADIENT =
  "linear-gradient(145deg, rgba(107,72,255,0.25), rgba(255,51,198,0.15))";

const LIGHT_SURFACE_BASE = "#f5f5ff";
const LIGHT_SURFACE_ELEVATED = "#ffffff";
const LIGHT_SURFACE_OVERLAY = "rgba(245, 245, 255, 0.85)";
const LIGHT_SURFACE_INVERTED = "#0a0a1f";
const LIGHT_SURFACE_MUTED = "rgba(224, 220, 255, 0.7)";
const LIGHT_SURFACE_GRADIENT =
  "linear-gradient(145deg, rgba(107,72,255,0.12), rgba(255,51,198,0.08))";

export const NEON_THEME_TOKENS: ThemeTokens = {
  palette: {
    primary: NEON_COLOR_PRIMARY,
    secondary: NEON_COLOR_SECONDARY,
    accent: NEON_COLOR_ACCENT,
    success: NEON_COLOR_SUCCESS,
    danger: NEON_COLOR_DANGER,
    neutral: NEON_COLOR_NEUTRAL,
    surface: {
      base: SURFACE_BASE,
      elevated: SURFACE_ELEVATED,
      overlay: SURFACE_OVERLAY,
      inverted: SURFACE_INVERTED,
      muted: SURFACE_MUTED,
      gradient: SURFACE_GRADIENT,
    },
    text: {
      primary: "#f5f5ff",
      secondary: "#d6d6ff",
      muted: "#9ea1d5",
      inverted: "#0a0a1f",
      accent: NEON_COLOR_ACCENT[300],
      success: NEON_COLOR_SUCCESS[200],
      danger: NEON_COLOR_DANGER[200],
    },
  },
  radii: {
    none: "0",
    sm: "0.125rem",
    md: "0.25rem",
    lg: "0.5rem",
    xl: "0.75rem",
    pill: "999px",
  },
  spacing: {
    xxs: "0.25rem",
    xs: "0.5rem",
    sm: "0.75rem",
    md: "1rem",
    lg: "1.5rem",
    xl: "2rem",
    xxl: "3rem",
  },
  typography: {
    family: {
      display: '"Press Start 2P", system-ui, sans-serif',
      body: '"Orbitron", system-ui, sans-serif',
      mono: '"VT323", "Fira Code", monospace',
    },
    letterSpacing: {
      tight: "0.05em",
      normal: "0.12em",
      wide: "0.18em",
      wider: "0.24em",
    },
    textTransform: "uppercase",
  },
  effects: {
    glow: "0 0 20px rgba(107, 72, 255, 0.45)",
    glowHover: "0 0 30px rgba(107, 72, 255, 0.6)",
    retro: "8px 8px 0 rgba(0, 0, 0, 0.8)",
    retroHover: "4px 4px 0 rgba(0, 0, 0, 0.65)",
    focusRing: "0 0 0 4px rgba(107, 72, 255, 0.3)",
    focusRingColor: "rgba(107, 72, 255, 0.35)",
    panel:
      "0 0 40px rgba(107, 72, 255, 0.35), inset 0 0 60px rgba(107, 72, 255, 0.12)",
  },
  borderWidths: {
    thin: "1px",
    regular: "2px",
    thick: "4px",
  },
  transitions: {
    fast: "120ms",
    base: "200ms",
    slow: "320ms",
  },
};

export const LIGHT_THEME_TOKENS: ThemeTokens = {
  palette: {
    primary: LIGHT_COLOR_PRIMARY,
    secondary: NEON_COLOR_SECONDARY,
    accent: NEON_COLOR_ACCENT,
    success: NEON_COLOR_SUCCESS,
    danger: NEON_COLOR_DANGER,
    neutral: NEON_COLOR_NEUTRAL,
    surface: {
      base: LIGHT_SURFACE_BASE,
      elevated: LIGHT_SURFACE_ELEVATED,
      overlay: LIGHT_SURFACE_OVERLAY,
      inverted: LIGHT_SURFACE_INVERTED,
      muted: LIGHT_SURFACE_MUTED,
      gradient: LIGHT_SURFACE_GRADIENT,
    },
    text: {
      primary: "#0a0a1f",
      secondary: "#2d2d70",
      muted: "#4d4da3",
      inverted: "#f5f5ff",
      accent: NEON_COLOR_ACCENT[900],
      success: NEON_COLOR_SUCCESS[900],
      danger: NEON_COLOR_DANGER[800],
    },
  },
  radii: NEON_THEME_TOKENS.radii,
  spacing: NEON_THEME_TOKENS.spacing,
  typography: NEON_THEME_TOKENS.typography,
  effects: {
    ...NEON_THEME_TOKENS.effects,
    focusRing: "0 0 0 4px rgba(31, 139, 255, 0.22)",
    focusRingColor: "rgba(31, 139, 255, 0.26)",
  },
  borderWidths: NEON_THEME_TOKENS.borderWidths,
  transitions: NEON_THEME_TOKENS.transitions,
};

type Mergeable = Record<string, unknown>;

function mergeDeep<T extends Mergeable>(target: T, source: Mergeable): T {
  const output: Mergeable = { ...target };

  for (const [key, value] of Object.entries(source)) {
    if (value === undefined || value === null) {
      continue;
    }

    const targetValue = output[key];

    if (
      typeof value === "object" &&
      !Array.isArray(value) &&
      typeof targetValue === "object" &&
      targetValue !== null
    ) {
      output[key] = mergeDeep(targetValue as Mergeable, value as Mergeable);
      continue;
    }

    output[key] = value;
  }

  return output as T;
}

export function mergeThemeTokens(overrides?: ThemeTokenOverrides): ThemeTokens {
  return mergeThemeTokensWithBase(NEON_THEME_TOKENS, overrides);
}

export function mergeThemeTokensWithBase(
  base: ThemeTokens,
  overrides?: ThemeTokenOverrides
): ThemeTokens {
  if (!overrides) {
    return { ...base };
  }

  return mergeDeep({ ...base }, overrides as Mergeable);
}
