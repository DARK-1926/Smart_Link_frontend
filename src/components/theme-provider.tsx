'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { Moon, Sun, Sparkles } from 'lucide-react';

type Theme = 'dark' | 'light';

interface ThemeContextValue {
  theme: Theme;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark');
  const applyTheme = (next: Theme) => {
    const root = document.documentElement;
    root.classList.toggle('theme-light', next === 'light');
    root.classList.toggle('theme-dark', next === 'dark');
    root.style.setProperty('color-scheme', next === 'light' ? 'light' : 'dark');
  };

  useEffect(() => {
    const stored = (typeof window !== 'undefined' && localStorage.getItem('theme')) as Theme | null;
    const prefersDark = typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initial = stored || (prefersDark ? 'dark' : 'light');
    setTheme(initial);
    applyTheme(initial);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('theme', theme);
    applyTheme(theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggle: () => setTheme((t) => (t === 'dark' ? 'light' : 'dark')) }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
}

export function ThemeToggle({ subtle = false }: { subtle?: boolean }) {
  const { theme, toggle } = useTheme();
  const isLight = theme === 'light';

  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      className={`theme-toggle ${subtle ? 'theme-toggle--ghost' : ''}`}
    >
      <span className="theme-toggle__icon">
        {isLight ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
      </span>
      <span className="theme-toggle__label">
        {isLight ? 'Night' : 'Day'}
        <Sparkles className="w-3 h-3 shrink-0" />
      </span>
      <span className="theme-toggle__glow" />
    </button>
  );
}
