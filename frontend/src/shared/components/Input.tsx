import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  darkMode?: boolean;
  icon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, darkMode = false, icon, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className={`block mb-2 font-semibold ${darkMode ? 'text-white' : 'text-dark-800'}`}>
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-light-600">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={`
              input
              ${darkMode ? 'input-dark' : ''}
              ${icon ? 'pl-12' : ''}
              ${error ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-200' : ''}
              ${className}
            `}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-2 text-sm text-danger-500 font-medium">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
