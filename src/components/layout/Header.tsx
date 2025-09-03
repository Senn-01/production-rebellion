/**
 * Universal Header Component
 * 
 * Present on all pages with:
 * - Brand identity (left)
 * - Capture bar with CMD+K shortcut (center)
 * - Settings menu (right)
 * - Theme-aware styling
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';
import { CaptureBar } from './CaptureBar';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext';

export const Header: React.FC = () => {
  const pathname = usePathname();
  const { currentTheme } = useTheme();
  const [showCaptureBar, setShowCaptureBar] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Get button styling based on current theme
  const getButtonStyling = () => {
    switch (currentTheme) {
      case 'focus':
        return {
          brainDumpStyle: 'bg-[var(--theme-background)] text-[var(--theme-text-secondary)]', // Medium green bg, white text
          menuButtonStyle: 'bg-[var(--theme-background)]',
          menuIconColor: 'text-[var(--theme-text-secondary)]',
          headerTextColor: 'text-[var(--theme-text-secondary)]' // White text
        };
      case 'analytics':
        return {
          brainDumpStyle: 'bg-[var(--theme-accent)] text-black',
          menuButtonStyle: 'bg-[var(--theme-accent)]',
          menuIconColor: 'text-black',
          headerTextColor: 'text-black'
        };
      case 'prime':
        return {
          brainDumpStyle: 'bg-[var(--theme-accent)] text-black',
          menuButtonStyle: 'bg-[var(--theme-accent)]',
          menuIconColor: 'text-black',
          headerTextColor: 'text-black'
        };
      default: // tactical map
        return {
          brainDumpStyle: 'bg-black text-white',
          menuButtonStyle: 'bg-[#f7f7f5]', // Crayonage grey for map page
          menuIconColor: 'text-black',
          headerTextColor: 'text-black'
        };
    }
  };

  const buttonStyling = getButtonStyling();

  // CMD+K shortcut to open capture bar
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        setShowCaptureBar(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <header className="w-full border-b-4 border-black p-6 bg-[var(--theme-primary)]">
      <div className="flex items-center justify-between w-full px-8">
        {/* Left: Brand Identity */}
        <div className="flex-shrink-0">
          <h1 className={`text-3xl font-black uppercase tracking-wider ${buttonStyling.headerTextColor}`}>
            PRODUCTION REBELLION
          </h1>
        </div>
        
        {/* Center: CaptureBar (absolutely centered) */}
        <div className="absolute left-1/2 transform -translate-x-1/2">
          <CaptureBar 
            isOpen={showCaptureBar}
            onOpenChange={setShowCaptureBar}
            brainDumpStyle={buttonStyling.brainDumpStyle}
          />
        </div>

        {/* Right: Hotkey Text and Menu */}
        <div className="flex items-center gap-6 flex-shrink-0">
          <div className={`text-base font-bold uppercase tracking-wide font-mono ${
            currentTheme === 'focus' ? 'text-[var(--theme-text-secondary)]/90' : 
            currentTheme === 'analytics' ? 'text-black/90' :
            currentTheme === 'prime' ? 'text-black/90' :
            'text-black/90'
          }`}>
            ⚡ PRESS ⌘C TO QUICK CAPTURE
          </div>
          
          <div className="relative">
            <button 
              onClick={() => setShowUserMenu(!showUserMenu)}
              className={`${buttonStyling.menuButtonStyle} border-4 border-black p-4 hover:opacity-90 transition-all duration-100 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_#000000] shadow-[4px_4px_0px_#000000]`}
            >
              <Menu className={`w-6 h-6 ${buttonStyling.menuIconColor}`} />
            </button>
            
            {showUserMenu && (
              <div className="absolute right-0 top-full mt-2 bg-white border-4 border-black shadow-[4px_4px_0px_#000000] p-4 min-w-[200px] z-50">
                <div className="space-y-3">
                  <div className="text-sm font-bold uppercase tracking-wide text-black/70 border-b-2 border-black pb-2">
                    USER MENU
                  </div>
                  <button className="w-full bg-[#525252] text-white border-2 border-black font-bold uppercase tracking-wide px-4 py-2 hover:bg-[#525252]/90 transition-all duration-100">
                    SIGN OUT
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

    </header>
  );
};

export default Header;