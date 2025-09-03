import { useState } from 'react';
import { Map, Target, BarChart3, Star, Plus, Zap, Menu } from 'lucide-react';

interface SharedLayoutProps {
  children: React.ReactNode;
  headerColor: string;
  currentPage: 'map' | 'focus' | 'data' | 'prime';
  onPageChange: (page: 'map' | 'focus' | 'data' | 'prime') => void;
  headerTextColor?: string;
  menuButtonStyle?: string;
  user?: any;
  onSignOut?: () => void;
}

export function SharedLayout({ 
  children, 
  headerColor, 
  currentPage, 
  onPageChange,
  headerTextColor = 'text-white',
  menuButtonStyle = 'bg-white',
  user,
  onSignOut
}: SharedLayoutProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  // Get background color based on current page
  const getBackgroundColor = () => {
    switch (currentPage) {
      case 'focus': return 'bg-[#3a6a2e]'; // Lighter green background
      case 'map': return 'bg-[#FFF8DC]';
      case 'data': return 'bg-[#E5B6E5]'; // Pink background
      case 'prime': return 'bg-[#FFFBEB]';
      default: return 'bg-[#FFF8DC]';
    }
  };

  // Get button styling based on current page - UPDATED to use background colors for all pages
  const getButtonStyling = () => {
    switch (currentPage) {
      case 'focus':
        return {
          brainDumpStyle: 'bg-[#3a6a2e] text-white', // Use background color
          menuButtonStyle: 'bg-[#3a6a2e]', // Use background color
          menuIconColor: 'text-white'
        };
      case 'data':
        return {
          brainDumpStyle: 'bg-[#E5B6E5] text-black', // Use background color
          menuButtonStyle: 'bg-[#E5B6E5]', // Use background color
          menuIconColor: 'text-black'
        };
      case 'prime':
        return {
          brainDumpStyle: 'bg-[#FFFBEB] text-black', // Use background color
          menuButtonStyle: 'bg-[#FFFBEB]', // Use background color
          menuIconColor: 'text-black'
        };
      default: // map - UPDATED to use crayonage grey
        return {
          brainDumpStyle: 'bg-black text-white',
          menuButtonStyle: 'bg-[#f7f7f5]', // Crayonage grey for map page
          menuIconColor: 'text-black'
        };
    }
  };

  // Get XP icon styling based on current page
  const getXPIconStyling = () => {
    switch (currentPage) {
      case 'focus':
        return 'text-[#224718] fill-[#224718]';
      case 'data':
        return 'text-[#451969] fill-[#451969]';
      default:
        return 'text-[#FDE047] fill-[#FDE047]';
    }
  };

  // Get XP gauge background - SPECIAL CASE for map page
  const getXPGaugeBackground = () => {
    return currentPage === 'map' ? 'bg-[#f7f7f5]' : 'bg-white';
  };

  // Get correct nav button colors - UPDATED to show only current page color
  const getNavButtonColor = (page: 'map' | 'focus' | 'data' | 'prime') => {
    const isActive = currentPage === page;
    
    // If not active, use light grey for all pages
    if (!isActive) {
      return 'bg-[#d1d5db] hover:bg-[#d1d5db]/90 text-black';
    }
    
    // If active, show the page's theme color
    switch (page) {
      case 'map':
        return 'bg-[#FDE047] hover:bg-[#FDE047]/90 text-black';
      case 'focus':
        return 'bg-[#CFE820] hover:bg-[#CFE820]/90 text-black';
      case 'data':
        return 'bg-[#E5B6E5] hover:bg-[#E5B6E5]/90 text-black';
      case 'prime':
        return 'bg-[#2563EB] hover:bg-[#2563EB]/90 text-white';
      default:
        return 'bg-white hover:bg-white/90 text-black';
    }
  };

  const buttonStyling = getButtonStyling();

  return (
    <div className={`min-h-screen ${getBackgroundColor()} min-w-[1200px]`} style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Header Capture Bar */}
      <header className="border-b-4 border-black p-6" style={{ backgroundColor: headerColor }}>
        <div className="flex items-center justify-between w-full px-8">
          {/* Left - App Name (pushed to edge) */}
          <div className="flex-shrink-0">
            <h1 className={`text-3xl font-black uppercase tracking-wider ${headerTextColor}`}>
              PRODUCTION REBELLION
            </h1>
          </div>
          
          {/* Center - Action Buttons (absolutely centered) */}
          <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-6">
            <button className={`${buttonStyling.brainDumpStyle} border-4 border-black font-black uppercase tracking-wider px-6 py-3 hover:opacity-90 transition-all duration-100 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_#000000] shadow-[4px_4px_0px_#000000]`}>
              <Plus className="w-5 h-5 inline mr-2" />
              BRAIN DUMP
            </button>
            
            <button className="bg-[#f7f7f5] border-4 border-black font-black uppercase tracking-wider px-6 py-3 hover:bg-[#f7f7f5]/90 transition-all duration-100 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_#000000] shadow-[4px_4px_0px_#000000]">
              1 TO TRIAGE
            </button>
          </div>

          {/* Right - Hotkey Text and Menu (pushed to edge) */}
          <div className="flex items-center gap-6 flex-shrink-0">
            <div className={`text-base font-bold uppercase tracking-wide font-mono ${
              headerTextColor === 'text-black' ? 'text-black/90' : 
              headerTextColor === 'text-[#E5B6E5]' ? 'text-[#E5B6E5]/90' :
              headerTextColor === 'text-[#CFE820]' ? 'text-[#CFE820]/90' :
              'text-white/90'
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
                      {user?.email}
                    </div>
                    <button
                      onClick={() => {
                        onSignOut?.();
                        setShowUserMenu(false);
                      }}
                      className="w-full bg-[#525252] text-white border-2 border-black font-bold uppercase tracking-wide px-4 py-2 hover:bg-[#525252]/90 transition-all duration-100"
                    >
                      SIGN OUT
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* XP Gauge - UPDATED with crayonage grey for map page */}
      <div 
        className={`${getXPGaugeBackground()} border-4 border-black px-4 py-3 shadow-[4px_4px_0px_#000000] hover:shadow-[6px_6px_0px_#000000] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-100 cursor-pointer z-50`}
        style={{
          position: 'fixed',
          top: '112px',
          right: '48px',
          transform: 'none' // Explicitly prevent any transform
        }}
      >
        <div className="flex items-center gap-3">
          <Zap className={`w-5 h-5 ${getXPIconStyling()}`} />
          <span className="text-base font-black uppercase tracking-wider text-black font-mono">1,250</span>
        </div>
      </div>

      {/* Main Content */}
      {children}

      {/* Fixed Bottom Navigation - Quick Nav Bar with ONLY current page color */}
      <div className="fixed bottom-8 right-8 z-50">
        <div className="bg-white border-4 border-black p-2 shadow-[4px_4px_0px_#000000]">
          <div className="grid grid-cols-2 gap-2">
            {/* Top Row */}
            <button 
              onClick={() => onPageChange('map')}
              className={`border-4 border-black p-2 font-black uppercase tracking-wider text-xs transition-all duration-100 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_#000000] shadow-[4px_4px_0px_#000000] min-w-[48px] ${getNavButtonColor('map')}`}
            >
              <Map className="w-4 h-4 mx-auto mb-1" />
              MAP
            </button>
            
            <button 
              onClick={() => onPageChange('focus')}
              className={`border-4 border-black p-2 font-black uppercase tracking-wider text-xs transition-all duration-100 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_#000000] shadow-[4px_4px_0px_#000000] min-w-[48px] ${getNavButtonColor('focus')}`}
            >
              <Target className="w-4 h-4 mx-auto mb-1" />
              FOCUS
            </button>
            
            {/* Bottom Row */}
            <button 
              onClick={() => onPageChange('data')}
              className={`border-4 border-black p-2 font-black uppercase tracking-wider text-xs transition-all duration-100 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_#000000] shadow-[4px_4px_0px_#000000] min-w-[48px] ${getNavButtonColor('data')}`}
            >
              <BarChart3 className="w-4 h-4 mx-auto mb-1" />
              DATA
            </button>
            
            <button 
              onClick={() => onPageChange('prime')}
              className={`border-4 border-black p-2 font-black uppercase tracking-wider text-xs transition-all duration-100 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_#000000] shadow-[4px_4px_0px_#000000] min-w-[48px] ${getNavButtonColor('prime')}`}
            >
              <Star className="w-4 h-4 mx-auto mb-1" />
              PRIME
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}