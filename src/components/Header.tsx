import React from 'react';
import { Link } from 'react-router-dom';
import { Utensils, User as UserIcon, LogOut } from 'lucide-react';
import { useAuthStore } from '../store/auth';

const Header: React.FC = () => {
  const { user, logout } = useAuthStore();

  return (
    <header className="bg-blue-600 text-white">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2">
          <Utensils size={24} />
          <span className="text-xl font-bold">Projet Kafet</span>
        </Link>
        <nav>
          <ul className="flex items-center space-x-4">
            <li><Link to="/menu" className="hover:underline">Menu</Link></li>
            {user ? (
              <>
                <li><Link to="/reservation" className="hover:underline">Réservation</Link></li>
                {user.role === 'admin' && (
                  <li><Link to="/admin" className="hover:underline">Tableau de bord</Link></li>
                )}
                <li className="flex items-center space-x-2">
                  <UserIcon size={18} />
                  <span>{user.firstName}</span>
                </li>
                <li>
                  <button
                    onClick={logout}
                    className="flex items-center space-x-1 hover:underline"
                  >
                    <LogOut size={18} />
                    <span>Déconnexion</span>
                  </button>
                </li>
              </>
            ) : (
              <>
                <li><Link to="/login" className="hover:underline">Connexion</Link></li>
                <li><Link to="/register" className="hover:underline">Inscription</Link></li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
