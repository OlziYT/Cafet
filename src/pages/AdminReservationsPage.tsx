import { useState, useEffect } from 'react';
import { Clock, Calendar, ArrowLeft, Search, Filter, Users, Check, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import toast from 'react-hot-toast';

type RawReservationData = {
  id: string;
  created_at: string;
  picked_up: boolean;
  status: string;
  user_id: string;
  menu_item_id: string;
  profiles: {
    id: string;
    name: string;
    email: string;
  }[];
  menu_items: {
    id: string;
    name: string;
    date: string;
    image_url: string;
    price: number;
  }[];
};

type AdminReservation = {
  id: string;
  created_at: string;
  picked_up: boolean;
  status: string;
  user_id: string;
  menu_item_id: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  menu_item: {
    id: string;
    name: string;
    date: string;
    image_url: string;
    price: number;
  };
};

export function AdminReservationsPage() {
  const navigate = useNavigate();
  const [reservations, setReservations] = useState<AdminReservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'picked' | 'not-picked'>('not-picked');

  useEffect(() => {
    loadReservations();
  }, []);

  const loadReservations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('reservations')
        .select(`
          id,
          created_at,
          picked_up,
          status,
          user_id,
          menu_item_id,
          profiles!reservations_user_id_fkey (
            id,
            name,
            email
          ),
          menu_items!reservations_menu_item_id_fkey (
            id,
            name,
            date,
            image_url,
            price
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const typedReservations = (data || []).map((res: RawReservationData) => {
        // Get profile and menu_item data, handling both array and object responses
        const profile = Array.isArray(res.profiles) ? res.profiles[0] : res.profiles;
        const menuItem = Array.isArray(res.menu_items) ? res.menu_items[0] : res.menu_items;

        // Skip if we don't have the required data
        if (!profile || !menuItem) {
          console.error('Missing required data for reservation:', res);
          return null;
        }

        return {
          id: res.id,
          created_at: res.created_at,
          picked_up: res.picked_up,
          status: res.status,
          user_id: res.user_id,
          menu_item_id: res.menu_item_id,
          user: {
            id: profile.id,
            name: profile.name,
            email: profile.email
          },
          menu_item: {
            id: menuItem.id,
            name: menuItem.name,
            date: menuItem.date,
            image_url: menuItem.image_url,
            price: Number(menuItem.price)
          }
        };
      }).filter(Boolean) as AdminReservation[];
      
      setReservations(typedReservations);
    } catch (error) {
      console.error('Error loading reservations:', error);
      toast.error('Impossible de charger les réservations');
    } finally {
      setLoading(false);
    }
  };

  const handlePickupToggle = async (reservationId: string, currentStatus: boolean) => {
    try {
      await supabase
        .from('reservations')
        .update({ picked_up: !currentStatus })
        .eq('id', reservationId);
      
      await loadReservations();
      toast.success('Statut de retrait mis à jour');
    } catch (error) {
      console.error('Error updating pickup status:', error);
      toast.error('Impossible de mettre à jour le statut');
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

  const handleBackClick = () => {
    navigate('/', { replace: true });
  };

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
            Gestion des réservations
          </h1>
        </div>

        <div className="bg-white dark:bg-marron-800 rounded-xl border border-marron-200 dark:border-marron-700 p-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-6">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-marron-400" />
              <input
                type="text"
                placeholder="Rechercher par nom, email ou plat..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-marron-200 dark:border-marron-600 bg-white dark:bg-marron-700 text-marron-800 dark:text-marron-100 focus:ring-2 focus:ring-olive-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <Filter className="w-5 h-5 text-marron-400" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as 'all' | 'picked' | 'not-picked')}
                className="flex-1 md:flex-none px-3 py-2 rounded-lg border border-marron-200 dark:border-marron-600 bg-white dark:bg-marron-700 text-marron-800 dark:text-marron-100 focus:ring-2 focus:ring-olive-500"
              >
                <option value="all">Toutes les réservations</option>
                <option value="picked">Repas retirés</option>
                <option value="not-picked">Repas non retirés</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Clock className="w-8 h-8 animate-spin text-marron-600" />
            </div>
          ) : filteredReservations.length === 0 ? (
            <div className="text-center py-12 bg-marron-50 dark:bg-marron-900/50 rounded-lg border-2 border-dashed border-marron-200 dark:border-marron-700">
              <Users className="w-12 h-12 mx-auto text-marron-400" />
              <p className="mt-4 text-lg font-medium text-marron-600 dark:text-marron-300">
                Aucune réservation trouvée
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredReservations.map((reservation) => (
                <div
                  key={reservation.id}
                  className="flex flex-col md:flex-row items-start md:items-center gap-4 p-4 bg-marron-50 dark:bg-marron-900/30 rounded-lg border border-marron-200 dark:border-marron-700"
                >
                  <img
                    src={reservation.menu_item.image_url}
                    alt={reservation.menu_item.name}
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                      <h3 className="text-lg font-medium text-marron-800 dark:text-marron-100">
                        {reservation.user.name}
                      </h3>
                      <span className="text-sm text-marron-500 dark:text-marron-400">
                        {reservation.user.email}
                      </span>
                    </div>
                    
                    <div className="mt-2">
                      <p className="font-medium text-marron-700 dark:text-marron-200">
                        {reservation.menu_item.name}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="w-4 h-4 text-marron-500" />
                        <span className="text-sm text-marron-500 dark:text-marron-400">
                          {format(new Date(reservation.menu_item.date), 'EEEE d MMMM', { locale: fr })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 ml-auto">
                    <span className="font-bold text-lg text-marron-800 dark:text-marron-100">
                      {reservation.menu_item.price.toFixed(2)} €
                    </span>
                    
                    <button
                      onClick={() => handlePickupToggle(reservation.id, reservation.picked_up)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                        reservation.picked_up
                          ? 'bg-olive-100 dark:bg-olive-900/30 text-olive-800 dark:text-olive-300 hover:bg-olive-200'
                          : 'bg-marron-200 dark:bg-marron-700 text-marron-800 dark:text-marron-100 hover:bg-marron-300'
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
              ))}
            </div>
          )}
        </div>

        <div className="mt-6">
          <Link
            to="/reservations"
            className="inline-flex items-center gap-2 px-4 py-2 bg-marron-100 dark:bg-marron-700 text-marron-800 dark:text-marron-100 rounded-lg hover:bg-marron-200 dark:hover:bg-marron-600 transition-colors"
          >
            <Users className="w-5 h-5" />
            <span>Voir mes réservations</span>
          </Link>
        </div>
      </div>
    </main>
  );
}