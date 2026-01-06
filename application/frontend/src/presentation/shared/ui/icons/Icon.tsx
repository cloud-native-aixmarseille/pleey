import { forwardRef, type ReactNode } from "react";
import * as LucideIcons from "lucide-react";
import type { LucideProps } from "lucide-react";
import { useTheme } from "../theme";

function normalizeHex(hex: string): string | null {
  const trimmed = hex.trim();
  if (/^#([0-9a-fA-F]{3}){1,2}$/.test(trimmed)) {
    if (trimmed.length === 4) {
      const r = trimmed[1];
      const g = trimmed[2];
      const b = trimmed[3];
      return `#${r}${r}${g}${g}${b}${b}`;
    }
    return trimmed;
  }

  return null;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const normalized = normalizeHex(hex);
  if (!normalized) {
    return null;
  }

  const value = normalized.replace("#", "");
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);

  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) {
    return null;
  }

  return { r, g, b };
}

function relativeLuminance({ r, g, b }: { r: number; g: number; b: number }) {
  const toLinear = (value: number) => {
    const channel = value / 255;
    return channel <= 0.03928
      ? channel / 12.92
      : Math.pow((channel + 0.055) / 1.055, 2.4);
  };

  const R = toLinear(r);
  const G = toLinear(g);
  const B = toLinear(b);
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

function isLightTheme(theme: ReturnType<typeof useTheme>): boolean {
  const rgb = hexToRgb(theme.palette.surface.base);
  if (!rgb) {
    return false;
  }

  return relativeLuminance(rgb) > 0.6;
}

export type IconDescriptor = {
  name: IconName;
  tone?: IconTone;
  size?: number;
  strokeWidth?: number;
  label?: string;
};

type IconLibraryKeys = Exclude<
  keyof typeof LucideIcons,
  "default" | "createLucideIcon" | "LucideIcon" | "icons" | "Icon" | "Svg"
>;

export type IconName = IconLibraryKeys;

export type IconTone =
  | "primary"
  | "secondary"
  | "accent"
  | "success"
  | "danger"
  | "neutral"
  | "muted"
  | "inverted";

export interface IconProps
  extends Omit<LucideProps, "className" | "color" | "stroke" | "fill"> {
  name: IconName;
  tone?: IconTone;
  label?: string;
}

const toneToColor = {
  primary: (theme: ReturnType<typeof useTheme>) =>
    isLightTheme(theme)
      ? theme.palette.primary[700]
      : theme.palette.primary[300],
  secondary: (theme: ReturnType<typeof useTheme>) =>
    isLightTheme(theme)
      ? theme.palette.secondary[700]
      : theme.palette.secondary[300],
  accent: (theme: ReturnType<typeof useTheme>) =>
    isLightTheme(theme) ? theme.palette.text.accent : theme.palette.accent[300],
  success: (theme: ReturnType<typeof useTheme>) =>
    isLightTheme(theme)
      ? theme.palette.text.success
      : theme.palette.success[200],
  danger: (theme: ReturnType<typeof useTheme>) =>
    isLightTheme(theme) ? theme.palette.text.danger : theme.palette.danger[200],
  neutral: (theme: ReturnType<typeof useTheme>) =>
    isLightTheme(theme)
      ? theme.palette.neutral[700]
      : theme.palette.neutral[300],
  muted: (theme: ReturnType<typeof useTheme>) => theme.palette.text.muted,
  inverted: (theme: ReturnType<typeof useTheme>) => theme.palette.text.inverted,
} as const;

function resolveToneColor(
  tone: IconTone,
  theme: ReturnType<typeof useTheme>
): string {
  const resolver = toneToColor[tone];
  return resolver ? resolver(theme) : theme.palette.text.primary;
}

export const Icon = forwardRef<SVGSVGElement, IconProps>(
  ({ name, tone = "accent", label, strokeWidth = 2, style, ...rest }, ref) => {
    const theme = useTheme();
    const IconComponent = LucideIcons[name];

    if (!IconComponent) {
      if (import.meta.env?.DEV) {
        // eslint-disable-next-line no-console -- design system diagnostics only
        console.warn(
          `Icon '${name}' is not available in lucide-react library.`
        );
      }
      return null;
    }

    const resolvedColor = resolveToneColor(tone, theme);
    const mergedStyle = {
      color: resolvedColor,
      ...style,
    };

    const accessibilityProps = label
      ? { role: "img", "aria-label": label }
      : { "aria-hidden": true };

    return (
      <IconComponent
        ref={ref}
        strokeWidth={strokeWidth}
        style={mergedStyle}
        {...accessibilityProps}
        {...rest}
      />
    );
  }
);

Icon.displayName = "Icon";

export default Icon;

export type IconSource = IconDescriptor | ReactNode;

interface RenderIconOptions {
  fallbackTone: IconTone;
  size: number;
  strokeWidth?: number;
  primitiveClassName?: string;
}

export function renderIconNode(
  icon: IconSource | undefined,
  options: RenderIconOptions
): ReactNode {
  if (icon === null || icon === undefined) {
    return null;
  }

  if (
    typeof icon === "object" &&
    icon !== null &&
    "name" in icon &&
    typeof (icon as IconDescriptor).name === "string"
  ) {
    const descriptor = icon as IconDescriptor;
    return (
      <Icon
        name={descriptor.name}
        tone={descriptor.tone ?? options.fallbackTone}
        size={descriptor.size ?? options.size}
        strokeWidth={descriptor.strokeWidth ?? options.strokeWidth ?? 2}
        label={descriptor.label}
      />
    );
  }

  if (
    typeof icon === "string" ||
    typeof icon === "number" ||
    typeof icon === "bigint"
  ) {
    const { primitiveClassName } = options;
    return (
      <span aria-hidden className={primitiveClassName}>
        {icon}
      </span>
    );
  }

  return icon as ReactNode;
}
