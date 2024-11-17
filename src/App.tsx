import { useState, useEffect } from 'react';
import { MenuGrid } from './components/MenuGrid';
import { UtensilsCrossed, LogOut } from 'lucide-react';
import { AuthModal } from './components/AuthModal';
import { AdminPanel } from './components/AdminPanel';
import { useAuthStore } from './store/auth';
import { supabase } from './lib/supabase';
import { Toaster } from 'react-hot-toast';

function App() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user, isAuthenticated, logout } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    logout();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <UtensilsCrossed className="h-8 w-8 text-blue-600" />
              <h1 className="ml-2 text-2xl font-bold text-gray-900">Repas Scolaires</h1>
            </div>
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <span className="text-gray-600">Bienvenue, {user?.name}</span>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                >
                  <LogOut className="w-4 h-4" />
                  Se déconnecter
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Se connecter
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {user?.role === 'admin' && (
          <div className="mb-8">
            <AdminPanel />
          </div>
        )}

        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Menu du jour</h2>
          <div className="flex gap-4">
            <button className="text-gray-600 hover:text-gray-900">Précédent</button>
            <button className="text-gray-600 hover:text-gray-900">Suivant</button>
          </div>
        </div>
        
        <MenuGrid />
      </main>

      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </div>
  );
}

export default App;