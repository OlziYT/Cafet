import { useState, useEffect } from 'react';
import { MenuItem } from './MenuItem';
import type { MenuItem as MenuItemType, DietaryTag } from '../types';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useMenuStore } from '../store/menu';
import { LoadingSpinner } from './LoadingSpinner';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface DatabaseMenuItem {
  id: string;
  name: string;
  description: string;
  image_url: string;
  price: number;
  date: string;
  quota: number;
  reservations: number;
  dietary_tags: DietaryTag[];
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
          const transformedData = (data || []).map((item: DatabaseMenuItem) => transformMenuItem(item));
          setItems(transformedData);
        }
      } catch (error: unknown) {
        const err = error as { message: string };
        toast.error('Erreur lors du chargement du menu');
        console.error('Error:', err.message);
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
        <div className="text-center py-12">
          <p className="text-gray-500">Aucun repas disponible pour cette date.</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredItems.map((item) => (
          <MenuItem key={item.id} item={item} />
        ))}
      </div>
    );
  };

  return (
    <div>
      <div className="flex flex-col gap-6 mb-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-6">
            <h2 
              onClick={() => {
                setCurrentDate(new Date());
                setViewMode('day');
              }}
              className="text-3xl font-bold text-gray-900 hover:text-blue-600 cursor-pointer transition-colors"
            >
              {viewMode === 'day' && isSameDay(currentDate, new Date()) 
                ? 'Menu du jour'
                : viewMode === 'day'
                  ? format(currentDate, 'EEEE d MMMM yyyy', { locale: fr })
                  : `Semaine du ${format(weekDays[0], 'd MMMM', { locale: fr })} au ${format(weekDays[4], 'd MMMM yyyy', { locale: fr })}`
              }
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <button
                onClick={() => setViewMode('day')}
                className={`px-3 py-1 rounded-l-md border ${
                  viewMode === 'day' 
                    ? 'bg-blue-600 text-white border-blue-600' 
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                Jour
              </button>
              <button
                onClick={() => setViewMode('week')}
                className={`px-3 py-1 rounded-r-md border -ml-[1px] ${
                  viewMode === 'week' 
                    ? 'bg-blue-600 text-white border-blue-600' 
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                Semaine
              </button>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => navigateDate('prev')}
                className="px-4 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors flex items-center gap-2"
              >
                <ChevronLeft className="w-5 h-5" /> Précédent
              </button>
              <button
                onClick={() => navigateDate('next')}
                className="px-4 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors flex items-center gap-2"
              >
                Suivant <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {viewMode === 'day' ? (
        renderItems(currentDate)
      ) : (
        <div className="space-y-8">
          {weekDays.map((date) => (
            <div key={date.toISOString()}>
              <h3 className="text-xl font-semibold mb-4">
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