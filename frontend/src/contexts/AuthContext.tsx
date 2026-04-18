import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../rental-v2/types/index';
import * as authService from '../services/authService';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (user: User, accessToken: string, refreshToken?: string) => boolean;
    logout: () => void;
    updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // Przywróć sesję z localStorage przy starcie
    useEffect(() => {
        const restoreSession = async () => {
            const token = localStorage.getItem('access_token');
            const storedUser = localStorage.getItem('user');

            if (token && storedUser) {
                try {
                    // Zweryfikuj token odpytując /auth/me
                    const freshUser = await authService.getMe();
                    setUser(freshUser);
                } catch {
                    // Token nieważny — wyczyść
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('user');
                }
            }
            setLoading(false);
        };

        restoreSession();
    }, []);

    const login = (userData: User, accessToken: string, _refreshToken?: string): boolean => {
        try {
            localStorage.setItem('access_token', accessToken);
            localStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);
            return true;
        } catch {
            return false;
        }
    };

    const logout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        setUser(null);
    };

    const updateUser = (updatedUser: User) => {
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
};
