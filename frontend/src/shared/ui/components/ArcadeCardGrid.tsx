import { type HTMLAttributes, type ReactNode } from "react";
import { composeClasses } from "../utils/composeClasses";

type ArcadeCardGridLayout = "double" | "triple" | "quad";

type ArcadeCardGridMotion = "none" | "slide-up";

type ArcadeCardGridSpacing = "none" | "sm" | "md" | "lg";

const LAYOUT_CLASS_MAP: Record<ArcadeCardGridLayout, string> = {
  double: "grid grid-cols-1 md:grid-cols-2",
  triple: "grid grid-cols-1 sm:grid-cols-3",
  quad: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
};

const MOTION_CLASS_MAP: Record<ArcadeCardGridMotion, string> = {
  none: "",
  "slide-up": "animate-slide-up",
};

const BOTTOM_SPACING_MAP: Record<ArcadeCardGridSpacing, string> = {
  none: "",
  sm: "mb-6",
  md: "mb-8",
  lg: "mb-12",
};

export interface ArcadeCardGridProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "className"> {
  children: ReactNode;
  layout?: ArcadeCardGridLayout;
  motion?: ArcadeCardGridMotion;
  bottomSpacing?: ArcadeCardGridSpacing;
}

export function ArcadeCardGrid({
  children,
  layout = "triple",
  motion = "slide-up",
  bottomSpacing = "md",
  ...rest
}: ArcadeCardGridProps) {
  return (
    <div
      className={composeClasses(
        "w-full gap-4",
        LAYOUT_CLASS_MAP[layout],
        MOTION_CLASS_MAP[motion],
        BOTTOM_SPACING_MAP[bottomSpacing]
      )}
      data-arcade-card-grid="true"
      {...rest}
    >
      {children}
    </div>
  );
}

export default ArcadeCardGrid;
