import React, { useState } from 'react'

// Mock data for demonstration
const mockMenus = [
  {
    date: '2024-03-18',
    meals: [
      { type: 'Entrée', name: 'Salade César', photo: 'https://cdn.pratico-pratiques.com/app/uploads/sites/4/2018/08/30182949/salade-cesar-1.jpeg' },
      { type: 'Plat', name: 'Tenders poulet', photo: 'https://static.750g.com/images/1200-675/65bdeada9a9f3edadc5996e3653aaf55/tenders-poulet-img-9884.jpg' },
      { type: 'Dessert', name: 'Tarte aux pommes', photo: 'https://img.freepik.com/photos-premium/concept-nourriture-savoureuse-tarte-aux-pommes-fond-bois_185193-65063.jpg' },
      { type: 'Menu complet', name: 'Tenders Frite pepsi', photo: 'https://lemiams.fr/wp-content/uploads/2021/06/MENU-TENDERS-X5.png' },
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
