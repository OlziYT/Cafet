import React from 'react'
import { Link } from 'react-router-dom'
import { Utensils } from 'lucide-react'

const Header: React.FC = () => {
  return (
    <header className="bg-blue-600 text-white">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2">
          <Utensils size={24} />
          <span className="text-xl font-bold">Projet Kafet</span>
        </Link>
        <nav>
          <ul className="flex space-x-4">
            <li><Link to="/menu" className="hover:underline">Menu</Link></li>
            <li><Link to="/reservation" className="hover:underline">Réservation</Link></li>
            <li><Link to="/login" className="hover:underline">Connexion</Link></li>
            <li><Link to="/register" className="hover:underline">Inscription</Link></li>
          </ul>
        </nav>
      </div>
    </header>
  )
}

export default Header