'use client';

import React from 'react';
import { ThemeProvider } from '@/contexts/ThemeContext';
import Header from '@/components/layout/Header';
import XPGauge from '@/components/layout/XPGauge';
import NavigationGrid from '@/components/layout/NavigationGrid';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ThemeProvider>
      <div className="min-h-screen transition-colors duration-300" style={{
        backgroundColor: 'var(--theme-background)',
        color: 'var(--theme-text)'
      }}>
        {/* Universal Header with Capture Bar */}
        <Header />
        
        {/* Fixed XP Gauge - top right */}
        <XPGauge className="fixed top-28 right-12 z-40" />
        
        {/* Page Content */}
        <main className="relative">
          {children}
        </main>
        
        {/* Fixed Navigation Grid - bottom right */}
        <NavigationGrid className="fixed bottom-8 right-8 z-40" />
      </div>
    </ThemeProvider>
  )
}