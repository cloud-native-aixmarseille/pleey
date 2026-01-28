import type { CSSProperties } from 'react';
import { uiThemeTokens } from '../../../../../shared/ui/foundation/ui-theme';
import { uiTypeScale } from '../../../../../shared/ui/foundation/ui-typography';

interface ActionSlotColor {
  readonly bg: string;
  readonly border: string;
  readonly text: string;
}

const DEFAULT_ACTION_SLOT_COUNT = 1;
const ACTION_SLOT_PALETTE_CACHE = new Map<number, readonly ActionSlotColor[]>();

function normalizeSlotCount(slotCount: number): number {
  return Number.isFinite(slotCount) && slotCount > 0
    ? Math.max(DEFAULT_ACTION_SLOT_COUNT, Math.floor(slotCount))
    : DEFAULT_ACTION_SLOT_COUNT;
}

function createActionSlotColor(hue: number): ActionSlotColor {
  const normalizedHue = ((hue % 360) + 360) % 360;

  return {
    bg: `hsla(${normalizedHue} 78% 52% / 0.14)`,
    border: `hsla(${normalizedHue} 82% 62% / 0.58)`,
    text: `hsl(${normalizedHue} 95% 78%)`,
  };
}

function createActionSlotPalette(slotCount: number): readonly ActionSlotColor[] {
  const normalizedSlotCount = normalizeSlotCount(slotCount);
  const cached = ACTION_SLOT_PALETTE_CACHE.get(normalizedSlotCount);

  if (cached) {
    return cached;
  }

  const palette = Array.from({ length: normalizedSlotCount }, (_, index) => {
    const hue = (index * 360) / normalizedSlotCount;
    return createActionSlotColor(hue);
  });

  ACTION_SLOT_PALETTE_CACHE.set(normalizedSlotCount, palette);
  return palette;
}

function getActionSlotColor(slotIndex: number, slotCount: number): ActionSlotColor {
  const palette = createActionSlotPalette(slotCount);
  return palette[((slotIndex % palette.length) + palette.length) % palette.length];
}

export function createHostActionCardStyle(slotIndex: number, slotCount: number): CSSProperties {
  const slot = getActionSlotColor(slotIndex, slotCount);

  return {
    alignItems: 'center',
    background: slot.bg,
    border: `2px solid ${slot.border}`,
    borderRadius: uiThemeTokens.radius.panel,
    display: 'flex',
    flexDirection: 'column',
    gap: uiThemeTokens.spacing.md,
    justifyContent: 'center',
    minHeight: '4rem',
    padding: `${uiThemeTokens.spacing.md} ${uiThemeTokens.spacing.lg}`,
    textAlign: 'center',
  };
}

export const hostActionLabelStyle: CSSProperties = {
  ...uiTypeScale.sectionTitle,
  color: uiThemeTokens.color.text.emphasis,
  margin: 0,
  textAlign: 'center',
};

export function createPlayerActionButtonStyle(
  slotIndex: number,
  slotCount: number,
  isSelected: boolean,
  isDisabled: boolean,
): CSSProperties {
  const slot = getActionSlotColor(slotIndex, slotCount);

  return {
    alignItems: 'center',
    background: isSelected ? slot.border : slot.bg,
    border: `2px solid ${slot.border}`,
    borderRadius: uiThemeTokens.radius.panel,
    color: isSelected ? '#fff' : slot.text,
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    display: 'flex',
    flexDirection: 'column',
    fontSize: 'clamp(1rem, 3vw, 1.25rem)',
    fontWeight: 700,
    gap: uiThemeTokens.spacing.sm,
    justifyContent: 'center',
    minHeight: 'clamp(3.5rem, 12vw, 5rem)',
    opacity: isDisabled && !isSelected ? 0.5 : 1,
    padding: `${uiThemeTokens.spacing.md} ${uiThemeTokens.spacing.lg}`,
    textAlign: 'center',
    transition: `all ${uiThemeTokens.motion.quick}`,
    width: '100%',
  };
}

export function createDistributionFillStyle(
  slotIndex: number,
  slotCount: number,
  percent: number,
): CSSProperties {
  const slot = getActionSlotColor(slotIndex, slotCount);

  return {
    background: slot.bg,
    borderRight: `2px solid ${slot.border}`,
    bottom: 0,
    left: 0,
    position: 'absolute',
    top: 0,
    transition: `width ${uiThemeTokens.motion.reveal}`,
    width: `${percent}%`,
    zIndex: 0,
  };
}
