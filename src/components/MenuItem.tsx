import { useState, useEffect } from 'react';
import { DietaryTag } from './DietaryTag';
import { Clock, Users, Check, X } from 'lucide-react';
import { format } from 'date-fns';
import { useAuthStore } from '../store/auth';
import { useReservation } from '../hooks/useReservation';
import type { MenuItem as MenuItemType } from '../types';
import toast from 'react-hot-toast';

type MenuItemProps = {
  item: MenuItemType;
};

export function MenuItem({ item: initialItem }: MenuItemProps) {
  const [item, setItem] = useState(initialItem);
  const { isAuthenticated, user } = useAuthStore();
  const availableSpots = item.quota - item.reservations;
  const isAvailable = availableSpots > 0;

  const {
    isReserving,
    isCancelling,
    hasReservation,
    reserve,
    cancel
  } = useReservation(item, user);

  const handleReserve = async () => {
    if (!user) {
      toast.error('Please sign in to make a reservation');
      return;
    }

    const updatedItem = await reserve();
    if (updatedItem) {
      setItem(updatedItem);
    }
  };

  const handleCancelReservation = async () => {
    if (!user) {
      toast.error('Please sign in to cancel your reservation');
      return;
    }

    const updatedItem = await cancel();
    if (updatedItem) {
      setItem(updatedItem);
    }
  };

  // Update local state when initial item changes
  useEffect(() => {
    setItem(initialItem);
  }, [initialItem]);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col h-full">
      <div className="relative">
        <img 
          src={item.imageUrl} 
          alt={item.name}
          className="w-full h-48 object-cover"
        />
        {hasReservation && (
          <div className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
            <Check className="w-4 h-4" />
            Reserved
          </div>
        )}
      </div>
      
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">{item.name}</h3>
            <p className="text-sm text-gray-500 mt-1">
              {format(new Date(item.date), 'EEEE, MMMM d')}
            </p>
          </div>
          <span className="text-lg font-bold text-gray-900">
            €{item.price.toFixed(2)}
          </span>
        </div>

        <p className="text-gray-600 mb-4">{item.description}</p>

        <div className="flex flex-wrap gap-2 mb-4">
          {item.dietaryTags?.map((tag) => (
            <DietaryTag key={tag} tag={tag} />
          ))}
        </div>

        <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center text-sm text-gray-500">
            <Users className="w-4 h-4 mr-1" />
            <span>{availableSpots} spots left</span>
          </div>
          {hasReservation ? (
            <button
              onClick={handleCancelReservation}
              disabled={isCancelling}
              className="px-4 py-2 rounded-md font-medium text-red-600 hover:text-red-700 border border-red-600 hover:border-red-700 flex items-center gap-2 disabled:opacity-50"
            >
              {isCancelling ? (
                <Clock className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <X className="w-4 h-4" />
                  Cancel Reservation
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleReserve}
              disabled={!isAvailable || isReserving || !isAuthenticated}
              className={`px-4 py-2 rounded-md font-medium ${
                !isAuthenticated
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : isAvailable
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isReserving ? (
                <Clock className="w-4 h-4 animate-spin" />
              ) : !isAuthenticated ? (
                'Sign in to Reserve'
              ) : isAvailable ? (
                'Reserve'
              ) : (
                'Sold Out'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}