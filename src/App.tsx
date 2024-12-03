import { useState, useEffect } from 'react';
import { MenuGrid } from './components/MenuGrid';
import { AuthModal } from './components/AuthModal';
import { AdminPanel } from './components/AdminPanel';
import { Header } from './components/Header';
import { useAuthStore } from './store/auth';
import { useThemeStore } from './store/theme';
import { supabase } from './lib/supabase';
import { Toaster } from 'react-hot-toast';
import { LoadingSpinner } from './components/LoadingSpinner';

function App() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { theme } = useThemeStore();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        useAuthStore.getState().login({
          id: session.user.id,
          email: session.user.email!,
          name: session.user.user_metadata.name,
          role: session.user.user_metadata.role || 'user'
        });
      }
      setIsLoading(false);
    });
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-marron-50 dark:bg-marron-900 bg-paper-texture">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-marron-50 dark:bg-marron-900 bg-paper-texture transition-colors duration-300">
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: theme === 'dark' ? '#2D2318' : '#FFF',
            color: theme === 'dark' ? '#F2EAE3' : '#53381F',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            borderRadius: '0.5rem',
            padding: '1rem',
            fontFamily: 'Lato, sans-serif',
          },
          success: {
            style: {
              background: theme === 'dark' ? '#2C3B1D' : '#F7F7EF',
              border: '1px solid #AFB35F',
              color: theme === 'dark' ? '#DFE1BF' : '#4F502B',
            },
          },
          error: {
            style: {
              background: theme === 'dark' ? '#3B1D1D' : '#FCF5F5',
              border: '1px solid #C93B3B',
              color: theme === 'dark' ? '#E7B1B1' : '#5C1A1A',
            },
          },
        }}
      />
      
      <Header 
        showAdminPanel={showAdminPanel}
        setShowAdminPanel={setShowAdminPanel}
        setShowAuthModal={setShowAuthModal}
      />

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="bg-white dark:bg-marron-800 bg-opacity-95 dark:bg-opacity-95 rounded-2xl shadow-xl p-8 border border-marron-200 dark:border-marron-700 transition-colors duration-300">
          {!showAdminPanel && <MenuGrid />}
          {showAdminPanel && <AdminPanel />}
        </div>
      </main>

      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </div>
  );
}

export default App;