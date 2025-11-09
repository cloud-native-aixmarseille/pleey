export type ColorScale = {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
};

export type ThemePalette = {
  primary: ColorScale;
  secondary: ColorScale;
  accent: ColorScale;
  success: ColorScale;
  danger: ColorScale;
  neutral: ColorScale;
  surface: {
    base: string;
    elevated: string;
    overlay: string;
    inverted: string;
    muted: string;
    gradient: string;
  };
  text: {
    primary: string;
    secondary: string;
    muted: string;
    inverted: string;
    accent: string;
    success: string;
    danger: string;
  };
};

export type ThemeRadii = {
  none: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  pill: string;
};

export type ThemeSpacing = {
  xxs: string;
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  xxl: string;
};

export type ThemeTypography = {
  family: {
    display: string;
    body: string;
    mono: string;
  };
  letterSpacing: {
    tight: string;
    normal: string;
    wide: string;
    wider: string;
  };
  textTransform: "uppercase" | "none";
};

export type ThemeEffects = {
  glow: string;
  glowHover: string;
  retro: string;
  retroHover: string;
  focusRing: string;
  focusRingColor: string;
  panel: string;
};

export type ThemeBorderWidths = {
  thin: string;
  regular: string;
  thick: string;
};

export type ThemeTransitions = {
  fast: string;
  base: string;
  slow: string;
};

export type ThemeTokens = {
  palette: ThemePalette;
  radii: ThemeRadii;
  spacing: ThemeSpacing;
  typography: ThemeTypography;
  effects: ThemeEffects;
  borderWidths: ThemeBorderWidths;
  transitions: ThemeTransitions;
};

export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

export type ThemeTokenOverrides = DeepPartial<ThemeTokens>;
