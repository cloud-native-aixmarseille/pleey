import { type ReactNode } from "react";
import { composeClasses } from "../../utils/composeClasses";

type ArcadeCardGridLayout = "double" | "triple" | "quad";

type ArcadeCardGridSpacing = "none" | "sm" | "md" | "lg";

const LAYOUT_CLASS_MAP: Record<ArcadeCardGridLayout, string> = {
  double: "grid grid-cols-1 md:grid-cols-2",
  triple: "grid grid-cols-1 sm:grid-cols-3",
  quad: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
};

const BOTTOM_SPACING_MAP: Record<ArcadeCardGridSpacing, string> = {
  none: "",
  sm: "mb-6",
  md: "mb-8",
  lg: "mb-12",
};

export interface ArcadeCardGridProps {
  children: ReactNode;
  layout?: ArcadeCardGridLayout;
  bottomSpacing?: ArcadeCardGridSpacing;
  role?: string;
  ariaLabel?: string;
}

export function ArcadeCardGrid({
  children,
  layout = "triple",
  bottomSpacing = "md",
  role,
  ariaLabel,
}: ArcadeCardGridProps) {
  return (
    <div
      className={composeClasses(
        "w-full gap-4",
        LAYOUT_CLASS_MAP[layout],
        "animate-slide-up",
        BOTTOM_SPACING_MAP[bottomSpacing]
      )}
      data-arcade-card-grid="true"
      role={role}
      aria-label={ariaLabel}
    >
      {children}
    </div>
  );
}

export default ArcadeCardGrid;
