import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../utils/apiClient';

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
            // Use the new apiClient for login
            const data = await apiClient.post('/auth/login', { email, password });

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

            return { success: true, user: data };
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: error.message };
        }
    };

    const register = async (name, email, password) => {
        try {
            // Use the new apiClient for registration
            const data = await apiClient.post('/users/create', { name, email, password });

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

            return { success: true, user: data };
        } catch (error) {
            console.error('Registration error:', error);
            return { success: false, error: error.message };
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