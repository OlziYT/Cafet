import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function BackToMenuButton() {
  const navigate = useNavigate();

  const handleBackToMenu = () => {
    navigate('/', { replace: true });
  };

  return (
    <button
      onClick={handleBackToMenu}
      className="text-marron-600 dark:text-marron-300 hover:text-marron-800 dark:hover:text-marron-100 transition-colors"
    >
      <ArrowLeft className="w-6 h-6" />
    </button>
  );
}
