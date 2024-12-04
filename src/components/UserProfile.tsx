import { List, Users } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import { fetchUserReservations } from '../services/reservationService';
import type { UserReservation, RawUserReservationData } from '../types/reservation';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface UserProfileProps {
  onNavigate?: () => void;
}

export function UserProfile({ onNavigate }: UserProfileProps) {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [reservations, setReservations] = useState<UserReservation[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPendingReservations = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const reservations = await fetchUserReservations(user.id);
      const typedReservations = reservations.map((res: RawUserReservationData) => {
        // Get menu_item data, handling both array and object responses
        const menuItem = Array.isArray(res.menu_item) ? res.menu_item[0] : res.menu_item;

        // Skip if we don't have the required data
        if (!menuItem) {
          console.error('Missing menu_item data for reservation:', res);
          return null;
        }

        return {
          id: res.id,
          created_at: res.created_at,
          picked_up: res.picked_up,
          menu_item: {
            id: menuItem.id,
            name: menuItem.name,
            date: menuItem.date,
            image_url: menuItem.image_url,
            price: Number(menuItem.price)
          }
        };
      }).filter(Boolean) as UserReservation[];

      setReservations(typedReservations);
    } catch (error) {
      console.error('Error loading reservations:', error);
      toast.error('Impossible de charger les réservations');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadPendingReservations();
  }, [loadPendingReservations]);

  const handleNavigation = (path: string) => {
    if (onNavigate) {
      onNavigate();
    }
    navigate(path);
  };

  if (!user) return null;

  return (
    <div className="space-y-4">
      {loading ? (
        <div className="flex justify-center py-4">
          <List className="w-6 h-6 animate-spin text-marron-600" />
        </div>
      ) : reservations.length === 0 ? (
        <div className="text-center py-4 bg-marron-50 dark:bg-marron-800/50 rounded-lg">
          <Users className="w-6 h-6 mx-auto text-marron-400 dark:text-marron-500" />
          <p className="mt-2 text-sm text-marron-600 dark:text-marron-300">
            Aucun repas à retirer
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-marron-800 dark:text-marron-100">
            Repas à retirer
          </h3>
          {reservations.map((reservation) => (
            <div
              key={reservation.id}
              onClick={() => {
                navigate('/reservations');
                if (onNavigate) onNavigate();
              }}
              className="flex items-center gap-4 p-4 rounded-lg bg-marron-50 dark:bg-marron-900/50 hover:bg-marron-100 dark:hover:bg-marron-900 transition-colors cursor-pointer"
            >
              <img
                src={reservation.menu_item.image_url}
                alt={reservation.menu_item.name}
                className="w-12 h-12 rounded object-cover"
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-marron-800 dark:text-marron-100 truncate">
                  {reservation.menu_item.name}
                </h4>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <List className="w-3.5 h-3.5 text-marron-500 dark:text-marron-400" />
                  <span className="text-xs text-marron-500 dark:text-marron-400 truncate">
                    {format(new Date(reservation.menu_item.date), 'EEEE d MMMM', { locale: fr })}
                  </span>
                </div>
              </div>
              <span className="text-sm font-medium text-marron-800 dark:text-marron-100">
                {reservation.menu_item.price.toFixed(2)} €
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-2">
        <button
          onClick={() => handleNavigation('/reservations')}
          className="w-full flex items-center gap-2 px-4 py-3 bg-marron-100 dark:bg-marron-700 text-marron-800 dark:text-marron-100 rounded-lg hover:bg-marron-200 dark:hover:bg-marron-600 transition-colors"
        >
          <List className="w-5 h-5" />
          <span>Voir mes réservations</span>
        </button>

        {user?.role === 'admin' && (
          <button
            onClick={() => handleNavigation('/admin/reservations')}
            className="w-full flex items-center gap-2 px-4 py-3 bg-olive-100 dark:bg-olive-900/30 text-olive-800 dark:text-olive-300 rounded-lg hover:bg-olive-200 dark:hover:bg-olive-900/50 transition-colors"
          >
            <Users className="w-5 h-5" />
            <span>Gérer les réservations</span>
          </button>
        )}
      </div>
    </div>
  );
}