import { useState } from 'react';
import { Plus, UtensilsCrossed, ChefHat } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { useThemeStore } from '../store/theme';
import { ImageUpload } from './ImageUpload';

export function AdminPanel() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [quota, setQuota] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [dietaryTags, setDietaryTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { theme } = useThemeStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from('menu_items').insert([
        {
          name,
          description,
          price: parseFloat(price),
          image_url: imageUrl,
          quota: parseInt(quota),
          dietary_tags: dietaryTags,
          date: date,
          reservations: 0
        }
      ]);

      if (error) throw error;

      toast.success('Plat ajouté avec succès !');
      // Reset form
      setName('');
      setDescription('');
      setPrice('');
      setImageUrl('');
      setQuota('');
      setDietaryTags([]);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-marron-800 rounded-xl shadow-xl p-8 border border-marron-200 dark:border-marron-700 transition-colors duration-300">
      <div className="flex items-center gap-4 mb-8">
        <div className="relative bg-marron-100 dark:bg-marron-700 p-3 rounded-lg transform rotate-6">
          <ChefHat className="h-8 w-8 text-bordeaux-600 dark:text-bordeaux-300 transform -rotate-6" />
          <div className="absolute -top-2 -right-2 bg-olive-100 dark:bg-olive-900 p-1.5 rounded-full">
            <UtensilsCrossed className="h-4 w-4 text-olive-700 dark:text-olive-300" />
          </div>
        </div>
        <h2 className="text-3xl font-title font-bold text-marron-800 dark:text-marron-100">
          Ajouter un nouveau plat
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-marron-700 dark:text-marron-200 mb-2">
              Date du repas
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-marron-200 dark:border-marron-600 bg-white dark:bg-marron-700 text-marron-800 dark:text-marron-100 focus:border-olive-500 dark:focus:border-olive-400 focus:ring-2 focus:ring-olive-200 dark:focus:ring-olive-900 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-marron-700 dark:text-marron-200 mb-2">
              Nom du plat
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-marron-200 dark:border-marron-600 bg-white dark:bg-marron-700 text-marron-800 dark:text-marron-100 focus:border-olive-500 dark:focus:border-olive-400 focus:ring-2 focus:ring-olive-200 dark:focus:ring-olive-900 transition-colors"
              placeholder="ex: Coq au Vin"
            />
          </div>
        </div>

        <ImageUpload imageUrl={imageUrl} onImageChange={setImageUrl} />

        <div>
          <label className="block text-sm font-medium text-marron-700 dark:text-marron-200 mb-2">
            Description
          </label>
          <textarea
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-marron-200 dark:border-marron-600 bg-white dark:bg-marron-700 text-marron-800 dark:text-marron-100 focus:border-olive-500 dark:focus:border-olive-400 focus:ring-2 focus:ring-olive-200 dark:focus:ring-olive-900 transition-colors"
            rows={3}
            placeholder="Décrivez les ingrédients et la préparation..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-marron-700 dark:text-marron-200 mb-2">
              Prix (€)
            </label>
            <input
              type="number"
              step="0.01"
              required
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-marron-200 dark:border-marron-600 bg-white dark:bg-marron-700 text-marron-800 dark:text-marron-100 focus:border-olive-500 dark:focus:border-olive-400 focus:ring-2 focus:ring-olive-200 dark:focus:ring-olive-900 transition-colors"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-marron-700 dark:text-marron-200 mb-2">
              Quantité disponible
            </label>
            <input
              type="number"
              required
              value={quota}
              onChange={(e) => setQuota(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-marron-200 dark:border-marron-600 bg-white dark:bg-marron-700 text-marron-800 dark:text-marron-100 focus:border-olive-500 dark:focus:border-olive-400 focus:ring-2 focus:ring-olive-200 dark:focus:ring-olive-900 transition-colors"
              placeholder="0"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-marron-700 dark:text-marron-200 mb-4">
            Régimes alimentaires
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { id: 'gluten-free', label: 'Sans gluten' },
              { id: 'vegan', label: 'Végétalien' },
              { id: 'vegetarian', label: 'Végétarien' },
              { id: 'organic', label: 'Bio' }
            ].map(({ id, label }) => (
              <label key={id} className="relative flex items-center justify-center">
                <input
                  type="checkbox"
                  checked={dietaryTags.includes(id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setDietaryTags([...dietaryTags, id]);
                    } else {
                      setDietaryTags(dietaryTags.filter((t) => t !== id));
                    }
                  }}
                  className="peer sr-only"
                />
                <div className="w-full py-3 px-4 text-center rounded-lg border-2 cursor-pointer transition-all duration-200 peer-checked:border-olive-500 peer-checked:bg-olive-50 peer-checked:text-olive-700 dark:peer-checked:border-olive-400 dark:peer-checked:bg-olive-900/30 dark:peer-checked:text-olive-300 border-marron-200 dark:border-marron-600 text-marron-600 dark:text-marron-300 hover:bg-marron-50 dark:hover:bg-marron-700/50">
                  {label}
                </div>
              </label>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-br from-olive-500 to-olive-600 dark:from-olive-600 dark:to-olive-700 text-white py-3 px-6 rounded-lg font-medium hover:from-olive-600 hover:to-olive-700 dark:hover:from-olive-500 dark:hover:to-olive-600 disabled:opacity-50 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg disabled:hover:transform-none disabled:hover:shadow-none flex items-center justify-center gap-3"
        >
          {loading ? (
            <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Plus className="w-5 h-5" />
              Ajouter au menu
            </>
          )}
        </button>
      </form>
    </div>
  );
}