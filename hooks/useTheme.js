import { useEffect } from 'react';
import { useAppState } from './useAppState';

export function useTheme() {
  const { state, actions } = useAppState();

  useEffect(() => {
    // اعمال تم به document
    document.documentElement.setAttribute('data-theme', state.theme);
    
    if (state.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.theme]);

  const toggleTheme = () => {
    const newTheme = state.theme === 'light' ? 'dark' : 'light';
    actions.setTheme(newTheme);
  };

  const setTheme = (theme) => {
    actions.setTheme(theme);
  };

  return {
    theme: state.theme,
    toggleTheme,
    setTheme,
    isDark: state.theme === 'dark'
  };
}
