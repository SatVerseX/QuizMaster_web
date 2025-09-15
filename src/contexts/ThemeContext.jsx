import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    // Check localStorage first
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    // Default to light theme instead of system preference
    return false;
  });

  // Clear any existing dark theme preference on first load for new users
  useEffect(() => {
    const hasVisitedBefore = localStorage.getItem('hasVisitedBefore');
    if (!hasVisitedBefore) {
      // This is a new user, ensure light theme
      localStorage.setItem('hasVisitedBefore', 'true');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }

    // Add transition class after theme change to enable smooth transitions
    setTimeout(() => {
      root.classList.add('theme-transition');
    }, 100);
    
    // Add CSS to head if it doesn't exist
    if (!document.getElementById('theme-transitions')) {
      const style = document.createElement('style');
      style.id = 'theme-transitions';
      style.textContent = `
        .theme-transition * {
          transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease, fill 0.3s ease !important;
        }
      `;
      document.head.appendChild(style);
    }
  }, [isDark]);

  // Toggle theme
  const toggleTheme = useCallback(() => {
    setIsDark(prev => !prev);
  }, []);

  // Explicitly set theme
  const setLightMode = useCallback(() => setIsDark(false), []);
  const setDarkMode = useCallback(() => setIsDark(true), []);
  
  // Reset to system preference
  const resetTheme = useCallback(() => {
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDark(systemPrefersDark);
  }, []);

  const value = useMemo(() => ({
    isDark,
    toggleTheme,
    setLightMode,
    setDarkMode,
    resetTheme,
    theme: isDark ? 'dark' : 'light'
  }), [isDark, toggleTheme, setLightMode, setDarkMode, resetTheme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
