import { useTheme } from "../theme";
import { withAlpha } from "../../utils/color";
import { type IconSource, type IconTone, renderIconNode } from "../icons";

export type InfoItemTone = "primary" | "secondary" | "neutral";

export interface InfoItemProps {
  icon: IconSource;
  label: string;
  value: string;
  tone?: InfoItemTone;
}

const TONE_CONFIG: Record<InfoItemTone, { iconTone: IconTone }> = {
  primary: { iconTone: "accent" },
  secondary: { iconTone: "secondary" },
  neutral: { iconTone: "neutral" },
};

export function InfoItem({
  icon,
  label,
  value,
  tone = "primary",
}: InfoItemProps) {
  const theme = useTheme();
  const config = TONE_CONFIG[tone];

  const labelColor = withAlpha(theme.palette.text.secondary, 0.85);
  const valueColor =
    tone === "neutral"
      ? theme.palette.text.secondary
      : theme.palette.text.primary;

  const iconNode = renderIconNode(icon, {
    fallbackTone: config.iconTone,
    size: 22,
    strokeWidth: 1.75,
    primitiveClassName: "text-2xl",
  });

  return (
    <div className="flex items-start gap-3">
      <span
        aria-hidden
        className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/20 backdrop-blur-sm"
      >
        {iconNode}
      </span>
      <div>
        <p
          className="text-xs font-semibold uppercase tracking-[0.2em]"
          style={{ color: labelColor }}
        >
          {label}
        </p>
        <p className="text-base font-bold" style={{ color: valueColor }}>
          {value}
        </p>
      </div>
    </div>
  );
}
