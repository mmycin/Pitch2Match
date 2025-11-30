import { create } from 'zustand';

interface ThemeState {
  isDark: boolean;
  toggleTheme: () => void;
}

/**
 * Zustand store for theme (dark/light mode)
 */
export const useThemeStore = create<ThemeState>((set, get) => ({
  isDark: false,

  toggleTheme: () => {
    const newIsDark = !get().isDark;
    
    if (typeof window !== 'undefined') {
      const html = document.documentElement;
      
      if (newIsDark) {
        html.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        html.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
    }
    
    set({ isDark: newIsDark });
  },
}));
