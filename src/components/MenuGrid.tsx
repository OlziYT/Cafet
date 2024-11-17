import { useState, useEffect } from 'react';
import { MenuItem } from './MenuItem';
import type { MenuItem as MenuItemType } from '../types';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

export function MenuGrid() {
  const [items, setItems] = useState<MenuItemType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function fetchMenuItems() {
      try {
        const { data, error } = await supabase
          .from('menu_items')
          .select('*')
          .order('date', { ascending: true });

        if (error) throw error;
        
        if (mounted) {
          // Transform the data to match our types
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
        toast.error('Failed to load menu items');
        console.error('Error:', error.message);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchMenuItems();

    // Subscribe to changes
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
                // Update existing item
                const updatedItems = [...currentItems];
                updatedItems[existingIndex] = transformedItem;
                return updatedItems;
              } else {
                // Add new item
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
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No menu items available.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {items.map((item) => (
        <MenuItem key={item.id} item={item} />
      ))}
    </div>
  );
}