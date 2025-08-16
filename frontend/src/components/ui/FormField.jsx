import React, { useState } from 'react';
import { Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';

const FormField = ({
  label,
  type = 'text',
  placeholder,
  icon: Icon,
  error,
  isValid,
  showValidation = false,
  register,
  name,
  autoComplete,
  className = '',
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const isPasswordField = type === 'password';
  const inputType = isPasswordField && showPassword ? 'text' : type;

  const getFieldState = () => {
    if (error) return 'error';
    if (showValidation && isValid) return 'valid';
    if (isFocused) return 'focused';
    return 'default';
  };

  const fieldState = getFieldState();

  const stateStyles = {
    default: 'border-gray-300 focus:border-blue-500 focus:ring-blue-500',
    focused: 'border-blue-500 ring-2 ring-blue-500 ring-opacity-20',
    valid: 'border-green-300 focus:border-green-500 focus:ring-green-500',
    error: 'border-red-300 focus:border-red-500 focus:ring-red-500'
  };

  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className={`h-5 w-5 ${
              fieldState === 'error' ? 'text-red-400' :
              fieldState === 'valid' ? 'text-green-400' :
              fieldState === 'focused' ? 'text-blue-400' :
              'text-gray-400'
            }`} />
          </div>
        )}
        
        <input
          id={name}
          type={inputType}
          autoComplete={autoComplete}
          className={`
            block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 
            focus:outline-none focus:ring-2 transition-colors duration-200
            ${Icon ? 'pl-10' : ''}
            ${isPasswordField || (showValidation && (isValid || error)) ? 'pr-10' : ''}
            ${stateStyles[fieldState]}
          `}
          placeholder={placeholder}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...register}
          {...props}
        />

        {/* Right side icons */}
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center space-x-1">
          {/* Validation status icon */}
          {showValidation && !isPasswordField && (
            <>
              {error && (
                <AlertCircle className="h-5 w-5 text-red-400" />
              )}
              {isValid && !error && (
                <CheckCircle className="h-5 w-5 text-green-400" />
              )}
            </>
          )}

          {/* Password toggle */}
          {isPasswordField && (
            <button
              type="button"
              className="text-gray-400 hover:text-gray-600 focus:outline-none"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="flex items-center space-x-1 mt-1">
          <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Success message */}
      {showValidation && isValid && !error && (
        <div className="flex items-center space-x-1 mt-1">
          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
          <p className="text-sm text-green-600">Looks good!</p>
        </div>
      )}
    </div>
  );
};

export default FormField;