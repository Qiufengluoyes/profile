import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MoonIcon, SunIcon, ComputerDesktopIcon } from '@heroicons/react/24/outline';

interface ThemeToggleProps {
  className?: string;
}

type ThemeMode = 'system' | 'light' | 'dark';

const ThemeToggle = ({ className = '' }: ThemeToggleProps) => {
  const getInitialMode = (): ThemeMode => {
    const savedMode = localStorage.getItem('theme-mode');
    if (savedMode === 'system' || savedMode === 'light' || savedMode === 'dark') {
      return savedMode;
    }
    const legacyUserSet = localStorage.getItem('theme-user-set') === '1';
    const legacyTheme = localStorage.getItem('theme');
    if (legacyUserSet && (legacyTheme === 'dark' || legacyTheme === 'light')) {
      return legacyTheme;
    }
    return 'system';
  };

  const getSystemPrefersDark = () => window.matchMedia('(prefers-color-scheme: dark)').matches;

  const [mode, setMode] = useState<ThemeMode>(getInitialMode);
  const [systemDark, setSystemDark] = useState(getSystemPrefersDark);

  const isDark = mode === 'dark' || (mode === 'system' && systemDark);

  // 切换主题：系统 -> 亮色 -> 暗色 -> 系统
  const toggleTheme = () => {
    const nextMode: ThemeMode =
      mode === 'system' ? 'light' : mode === 'light' ? 'dark' : 'system';
    setMode(nextMode);
  };

  // 每当主题改变时，更新文档类和本地存储
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    localStorage.setItem('theme-mode', mode);

    if (mode === 'system') {
      localStorage.removeItem('theme-user-set');
      localStorage.removeItem('theme');
    } else {
      localStorage.setItem('theme-user-set', '1');
      localStorage.setItem('theme', mode);
    }
  }, [isDark, mode]);

  // 监听系统主题变化
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemDark(e.matches);
    };

    // 添加事件监听
    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
    // Safari / old browsers fallback
    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, []);

  return (
    <button
      onClick={toggleTheme}
      className={`theme-toggle-btn ${className}`}
      aria-label={
        mode === 'system'
          ? 'Theme: System'
          : mode === 'light'
            ? 'Theme: Light'
            : 'Theme: Dark'
      }
      title={
        mode === 'system'
          ? 'Theme: System'
          : mode === 'light'
            ? 'Theme: Light'
            : 'Theme: Dark'
      }
    >
      <motion.div
        initial={false}
        animate={{ rotate: mode === 'dark' ? 180 : 0 }}
        transition={{ type: 'spring', stiffness: 220, damping: 20 }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <AnimatePresence mode="wait" initial={false}>
          {mode === 'system' ? (
            <motion.span
              key="system"
              initial={{ opacity: 0, scale: 0.9, y: 2 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -2 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="flex items-center justify-center"
            >
              <ComputerDesktopIcon className="w-5 h-5 text-gray-400 dark:text-gray-300" />
            </motion.span>
          ) : mode === 'dark' ? (
            <motion.span
              key="dark"
              initial={{ opacity: 0, scale: 0.9, y: 2 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -2 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="flex items-center justify-center"
            >
              <MoonIcon className="w-5 h-5 text-blue-100" />
            </motion.span>
          ) : (
            <motion.span
              key="light"
              initial={{ opacity: 0, scale: 0.9, y: 2 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -2 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="flex items-center justify-center"
            >
              <SunIcon className="w-5 h-5 text-amber-400" />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
    </button>
  );
};

export default ThemeToggle; 
