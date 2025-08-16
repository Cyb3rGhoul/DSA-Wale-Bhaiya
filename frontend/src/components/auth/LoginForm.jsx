import React from 'react';
import { useForm } from 'react-hook-form';
import { Mail, Lock, LogIn } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import FormField from '../ui/FormField';
import LoadingButton from '../ui/LoadingButton';

const LoginForm = ({ onSuccess, onSwitchToRegister }) => {
  const { login, isLoading, error, clearError } = useAuth();
  
  const {
    register,
    handleSubmit,
    formState: { errors, isValid, dirtyFields },
    setError,
    watch
  } = useForm({ mode: 'onChange' });

  const watchedFields = watch();

  const onSubmit = async (data) => {
    clearError();
    
    const result = await login(data.email, data.password);
    
    if (result.success) {
      onSuccess?.();
    } else {
      // Set form-level error if login fails
      setError('root', {
        type: 'manual',
        message: result.message || 'Login failed'
      });
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
          <p className="text-gray-600 mt-2">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email Field */}
          <FormField
            label="Email Address"
            name="email"
            type="email"
            placeholder="Enter your email"
            icon={Mail}
            autoComplete="email"
            error={errors.email?.message}
            isValid={dirtyFields.email && !errors.email && watchedFields.email}
            showValidation={dirtyFields.email}
            register={register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Please enter a valid email address'
              }
            })}
          />

          {/* Password Field */}
          <FormField
            label="Password"
            name="password"
            type="password"
            placeholder="Enter your password"
            icon={Lock}
            autoComplete="current-password"
            error={errors.password?.message}
            isValid={dirtyFields.password && !errors.password && watchedFields.password}
            showValidation={dirtyFields.password}
            register={register('password', {
              required: 'Password is required',
              minLength: {
                value: 6,
                message: 'Password must be at least 6 characters'
              }
            })}
          />

          {/* Error Display */}
          {(error || errors.root) && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-red-600">
                {error || errors.root?.message}
              </p>
            </div>
          )}

          {/* Submit Button */}
          <LoadingButton
            type="submit"
            isLoading={isLoading}
            loadingText="Signing in..."
            disabled={!isValid}
            className="w-full"
            icon={LogIn}
          >
            Sign In
          </LoadingButton>
        </form>

        {/* Switch to Register */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={onSwitchToRegister}
              className="font-medium text-blue-600 hover:text-blue-500 focus:outline-none focus:underline"
            >
              Sign up here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;