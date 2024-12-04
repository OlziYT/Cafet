import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import type { User, MenuItem } from '../types';
import { 
  checkReservation,
  createReservation,
  cancelReservation
} from '../services/reservationService';

export function useReservation(menuItem: MenuItem, user: User | null) {
  const [isReserving, setIsReserving] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [hasReservation, setHasReservation] = useState(false);

  const checkUserReservation = useCallback(async () => {
    if (!user) return false;
    
    try {
      return await checkReservation(user.id, menuItem.id);
    } catch (error) {
      console.error('Check reservation error:', error);
      return false;
    }
  }, [user, menuItem.id]);

  useEffect(() => {
    let mounted = true;

    if (user) {
      checkUserReservation().then((hasRes) => {
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
  }, [user, checkUserReservation]);

  const reserve = async () => {
    if (!user) {
      toast.error('Please sign in to make a reservation');
      return null;
    }

    setIsReserving(true);

    try {
      const updatedMenuItem = await createReservation(user.id, menuItem.id);
      setHasReservation(true);
      toast.success('Reservation confirmed!');
      return updatedMenuItem;
    } catch (error: any) {
      console.error('Reservation error:', error);
      if (error.message.includes('No available spots')) {
        toast.error('No available spots left for this meal');
      } else {
        toast.error('Failed to make reservation. Please try again.');
      }
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
      const updatedMenuItem = await cancelReservation(user.id, menuItem.id);
      setHasReservation(false);
      toast.success('Reservation cancelled successfully');
      return updatedMenuItem;
    } catch (error: any) {
      console.error('Cancellation error:', error);
      if (error.message.includes('No active reservation found')) {
        toast.error('No active reservation found');
      } else {
        toast.error('Failed to cancel reservation. Please try again.');
      }
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
    checkReservation: checkUserReservation,
    reserve,
    cancel
  };
}