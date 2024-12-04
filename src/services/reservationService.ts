import { supabase } from '../lib/supabase';
import type { MenuItem } from '../types';

export async function fetchUserReservations(userId: string) {
  const { data, error } = await supabase
    .from('reservations')
    .select(`
      id,
      created_at,
      picked_up,
      menu_item:menu_items!reservations_menu_item_id_fkey(
        id,
        name,
        date,
        image_url,
        price
      )
    `)
    .eq('user_id', userId)
    .eq('status', 'confirmed')
    .order('menu_item(date)', { ascending: true });

  if (error) throw error;
  return data;
}

export async function fetchPendingUserReservations(userId: string, limit = 2) {
  const { data, error } = await supabase
    .from('reservations')
    .select(`
      id,
      created_at,
      picked_up,
      menu_item:menu_items!reservations_menu_item_id_fkey(
        id,
        name,
        date,
        image_url,
        price
      )
    `)
    .eq('user_id', userId)
    .eq('status', 'confirmed')
    .eq('picked_up', false)
    .order('menu_item(date)', { ascending: true })
    .limit(limit);

  if (error) throw error;
  return data;
}

export async function fetchAdminReservations() {
  const { data, error } = await supabase
    .from('reservations')
    .select(`
      id,
      created_at,
      picked_up,
      user:profiles!reservations_user_id_fkey(
        id,
        name,
        email
      ),
      menu_item:menu_items!reservations_menu_item_id_fkey(
        id,
        name,
        date,
        image_url,
        price
      )
    `)
    .eq('status', 'confirmed')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function toggleReservationPickup(reservationId: string, currentStatus: boolean) {
  const { error } = await supabase
    .from('reservations')
    .update({ picked_up: !currentStatus })
    .eq('id', reservationId);

  if (error) throw error;
}

export async function deleteMenuItem(menuItemId: string): Promise<void> {
  const { error: transactionError } = await supabase.rpc('delete_menu_item_cascade', {
    p_menu_item_id: menuItemId
  });

  if (transactionError) throw transactionError;
}

export async function deleteMenuItemImage(fileName: string): Promise<void> {
  const { error } = await supabase.storage
    .from('meals')
    .remove([`meal-images/${fileName}`]);

  if (error) throw error;
}

export async function checkReservation(userId: string, menuItemId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('reservations')
    .select('id, status')
    .eq('user_id', userId)
    .eq('menu_item_id', menuItemId)
    .eq('status', 'confirmed')
    .maybeSingle();
  
  if (error) throw error;
  return !!data;
}

export async function createReservation(userId: string, menuItemId: string): Promise<MenuItem> {
  try {
    const { data, error } = await supabase.rpc(
      'create_reservation',
      {
        p_user_id: userId,
        p_menu_item_id: menuItemId
      }
    );

    if (error) {
      if (error.message.includes('Active reservation already exists')) {
        throw new Error('You already have an active reservation for this meal');
      }
      throw error;
    }

    if (!data) {
      throw new Error('Failed to create reservation');
    }

    return {
      id: data.id,
      name: data.name,
      description: data.description,
      imageUrl: data.image_url,
      price: data.price,
      date: data.date,
      quota: data.quota,
      reservations: data.reservations,
      dietaryTags: data.dietary_tags
    };
  } catch (error: any) {
    if (error.message.includes('No available spots')) {
      throw new Error('No available spots left for this meal');
    }
    throw error;
  }
}

export async function cancelReservation(userId: string, menuItemId: string): Promise<MenuItem> {
  const { data, error } = await supabase.rpc(
    'cancel_reservation',
    {
      p_user_id: userId,
      p_menu_item_id: menuItemId
    }
  );

  if (error) throw error;
  if (!data) throw new Error('Failed to cancel reservation');

  return {
    id: data.id,
    name: data.name,
    description: data.description,
    imageUrl: data.image_url,
    price: data.price,
    date: data.date,
    quota: data.quota,
    reservations: data.reservations,
    dietaryTags: data.dietary_tags
  };
}