import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const ThemeModeContext = createContext();

const STORAGE_KEY = 'themeMode';

export const ThemeModeProvider = ({ children }) => {
    const [mode, setMode] = useState(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved === 'light' || saved === 'dark') return saved;
        return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    });

    useEffect(() => {
        const handleLogout = () => {
            localStorage.removeItem(STORAGE_KEY);
            setMode('light');
        };
        window.addEventListener('app:logout', handleLogout);
        return () => window.removeEventListener('app:logout', handleLogout);
    }, []);

    const toggleMode = () => {
        setMode((prev) => {
            const next = prev === 'light' ? 'dark' : 'light';
            localStorage.setItem(STORAGE_KEY, next);
            return next;
        });
    };

    const theme = useMemo(() => createTheme({
        palette: {
            mode,
            ...(mode === 'dark' && {
                background: {
                    default: '#0f1115',
                    paper: '#1a1d23',
                },
            }),
        },
    }), [mode]);

    return (
        <ThemeModeContext.Provider value={{ mode, toggleMode }}>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                {children}
            </ThemeProvider>
        </ThemeModeContext.Provider>
    );
};

export const useThemeMode = () => {
    const context = useContext(ThemeModeContext);
    if (!context) {
        throw new Error('useThemeMode must be used within a ThemeModeProvider');
    }
    return context;
};
