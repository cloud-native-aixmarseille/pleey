import { Card } from "./Card";
import { type IconSource, type IconTone, renderIconNode } from "../icons";
import { useTheme } from "../theme";
import { withAlpha } from "../../utils/color";

export type StatsCardVariant = "primary" | "secondary" | "accent" | "purple";

type StatsCardIcon = IconSource;

export interface StatsCardProps {
  label: string;
  value: number | string;
  icon?: StatsCardIcon;
  variant?: StatsCardVariant;
}

const VARIANT_CONFIG: Record<
  StatsCardVariant,
  {
    surface: "gradient" | "accent" | "panel";
    tone: "primary" | "secondary" | "accent";
    elevation: "glow" | "panel" | "none";
    iconTone: IconTone;
  }
> = {
  primary: {
    surface: "gradient",
    tone: "primary",
    elevation: "glow",
    iconTone: "accent",
  },
  secondary: {
    surface: "gradient",
    tone: "secondary",
    elevation: "glow",
    iconTone: "accent",
  },
  accent: {
    surface: "accent",
    tone: "accent",
    elevation: "panel",
    iconTone: "inverted",
  },
  purple: {
    surface: "panel",
    tone: "primary",
    elevation: "panel",
    iconTone: "accent",
  },
};

export function StatsCard({
  label,
  value,
  icon,
  variant = "primary",
}: StatsCardProps) {
  const theme = useTheme();
  const config = VARIANT_CONFIG[variant];
  const isAccent = variant === "accent";

  const labelColor = isAccent
    ? withAlpha(theme.palette.text.inverted, 0.75)
    : withAlpha(theme.palette.text.secondary, 0.85);
  const valueColor = isAccent
    ? theme.palette.text.inverted
    : theme.palette.text.primary;

  const iconNode = renderIconNode(icon, {
    fallbackTone: config.iconTone,
    size: 32,
    strokeWidth: 1.75,
    primitiveClassName: "text-4xl font-black",
  });

  return (
    <Card
      surface={config.surface}
      tone={config.tone}
      elevation={config.elevation}
      padding="lg"
    >
      <div className="flex items-center justify-between gap-6">
        <div className="space-y-2">
          <p
            className="text-xs font-semibold uppercase tracking-[0.28em]"
            style={{ color: labelColor }}
          >
            {label}
          </p>
          <p
            className="text-4xl font-black leading-none"
            style={{ color: valueColor }}
          >
            {value}
          </p>
        </div>
        {iconNode ? (
          <div
            aria-hidden
            className="flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-black/30 backdrop-blur-sm"
          >
            {iconNode}
          </div>
        ) : null}
      </div>
    </Card>
  );
}
