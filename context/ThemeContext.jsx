import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';

export const ThemeContext = createContext({
  theme: 'light',
  isDarkMode: false,
  colors: {
    background: '#F8F9FA',
    surface: '#FFFFFF',
    border: '#E9ECEF',
    text: '#0f172a',
    textSecondary: '#64748b',
    muted: '#64748b',
    primary: '#06b6d4',
    accent: '#0891b2',
    error: '#ef4444',
    success: '#10b981',
    warning: '#f59e0b',
  },
  toggleTheme: () => {},
});

const lightColors = {
  background: '#F8F9FA',
  surface: '#FFFFFF',
  border: '#E9ECEF',
  text: '#0f172a',
  textSecondary: '#64748b',
  muted: '#64748b',
  primary: '#06b6d4',
  accent: '#0891b2',
  error: '#ef4444',
  success: '#10b981',
  warning: '#f59e0b',
};

const darkColors = {
  background: '#0b1020',
  surface: '#12172a',
  border: '#1f273f',
  text: '#e5e7eb',
  textSecondary: '#9aa3b2',
  muted: '#9aa3b2',
  primary: '#06b6d4',
  accent: '#22d3ee',
  error: '#ef4444',
  success: '#10b981',
  warning: '#f59e0b',
};

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    AsyncStorage.getItem('app_theme').then((value) => {
      if (value === 'dark' || value === 'light') setTheme(value);
    });
  }, []);

  const toggleTheme = useCallback(async () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    await AsyncStorage.setItem('app_theme', next);
  }, [theme]);

  const value = useMemo(() => ({
    theme,
    isDarkMode: theme === 'dark',
    colors: theme === 'light' ? lightColors : darkColors,
    toggleTheme,
  }), [theme, toggleTheme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}


