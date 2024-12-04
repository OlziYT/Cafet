import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface ImageUploadProps {
  imageUrl: string;
  onImageChange: (url: string) => void;
}

export function ImageUpload({ imageUrl, onImageChange }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(imageUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadImage = async (file: File) => {
    try {
      setUploading(true);

      // Créer un nom de fichier unique
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `meal-images/${fileName}`;

      // Upload du fichier
      const { error: uploadError } = await supabase.storage
        .from('meals')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Obtenir l'URL publique
      const { data: { publicUrl } } = supabase.storage
        .from('meals')
        .getPublicUrl(filePath);

      onImageChange(publicUrl);
      setPreview(publicUrl);
      toast.success('Image téléchargée avec succès');
    } catch (error: any) {
      toast.error('Erreur lors du téléchargement de l\'image');
      console.error('Error uploading image:', error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    if (file.size > 5 * 1024 * 1024) { // 5MB max
      toast.error('L\'image ne doit pas dépasser 5MB');
      return;
    }

    await uploadImage(file);
  };

  const handleRemoveImage = async () => {
    if (!imageUrl) return;

    try {
      // Extraire le nom du fichier de l'URL
      const fileName = imageUrl.split('/').pop();
      if (!fileName) return;

      const { error } = await supabase.storage
        .from('meals')
        .remove([`meal-images/${fileName}`]);

      if (error) throw error;

      onImageChange('');
      setPreview('');
      toast.success('Image supprimée avec succès');
    } catch (error: any) {
      toast.error('Erreur lors de la suppression de l\'image');
      console.error('Error removing image:', error.message);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-marron-700 dark:text-marron-200">
          Image du plat
        </label>
        <span className="text-xs text-marron-500 dark:text-marron-400">
          Format: JPG, PNG • Taille max: 5MB
        </span>
      </div>

      <div className="relative">
        {preview ? (
          <div className="relative rounded-lg overflow-hidden group">
            <img
              src={preview}
              alt="Aperçu"
              className="w-full h-64 object-cover"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
              >
                <Upload className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={handleRemoveImage}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-64 border-2 border-dashed border-marron-300 dark:border-marron-600 rounded-lg flex flex-col items-center justify-center gap-4 hover:border-olive-500 dark:hover:border-olive-400 transition-colors"
          >
            <div className="p-4 bg-marron-100 dark:bg-marron-700 rounded-full">
              <ImageIcon className="w-8 h-8 text-marron-600 dark:text-marron-300" />
            </div>
            <div className="text-center">
              <span className="text-marron-600 dark:text-marron-300">
                {uploading ? 'Téléchargement en cours...' : 'Cliquez pour ajouter une image'}
              </span>
              <p className="text-sm text-marron-500 dark:text-marron-400 mt-1">
                ou glissez-déposez votre fichier ici
              </p>
            </div>
          </button>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={uploading}
          className="hidden"
        />
      </div>
    </div>
  );
}