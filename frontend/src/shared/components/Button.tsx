import { ReactNode, ButtonHTMLAttributes, forwardRef } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'success' | 'danger' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  icon?: ReactNode;
  children: ReactNode;
}

const sizeClasses = {
  sm: 'px-4 py-2 text-sm rounded-xl',
  md: 'px-6 py-3 text-base rounded-2xl',
  lg: 'px-8 py-4 text-lg rounded-2xl',
  xl: 'px-10 py-5 text-xl rounded-3xl',
};

const variantClasses = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  accent: 'btn-accent',
  success: 'btn-success',
  danger: 'btn-danger',
  outline: 'btn-outline',
  ghost: 'btn-ghost',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(({ 
  variant = 'primary', 
  size = 'md', 
  fullWidth = false,
  icon,
  children, 
  className = '',
  disabled,
  ...props 
}, ref) => {
  return (
    <button
      ref={ref}
      className={`
        btn
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${fullWidth ? 'w-full' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
      disabled={disabled}
      aria-disabled={disabled}
      {...props}
    >
      {icon && <span className="inline-flex items-center mr-2" aria-hidden="true">{icon}</span>}
      {children}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;
