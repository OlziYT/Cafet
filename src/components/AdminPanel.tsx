import { useState } from 'react';
import { Plus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

export function AdminPanel() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [quota, setQuota] = useState('');
  const [dietaryTags, setDietaryTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

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
          date: new Date().toISOString(),
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
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6">Ajouter un plat au menu</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Nom du plat</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Prix (€)</label>
            <input
              type="number"
              step="0.01"
              required
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Quantité disponible</label>
            <input
              type="number"
              required
              value={quota}
              onChange={(e) => setQuota(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">URL de l'image</label>
          <input
            type="url"
            required
            placeholder="https://images.unsplash.com/..."
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Régimes alimentaires</label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'gluten-free', label: 'Sans gluten' },
              { id: 'vegan', label: 'Végétalien' },
              { id: 'vegetarian', label: 'Végétarien' },
              { id: 'organic', label: 'Bio' }
            ].map(({ id, label }) => (
              <label key={id} className="inline-flex items-center">
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
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-600">{label}</span>
              </label>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>Chargement...</>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              Ajouter au menu
            </>
          )}
        </button>
      </form>
    </div>
  );
}