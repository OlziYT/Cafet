import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark';

interface ThemeStore {
  theme: Theme;
  userPreference: Theme | 'system';
  toggleTheme: () => void;
  setTheme: (theme: Theme | 'system') => void;
}

const getSystemTheme = (): Theme => {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      theme: getSystemTheme(),
      userPreference: 'system',
      toggleTheme: () => 
        set((state) => {
          const newPreference = state.userPreference === 'system' 
            ? getSystemTheme() === 'light' ? 'dark' : 'light'
            : state.userPreference === 'light' ? 'dark' : 'light';
          
          return { 
            theme: newPreference,
            userPreference: newPreference
          };
        }),
      setTheme: (preference) => 
        set(() => ({ 
          theme: preference === 'system' ? getSystemTheme() : preference,
          userPreference: preference
        })),
    }),
    {
      name: 'theme-storage',
    }
  )
);

// Écouter les changements de thème système
if (typeof window !== 'undefined') {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    const store = useThemeStore.getState();
    if (store.userPreference === 'system') {
      store.setTheme('system');
    }
  });
}