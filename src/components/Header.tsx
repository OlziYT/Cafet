import { UtensilsCrossed, LogOut, Plus, ChefHat } from 'lucide-react';
import { useAuthStore } from '../store/auth';
import { ThemeToggle } from './ThemeToggle';

interface HeaderProps {
  showAdminPanel: boolean;
  setShowAdminPanel: (show: boolean) => void;
  setShowAuthModal: (show: boolean) => void;
}

export function Header({ showAdminPanel, setShowAdminPanel, setShowAuthModal }: HeaderProps) {
  const { user, isAuthenticated, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="bg-white dark:bg-marron-800 bg-menu-pattern border-b-4 border-marron-300 dark:border-marron-600 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between">
          <div 
            onClick={() => {
              if (showAdminPanel) {
                setShowAdminPanel(false);
              }
            }}
            className="flex items-center cursor-pointer group"
          >
            <div className="relative bg-marron-100 dark:bg-marron-700 p-4 rounded-full transform rotate-12 group-hover:rotate-0 transition-all duration-300">
              <ChefHat className="h-12 w-12 text-bordeaux-600 dark:text-bordeaux-300 transform -rotate-12 group-hover:rotate-0 transition-transform" />
              <div className="absolute -top-2 -right-2 bg-olive-100 dark:bg-olive-900 p-2 rounded-full">
                <UtensilsCrossed className="h-6 w-6 text-olive-700 dark:text-olive-300" />
              </div>
            </div>
            <div className="ml-6 border-l-2 border-marron-200 dark:border-marron-600 pl-6">
              <h1 className="text-4xl font-title font-bold text-marron-800 dark:text-marron-100">
                Cafétéria Rascol
              </h1>
              <p className="text-marron-600 dark:text-marron-400 font-body mt-1">
                Votre pause déjeuner au lycée
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <ThemeToggle />
            
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-end">
                  <span className="text-xl font-title text-marron-800 dark:text-marron-100">{user?.name}</span>
                  <span className="text-marron-600 dark:text-marron-400">
                    {user?.role === 'admin' ? 'Gestionnaire' : 'Élève'}
                  </span>
                </div>

                <div className="h-10 w-px bg-marron-200 dark:bg-marron-600" />

                {user?.role === 'admin' && (
                  <button
                    onClick={() => setShowAdminPanel(!showAdminPanel)}
                    className={`group relative px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                      showAdminPanel
                        ? 'bg-marron-100 dark:bg-marron-700 text-marron-800 dark:text-marron-100'
                        : 'bg-olive-600 dark:bg-olive-500 text-white hover:bg-olive-700 dark:hover:bg-olive-600'
                    }`}
                  >
                    <span className="relative flex items-center gap-2">
                      {showAdminPanel ? (
                        'Retour au menu'
                      ) : (
                        <>
                          <Plus className="w-5 h-5" />
                          <span className="hidden sm:inline">Ajouter un plat</span>
                          <span className="sm:hidden">Ajouter</span>
                        </>
                      )}
                    </span>
                  </button>
                )}

                <div className="h-10 w-px bg-marron-200 dark:bg-marron-600" />

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-marron-700 dark:text-marron-300 hover:text-bordeaux-600 dark:hover:text-bordeaux-400 px-4 py-2 rounded-lg hover:bg-marron-100 dark:hover:bg-marron-700/50 transition-colors duration-200"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="hidden sm:inline font-medium">Déconnexion</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="group relative px-6 py-2.5 bg-olive-600 dark:bg-olive-500 text-white rounded-lg font-medium transform hover:-translate-y-0.5 transition-all duration-200"
              >
                <span className="relative">Se connecter</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}