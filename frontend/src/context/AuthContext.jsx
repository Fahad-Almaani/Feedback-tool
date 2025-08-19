import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient, errorHandler } from '../utils/apiClient';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Initialize auth state from localStorage
    useEffect(() => {
        const token = localStorage.getItem('jwt_token');
        const userData = localStorage.getItem('user_data');

        if (token && userData) {
            try {
                const parsedUser = JSON.parse(userData);
                setUser({
                    ...parsedUser,
                    token
                });
            } catch (error) {
                console.error('Error parsing user data:', error);
                // Clear invalid data
                localStorage.removeItem('jwt_token');
                localStorage.removeItem('user_data');
            }
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            // Use the enhanced apiClient for login
            const response = await apiClient.post('/auth/login', { email, password });

            // The apiClient now automatically extracts data from the new API response structure
            const data = apiClient.extractData(response);
            const metadata = apiClient.getResponseMetadata(response);

            // Log success message if available
            if (metadata?.message) {
                console.log('Login response:', metadata.message);
            }

            // Store token and user data
            apiClient.auth.setToken(data.token);
            localStorage.setItem('user_data', JSON.stringify({
                userId: data.userId,
                email: data.email,
                name: data.name,
                role: data.role
            }));

            // Update state
            setUser({
                userId: data.userId,
                email: data.email,
                name: data.name,
                role: data.role,
                token: data.token
            });

            return {
                success: true,
                user: data,
                message: metadata?.message || 'Login successful'
            };
        } catch (error) {
            console.error('Login error:', error);

            // Use enhanced error handling
            const errorDetails = apiClient.getErrorDetails(error);

            return {
                success: false,
                error: errorDetails.message,
                errors: errorDetails.errors
            };
        }
    };

    const register = async (name, email, password) => {
        try {
            // Use the enhanced apiClient for registration
            const response = await apiClient.post('/users/create', { name, email, password });

            // Extract data using the new API response structure
            const data = apiClient.extractData(response);
            const metadata = apiClient.getResponseMetadata(response);

            // Log success message if available
            if (metadata?.message) {
                console.log('Registration response:', metadata.message);
            }

            // Store token and user data
            apiClient.auth.setToken(data.token);
            localStorage.setItem('user_data', JSON.stringify({
                userId: data.userId,
                email: data.email,
                name: data.name,
                role: data.role
            }));

            // Update state
            setUser({
                userId: data.userId,
                email: data.email,
                name: data.name,
                role: data.role,
                token: data.token
            });

            return {
                success: true,
                user: data,
                message: metadata?.message || 'Registration successful'
            };
        } catch (error) {
            console.error('Registration error:', error);

            // Use enhanced error handling
            const errorDetails = apiClient.getErrorDetails(error);

            return {
                success: false,
                error: errorDetails.message,
                errors: errorDetails.errors
            };
        }
    };

    const logout = () => {
        apiClient.auth.removeToken();
        setUser(null);
    };

    const isAuthenticated = () => {
        return user && user.token;
    };

    const hasRole = (requiredRole) => {
        return user && user.role === requiredRole;
    };

    const isAdmin = () => {
        return hasRole('ADMIN');
    };

    const isUser = () => {
        return hasRole('USER');
    };

    const value = {
        user,
        login,
        register,
        logout,
        isAuthenticated,
        hasRole,
        isAdmin,
        isUser,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};