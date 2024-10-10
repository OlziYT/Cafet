import React, { useState } from 'react'

const Reservation: React.FC = () => {
  const [date, setDate] = useState('')
  const [meal, setMeal] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically send the reservation to your backend
    console.log('Reservation submitted:', { date, meal })
    alert('Réservation effectuée avec succès !')
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Réserver un repas</h1>
      <form onSubmit={handleSubmit} className="max-w-md mx-auto">
        <div className="mb-4">
          <label htmlFor="date" className="block mb-2">Date</label>
          <input
            type="date"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="w-full border rounded p-2"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="meal" className="block mb-2">Repas</label>
          <select
            id="meal"
            value={meal}
            onChange={(e) => setMeal(e.target.value)}
            required
            className="w-full border rounded p-2"
          >
            <option value="">Sélectionnez un repas</option>
            <option value="entree">Entrée</option>
            <option value="plat">Plat</option>
            <option value="dessert">Dessert</option>
          </select>
        </div>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Réserver
        </button>
      </form>
    </div>
  )
}

export default Reservation