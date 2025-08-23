// QuizMaster Professional Theme Hook
// React hook for applying the professional theme configuration

import { useState, useEffect, createContext, useContext } from 'react';

// Theme Context
const ThemeContext = createContext();

// CSS Custom Properties Generator
export const generateThemeCSS = (themeData) => {
  const cssVars = [];
  
  const processTokens = (tokens, prefix = '') => {
    Object.entries(tokens).forEach(([key, value]) => {
      if (value && typeof value === 'object' && value.$value !== undefined) {
        // This is a design token
        const cssVarName = `--${prefix}${key}`.replace(/([A-Z])/g, '-$1').toLowerCase();
        cssVars.push(`${cssVarName}: ${value.$value};`);
      } else if (value && typeof value === 'object' && !Array.isArray(value)) {
        // This is a nested object, recurse
        const newPrefix = prefix ? `${prefix}-${key}` : `${key}-`;
        processTokens(value, newPrefix);
      }
    });
  };

  // Process theme sections
  if (themeData.global) processTokens(themeData.global, '');
  if (themeData.semantic) processTokens(themeData.semantic, 'semantic-');
  if (themeData.components) processTokens(themeData.components, 'component-');

  return `:root {\n  ${cssVars.join('\n  ')}\n}`;
};

// Professional Theme Provider Component
export const ProfessionalThemeProvider = ({ children, themeConfig }) => {
  const [currentTheme, setCurrentTheme] = useState('light');
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Apply theme CSS variables to document
    const styleElement = document.createElement('style');
    styleElement.id = 'quizmaster-theme';
    
    if (themeConfig) {
      const cssVariables = generateThemeCSS(themeConfig);
      styleElement.textContent = cssVariables;
    }
    
    // Remove existing theme styles
    const existingStyle = document.getElementById('quizmaster-theme');
    if (existingStyle) {
      existingStyle.remove();
    }
    
    // Add new theme styles
    document.head.appendChild(styleElement);
    
    return () => {
      const element = document.getElementById('quizmaster-theme');
      if (element) element.remove();
    };
  }, [themeConfig, currentTheme]);

  const toggleTheme = () => {
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setCurrentTheme(newTheme);
    setIsDark(newTheme === 'dark');
    
    // Update document class for theme switching
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const themeValue = {
    currentTheme,
    isDark,
    toggleTheme,
    setTheme: (theme) => {
      setCurrentTheme(theme);
      setIsDark(theme === 'dark');
      document.documentElement.classList.toggle('dark', theme === 'dark');
    }
  };

  return (
    <ThemeContext.Provider value={themeValue}>
      {children}
    </ThemeContext.Provider>
  );
};

// Hook to use theme
export const useProfessionalTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useProfessionalTheme must be used within ProfessionalThemeProvider');
  }
  return context;
};

// Professional theme class generator
export const getThemeClasses = (isDark = false) => ({
  // Background classes
  bgPrimary: isDark 
    ? 'bg-gradient-to-br from-gray-900 via-blue-900/10 to-purple-900/10' 
    : 'bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/15',
  
  bgSecondary: isDark ? 'bg-gray-800/50' : 'bg-white',
  
  bgCard: isDark 
    ? 'bg-gradient-to-br from-gray-800/80 to-gray-900/80 border-gray-700/50' 
    : 'bg-white/95 border-slate-200/60',

  // Text classes
  textPrimary: isDark ? 'text-white' : 'text-slate-800',
  textSecondary: isDark ? 'text-gray-300' : 'text-slate-600',
  textTertiary: isDark ? 'text-gray-400' : 'text-slate-500',
  
  // Border classes
  borderPrimary: isDark ? 'border-gray-700/50' : 'border-slate-200/60',
  borderSecondary: isDark ? 'border-gray-600/50' : 'border-slate-300/60',
  
  // Button classes
  btnPrimary: isDark 
    ? 'bg-gradient-to-r from-blue-600 via-blue-700 to-purple-600 hover:from-blue-700 hover:via-blue-800 hover:to-purple-700 text-white'
    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white',
  
  btnSecondary: isDark 
    ? 'bg-gray-700 hover:bg-gray-600 text-gray-200 border-gray-600'
    : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300 hover:border-slate-400',
  
  // Shadow classes
  shadowSm: isDark ? 'shadow-blue-500/10' : 'shadow-slate-300/20',
  shadowMd: isDark ? 'shadow-blue-500/20' : 'shadow-slate-300/30',
  shadowLg: isDark ? 'shadow-blue-500/25' : 'shadow-slate-400/30',

  // Input classes
  inputDefault: isDark
    ? 'bg-gray-800/60 border-gray-700/50 text-gray-200 placeholder-gray-400'
    : 'bg-white border-slate-300/60 text-slate-700 placeholder-slate-500',
  
  inputFocus: isDark
    ? 'focus:border-blue-500/50 focus:ring-blue-500/20'
    : 'focus:border-blue-400/60 focus:ring-blue-400/20',

  // Modal classes
  modalOverlay: 'bg-black/40 backdrop-blur-sm',
  modalContent: isDark 
    ? 'bg-gray-800 border-gray-700' 
    : 'bg-white border-slate-200',

  // Navigation classes
  navBackground: isDark ? 'bg-gray-900/95' : 'bg-white/95',
  navBorder: isDark ? 'border-gray-800' : 'border-slate-200',
  navLink: isDark 
    ? 'text-gray-300 hover:text-blue-400' 
    : 'text-slate-600 hover:text-blue-600',

  // Feature card classes
  featureCard: isDark 
    ? 'bg-gray-800/50 border-gray-700/50 hover:border-blue-500/50 hover:shadow-blue-500/20'
    : 'bg-white border-slate-200/60 hover:border-blue-300/60 hover:shadow-blue-300/20',

  // Icon background classes
  iconBgBlue: isDark 
    ? 'bg-blue-500/20 text-blue-400' 
    : 'bg-blue-50 text-blue-600',
  
  iconBgPurple: isDark 
    ? 'bg-purple-500/20 text-purple-400' 
    : 'bg-purple-50 text-purple-600',
  
  iconBgGreen: isDark 
    ? 'bg-emerald-500/20 text-emerald-400' 
    : 'bg-emerald-50 text-emerald-600',

  // Trust badge classes
  trustBadge: isDark 
    ? 'bg-gray-800/50 border-gray-700/50' 
    : 'bg-white border-slate-200/60 shadow-sm',

  // Progress bar classes
  progressBg: isDark ? 'bg-gray-700' : 'bg-slate-200',
  progressFill: 'bg-gradient-to-r from-blue-500 to-indigo-500',

  // Floating element classes
  floatingElement: isDark 
    ? 'bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/30' 
    : 'bg-white border-blue-200/60 shadow-blue-200/30',
});

// Professional color palette
export const professionalColors = {
  light: {
    primary: {
      50: '#eff6ff',
      100: '#dbeafe', 
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a'
    },
    secondary: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a'
    },
    success: {
      50: '#ecfdf5',
      100: '#d1fae5',
      500: '#10b981',
      600: '#059669'
    },
    warning: {
      50: '#fffbeb',
      100: '#fef3c7',
      500: '#f59e0b',
      600: '#d97706'
    },
    error: {
      50: '#fef2f2',
      100: '#fee2e2',
      500: '#ef4444',
      600: '#dc2626'
    }
  }
};

// Export default theme configuration object
export const defaultThemeConfig = {
  name: 'QuizMaster Professional',
  version: '1.0.0',
  type: 'light',
  tokens: {
    colors: professionalColors.light,
    spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '3rem',
      '2xl': '6rem'
    },
    borderRadius: {
      sm: '0.125rem',
      md: '0.375rem',
      lg: '0.5rem',
      xl: '0.75rem',
      '2xl': '1rem',
      '3xl': '1.5rem',
      full: '9999px'
    },
    shadows: {
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
    },
    typography: {
      fontFamilies: {
        primary: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        heading: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif']
      },
      fontSizes: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
        '5xl': '3rem'
      },
      fontWeights: {
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700
      }
    }
  }
};