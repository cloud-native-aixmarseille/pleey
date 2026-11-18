export class ThemeDocumentNormalizerCore {
  constructor({ curatedThemeIds, curatedThemePalettes, keys, invalid }) {
    this.curatedThemeIds = curatedThemeIds;
    this.curatedThemePalettes = curatedThemePalettes;
    this.keys = keys;
    this.invalid = invalid;
  }

  normalize(value) {
    const input = this.record(value, 'document');
    if (input.schemaVersion !== 1) this.invalid('schemaVersion');
    if (typeof input.name !== 'string' || !input.name.trim() || input.name.trim().length > 80) this.invalid('name');
    const baseThemeId = this.curatedThemeIds.find((id) => id === input.baseThemeId);
    if (!baseThemeId) this.invalid('baseThemeId');
    const source = this.record(input.overrides ?? {}, 'overrides');
    const overrides = {};
    if (source.colorScales !== undefined) {
      const scales = this.record(source.colorScales, 'colorScales');
      overrides.colorScales = Object.fromEntries(
        ['accent', 'highlight', 'success']
          .filter((key) => scales[key] !== undefined)
          .map((key) => {
            const colors = scales[key];
            if (!Array.isArray(colors) || colors.length !== 10) this.invalid(`colorScales.${key}`);
            return [key, colors.map((color, index) => this.color(color, `colorScales.${key}.${index}`))];
          }),
      );
    }
    if (source.semantic !== undefined) {
      const semantic = this.record(source.semantic, 'semantic');
      overrides.semantic = Object.fromEntries(
        ['light', 'dark']
          .filter((key) => semantic[key] !== undefined)
          .map((scheme) => {
            const palette = this.record(semantic[scheme], `semantic.${scheme}`);
            const result = {};
            for (const [group, keys] of [
              ['surface', this.keys.surface],
              ['text', this.keys.text],
              ['border', this.keys.border],
            ]) {
              if (palette[group] !== undefined) {
                result[group] = this.normalizeFields(palette[group], keys, (fieldValue, key) =>
                  this.color(fieldValue, `semantic.${scheme}.${group}.${key}`),
                );
              }
            }
            return [scheme, result];
          }),
      );
    }
    for (const [group, keys, maximum] of [
      ['radius', this.keys.radius, 999],
      ['spacing', this.keys.spacing, 96],
    ]) {
      if (source[group] !== undefined) {
        overrides[group] = this.normalizeFields(source[group], keys, (fieldValue, key) => {
          if (typeof fieldValue !== 'string' || !/^(?:0|[1-9]\d*)(?:\.\d{1,2})?(?:px|rem)$/.test(fieldValue)) {
            this.invalid(`${group}.${key}`);
          }
          const pixels = parseFloat(fieldValue) * (fieldValue.endsWith('rem') ? 16 : 1);
          if (pixels > maximum) this.invalid(`${group}.${key}`);
          return fieldValue;
        });
      }
    }
    if (source.motion !== undefined) {
      overrides.motion = this.normalizeFields(source.motion, this.keys.motion, (fieldValue, key) => {
        if (
          typeof fieldValue !== 'string' ||
          !/^(?:0|[1-9]\d{0,2})ms(?: (?:ease|linear|ease-in-out))?$/.test(fieldValue) ||
          parseInt(fieldValue, 10) > 500
        ) {
          this.invalid(`motion.${key}`);
        }
        return fieldValue;
      });
    }
    if (source.typography !== undefined) {
      overrides.typography = this.normalizeFields(source.typography, this.keys.typography, (fieldValue, key) => {
        if (!this.keys.fontFamilies.some((font) => font === fieldValue)) this.invalid(`typography.${key}`);
        return fieldValue;
      });
    }
    if (source.assets !== undefined) {
      overrides.assets = this.normalizeFields(source.assets, ['logoAssetId', 'backgroundAssetId'], (fieldValue) => {
        if (
          fieldValue !== null &&
          (typeof fieldValue !== 'string' ||
            !/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(fieldValue))
        ) {
          this.invalid('assets');
        }
        return fieldValue;
      });
    }
    const document = {
      schemaVersion: 1,
      baseThemeId,
      name: input.name.trim(),
      overrides,
    };
    this.checkContrast(document);
    return document;
  }

  record(value, field) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) this.invalid(field);
    return value;
  }

  normalizeFields(value, keys, normalize) {
    const source = this.record(value, 'overrides');
    return Object.fromEntries(
      keys.filter((key) => source[key] !== undefined).map((key) => [key, normalize(source[key], key)]),
    );
  }

  color(value, field) {
    if (typeof value !== 'string' || !/^#[0-9a-f]{6}$/i.test(value)) this.invalid(field);
    return value.toLowerCase();
  }

  checkContrast(document) {
    const base = this.curatedThemePalettes[document.baseThemeId];
    const scales = { ...base.colorScales, ...document.overrides.colorScales };
    for (const scheme of ['light', 'dark']) {
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
      ]) {
        for (const foreground of ['primary', 'secondary', 'soft', 'quiet', 'emphasis', 'link']) {
          if (
            changes?.surface?.canvas !== undefined ||
            changes?.surface?.[background] !== undefined ||
            changes?.text?.[foreground] !== undefined
          ) {
            this.assertContrast(text[foreground], surface[background], canvas, 4.5, `${scheme}.text.${foreground}`);
          }
        }
        if (
          changes?.border?.accent !== undefined ||
          changes?.surface?.canvas !== undefined ||
          changes?.surface?.[background] !== undefined
        ) {
          this.assertContrast(border.accent, surface[background], canvas, 3, `${scheme}.border.accent`);
        }
      }
      for (const [foreground, background] of [
        ['status', 'accentMuted'],
        ['status', 'accentPanel'],
        ['statusSoft', 'recessed'],
      ]) {
        if (
          changes?.text?.[foreground] !== undefined ||
          changes?.surface?.[background] !== undefined ||
          changes?.surface?.canvas !== undefined
        ) {
          this.assertContrast(text[foreground], surface[background], canvas, 4.5, `${scheme}.text.${foreground}`);
        }
      }
      for (const semantic of ['danger', 'warning', 'live']) {
        if (
          changes?.text?.[semantic] !== undefined ||
          changes?.surface?.[semantic] !== undefined ||
          changes?.surface?.canvas !== undefined
        ) {
          this.assertContrast(text[semantic], surface[semantic], canvas, 4.5, `${scheme}.text.${semantic}`);
        }
      }
      for (const scale of ['accent', 'highlight', 'success']) {
        if (document.overrides.colorScales?.[scale]) {
          for (const background of ['canvas', 'panel']) {
            this.assertContrast(scales[scale][5], surface[background], canvas, 3, `${scheme}.colorScales.${scale}`);
          }
        }
      }
      if (document.overrides.colorScales?.accent || changes?.text?.onAction !== undefined) {
        for (const index of scheme === 'light' ? [7, 8] : [4, 5]) {
          this.assertContrast(text.onAction, scales.accent[index], canvas, 4.5, `${scheme}.text.onAction`);
        }
      }
    }
  }

  rgb(value, background) {
    if (value.startsWith('#')) return [1, 3, 5].map((index) => parseInt(value.slice(index, index + 2), 16));
    const channels = value.match(/[\d.]+/g)?.map(Number) ?? [];
    const alpha = channels[3] ?? 1;
    return [0, 1, 2].map((index) => (channels[index] ?? 0) * alpha + background[index] * (1 - alpha));
  }

  luminance(channels) {
    const linear = channels.map((channel) => {
      const value = channel / 255;
      return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
    });
    return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
  }

  assertContrast(foreground, background, canvas, minimum, field) {
    const surface = this.rgb(background, canvas);
    const first = this.luminance(this.rgb(foreground, surface));
    const second = this.luminance(surface);
    const contrast = (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
    if (contrast < minimum) this.invalid(`${field}.contrast`);
  }
}
