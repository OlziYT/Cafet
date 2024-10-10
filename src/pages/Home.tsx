import React from 'react'
import { Link } from 'react-router-dom'

const Home: React.FC = () => {
  return (
    <div className="text-center">
      <h1 className="text-4xl font-bold mb-4">Bienvenue sur Projet Kafet</h1>
      <p className="mb-8">Découvrez nos menus et réservez vos repas en quelques clics.</p>
      <div className="space-x-4">
        <Link to="/menu" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
          Voir le menu
        </Link>
        <Link to="/reservation" className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700">
          Réserver un repas
        </Link>
      </div>
    </div>
  )
}

export default Home