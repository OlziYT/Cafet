import { Moon, Sun } from 'lucide-react';
import { useThemeStore } from '../store/theme';

export function ThemeToggle() {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg text-marron-600 hover:text-marron-800 dark:text-marron-300 dark:hover:text-marron-100 hover:bg-marron-100 dark:hover:bg-marron-800/50 transition-colors"
      aria-label="Changer le thème"
    >
      {theme === 'light' ? (
        <Moon className="w-5 h-5" />
      ) : (
        <Sun className="w-5 h-5" />
      )}
    </button>
  );
}