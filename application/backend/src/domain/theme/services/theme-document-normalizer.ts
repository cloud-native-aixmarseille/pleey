import {
  THEME_BORDER_KEYS,
  THEME_FONT_FAMILIES,
  THEME_MOTION_KEYS,
  THEME_RADIUS_KEYS,
  THEME_SPACING_KEYS,
  THEME_SURFACE_KEYS,
  THEME_TEXT_KEYS,
  THEME_TYPOGRAPHY_KEYS,
  type ThemeDocument,
  type ThemeOverrides,
} from '../entities/theme-document';
import { CURATED_THEME_IDS } from '../entities/theme-id';
import { ThemeError, ThemeErrorCode } from '../errors/theme-error';
import { CURATED_THEME_PALETTES } from './curated-theme-palettes';

export class ThemeDocumentNormalizer {
  normalize(value: unknown): ThemeDocument {
    const input = this.record(value, 'document');
    if (input.schemaVersion !== 1) this.invalid('schemaVersion');
    if (typeof input.name !== 'string' || !input.name.trim() || input.name.trim().length > 80) this.invalid('name');
    const baseThemeId = CURATED_THEME_IDS.find((id) => id === input.baseThemeId);
    if (!baseThemeId) this.invalid('baseThemeId');
    const source = this.record(input.overrides ?? {}, 'overrides');
    const overrides: Record<string, unknown> = {};
    if (source.colorScales !== undefined) {
      const scales = this.record(source.colorScales, 'colorScales');
      overrides.colorScales = Object.fromEntries(
        ['accent', 'highlight', 'success']
          .filter((key) => scales[key] !== undefined)
          .map((key) => {
            const colors = scales[key];
            if (!Array.isArray(colors) || colors.length !== 10) this.invalid('colorScales.' + key);
            return [key, colors.map((color) => this.color(color))];
          }),
      );
    }
    if (source.semantic !== undefined) {
      const semantic = this.record(source.semantic, 'semantic');
      overrides.semantic = Object.fromEntries(
        ['light', 'dark']
          .filter((key) => semantic[key] !== undefined)
          .map((scheme) => {
            const palette = this.record(semantic[scheme], 'semantic.' + scheme);
            const result: Record<string, unknown> = {};
            for (const [group, keys] of [
              ['surface', THEME_SURFACE_KEYS],
              ['text', THEME_TEXT_KEYS],
              ['border', THEME_BORDER_KEYS],
            ] as const) {
              if (palette[group] !== undefined)
                result[group] = this.normalizeFields(palette[group], keys, (value) => this.color(value));
            }
            return [scheme, result];
          }),
      );
    }
    for (const [group, keys, maximum] of [
      ['radius', THEME_RADIUS_KEYS, 999],
      ['spacing', THEME_SPACING_KEYS, 96],
    ] as const) {
      if (source[group] !== undefined)
        overrides[group] = this.normalizeFields(source[group], keys, (value) => {
          if (typeof value !== 'string' || !/^(?:0|[1-9]\d*)(?:\.\d{1,2})?(?:px|rem)$/.test(value)) this.invalid(group);
          const pixels = parseFloat(value) * (value.endsWith('rem') ? 16 : 1);
          if (pixels > maximum) this.invalid(group);
          return value;
        });
    }
    if (source.motion !== undefined)
      overrides.motion = this.normalizeFields(source.motion, THEME_MOTION_KEYS, (value) => {
        if (
          typeof value !== 'string' ||
          !/^(?:0|[1-9]\d{0,2})ms(?: (?:ease|linear|ease-in-out))?$/.test(value) ||
          parseInt(value, 10) > 500
        )
          this.invalid('motion');
        return value;
      });
    if (source.typography !== undefined)
      overrides.typography = this.normalizeFields(source.typography, THEME_TYPOGRAPHY_KEYS, (value) => {
        if (!THEME_FONT_FAMILIES.some((font) => font === value)) this.invalid('typography');
        return value as string;
      });
    if (source.assets !== undefined)
      overrides.assets = this.normalizeFields(source.assets, ['logoAssetId', 'backgroundAssetId'], (value) => {
        if (
          value !== null &&
          (typeof value !== 'string' ||
            !/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value))
        )
          this.invalid('assets');
        return value as string | null;
      });
    const document: ThemeDocument = {
      schemaVersion: 1,
      baseThemeId,
      name: input.name.trim(),
      overrides: overrides as ThemeOverrides,
    };
    this.checkContrast(document);
    return document;
  }

  private record(value: unknown, field: string): Record<string, unknown> {
    if (!value || typeof value !== 'object' || Array.isArray(value)) this.invalid(field);
    return value as Record<string, unknown>;
  }
  private normalizeFields(
    value: unknown,
    keys: readonly string[],
    normalize: (value: unknown) => string | null,
  ): Record<string, string | null> {
    const source = this.record(value, 'overrides');
    return Object.fromEntries(
      keys.filter((key) => source[key] !== undefined).map((key) => [key, normalize(source[key])]),
    );
  }
  private color(value: unknown): string {
    if (typeof value !== 'string' || !/^#[0-9a-f]{6}$/i.test(value)) this.invalid('color');
    return value.toLowerCase();
  }
  private checkContrast(document: ThemeDocument): void {
    const base = CURATED_THEME_PALETTES[document.baseThemeId];
    const scales = { ...base.colorScales, ...document.overrides.colorScales };
    for (const scheme of ['light', 'dark'] as const) {
      const changes = document.overrides.semantic?.[scheme];
      const palette = base.semantic[scheme];
      const surface = { ...palette.surface, ...changes?.surface };
      const text = { ...palette.text, ...changes?.text };
      const border = { ...palette.border, ...changes?.border };
      const canvas = this.rgb(surface.canvas, [255, 255, 255]);
      for (const background of [
        'canvas',
        'panel',
        'field',
        'recessed',
        'overlay',
        'accentMuted',
        'accentPanel',
        'neutralMuted',
        'strongAccent',
      ] as const) {
        for (const foreground of ['primary', 'secondary', 'soft', 'quiet', 'emphasis', 'link'] as const) {
          if (
            changes?.surface?.canvas !== undefined ||
            changes?.surface?.[background] !== undefined ||
            changes?.text?.[foreground] !== undefined
          ) {
            this.assertContrast(text[foreground], surface[background], canvas, 4.5, scheme + '.text.' + foreground);
          }
        }
        if (
          changes?.border?.accent !== undefined ||
          changes?.surface?.canvas !== undefined ||
          changes?.surface?.[background] !== undefined
        ) {
          this.assertContrast(border.accent, surface[background], canvas, 3, scheme + '.border.accent');
        }
      }
      for (const [foreground, background] of [
        ['status', 'accentMuted'],
        ['status', 'accentPanel'],
        ['statusSoft', 'recessed'],
      ] as const) {
        if (
          changes?.text?.[foreground] !== undefined ||
          changes?.surface?.[background] !== undefined ||
          changes?.surface?.canvas !== undefined
        )
          this.assertContrast(text[foreground], surface[background], canvas, 4.5, `${scheme}.text.${foreground}`);
      }
      for (const semantic of ['danger', 'warning', 'live'] as const) {
        if (
          changes?.text?.[semantic] !== undefined ||
          changes?.surface?.[semantic] !== undefined ||
          changes?.surface?.canvas !== undefined
        ) {
          this.assertContrast(text[semantic], surface[semantic], canvas, 4.5, scheme + '.text.' + semantic);
        }
      }
      for (const scale of ['accent', 'highlight', 'success'] as const) {
        if (document.overrides.colorScales?.[scale]) {
          for (const background of ['canvas', 'panel'] as const)
            this.assertContrast(scales[scale][5], surface[background], canvas, 3, `${scheme}.colorScales.${scale}`);
        }
      }
      if (document.overrides.colorScales?.accent || changes?.text?.onAction !== undefined) {
        for (const index of scheme === 'light' ? [7, 8] : [4, 5])
          this.assertContrast(text.onAction, scales.accent[index], canvas, 4.5, scheme + '.text.onAction');
      }
    }
  }
  private rgb(value: string, background: readonly number[]): number[] {
    if (value.startsWith('#')) return [1, 3, 5].map((index) => parseInt(value.slice(index, index + 2), 16));
    const channels = value.match(/[\d.]+/g)?.map(Number) ?? [];
    const alpha = channels[3] ?? 1;
    return [0, 1, 2].map((index) => (channels[index] ?? 0) * alpha + background[index] * (1 - alpha));
  }
  private luminance(channels: readonly number[]): number {
    const linear = channels.map((channel) => {
      const value = channel / 255;
      return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
    });
    return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
  }
  private assertContrast(
    foreground: string,
    background: string,
    canvas: readonly number[],
    minimum: number,
    field: string,
  ): void {
    const surface = this.rgb(background, canvas);
    const first = this.luminance(this.rgb(foreground, surface));
    const second = this.luminance(surface);
    const contrast = (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
    if (contrast < minimum) this.invalid(field + '.contrast');
  }
  private invalid(field: string): never {
    throw new ThemeError(ThemeErrorCode.INVALID_DOCUMENT, { field });
  }
}
