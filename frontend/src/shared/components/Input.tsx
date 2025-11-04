import { InputHTMLAttributes, forwardRef, useId } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  darkMode?: boolean;
  icon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, darkMode = false, icon, className = '', id: providedId, ...props }, ref) => {
    const generatedId = useId();
    const id = providedId || generatedId;
    const errorId = `${id}-error`;
    
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={id} className={`block mb-2 font-semibold ${darkMode ? 'text-white' : 'text-dark-800'}`}>
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-light-600" aria-hidden="true">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={id}
            className={`
              input
              ${darkMode ? 'input-dark' : ''}
              ${icon ? 'pl-12' : ''}
              ${error ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-200' : ''}
              ${className}
            `}
            aria-invalid={error ? 'true' : undefined}
            aria-describedby={error ? errorId : undefined}
            {...props}
          />
        </div>
        {error && (
          <p id={errorId} className="mt-2 text-sm text-danger-500 font-medium" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
