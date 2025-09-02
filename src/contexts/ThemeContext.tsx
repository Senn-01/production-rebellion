/**
 * Theme Context Provider
 * 
 * Manages theme switching across the entire application.
 * Each "painting" (page) automatically sets its theme based on route.
 */

'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { themes, type ThemeName, generateThemeCSS } from '@/lib/design-tokens';

interface ThemeContextType {
  currentTheme: ThemeName;
  setTheme: (theme: ThemeName) => void;
  themeConfig: typeof themes[ThemeName];
  cssVariables: Record<string, string>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [currentTheme, setCurrentTheme] = useState<ThemeName>('tactical');

  // Auto-detect theme based on route
  useEffect(() => {
    console.log('[ThemeProvider] Route changed:', pathname);
    if (pathname.includes('/tactical-map')) {
      setCurrentTheme('tactical');
      console.log('[ThemeProvider] Setting theme: tactical');
    } else if (pathname.includes('/deep-focus')) {
      setCurrentTheme('focus');
      console.log('[ThemeProvider] Setting theme: focus');
    } else if (pathname.includes('/analytics')) {
      setCurrentTheme('analytics');
      console.log('[ThemeProvider] Setting theme: analytics');
    } else if (pathname.includes('/prime')) {
      setCurrentTheme('prime');
      console.log('[ThemeProvider] Setting theme: prime');
    }
  }, [pathname]);

  // Apply CSS variables to document root
  useEffect(() => {
    const cssVariables = generateThemeCSS(currentTheme);
    console.log('[ThemeProvider] Applying CSS variables for theme:', currentTheme, cssVariables);
    
    const root = document.documentElement;
    Object.entries(cssVariables).forEach(([property, value]) => {
      root.style.setProperty(property, value);
    });
  }, [currentTheme]);

  const themeConfig = themes[currentTheme];
  const cssVariables = generateThemeCSS(currentTheme);

  return (
    <ThemeContext.Provider value={{
      currentTheme,
      setTheme: setCurrentTheme,
      themeConfig,
      cssVariables
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}