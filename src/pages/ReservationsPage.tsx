import { useState, useEffect } from 'react';
import { Clock, Calendar, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import toast from 'react-hot-toast';
import { fetchUserReservations } from '../services/reservationService';

type Reservation = {
  id: string;
  created_at: string;
  picked_up: boolean;
  menu_item: {
    id: string;
    name: string;
    date: string;
    image_url: string;
    price: number;
  };
};

export function ReservationsPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  const handleBackClick = () => {
    navigate(-1);
  };

  useEffect(() => {
    if (!user) return;

    async function loadReservations() {
      try {
        setLoading(true);
        const data = await fetchUserReservations(user.id);
        setReservations(data || []);
      } catch (error: any) {
        toast.error('Erreur lors du chargement des réservations');
        console.error('Error:', error.message);
      } finally {
        setLoading(false);
      }
    }

    loadReservations();
  }, [user]);

  return (
    <main className="max-w-7xl mx-auto px-6 py-12">
      <div className="bg-white dark:bg-marron-800 bg-opacity-95 dark:bg-opacity-95 rounded-2xl shadow-xl p-8 border border-marron-200 dark:border-marron-700">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={handleBackClick}
            className="text-marron-600 dark:text-marron-300 hover:text-marron-800 dark:hover:text-marron-100 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-3xl font-title font-bold text-marron-800 dark:text-marron-100">
            Mes réservations
          </h1>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Clock className="w-8 h-8 animate-spin text-marron-600" />
          </div>
        ) : reservations.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-marron-800 rounded-xl border-2 border-dashed border-marron-200 dark:border-marron-700">
            <p className="text-xl font-title text-marron-600 dark:text-marron-300">
              Aucune réservation trouvée
            </p>
            <Link
              to="/"
              className="inline-block mt-4 px-6 py-2 bg-olive-600 text-white rounded-lg hover:bg-olive-700 transition-colors"
            >
              Réserver un repas
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {reservations.map((reservation) => (
              <div
                key={reservation.id}
                className="bg-white dark:bg-marron-800 rounded-xl border border-marron-200 dark:border-marron-700 overflow-hidden"
              >
                <div className="flex items-center p-4">
                  <img
                    src={reservation.menu_item.image_url}
                    alt={reservation.menu_item.name}
                    className="w-24 h-24 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0 ml-4">
                    <h3 className="text-lg font-medium text-marron-800 dark:text-marron-100">
                      {reservation.menu_item.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 text-marron-600 dark:text-marron-300">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">
                        {format(new Date(reservation.menu_item.date), 'EEEE d MMMM yyyy', { locale: fr })}
                      </span>
                    </div>
                    <p className="text-sm text-marron-500 dark:text-marron-400 mt-1">
                      Réservé le {format(new Date(reservation.created_at), 'dd/MM/yyyy à HH:mm')}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2 ml-4">
                    <span className="text-lg font-bold text-marron-800 dark:text-marron-100">
                      {reservation.menu_item.price.toFixed(2)} €
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      reservation.picked_up
                        ? 'bg-olive-100 dark:bg-olive-900/30 text-olive-800 dark:text-olive-300'
                        : 'bg-marron-100 dark:bg-marron-700 text-marron-600 dark:text-marron-300'
                    }`}>
                      {reservation.picked_up ? 'Retiré' : 'Non retiré'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}