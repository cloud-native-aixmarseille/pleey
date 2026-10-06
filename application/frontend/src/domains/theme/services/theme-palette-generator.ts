import type { ThemeColorScale, ThemeDocument } from '../entities/theme-document';
import { ThemeError, ThemeErrorCode } from '../errors/theme-error';

// The shared middle shade must remain distinguishable against both curated schemes.
const SHADE_LUMINANCES = [0.94, 0.84, 0.72, 0.56, 0.4, 0.25, 0.18, 0.11, 0.065, 0.035] as const;

export class ThemePaletteGenerator {
  apply(document: ThemeDocument, group: 'accent' | 'highlight', color: string): ThemeDocument {
    if (!/^#[0-9a-f]{6}$/i.test(color)) {
      throw new ThemeError(ThemeErrorCode.INVALID_DOCUMENT, { field: `colorScales.${group}` });
    }
    const channels = [1, 3, 5].map((offset) => parseInt(color.slice(offset, offset + 2), 16));
    const scale = SHADE_LUMINANCES.map((target) => this.shade(channels, target)) as unknown as ThemeColorScale;
    const overrides = { ...document.overrides, colorScales: { ...document.overrides.colorScales, [group]: scale } };
    if (group === 'accent') {
      overrides.semantic = { ...document.overrides.semantic };
      for (const scheme of ['light', 'dark'] as const) {
        const existing = document.overrides.semantic?.[scheme];
        overrides.semantic[scheme] = {
          ...existing,
          text: { ...existing?.text, onAction: scheme === 'light' ? '#ffffff' : '#000000' },
        };
      }
    }
    return { ...document, overrides };
  }

  private shade(channels: readonly number[], target: number): string {
    const endpoint = this.luminance(channels) < target ? 255 : 0;
    let low = 0;
    let high = 1;
    for (let step = 0; step < 20; step++) {
      const weight = (low + high) / 2;
      const mixed = channels.map((channel) => channel + (endpoint - channel) * weight);
      if (this.luminance(mixed) < target === (endpoint === 255)) low = weight;
      else high = weight;
    }
    return `#${channels
      .map((channel) =>
        Math.round(channel + (endpoint - channel) * ((low + high) / 2))
          .toString(16)
          .padStart(2, '0'),
      )
      .join('')}`;
  }

  private luminance(channels: readonly number[]): number {
    const linear = channels.map((channel) => {
      const value = channel / 255;
      return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
    });
    return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
  }
}
