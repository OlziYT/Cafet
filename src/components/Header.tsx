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
          
          <div className="flex items-center gap-8">
            <ThemeToggle />
            
            {user?.role === 'admin' && (
              <button
                onClick={() => setShowAdminPanel(!showAdminPanel)}
                className="group relative px-8 py-3 bg-bordeaux-600 dark:bg-bordeaux-700 text-white rounded-lg font-title text-lg tracking-wide transform hover:-translate-y-1 transition-all duration-200 overflow-hidden"
              >
                <div className="absolute inset-0 bg-bordeaux-700 dark:bg-bordeaux-800 transform translate-y-full group-hover:translate-y-0 transition-transform duration-200"></div>
                <span className="relative flex items-center justify-center">
                  {showAdminPanel ? (
                    'Retour au menu'
                  ) : (
                    <>
                      <Plus className="w-5 h-5 mr-2" />
                      Ajouter un plat
                    </>
                  )}
                </span>
              </button>
            )}
            
            {isAuthenticated ? (
              <div className="flex items-center gap-8">
                <div className="flex flex-col items-end">
                  <span className="text-xl font-title text-marron-800 dark:text-marron-100">{user?.name}</span>
                  <span className="text-marron-600 dark:text-marron-400">
                    {user?.role === 'admin' ? 'Gestionnaire' : 'Élève'}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-marron-700 dark:text-marron-300 hover:text-bordeaux-600 dark:hover:text-bordeaux-400 px-6 py-3 rounded-lg hover:bg-marron-100 dark:hover:bg-marron-700/50 transition-colors duration-200"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Déconnexion</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="group relative px-8 py-3 bg-olive-600 dark:bg-olive-700 text-white rounded-lg font-title text-lg tracking-wide transform hover:-translate-y-1 transition-all duration-200 overflow-hidden"
              >
                <div className="absolute inset-0 bg-olive-700 dark:bg-olive-800 transform translate-y-full group-hover:translate-y-0 transition-transform duration-200"></div>
                <span className="relative">Se connecter</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}