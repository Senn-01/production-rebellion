import { useState, useEffect } from 'react';
import { SharedLayout } from './components/SharedLayout';
import { FocusPage } from './components/FocusPage';
import { AnalyticsPage } from './components/AnalyticsPage';
import { PrimePage } from './components/PrimePage';
import { TacticalMapPage } from './components/TacticalMapPage';
import { LandingPage } from './components/LandingPage';
import { useHeaderStyling } from './hooks/useHeaderStyling';
import { CurrentPage } from './types/project';
import { supabase } from './utils/supabase/client';

export default function App() {
  const [currentPage, setCurrentPage] = useState<CurrentPage>('map');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const { headerColor, headerTextColor, menuButtonStyle } = useHeaderStyling(currentPage);

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleAuthSuccess = () => {
    // User will be automatically set by the auth state listener
    // Set the page to TacticalMap (default is already 'map')
  };

  const renderPageContent = () => {
    switch (currentPage) {
      case 'focus':
        return <FocusPage />;
      case 'data':
        return <AnalyticsPage />;
      case 'prime':
        return <PrimePage />;
      case 'map':
      default:
        return <TacticalMapPage />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f7f5] flex items-center justify-center">
        <div className="text-2xl font-black uppercase tracking-wider">LOADING...</div>
      </div>
    );
  }

  if (!user) {
    return <LandingPage onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <SharedLayout 
      headerColor={headerColor} 
      currentPage={currentPage} 
      onPageChange={setCurrentPage}
      headerTextColor={headerTextColor}
      menuButtonStyle={menuButtonStyle}
      user={user}
      onSignOut={() => supabase.auth.signOut()}
    >
      {renderPageContent()}
    </SharedLayout>
  );
}