import { useState, useEffect } from 'react';
import { DietaryTag } from './DietaryTag';
import { Clock, Users, Check, X, UtensilsCrossed } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
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
      toast.error('Veuillez vous connecter pour réserver');
      return;
    }

    const updatedItem = await reserve();
    if (updatedItem) {
      setItem(updatedItem);
    }
  };

  const handleCancelReservation = async () => {
    if (!user) {
      toast.error('Veuillez vous connecter pour annuler votre réservation');
      return;
    }

    const updatedItem = await cancel();
    if (updatedItem) {
      setItem(updatedItem);
    }
  };

  useEffect(() => {
    setItem(initialItem);
  }, [initialItem]);

  return (
    <div className="group relative bg-white rounded-xl shadow-md overflow-hidden border border-marron-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <div className="relative h-48 overflow-hidden">
        <img 
          src={item.imageUrl} 
          alt={item.name}
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        
        {hasReservation && (
          <div className="absolute top-4 right-4 bg-olive-500 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 shadow-lg">
            <Check className="w-4 h-4" />
            Réservé
          </div>
        )}
        
        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
          <div>
            <h3 className="text-white text-xl font-title font-bold leading-tight">
              {item.name}
            </h3>
            <p className="text-white/90 text-sm mt-1">
              {format(new Date(item.date), 'EEEE d MMMM', { locale: fr })}
            </p>
          </div>
          <div className="bg-bordeaux-600 text-white px-3 py-1 rounded-lg text-lg font-bold shadow-md">
            {item.price.toFixed(2)} €
          </div>
        </div>
      </div>
      
      <div className="p-4">
        <p className="text-marron-700 leading-relaxed">{item.description}</p>

        <div className="mt-4 flex flex-wrap gap-2">
          {item.dietaryTags?.map((tag) => (
            <DietaryTag key={tag} tag={tag} />
          ))}
        </div>

        <div className="mt-6 flex items-center justify-between pt-4 border-t border-marron-100">
          <div className="flex items-center gap-2 text-marron-600">
            <Users className="w-5 h-5" />
            <span className="font-medium">
              {availableSpots} {availableSpots > 1 ? 'places' : 'place'}
            </span>
          </div>

          {hasReservation ? (
            <button
              onClick={handleCancelReservation}
              disabled={isCancelling}
              className="flex items-center gap-2 px-4 py-2 text-bordeaux-600 hover:bg-bordeaux-50 rounded-lg transition-colors disabled:opacity-50"
            >
              {isCancelling ? (
                <Clock className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <X className="w-5 h-5" />
                  <span className="font-medium">Annuler</span>
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleReserve}
              disabled={!isAvailable || isReserving || !isAuthenticated}
              className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                !isAuthenticated
                  ? 'bg-marron-100 text-marron-400 cursor-not-allowed'
                  : isAvailable
                    ? 'bg-olive-600 text-white hover:bg-olive-700 transform hover:-translate-y-1'
                    : 'bg-marron-100 text-marron-400 cursor-not-allowed'
              }`}
            >
              {isReserving ? (
                <Clock className="w-5 h-5 animate-spin" />
              ) : !isAuthenticated ? (
                <>
                  <UtensilsCrossed className="w-5 h-5" />
                  <span>Connectez-vous</span>
                </>
              ) : isAvailable ? (
                'Réserver'
              ) : (
                'Complet'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}