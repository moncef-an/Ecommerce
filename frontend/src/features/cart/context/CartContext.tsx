import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Cart } from '../../../types';
import { useAuth } from '../../auth/context/AuthContext';
import {
  getCart,
  addCartItem,
  updateCartItemQuantity,
  removeCartItem,
  clearUserCart,
} from '../api/cartApi';

interface CartContextType {
  cart: Cart | null;
  itemCount: number;
  isLoading: boolean;
  error: string | null;
  addToCart: (productId: string, quantity?: number) => Promise<boolean>;
  updateQuantity: (cartItemId: string, quantity: number) => Promise<void>;
  removeItem: (cartItemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  authModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const refreshCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart(null);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const data = await getCart();
      setCart(data);
    } catch (err) {
      console.error('Failed to load cart:', err);
      // If error occurs, set empty fallback
      setCart({ user_id: '', items: [], total_price: 0 });
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Load cart when user logs in or out
  useEffect(() => {
    if (isAuthenticated) {
      refreshCart();
    } else {
      setCart(null);
    }
  }, [isAuthenticated, refreshCart]);

  const addToCart = async (productId: string, quantity = 1): Promise<boolean> => {
    if (!isAuthenticated) {
      setAuthModalOpen(true);
      return false;
    }

    try {
      setIsLoading(true);
      await addCartItem(productId, quantity);
      await refreshCart();
      return true;
    } catch (err) {
      console.error('Failed to add item to cart:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = async (cartItemId: string, quantity: number) => {
    if (!isAuthenticated) return;
    try {
      setIsLoading(true);
      if (quantity <= 0) {
        await removeCartItem(cartItemId);
      } else {
        await updateCartItemQuantity(cartItemId, quantity);
      }
      await refreshCart();
    } catch (err) {
      console.error('Failed to update quantity:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const removeItem = async (cartItemId: string) => {
    if (!isAuthenticated) return;
    try {
      setIsLoading(true);
      await removeCartItem(cartItemId);
      await refreshCart();
    } catch (err) {
      console.error('Failed to remove item:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const clearCart = async () => {
    if (!isAuthenticated) return;
    try {
      setIsLoading(true);
      await clearUserCart();
      await refreshCart();
    } catch (err) {
      console.error('Failed to clear cart:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const itemCount =
    cart?.items?.reduce((sum, item) => sum + (item.quantity || 1), 0) || 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        itemCount,
        isLoading,
        error,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        refreshCart,
        authModalOpen,
        openAuthModal: () => setAuthModalOpen(true),
        closeAuthModal: () => setAuthModalOpen(false),
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export function useCart(): CartContextType {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

