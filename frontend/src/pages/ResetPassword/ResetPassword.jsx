import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useApiForm } from '../../hooks/useApi';
import { AuthService } from '../../services/apiServices';
import LoadingSpinner from '../../components/LoadingSpinner';

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();

    const [tokenValid, setTokenValid] = useState(null);
    const [validatingToken, setValidatingToken] = useState(true);
    const [isSuccess, setIsSuccess] = useState(false);

    const {
        values,
        errors,
        submitting,
        setValue,
        submit,
        generalError,
        setError
    } = useApiForm(
        (data) => AuthService.resetPassword(token, data.password),
        {
            initialValues: {
                password: '',
                confirmPassword: ''
            },
            onSuccess: (result) => {
                setIsSuccess(true);
                // Redirect to login after 3 seconds
                setTimeout(() => {
                    navigate('/login', {
                        state: {
                            message: 'Password has been reset successfully. Please log in with your new password.'
                        }
                    });
                }, 3000);
            },
            onError: (error, details) => {
                console.error('Password reset error:', details);
            }
        }
    );

    // Validate token on mount
    useEffect(() => {
        const validateToken = async () => {
            if (!token) {
                setTokenValid(false);
                setValidatingToken(false);
                return;
            }

            try {
                await AuthService.validateResetToken(token);
                setTokenValid(true);
            } catch (error) {
                setTokenValid(false);
            } finally {
                setValidatingToken(false);
            }
        };

        validateToken();
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Clear previous errors
        setError('password', null);
        setError('confirmPassword', null);

        // Validate passwords
        let hasErrors = false;

        if (!values.password) {
            setError('password', 'Password is required');
            hasErrors = true;
        } else if (values.password.length < 6) {
            setError('password', 'Password must be at least 6 characters');
            hasErrors = true;
        }

        if (!values.confirmPassword) {
            setError('confirmPassword', 'Please confirm your password');
            hasErrors = true;
        } else if (values.password !== values.confirmPassword) {
            setError('confirmPassword', 'Passwords do not match');
            hasErrors = true;
        }

        if (hasErrors) {
            return;
        }

        try {
            await submit();
        } catch (error) {
            // Error is handled by the form hook
        }
    };

    const handlePasswordChange = (e) => {
        setValue('password', e.target.value);
        if (errors.password) {
            setError('password', null);
        }
    };

    const handleConfirmPasswordChange = (e) => {
        setValue('confirmPassword', e.target.value);
        if (errors.confirmPassword) {
            setError('confirmPassword', null);
        }
    };

    // Loading state while validating token
    if (validatingToken) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8 text-center">
                    <LoadingSpinner size="lg" />
                    <p className="text-gray-600">Validating reset link...</p>
                </div>
            </div>
        );
    }

    // Invalid token state
    if (!tokenValid) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8">
                    <div className="text-center">
                        <div className="mx-auto h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
                            <svg className="h-8 w-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
                            Invalid Reset Link
                        </h2>
                        <p className="text-gray-600 mb-6">
                            This password reset link is invalid or has expired.
                        </p>
                        <div className="space-y-4">
                            <Link
                                to="/forgot-password"
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Request New Reset Link
                            </Link>
                            <div>
                                <Link
                                    to="/login"
                                    className="font-medium text-indigo-600 hover:text-indigo-500"
                                >
                                    ← Back to Login
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Success state
    if (isSuccess) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8">
                    <div className="text-center">
                        <div className="mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                            <svg className="h-8 w-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
                            Password Reset Successfully
                        </h2>
                        <p className="text-gray-600 mb-6">
                            Your password has been updated. You will be redirected to the login page shortly.
                        </p>
                        <div className="pt-4">
                            <Link
                                to="/login"
                                className="font-medium text-indigo-600 hover:text-indigo-500"
                            >
                                Continue to Login →
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Reset password form
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Set new password
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Please enter your new password below.
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {/* General Error Message */}
                    {generalError && (
                        <div className="rounded-md bg-red-50 p-4">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-red-800">{generalError}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="space-y-4">
                        {/* New Password */}
                        <div>
                            <label htmlFor="password" className="sr-only">
                                New Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="new-password"
                                required
                                value={values.password}
                                onChange={handlePasswordChange}
                                disabled={submitting}
                                className={`relative block w-full px-3 py-2 border placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:z-10 sm:text-sm ${errors.password
                                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                        : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                                    } ${submitting ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                placeholder="New password (min. 6 characters)"
                            />
                            {errors.password && (
                                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label htmlFor="confirmPassword" className="sr-only">
                                Confirm Password
                            </label>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                autoComplete="new-password"
                                required
                                value={values.confirmPassword}
                                onChange={handleConfirmPasswordChange}
                                disabled={submitting}
                                className={`relative block w-full px-3 py-2 border placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:z-10 sm:text-sm ${errors.confirmPassword
                                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                        : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                                    } ${submitting ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                placeholder="Confirm new password"
                            />
                            {errors.confirmPassword && (
                                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                            )}
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={submitting || !values.password || !values.confirmPassword}
                            className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${submitting || !values.password || !values.confirmPassword
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-indigo-600 hover:bg-indigo-700'
                                }`}
                        >
                            {submitting ? (
                                <div className="flex items-center">
                                    <LoadingSpinner size="sm" />
                                    <span className="ml-2">Updating Password...</span>
                                </div>
                            ) : (
                                'Update Password'
                            )}
                        </button>
                    </div>

                    <div className="text-center">
                        <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                            ← Back to Login
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;