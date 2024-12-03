import { useState, useEffect } from 'react';
import { MenuItem } from './MenuItem';
import type { MenuItem as MenuItemType } from '../types';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useMenuStore } from '../store/menu';
import { LoadingSpinner } from './LoadingSpinner';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

interface DatabaseMenuItem {
  id: string;
  name: string;
  description: string;
  image_url: string;
  price: number;
  date: string;
  quota: number;
  reservations: number;
  dietary_tags: string[];
}

const transformMenuItem = (item: DatabaseMenuItem): MenuItemType => ({
  id: item.id,
  name: item.name,
  description: item.description,
  imageUrl: item.image_url,
  price: item.price,
  date: item.date,
  quota: item.quota,
  reservations: item.reservations,
  dietaryTags: item.dietary_tags
});

export function MenuGrid() {
  const [items, setItems] = useState<MenuItemType[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');

  const weekDays = Array.from({ length: 5 }, (_, i) => 
    addDays(startOfWeek(currentDate, { weekStartsOn: 1 }), i)
  );

  useEffect(() => {
    useMenuStore.getState().setResetView(() => {
      setCurrentDate(new Date());
      setViewMode('day');
    });

    return () => {
      useMenuStore.getState().setResetView(() => {});
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    async function fetchMenuItems() {
      try {
        const startDate = viewMode === 'day' 
          ? format(currentDate, 'yyyy-MM-dd')
          : format(weekDays[0], 'yyyy-MM-dd');
        
        const endDate = viewMode === 'day'
          ? format(currentDate, 'yyyy-MM-dd')
          : format(weekDays[4], 'yyyy-MM-dd');

        const { data, error } = await supabase
          .from('menu_items')
          .select('*')
          .gte('date', startDate)
          .lte('date', endDate)
          .order('date', { ascending: true });

        if (error) throw error;
        
        if (mounted) {
          const transformedData = (data || []).map(transformMenuItem);
          setItems(transformedData);
        }
      } catch (error: any) {
        toast.error('Erreur lors du chargement du menu');
        console.error('Error:', error.message);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchMenuItems();

    const subscription = supabase
      .channel('menu_items_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'menu_items'
        },
        (payload) => {
          if (payload.new) {
            setItems(currentItems => {
              const newItem = payload.new as DatabaseMenuItem;
              const transformedItem = transformMenuItem(newItem);

              const existingIndex = currentItems.findIndex(item => item.id === newItem.id);
              
              if (existingIndex >= 0) {
                const updatedItems = [...currentItems];
                updatedItems[existingIndex] = transformedItem;
                return updatedItems;
              } else {
                return [...currentItems, transformedItem];
              }
            });
          }
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [currentDate, viewMode, weekDays]);

  const navigateDate = (direction: 'prev' | 'next') => {
    setCurrentDate(current => {
      const days = viewMode === 'day' ? 1 : 7;
      return direction === 'next' 
        ? addDays(current, days)
        : addDays(current, -days);
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  const renderItems = (date?: Date) => {
    const filteredItems = date
      ? items.filter(item => isSameDay(new Date(item.date), date))
      : items;

    if (filteredItems.length === 0) {
      return (
        <div className="text-center py-12 bg-marron-50 dark:bg-marron-900/50 rounded-lg border-2 border-dashed border-marron-200 dark:border-marron-700">
          <p className="text-marron-600 dark:text-marron-300 font-title text-xl">
            Pas de menu disponible pour cette date
          </p>
          <p className="text-marron-500 dark:text-marron-400 mt-2">
            Le menu sera bientôt disponible. Revenez un peu plus tard !
          </p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <MenuItem key={item.id} item={item} />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Calendar className="w-8 h-8 text-bordeaux-600 dark:text-bordeaux-400" />
            <h2 
              onClick={() => {
                setCurrentDate(new Date());
                setViewMode('day');
              }}
              className="text-3xl font-title text-marron-800 dark:text-marron-100 hover:text-bordeaux-600 dark:hover:text-bordeaux-400 cursor-pointer"
            >
              {viewMode === 'day' && isSameDay(currentDate, new Date()) 
                ? "Menu du jour"
                : viewMode === 'day'
                  ? format(currentDate, 'EEEE d MMMM yyyy', { locale: fr })
                  : `Semaine du ${format(weekDays[0], 'd MMMM', { locale: fr })} au ${format(weekDays[4], 'd MMMM yyyy', { locale: fr })}`
              }
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex rounded-lg overflow-hidden border border-marron-200 dark:border-marron-700">
              <button
                onClick={() => setViewMode('day')}
                className={`px-4 py-2 font-medium ${
                  viewMode === 'day'
                    ? 'bg-marron-600 dark:bg-marron-700 text-white'
                    : 'bg-white dark:bg-marron-800 text-marron-600 dark:text-marron-300 hover:bg-marron-50 dark:hover:bg-marron-700'
                } transition-colors`}
              >
                Jour
              </button>
              <button
                onClick={() => setViewMode('week')}
                className={`px-4 py-2 font-medium ${
                  viewMode === 'week'
                    ? 'bg-marron-600 dark:bg-marron-700 text-white'
                    : 'bg-white dark:bg-marron-800 text-marron-600 dark:text-marron-300 hover:bg-marron-50 dark:hover:bg-marron-700'
                } transition-colors`}
              >
                Semaine
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => navigateDate('prev')}
                className="flex items-center gap-2 px-4 py-2 text-marron-600 dark:text-marron-300 hover:text-bordeaux-600 dark:hover:text-bordeaux-400 hover:bg-marron-50 dark:hover:bg-marron-700/50 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
                <span className="font-medium">Précédent</span>
              </button>
              <button
                onClick={() => navigateDate('next')}
                className="flex items-center gap-2 px-4 py-2 text-marron-600 dark:text-marron-300 hover:text-bordeaux-600 dark:hover:text-bordeaux-400 hover:bg-marron-50 dark:hover:bg-marron-700/50 rounded-lg transition-colors"
              >
                <span className="font-medium">Suivant</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {viewMode === 'day' ? (
        renderItems(currentDate)
      ) : (
        <div className="space-y-12">
          {weekDays.map((date) => (
            <div key={date.toISOString()} className="space-y-4">
              <h3 className="text-2xl font-title text-marron-700 dark:text-marron-200 border-b-2 border-marron-200 dark:border-marron-700 pb-2">
                {format(date, 'EEEE d MMMM', { locale: fr })}
              </h3>
              {renderItems(date)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}