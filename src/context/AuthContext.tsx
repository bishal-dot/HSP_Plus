'use client';
import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';

interface AuthContextType {
    authToken: string | null;
    username: string | null;
    consultantCode: number;
    isConsultant: boolean;
    login: (token: string, name: string, consultantCode: number) => void;
    logout: () => void;
    setAuthToken: (token: string | null) => void;
    setUsername: (name: string | null) => void;
    setConsultantCode: (code: number) => void;
    isLoading: boolean;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const safeLocalStorageGet = (key: string): string | null => {
    if (typeof window === 'undefined') return null;
    try {
        return window.localStorage.getItem(key);
    } catch (e) {
        console.warn(`localStorage access denied for key "${key}"`);
        return null;
    }
};

const safeLocalStorageSet = (key: string, value: string | null): void => {
    if (typeof window === 'undefined') return;
    try {
        if (value === null) {
            window.localStorage.removeItem(key);
        } else {
            window.localStorage.setItem(key, value);
        }
    } catch (e) {
        console.warn(`Failed to write to localStorage key "${key}"`);
    }
};

export const AuthTokenProvider = ({ children }: { children: ReactNode }) => {
    const initialAuthToken = safeLocalStorageGet('authToken');
    const initialUsername = safeLocalStorageGet('username');
    const initialConsultantCode = safeLocalStorageGet('consultantCode');
    
    const [authToken, setAuthTokenState] = useState(initialAuthToken);
    const [username, setUsernameState] = useState(initialUsername);
    const [consultantCode, setConsultantCodeState] = useState(
        initialConsultantCode ? parseInt(initialConsultantCode) : 0
    );
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'authToken') {
                const newAuthToken = e.newValue ?? null;
                setAuthTokenState(newAuthToken);
                if (newAuthToken === null) {
                    setUsernameState(null);
                    setConsultantCodeState(0);
                    safeLocalStorageSet('username', null);
                    safeLocalStorageSet('consultantCode', '0');
                }
            } else if (e.key === 'username') {
                setUsernameState(e.newValue ?? null);
            } else if (e.key === 'consultantCode') {
                setConsultantCodeState(e.newValue ? parseInt(e.newValue) : 0);
            }
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const login = (token: string, name: string, code: number) => {
        safeLocalStorageSet('authToken', token);
        safeLocalStorageSet('username', name);
        safeLocalStorageSet('consultantCode', code.toString());
        setAuthTokenState(token);
        setUsernameState(name);
        setConsultantCodeState(code);
    };

    const logout = () => {
        safeLocalStorageSet('authToken', null);
        safeLocalStorageSet('username', null);
        safeLocalStorageSet('consultantCode', null);
        setAuthTokenState(null);
        setUsernameState(null);
        setConsultantCodeState(0);
    };

    const setAuthToken = (token: string | null) => {
        safeLocalStorageSet('authToken', token);
        setAuthTokenState(token);
    };

    const setUsername = (name: string | null) => {
        safeLocalStorageSet('username', name);
        setUsernameState(name);
    };

    // FIXED: Add the missing function
    const setConsultantCode = (code: number) => {
        safeLocalStorageSet('consultantCode', code.toString());
        setConsultantCodeState(code);
    };

    const isAuthenticated = !!authToken && !!username;
    const isConsultant = consultantCode !== 0;

    const contextValue = useMemo(() => ({
        authToken,
        username,
        consultantCode,
        isConsultant,
        login,
        logout,
        setAuthToken,
        setUsername,
        setConsultantCode,
        isLoading,
        isAuthenticated,
    }), [authToken, username, consultantCode, isConsultant, isLoading, isAuthenticated]);

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuthToken = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuthToken must be used within an AuthTokenProvider');
    }
    return context;
};