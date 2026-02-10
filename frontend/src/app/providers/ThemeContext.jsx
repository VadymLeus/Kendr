// frontend/src/app/providers/ThemeContext.jsx
import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { AuthContext } from './AuthContext';
import apiClient from '../../shared/api/api';

export const ThemeContext = createContext(null);
export const ThemeProvider = ({ children }) => {
    const { user, updateUser, isLoading } = useContext(AuthContext);
    const DEFAULT_MODE = 'system';
    const DEFAULT_ACCENT = 'blue';
    const getSystemTheme = () => 
        window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const [detectedSystemMode, setDetectedSystemMode] = useState(getSystemTheme);
    const [platformMode, setPlatformModeState] = useState(() => {
        return localStorage.getItem('themeMode') || DEFAULT_MODE;
    });
    const [platformAccent, setPlatformAccentState] = useState(() => {
        return localStorage.getItem('themeAccent') || DEFAULT_ACCENT;
    });
    const [siteMode, setSiteMode] = useState('light');
    const [siteAccent, setSiteAccent] = useState('orange');
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handler = (e) => {
            setDetectedSystemMode(e.matches ? 'dark' : 'light');
        };
        mediaQuery.addEventListener('change', handler);
        return () => mediaQuery.removeEventListener('change', handler);
    }, []);
    useEffect(() => {
        if (isLoading) return;
        if (user) {
            if (user.platform_theme_mode && user.platform_theme_mode !== platformMode) {
                setPlatformModeState(user.platform_theme_mode);
                localStorage.setItem('themeMode', user.platform_theme_mode);
            }
            if (user.platform_theme_accent && user.platform_theme_accent !== platformAccent) {
                setPlatformAccentState(user.platform_theme_accent);
                localStorage.setItem('themeAccent', user.platform_theme_accent);
            }
        } else {
            setPlatformModeState(DEFAULT_MODE);
            setPlatformAccentState(DEFAULT_ACCENT);
            localStorage.removeItem('themeMode');
            localStorage.removeItem('themeAccent');
        }
    }, [user, isLoading]); 
    useEffect(() => {
        const effectiveMode = platformMode === 'system' ? detectedSystemMode : platformMode;
        document.body.dataset.platformMode = effectiveMode;
        document.body.dataset.platformAccent = platformAccent;
        if (platformMode !== DEFAULT_MODE) localStorage.setItem('themeMode', platformMode);
        if (platformAccent !== DEFAULT_ACCENT) localStorage.setItem('themeAccent', platformAccent);

    }, [platformMode, platformAccent, detectedSystemMode]);

    const setPlatformMode = useCallback(async (mode) => {
        setPlatformModeState(mode);
        if (user) {
            updateUser({ ...user, platform_theme_mode: mode });
            try {
                await apiClient.put('/users/profile', { platform_theme_mode: mode });
            } catch (error) {
                console.error("Theme save error:", error);
            }
        } else {
            localStorage.setItem('themeMode', mode);
        }
    }, [user, updateUser]);

    const setPlatformAccent = useCallback(async (accent) => {
        setPlatformAccentState(accent);
        if (user) {
            updateUser({ ...user, platform_theme_accent: accent });
            try {
                await apiClient.put('/users/profile', { platform_theme_accent: accent });
            } catch (error) {
                console.error("Accent save error:", error);
            }
        } else {
            localStorage.setItem('themeAccent', accent);
        }
    }, [user, updateUser]);

    return (
        <ThemeContext.Provider value={{
            platformMode,
            platformAccent,
            siteMode,
            siteAccent,
            setPlatformMode,
            setPlatformAccent,
            setSiteMode,
            setSiteAccent,
            detectedSystemMode
        }}>
            {children}
        </ThemeContext.Provider>
    );
};