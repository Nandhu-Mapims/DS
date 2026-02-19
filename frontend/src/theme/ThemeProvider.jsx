import { createContext, useContext, useCallback, useMemo, useState, useEffect } from 'react';

const THEME_STORAGE_KEY = 'ds-workflow-theme';
const THEME_LIGHT = 'light';
const THEME_DARK = 'dark';

const ThemeContext = createContext(null);

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return ctx;
}

function readStoredTheme() {
  return THEME_LIGHT; /* Light theme only; dark switch removed */
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => readStoredTheme());

  useEffect(() => {
    applyTheme(theme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch (_) {}
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === THEME_LIGHT ? THEME_DARK : THEME_LIGHT));
  }, []);

  const setTheme = useCallback((value) => {
    if (value === THEME_LIGHT || value === THEME_DARK) {
      setThemeState(value);
    }
  }, []);

  const value = useMemo(
    () => ({
      theme,
      isDark: theme === THEME_DARK,
      toggleTheme,
      setTheme,
    }),
    [theme, toggleTheme, setTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
