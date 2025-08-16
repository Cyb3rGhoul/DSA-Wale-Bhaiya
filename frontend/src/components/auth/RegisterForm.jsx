import React from 'react';
import { useForm } from 'react-hook-form';
import { Mail, Lock, User, UserPlus } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import FormField from '../ui/FormField';
import LoadingButton from '../ui/LoadingButton';

const RegisterForm = ({ onSuccess, onSwitchToLogin }) => {
  const { register: registerUser, isLoading, error, clearError } = useAuth();
  
  const {
    register,
    handleSubmit,
    formState: { errors, isValid, dirtyFields },
    watch,
    setError
  } = useForm({ mode: 'onChange' });

  const watchedFields = watch();

  const password = watch('password');

  const onSubmit = async (data) => {
    clearError();
    
    const { confirmPassword, ...userData } = data;
    const result = await registerUser(userData);
    
    if (result.success) {
      onSuccess?.();
    } else {
      // Set form-level error if registration fails
      setError('root', {
        type: 'manual',
        message: result.message || 'Registration failed'
      });
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Create Account</h2>
          <p className="text-gray-600 mt-2">Join DSA Brother Bot today</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Name Field */}
          <FormField
            label="Full Name"
            name="name"
            type="text"
            placeholder="Enter your full name"
            icon={User}
            autoComplete="name"
            error={errors.name?.message}
            isValid={dirtyFields.name && !errors.name && watchedFields.name}
            showValidation={dirtyFields.name}
            register={register('name', {
              required: 'Name is required',
              minLength: {
                value: 2,
                message: 'Name must be at least 2 characters'
              },
              maxLength: {
                value: 50,
                message: 'Name cannot exceed 50 characters'
              },
              pattern: {
                value: /^[a-zA-Z\s]+$/,
                message: 'Name can only contain letters and spaces'
              }
            })}
          />

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
            placeholder="Create a password"
            icon={Lock}
            autoComplete="new-password"
            error={errors.password?.message}
            isValid={dirtyFields.password && !errors.password && watchedFields.password}
            showValidation={dirtyFields.password}
            register={register('password', {
              required: 'Password is required',
              minLength: {
                value: 6,
                message: 'Password must be at least 6 characters'
              },
              pattern: {
                value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                message: 'Password must contain at least one lowercase letter, one uppercase letter, and one number'
              }
            })}
          />

          {/* Confirm Password Field */}
          <FormField
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            placeholder="Confirm your password"
            icon={Lock}
            autoComplete="new-password"
            error={errors.confirmPassword?.message}
            isValid={dirtyFields.confirmPassword && !errors.confirmPassword && watchedFields.confirmPassword}
            showValidation={dirtyFields.confirmPassword}
            register={register('confirmPassword', {
              required: 'Please confirm your password',
              validate: value =>
                value === watchedFields.password || 'Passwords do not match'
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
            loadingText="Creating account..."
            disabled={!isValid}
            className="w-full"
            icon={UserPlus}
          >
            Create Account
          </LoadingButton>
        </form>

        {/* Switch to Login */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="font-medium text-blue-600 hover:text-blue-500 focus:outline-none focus:underline"
            >
              Sign in here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;