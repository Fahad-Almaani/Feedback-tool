import React, { createContext, useContext, useState, useEffect } from 'react';

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
            const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';
            const response = await fetch(`${backendUrl}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
                credentials: 'include', // Include cookies if needed
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Network error or server unavailable' }));
                throw new Error(errorData.message || 'Login failed');
            }

            const data = await response.json();

            // Store token and user data
            localStorage.setItem('jwt_token', data.token);
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

            // Handle specific CORS errors
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                return {
                    success: false,
                    error: 'Unable to connect to server. Please check if the backend is running and CORS is configured properly.'
                };
            }

            return { success: false, error: error.message };
        }
    };

    const logout = () => {
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('user_data');
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