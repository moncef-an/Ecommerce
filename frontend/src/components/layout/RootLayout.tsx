import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { useCart } from '../../features/cart/context/CartContext';
import { AuthRequiredModal } from '../../features/auth/components/AuthRequiredModal';

export const RootLayout: React.FC = () => {
  const { authModalOpen, closeAuthModal } = useCart();

  return (
    <div className="flex min-h-screen flex-col bg-[#09090b] text-zinc-100 selection:bg-purple-600 selection:text-white">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <AuthRequiredModal isOpen={authModalOpen} onClose={closeAuthModal} />
    </div>
  );
};
