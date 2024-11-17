import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import type { User, MenuItem } from '../types';

export function useReservation(menuItem: MenuItem, user: User | null) {
  const [isReserving, setIsReserving] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [hasReservation, setHasReservation] = useState(false);

  const checkReservation = useCallback(async () => {
    if (!user) return false;
    
    try {
      const { data, error } = await supabase
        .from('reservations')
        .select('id, status')
        .eq('user_id', user.id)
        .eq('menu_item_id', menuItem.id)
        .maybeSingle();
      
      if (error) throw error;
      return data?.status === 'confirmed';
    } catch (error) {
      console.error('Check reservation error:', error);
      return false;
    }
  }, [user, menuItem.id]);

  useEffect(() => {
    let mounted = true;

    if (user) {
      checkReservation().then((hasRes) => {
        if (mounted) {
          setHasReservation(hasRes);
        }
      });
    } else {
      setHasReservation(false);
    }

    return () => {
      mounted = false;
    };
  }, [user, checkReservation]);

  const reserve = async () => {
    if (!user) {
      toast.error('Please sign in to make a reservation');
      return null;
    }

    setIsReserving(true);

    try {
      // Check for any existing reservation (confirmed or cancelled)
      const { data: existingReservation } = await supabase
        .from('reservations')
        .select('id, status')
        .eq('user_id', user.id)
        .eq('menu_item_id', menuItem.id)
        .maybeSingle();

      if (existingReservation) {
        if (existingReservation.status === 'confirmed') {
          toast.error('You already have an active reservation for this meal');
          return null;
        }

        // If there's a cancelled reservation, update it instead of creating a new one
        const { data: updatedMenuItem, error: updateError } = await supabase.rpc(
          'reactivate_reservation',
          {
            p_reservation_id: existingReservation.id,
            p_menu_item_id: menuItem.id
          }
        );

        if (updateError) throw updateError;
        if (!updatedMenuItem) throw new Error('Failed to reactivate reservation');

        setHasReservation(true);
        toast.success('Reservation confirmed!');

        return {
          id: updatedMenuItem.id,
          name: updatedMenuItem.name,
          description: updatedMenuItem.description,
          imageUrl: updatedMenuItem.image_url,
          price: updatedMenuItem.price,
          date: updatedMenuItem.date,
          quota: updatedMenuItem.quota,
          reservations: updatedMenuItem.reservations,
          dietaryTags: updatedMenuItem.dietary_tags
        };
      }

      // If no existing reservation, create a new one
      const { data: result, error } = await supabase.rpc(
        'create_reservation',
        {
          p_user_id: user.id,
          p_menu_item_id: menuItem.id
        }
      );

      if (error) {
        if (error.message.includes('No available spots')) {
          toast.error('No available spots left for this meal');
        } else {
          throw error;
        }
        return null;
      }

      if (!result) {
        throw new Error('Failed to create reservation');
      }

      setHasReservation(true);
      toast.success('Reservation confirmed!');
      
      return {
        id: result.id,
        name: result.name,
        description: result.description,
        imageUrl: result.image_url,
        price: result.price,
        date: result.date,
        quota: result.quota,
        reservations: result.reservations,
        dietaryTags: result.dietary_tags
      };
    } catch (error: any) {
      console.error('Reservation error:', error);
      toast.error('Failed to make reservation. Please try again.');
      return null;
    } finally {
      setIsReserving(false);
    }
  };

  const cancel = async () => {
    if (!user) {
      toast.error('Please sign in to cancel your reservation');
      return null;
    }

    setIsCancelling(true);

    try {
      const { data: result, error } = await supabase.rpc(
        'cancel_reservation',
        {
          p_user_id: user.id,
          p_menu_item_id: menuItem.id
        }
      );

      if (error) {
        if (error.message.includes('No active reservation found')) {
          toast.error('No active reservation found');
        } else {
          throw error;
        }
        return null;
      }

      if (!result) {
        throw new Error('Failed to cancel reservation');
      }

      setHasReservation(false);
      toast.success('Reservation cancelled successfully');
      
      return {
        id: result.id,
        name: result.name,
        description: result.description,
        imageUrl: result.image_url,
        price: result.price,
        date: result.date,
        quota: result.quota,
        reservations: result.reservations,
        dietaryTags: result.dietary_tags
      };
    } catch (error: any) {
      console.error('Cancellation error:', error);
      toast.error('Failed to cancel reservation. Please try again.');
      return null;
    } finally {
      setIsCancelling(false);
    }
  };

  return {
    isReserving,
    isCancelling,
    hasReservation,
    setHasReservation,
    checkReservation,
    reserve,
    cancel
  };
}