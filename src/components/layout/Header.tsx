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
import { Plus, Settings, Zap } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { CaptureBar } from './CaptureBar';
import { useTheme } from '@/contexts/ThemeContext';

export const Header: React.FC = () => {
  const { themeConfig } = useTheme();
  const [showCaptureBar, setShowCaptureBar] = useState(false);

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
    <header 
      className="w-full border-b-4 border-black p-6 bg-[var(--theme-background)] relative"
      style={{
        color: themeConfig.text
      }}
    >
      <div className="flex items-center justify-between">
        {/* Left: Brand Identity */}
        <div>
          <h1 
            className="text-3xl font-black uppercase tracking-wider"
            style={{ color: themeConfig.text }}
          >
            PRODUCTION REBELLION
          </h1>
        </div>

        {/* Center: Capture Actions (absolutely positioned for perfect centering) */}
        <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-4">
          <CaptureBar 
            isOpen={showCaptureBar}
            onOpenChange={setShowCaptureBar}
          />
        </div>

        {/* Right: Settings and Shortcuts */}
        <div className="flex items-center gap-4">
          <div className="text-sm font-bold uppercase tracking-wide">
            ⚡ PRESS ⌘K TO QUICK CAPTURE
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            className="p-2 h-auto"
          >
            <Settings className="h-5 w-5" />
            <span className="sr-only">Settings</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;