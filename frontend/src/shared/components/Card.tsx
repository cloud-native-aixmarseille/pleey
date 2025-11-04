import { ReactNode, CSSProperties } from "react";

type CardVariant = "default" | "glass" | "dark" | "gradient";

interface CardProps {
  variant?: CardVariant;
  hover?: boolean;
  className?: string;
  children: ReactNode;
  onClick?: () => void;
  style?: CSSProperties;
}

const variantClasses = {
  default: "card bg-white",
  glass: "card-glass",
  dark: "card-dark",
  gradient:
    "card bg-gradient-to-br from-primary-500 to-secondary-500 text-white",
};

export default function Card({
  variant = "default",
  hover = false,
  className = "",
  children,
  onClick,
  style,
}: CardProps) {
  // If onClick is provided, make it a button for proper accessibility
  if (onClick) {
    return (
      <button
        type="button"
        className={`
          ${variantClasses[variant]}
          ${hover ? "card-hover cursor-pointer" : ""}
          ${className}
          w-full text-left border-0
        `}
        onClick={onClick}
        style={style}
      >
        {children}
      </button>
    );
  }
  
  return (
    <div
      className={`
        ${variantClasses[variant]}
        ${hover ? "card-hover" : ""}
        ${className}
      `}
      style={style}
    >
      {children}
    </div>
  );
}
