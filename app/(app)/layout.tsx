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
      <div className="min-h-screen bg-[#FFF8DC] text-black">
        {/* Universal Header with Capture Bar */}
        <Header />
        
        {/* Fixed XP Gauge - top right */}
        <XPGauge 
          className="z-40" 
          style={{
            position: 'fixed',
            top: '112px',
            right: '48px',
            transform: 'none'
          }}
        />
        
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