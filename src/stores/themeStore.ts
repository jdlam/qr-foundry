import { create } from 'zustand';

type Theme = 'light' | 'dark' | 'system';

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: () => 'light' | 'dark';
}

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme: Theme) {
  const resolved = theme === 'system' ? getSystemTheme() : theme;
  document.documentElement.setAttribute('data-theme', resolved);
}

function loadPersistedTheme(): Theme {
  try {
    const stored = localStorage.getItem('qr-foundry-theme');
    if (stored === 'light' || stored === 'dark' || stored === 'system') {
      return stored;
    }
  } catch {
    // localStorage not available
  }
  return 'dark';
}

const initialTheme = loadPersistedTheme();
applyTheme(initialTheme);

export const useThemeStore = create<ThemeState>((_, get) => ({
  theme: initialTheme,

  setTheme: (theme: Theme) => {
    applyTheme(theme);
    try {
      localStorage.setItem('qr-foundry-theme', theme);
    } catch {
      // localStorage not available
    }
    // Use Zustand's setState via the store
    useThemeStore.setState({ theme });
  },

  resolvedTheme: () => {
    const { theme } = get();
    return theme === 'system' ? getSystemTheme() : theme;
  },
}));

// Listen for system theme changes
if (typeof window !== 'undefined') {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    const { theme } = useThemeStore.getState();
    if (theme === 'system') {
      applyTheme('system');
    }
  });
}
