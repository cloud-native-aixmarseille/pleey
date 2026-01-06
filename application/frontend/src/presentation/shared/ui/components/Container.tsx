import { type ReactNode } from "react";
import { composeClasses } from "../../utils/composeClasses";

export type ContainerSize = "sm" | "md" | "lg" | "xl" | "full";

export interface ContainerProps {
  children: ReactNode;
  size?: ContainerSize;
}

const SIZE_CLASS_MAP: Record<ContainerSize, string> = {
  sm: "max-w-2xl",
  md: "max-w-4xl",
  lg: "max-w-6xl",
  xl: "max-w-7xl",
  full: "max-w-full",
};

export function Container({ children, size = "lg" }: ContainerProps) {
  return (
    <div
      className={composeClasses(
        SIZE_CLASS_MAP[size],
        "mx-auto",
        "px-4 sm:px-6 lg:px-8"
      )}
    >
      {children}
    </div>
  );
}

export default Container;
