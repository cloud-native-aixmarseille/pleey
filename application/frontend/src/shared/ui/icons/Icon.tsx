import { forwardRef, type ReactNode } from "react";
import * as LucideIcons from "lucide-react";
import type { LucideProps } from "lucide-react";
import { useTheme } from "../theme";

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
  primary: (theme: ReturnType<typeof useTheme>) => theme.palette.primary[300],
  secondary: (theme: ReturnType<typeof useTheme>) =>
    theme.palette.secondary[300],
  accent: (theme: ReturnType<typeof useTheme>) => theme.palette.accent[300],
  success: (theme: ReturnType<typeof useTheme>) => theme.palette.success[200],
  danger: (theme: ReturnType<typeof useTheme>) => theme.palette.danger[200],
  neutral: (theme: ReturnType<typeof useTheme>) => theme.palette.neutral[300],
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
