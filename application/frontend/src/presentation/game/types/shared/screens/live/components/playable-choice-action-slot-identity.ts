import type { MantineThemeOverride } from '@mantine/core';

export interface PlayableChoiceActionSlotIdentity {
  readonly letter: string;
  readonly surfaceBackground: string;
  readonly surfaceBorder: string;
  readonly badgeBackground: string;
  readonly badgeText: string;
}

interface HslColor {
  readonly hue: number;
  readonly lightness: number;
  readonly saturation: number;
}

type PlayableChoiceActionSlotTheme = MantineThemeOverride;

const DEFAULT_ACTION_SLOT_COUNT = 1;
const DEFAULT_HSL_THEME_PROFILE: HslColor = {
  hue: 220,
  lightness: 54,
  saturation: 74,
};
const SLOT_LABEL_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function normalizeActionSlotCount(slotCount: number): number {
  return Number.isFinite(slotCount) && slotCount > 0
    ? Math.max(DEFAULT_ACTION_SLOT_COUNT, Math.floor(slotCount))
    : DEFAULT_ACTION_SLOT_COUNT;
}

function normalizeWrappedIndex(index: number, slotCount: number): number {
  return ((index % slotCount) + slotCount) % slotCount;
}

function parseThemeHexColor(color: string): {
  readonly blue: number;
  readonly green: number;
  readonly red: number;
} | null {
  const normalized = color.trim();

  if (/^#[\da-f]{3}$/iu.test(normalized)) {
    return {
      blue: Number.parseInt(`${normalized[3]}${normalized[3]}`, 16),
      green: Number.parseInt(`${normalized[2]}${normalized[2]}`, 16),
      red: Number.parseInt(`${normalized[1]}${normalized[1]}`, 16),
    };
  }

  if (/^#[\da-f]{6}$/iu.test(normalized)) {
    return {
      blue: Number.parseInt(normalized.slice(5, 7), 16),
      green: Number.parseInt(normalized.slice(3, 5), 16),
      red: Number.parseInt(normalized.slice(1, 3), 16),
    };
  }

  return null;
}

function convertRgbToHsl(color: {
  readonly blue: number;
  readonly green: number;
  readonly red: number;
}): HslColor {
  const red = color.red / 255;
  const green = color.green / 255;
  const blue = color.blue / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const delta = max - min;
  const lightness = (max + min) / 2;

  if (delta === 0) {
    return {
      hue: 0,
      lightness: Math.round(lightness * 100),
      saturation: 0,
    };
  }

  const saturation = delta / (1 - Math.abs(2 * lightness - 1));
  let hue = 0;

  switch (max) {
    case red:
      hue = ((green - blue) / delta) % 6;
      break;
    case green:
      hue = (blue - red) / delta + 2;
      break;
    default:
      hue = (red - green) / delta + 4;
      break;
  }

  return {
    hue: Math.round((hue * 60 + 360) % 360),
    lightness: Math.round(lightness * 100),
    saturation: Math.round(saturation * 100),
  };
}

function resolveThemeProfile(theme: PlayableChoiceActionSlotTheme): HslColor {
  const themeAnchors = [
    theme.colors?.brand?.[5],
    theme.colors?.accent?.[5],
    theme.colors?.success?.[5],
  ]
    .filter((color): color is string => typeof color === 'string')
    .map(parseThemeHexColor)
    .filter((color): color is NonNullable<ReturnType<typeof parseThemeHexColor>> => color !== null)
    .map(convertRgbToHsl);

  if (themeAnchors.length === 0) {
    return DEFAULT_HSL_THEME_PROFILE;
  }

  return {
    hue: themeAnchors[0]?.hue ?? DEFAULT_HSL_THEME_PROFILE.hue,
    lightness: Math.round(
      themeAnchors.reduce((sum, color) => sum + color.lightness, 0) / themeAnchors.length,
    ),
    saturation: Math.round(
      themeAnchors.reduce((sum, color) => sum + color.saturation, 0) / themeAnchors.length,
    ),
  };
}

function createThemeHue(
  index: number,
  slotCount: number,
  theme: PlayableChoiceActionSlotTheme,
): HslColor {
  const profile = resolveThemeProfile(theme);
  const normalizedSlotCount = normalizeActionSlotCount(slotCount);
  const wrappedIndex = normalizeWrappedIndex(index, normalizedSlotCount);
  const hueStep = 360 / normalizedSlotCount;

  return {
    hue: Math.round((profile.hue + wrappedIndex * hueStep) % 360),
    lightness: clamp(profile.lightness, 38, 72),
    saturation: clamp(profile.saturation, 48, 86),
  };
}

function createHslColorString(color: HslColor, lightnessOffset = 0, saturationOffset = 0): string {
  return `hsl(${color.hue} ${clamp(color.saturation + saturationOffset, 42, 94)}% ${clamp(
    color.lightness + lightnessOffset,
    24,
    88,
  )}%)`;
}

export function resolvePlayableChoiceActionSlotLabel(index: number): string {
  const safeIndex = Number.isFinite(index) ? Math.max(0, Math.floor(index)) : 0;
  let current = safeIndex;
  let label = '';

  do {
    const alphabetIndex = current % SLOT_LABEL_ALPHABET.length;
    label = `${SLOT_LABEL_ALPHABET[alphabetIndex] ?? 'A'}${label}`;
    current = Math.floor(current / SLOT_LABEL_ALPHABET.length) - 1;
  } while (current >= 0);

  return label;
}

export function resolvePlayableChoiceActionSlotIdentity(
  index: number,
  slotCount: number,
  theme: PlayableChoiceActionSlotTheme,
): PlayableChoiceActionSlotIdentity {
  const slotColor = createThemeHue(index, slotCount, theme);

  return {
    badgeBackground: `color-mix(in srgb, ${createHslColorString(slotColor, -2, 10)} 78%, var(--ui-color-brand-primary))`,
    badgeText: 'var(--ui-color-text-on-action)',
    letter: resolvePlayableChoiceActionSlotLabel(index),
    surfaceBackground: `color-mix(in srgb, ${createHslColorString(slotColor, 16, 4)} 22%, var(--ui-color-surface-panel))`,
    surfaceBorder: `color-mix(in srgb, ${createHslColorString(slotColor, 8, 8)} 62%, var(--ui-color-border-strong))`,
  };
}
