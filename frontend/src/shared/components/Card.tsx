import { ReactNode } from 'react';

type CardVariant = 'default' | 'glass' | 'dark' | 'gradient';

interface CardProps {
  variant?: CardVariant;
  hover?: boolean;
  className?: string;
  children: ReactNode;
  onClick?: () => void;
}

const variantClasses = {
  default: 'card bg-white',
  glass: 'card-glass',
  dark: 'card-dark',
  gradient: 'card bg-gradient-to-br from-primary-500 to-secondary-500 text-white',
};

export default function Card({ 
  variant = 'default', 
  hover = false, 
  className = '', 
  children,
  onClick 
}: CardProps) {
  return (
    <div
      className={`
        ${variantClasses[variant]}
        ${hover ? 'card-hover cursor-pointer' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
