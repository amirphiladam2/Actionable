import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const ThemeContext = createContext({
  theme: 'light',
  colors: {
    background: '#F8F9FA',
    surface: '#FFFFFF',
    border: '#E9ECEF',
    text: '#0f172a',
    muted: '#64748b',
    primary: '#06b6d4',
    accent: '#0891b2',
  },
  toggleTheme: () => {},
});

const lightColors = {
  background: '#F8F9FA',
  surface: '#FFFFFF',
  border: '#E9ECEF',
  text: '#0f172a',
  muted: '#64748b',
  primary: '#06b6d4',
  accent: '#0891b2',
};

const darkColors = {
  background: '#0b1020',
  surface: '#12172a',
  border: '#1f273f',
  text: '#e5e7eb',
  muted: '#9aa3b2',
  primary: '#06b6d4',
  accent: '#22d3ee',
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
    colors: theme === 'light' ? lightColors : darkColors,
    toggleTheme,
  }), [theme, toggleTheme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}


