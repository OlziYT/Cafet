import { useState } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/auth';
import toast from 'react-hot-toast';

type AuthMode = 'signin' | 'signup';

export function AuthModal({ onClose }: { onClose: () => void }) {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { name },
            emailRedirectTo: window.location.origin
          }
        });
        if (error) throw error;
        if (data.user) {
          toast.success('Compte créé ! Veuillez vérifier votre email pour confirmer votre compte.');
          onClose();
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
          options: {
            persistSession: rememberMe
          }
        });
        if (error) throw error;
        if (data.user) {
          login({
            id: data.user.id,
            email: data.user.email!,
            name: data.user.user_metadata.name,
            role: data.user.user_metadata.role || 'user'
          });
          toast.success('Bon retour parmi nous !');
          onClose();
        }
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-bold mb-6">
          {mode === 'signin' ? 'Connexion' : 'Créer un compte'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Nom</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Mot de passe</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
            />
          </div>

          {mode === 'signin' && (
            <div className="flex items-center">
              <input
                type="checkbox"
                id="remember-me"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                Se souvenir de moi
              </label>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Chargement...' : mode === 'signin' ? 'Se connecter' : 'Créer un compte'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          {mode === 'signin' ? (
            <>
              Pas encore de compte ?{' '}
              <button
                onClick={() => setMode('signup')}
                className="text-blue-600 hover:text-blue-500 font-medium"
              >
                S'inscrire
              </button>
            </>
          ) : (
            <>
              Déjà un compte ?{' '}
              <button
                onClick={() => setMode('signin')}
                className="text-blue-600 hover:text-blue-500 font-medium"
              >
                Se connecter
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}