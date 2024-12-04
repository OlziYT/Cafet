import { useState, useEffect } from 'react';
import { Search, Check, X, Clock, Filter } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import toast from 'react-hot-toast';

type Reservation = {
  id: string;
  created_at: string;
  picked_up: boolean;
  user: {
    id: string;
    name: string;
    email: string;
  };
  menu_item: {
    id: string;
    name: string;
    date: string;
  };
};

export function AdminReservations() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'picked' | 'not-picked'>('all');

  useEffect(() => {
    fetchReservations();
  }, []);

  async function fetchReservations() {
    try {
      const { data, error } = await supabase
        .from('reservations')
        .select(`
          id,
          created_at,
          picked_up,
          user:profiles(id, name, email),
          menu_item:menu_items(id, name, date)
        `)
        .eq('status', 'confirmed')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReservations(data || []);
    } catch (error: any) {
      toast.error('Erreur lors du chargement des réservations');
      console.error('Error:', error.message);
    } finally {
      setLoading(false);
    }
  }

  const handlePickupToggle = async (reservationId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('reservations')
        .update({ picked_up: !currentStatus })
        .eq('id', reservationId);

      if (error) throw error;

      setReservations(current =>
        current.map(res =>
          res.id === reservationId
            ? { ...res, picked_up: !currentStatus }
            : res
        )
      );

      toast.success(
        currentStatus
          ? 'Statut de retrait annulé'
          : 'Repas marqué comme retiré'
      );
    } catch (error: any) {
      toast.error('Erreur lors de la mise à jour du statut');
      console.error('Error:', error.message);
    }
  };

  const filteredReservations = reservations.filter(reservation => {
    const matchesSearch = 
      reservation.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reservation.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reservation.menu_item.name.toLowerCase().includes(searchQuery.toLowerCase());

    if (filter === 'picked') return matchesSearch && reservation.picked_up;
    if (filter === 'not-picked') return matchesSearch && !reservation.picked_up;
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Clock className="w-8 h-8 animate-spin text-marron-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-marron-400" />
          <input
            type="text"
            placeholder="Rechercher par nom, email ou plat..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-marron-200 dark:border-marron-600 bg-white dark:bg-marron-700 text-marron-800 dark:text-marron-100 placeholder-marron-400 dark:placeholder-marron-500 focus:border-olive-500 dark:focus:border-olive-400 focus:ring-2 focus:ring-olive-200 dark:focus:ring-olive-900 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-5 h-5 text-marron-400" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as 'all' | 'picked' | 'not-picked')}
            className="flex-1 md:flex-none px-3 py-2 rounded-lg border border-marron-200 dark:border-marron-600 bg-white dark:bg-marron-700 text-marron-800 dark:text-marron-100 focus:border-olive-500 dark:focus:border-olive-400 focus:ring-2 focus:ring-olive-200 dark:focus:ring-olive-900 transition-colors"
          >
            <option value="all">Tous les repas</option>
            <option value="picked">Repas retirés</option>
            <option value="not-picked">Repas non retirés</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {filteredReservations.length === 0 ? (
          <div className="text-center py-12 bg-marron-50 dark:bg-marron-800/50 rounded-lg border-2 border-dashed border-marron-200 dark:border-marron-700">
            <p className="text-marron-600 dark:text-marron-300 font-medium">
              Aucune réservation trouvée
            </p>
            <p className="mt-2 text-marron-500 dark:text-marron-400">
              Modifiez vos critères de recherche pour voir plus de résultats
            </p>
          </div>
        ) : (
          filteredReservations.map((reservation) => (
            <div
              key={reservation.id}
              className={`bg-white dark:bg-marron-800 rounded-lg p-4 shadow-sm border transition-colors ${
                reservation.picked_up
                  ? 'border-olive-200 dark:border-olive-800'
                  : 'border-marron-200 dark:border-marron-700'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-medium text-marron-800 dark:text-marron-100">
                      {reservation.user.name}
                    </h3>
                    <span className="text-sm text-marron-500 dark:text-marron-400">
                      ({reservation.user.email})
                    </span>
                  </div>
                  
                  <div className="mt-2 text-marron-600 dark:text-marron-300">
                    <p className="font-medium">{reservation.menu_item.name}</p>
                    <p className="text-sm mt-1">
                      {format(new Date(reservation.menu_item.date), 'EEEE d MMMM yyyy', { locale: fr })}
                    </p>
                  </div>
                  
                  <p className="text-xs text-marron-500 dark:text-marron-400 mt-2">
                    Réservé le {format(new Date(reservation.created_at), 'dd/MM/yyyy à HH:mm')}
                  </p>
                </div>

                <button
                  onClick={() => handlePickupToggle(reservation.id, reservation.picked_up)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    reservation.picked_up
                      ? 'bg-olive-100 dark:bg-olive-900/30 text-olive-800 dark:text-olive-300 hover:bg-olive-200 dark:hover:bg-olive-900/50'
                      : 'bg-marron-100 dark:bg-marron-700 text-marron-600 dark:text-marron-300 hover:bg-marron-200 dark:hover:bg-marron-600'
                  }`}
                >
                  {reservation.picked_up ? (
                    <>
                      <Check className="w-5 h-5" />
                      <span>Retiré</span>
                    </>
                  ) : (
                    <>
                      <X className="w-5 h-5" />
                      <span>Non retiré</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}