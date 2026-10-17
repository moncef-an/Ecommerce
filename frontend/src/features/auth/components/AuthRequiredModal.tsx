import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, ShoppingBag, X } from 'lucide-react';
import { Button } from '../../../components/ui/Button';

interface AuthRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthRequiredModal: React.FC<AuthRequiredModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleGoToLogin = () => {
    onClose();
    navigate('/');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md rounded-3xl border border-purple-500/30 bg-[#121216] p-7 text-white shadow-2xl shadow-purple-950/50 space-y-6">
        {/* Close icon */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Icon */}
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-950/80 border border-purple-500/40 text-purple-400 shadow-inner">
          <ShoppingBag className="h-7 w-7" />
        </div>

        {/* Content */}
        <div className="text-center space-y-2">
          <h3 className="text-xl font-bold tracking-tight text-white">
            Sign In to Start Shopping
          </h3>
          <p className="text-sm text-zinc-300 leading-relaxed max-w-sm mx-auto">
            You need to log in first to add items to your cart.
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-2.5 pt-2">
          <Button
            size="lg"
            onClick={handleGoToLogin}
            className="w-full bg-purple-600 hover:bg-purple-500 text-white font-semibold shadow-lg shadow-purple-900/40"
            leftIcon={<LogIn className="h-4 w-4" />}
          >
            Log In to Continue
          </Button>

          <Button
            size="md"
            variant="ghost"
            onClick={onClose}
            className="w-full text-zinc-400 hover:text-white hover:bg-zinc-800/60"
          >
            Continue Browsing
          </Button>
        </div>
      </div>
    </div>
  );
};

