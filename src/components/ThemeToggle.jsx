import { FaSun, FaMoon } from 'react-icons/fa';
import { useTheme } from '../hooks/useTheme';

const ThemeToggle = ({ className = "" }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`relative inline-flex items-center justify-center p-2 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 border border-slate-300 dark:border-slate-600 shadow-sm dark:shadow-lg dark:shadow-2xl dark:shadow-black/25 hover:shadow-md dark:hover:shadow-xl transition-all duration-200 ease-out ${className}`}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      <div className="relative w-5 h-5">
        {theme === 'dark' ? (
          <FaSun className="w-5 h-5 text-yellow-400 animate-pulse drop-shadow-sm dark:shadow-black/25" />
        ) : (
          <FaMoon className="w-5 h-5 text-slate-600 dark:text-slate-300 drop-shadow-sm dark:shadow-black/25" />
        )}
      </div>
    </button>
  );
};

export default ThemeToggle;
