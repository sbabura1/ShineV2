import { useCallback, useEffect, useState } from 'react';

export const THEME_STORAGE_KEY = 'scalaris:theme';
const themes = new Set(['light', 'dark']);

export function getSystemTheme() {
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function getStoredTheme() {
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    return themes.has(stored) ? stored : null;
  } catch {
    return null;
  }
}

export function resolveTheme() {
  return getStoredTheme() || getSystemTheme();
}

export function applyTheme(theme) {
  const nextTheme = themes.has(theme) ? theme : getSystemTheme();
  document.documentElement.dataset.theme = nextTheme;
  document.documentElement.style.colorScheme = nextTheme;
  const pageBackground = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim();
  if (pageBackground) document.querySelector('meta[name="theme-color"]')?.setAttribute('content', pageBackground);
  return nextTheme;
}

export function useTheme() {
  const [theme, setThemeState] = useState(resolveTheme);

  const setTheme = useCallback((nextTheme) => {
    const resolved = applyTheme(nextTheme);
    try { window.localStorage.setItem(THEME_STORAGE_KEY, resolved); } catch { /* storage can be unavailable */ }
    setThemeState(resolved);
  }, []);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    const media = window.matchMedia?.('(prefers-color-scheme: dark)');
    if (!media) return undefined;
    const handleChange = (event) => {
      if (getStoredTheme()) return;
      const nextTheme = event.matches ? 'dark' : 'light';
      applyTheme(nextTheme);
      setThemeState(nextTheme);
    };
    media.addEventListener?.('change', handleChange);
    return () => media.removeEventListener?.('change', handleChange);
  }, []);

  const toggleTheme = useCallback(() => setTheme(theme === 'dark' ? 'light' : 'dark'), [setTheme, theme]);
  return { theme, setTheme, toggleTheme };
}
