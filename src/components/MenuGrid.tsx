import { useState, useEffect } from 'react';
import { MenuItem } from './MenuItem';
import type { MenuItem as MenuItemType } from '../types';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function MenuGrid() {
  const [items, setItems] = useState<MenuItemType[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');

  const weekDays = Array.from({ length: 5 }, (_, i) => 
    addDays(startOfWeek(currentDate, { weekStartsOn: 1 }), i)
  );

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
          const transformedData = (data || []).map(item => ({
            id: item.id,
            name: item.name,
            description: item.description,
            imageUrl: item.image_url,
            price: item.price,
            date: item.date,
            quota: item.quota,
            reservations: item.reservations,
            dietaryTags: item.dietary_tags
          }));
          
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
              const newItem = payload.new as any;
              const transformedItem = {
                id: newItem.id,
                name: newItem.name,
                description: newItem.description,
                imageUrl: newItem.image_url,
                price: newItem.price,
                date: newItem.date,
                quota: newItem.quota,
                reservations: newItem.reservations,
                dietaryTags: newItem.dietary_tags
              };

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
  }, [currentDate, viewMode]);

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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value as 'day' | 'week')}
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="day">Vue par jour</option>
            <option value="week">Vue par semaine</option>
          </select>
          <div className="text-lg font-semibold">
            {viewMode === 'day' ? (
              format(currentDate, 'EEEE d MMMM yyyy', { locale: fr })
            ) : (
              `Semaine du ${format(weekDays[0], 'd MMMM', { locale: fr })} au ${format(weekDays[4], 'd MMMM yyyy', { locale: fr })}`
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigateDate('prev')}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => navigateDate('next')}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
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