import { useState } from 'react';
import { X, Eye, EyeOff } from 'lucide-react';
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
  const [showPassword, setShowPassword] = useState(false);
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
          toast.success('Compte créé ! Vérifiez votre boîte mail pour confirmer votre compte.');
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
          toast.success('Connexion réussie !');
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
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-marron-900 rounded-2xl max-w-md w-full p-8 relative border border-marron-200 dark:border-marron-700 shadow-xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-marron-400 hover:text-marron-600 dark:text-marron-500 dark:hover:text-marron-300 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-title text-marron-800 dark:text-marron-100 mb-6">
          {mode === 'signin' ? 'Accès à mon compte' : 'Créer mon compte'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-sm font-medium text-marron-700 dark:text-marron-200 mb-1">
                Nom complet
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-marron-200 dark:border-marron-600 bg-white dark:bg-marron-800 text-marron-800 dark:text-marron-100 focus:border-olive-500 dark:focus:border-olive-400 focus:ring-2 focus:ring-olive-200 dark:focus:ring-olive-900 transition-colors"
                placeholder="Jean Dupont"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-marron-700 dark:text-marron-200 mb-1">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-marron-200 dark:border-marron-600 bg-white dark:bg-marron-800 text-marron-800 dark:text-marron-100 focus:border-olive-500 dark:focus:border-olive-400 focus:ring-2 focus:ring-olive-200 dark:focus:ring-olive-900 transition-colors"
              placeholder="jean.dupont@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-marron-700 dark:text-marron-200 mb-1">
              Mot de passe
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-marron-200 dark:border-marron-600 bg-white dark:bg-marron-800 text-marron-800 dark:text-marron-100 focus:border-olive-500 dark:focus:border-olive-400 focus:ring-2 focus:ring-olive-200 dark:focus:ring-olive-900 transition-colors pr-12"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-marron-400 hover:text-marron-600 dark:text-marron-500 dark:hover:text-marron-300 transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {mode === 'signin' && (
            <div className="flex items-center">
              <input
                type="checkbox"
                id="remember-me"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-marron-300 dark:border-marron-600 text-olive-600 dark:text-olive-500 focus:ring-olive-500 dark:focus:ring-olive-400 bg-white dark:bg-marron-800"
              />
              <label htmlFor="remember-me" className="ml-2 text-sm text-marron-600 dark:text-marron-300">
                Rester connecté
              </label>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-br from-olive-500 to-olive-600 dark:from-olive-600 dark:to-olive-700 text-white py-3 px-4 rounded-lg font-medium hover:from-olive-600 hover:to-olive-700 dark:hover:from-olive-500 dark:hover:to-olive-600 disabled:opacity-50 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg disabled:hover:transform-none disabled:hover:shadow-none mt-6"
          >
            {loading ? (
              <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin mx-auto" />
            ) : (
              mode === 'signin' ? 'Se connecter' : 'Créer mon compte'
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-marron-600 dark:text-marron-300">
          {mode === 'signin' ? (
            <>
              Pas encore de compte ?{' '}
              <button
                onClick={() => setMode('signup')}
                className="text-olive-600 dark:text-olive-400 hover:text-olive-700 dark:hover:text-olive-300 font-medium"
              >
                S'inscrire
              </button>
            </>
          ) : (
            <>
              Déjà un compte ?{' '}
              <button
                onClick={() => setMode('signin')}
                className="text-olive-600 dark:text-olive-400 hover:text-olive-700 dark:hover:text-olive-300 font-medium"
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