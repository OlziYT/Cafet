import React, { useState } from 'react'

// Mock data for demonstration
const mockMenus = [
  {
    date: '2024-03-18',
    meals: [
      { type: 'Entrée', name: 'Salade César', photo: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80' },
      { type: 'Plat', name: 'Poulet rôti', photo: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80' },
      { type: 'Dessert', name: 'Tarte aux pommes', photo: 'https://images.unsplash.com/photo-1568571780765-9276ac8b75a7?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80' },
    ],
  },
  // Add more days...
]

const Menu: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(mockMenus[0].date)

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Menu du jour</h1>
      <div className="mb-4">
        <select
          value={currentDate}
          onChange={(e) => setCurrentDate(e.target.value)}
          className="border rounded p-2"
        >
          {mockMenus.map((menu) => (
            <option key={menu.date} value={menu.date}>
              {new Date(menu.date).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {mockMenus.find((menu) => menu.date === currentDate)?.meals.map((meal, index) => (
          <div key={index} className="border rounded-lg overflow-hidden shadow-lg">
            <img src={meal.photo} alt={meal.name} className="w-full h-48 object-cover" />
            <div className="p-4">
              <h3 className="font-bold">{meal.type}</h3>
              <p>{meal.name}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Menu