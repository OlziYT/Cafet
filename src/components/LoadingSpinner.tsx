import { UtensilsCrossed } from 'lucide-react';

export function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative">
        <div className="w-24 h-24 rounded-full border-4 border-marron-200 relative overflow-hidden animate-spin-slow">
          <div className="absolute inset-0 bg-menu-pattern opacity-20"></div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <UtensilsCrossed className="w-10 h-10 text-bordeaux-600" />
        </div>
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-olive-100 rounded-full flex items-center justify-center animate-bounce">
          <div className="w-4 h-4 bg-olive-500 rounded-full"></div>
        </div>
      </div>
      <div className="text-center">
        <p className="font-title text-2xl text-marron-800">Mise en place...</p>
        <p className="text-marron-600 italic mt-1">Nos meilleures recettes arrivent</p>
      </div>
    </div>
  );
}