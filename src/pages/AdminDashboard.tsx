import React, { useState } from 'react'

const AdminDashboard: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState('')
  const [menuItems, setMenuItems] = useState([
    { type: 'Entrée', name: '', photo: '', price: '', quota: '' },
    { type: 'Plat', name: '', photo: '', price: '', quota: '' },
    { type: 'Dessert', name: '', photo: '', price: '', quota: '' },
  ])

  const handleMenuItemChange = (index: number, field: string, value: string) => {
    const updatedMenuItems = [...menuItems]
    updatedMenuItems[index] = { ...updatedMenuItems[index], [field]: value }
    setMenuItems(updatedMenuItems)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically send the menu data to your backend
    console.log('Menu submitted:', { date: selectedDate, menuItems })
    alert('Menu enregistré avec succès !')
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Tableau de bord administrateur</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="date" className="block mb-2">Date du menu</label>
          <input
            type="date"
            id="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            required
            className="w-full border rounded p-2"
          />
        </div>
        {menuItems.map((item, index) => (
          <div key={index} className="border p-4 rounded">
            <h3 className="font-bold mb-2">{item.type}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor={`name-${index}`} className="block mb-1">Nom</label>
                <input
                  type="text"
                  id={`name-${index}`}
                  value={item.name}
                  onChange={(e) => handleMenuItemChange(index, 'name', e.target.value)}
                  required
                  className="w-full border rounded p-2"
                />
              </div>
              <div>
                <label htmlFor={`photo-${index}`} className="block mb-1">URL de la photo</label>
                <input
                  type="url"
                  id={`photo-${index}`}
                  value={item.photo}
                  onChange={(e) => handleMenuItemChange(index, 'photo', e.target.value)}
                  required
                  className="w-full border rounded p-2"
                />
              </div>
              <div>
                <label htmlFor={`price-${index}`} className="block mb-1">Prix</label>
                <input
                  type="number"
                  id={`price-${index}`}
                  value={item.price}
                  onChange={(e) => handleMenuItemChange(index, 'price', e.target.value)}
                  required
                  className="w-full border rounded p-2"
                />
              </div>
              <div>
                <label htmlFor={`quota-${index}`} className="block mb-1">Quota</label>
                <input
                  type="number"
                  id={`quota-${index}`}
                  value={item.quota}
                  onChange={(e) => handleMenuItemChange(index, 'quota', e.target.value)}
                  required
                  className="w-full border rounded p-2"
                />
              </div>
            </div>
          </div>
        ))}
        <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700">
          Enregistrer le menu
        </button>
      </form>
    </div>
  )
}

export default AdminDashboard