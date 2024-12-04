import { UtensilsCrossed, LogOut, Plus, ChefHat, User, Menu as MenuIcon } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import { ThemeToggle } from './ThemeToggle';
import { UserProfile } from './UserProfile';

interface HeaderProps {
  showAdminPanel: boolean;
  setShowAdminPanel: (show: boolean) => void;
  setShowAuthModal: (show: boolean) => void;
}

export function Header({ showAdminPanel, setShowAdminPanel, setShowAuthModal }: HeaderProps) {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current && 
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current && 
        !buttonRef.current.contains(event.target as Node)
      ) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleMenu = () => {
    setShowUserMenu(!showUserMenu);
  };

  const closeMenu = () => setShowUserMenu(false);

  const handleLogout = async () => {
    await logout();
    closeMenu();
  };

  const handleLogoClick = () => {
    setShowAdminPanel(false);
    closeMenu();
    navigate('/', { replace: true });
  };

  return (
    <header className="bg-white dark:bg-marron-800 bg-menu-pattern border-b-4 border-marron-300 dark:border-marron-600 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between">
          <div 
            onClick={handleLogoClick}
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
              <div className="relative">
                <button
                  ref={buttonRef}
                  onClick={toggleMenu}
                  className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-marron-100 dark:hover:bg-marron-700/50 transition-colors"
                >
                  <div className="flex flex-col items-end">
                    <span className="text-xl font-title text-marron-800 dark:text-marron-100">{user?.name}</span>
                    <span className="text-marron-600 dark:text-marron-400">
                      {user?.role === 'admin' ? 'Gestionnaire' : 'Élève'}
                    </span>
                  </div>
                  <MenuIcon className="w-5 h-5 text-marron-600 dark:text-marron-300" />
                </button>

                {showUserMenu && (
                  <div 
                    ref={menuRef}
                    className="absolute right-0 mt-2 w-80 bg-white dark:bg-marron-800 rounded-xl shadow-lg border border-marron-200 dark:border-marron-700 overflow-hidden z-50"
                  >
                    <div className="p-6">
                      <UserProfile onNavigate={() => setShowUserMenu(false)} />
                    </div>

                    <div className="border-t border-marron-200 dark:border-marron-700 p-4 space-y-2">
                      {user?.role === 'admin' && (
                        <button
                          onClick={() => {
                            setShowAdminPanel(true);
                            setShowUserMenu(false);
                            navigate('/', { replace: true });
                          }}
                          className={`w-full flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                            showAdminPanel
                              ? 'bg-marron-100 dark:bg-marron-700 text-marron-800 dark:text-marron-100'
                              : 'text-olive-700 dark:text-olive-300 hover:bg-olive-50 dark:hover:bg-olive-900/30'
                          }`}
                        >
                          <Plus className="w-5 h-5" />
                          <span>Ajouter un plat</span>
                        </button>
                      )}

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2 text-bordeaux-600 dark:text-bordeaux-400 hover:bg-bordeaux-50 dark:hover:bg-bordeaux-900/30 rounded-lg transition-colors"
                      >
                        <LogOut className="w-5 h-5" />
                        <span>Se déconnecter</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-olive-600 hover:bg-olive-700 text-white rounded-lg transition-colors"
              >
                <User className="w-5 h-5" />
                <span>Se connecter</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}