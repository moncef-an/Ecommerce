import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShoppingBag,
  ShieldCheck,
} from 'lucide-react';
import { PageContainer } from '../components/layout/PageContainer';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/LoadingSkeleton';
import { formatCurrency } from '../lib/utils';
import { useCart } from '../features/cart/context/CartContext';
import { useAuth } from '../features/auth/context/AuthContext';
import { getProductFallbackImage } from '../lib/imageFallback';

export const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { cart, isLoading, updateQuantity, removeItem, clearCart } = useCart();
  const [clearing, setClearing] = useState(false);

  const handleClear = async () => {
    setClearing(true);
    try {
      await clearCart();
    } finally {
      setClearing(false);
    }
  };

  const handleProceedToCheckout = () => {
    if (!isAuthenticated) {
      navigate('/');
      return;
    }
    navigate('/checkout');
  };

  const items = cart?.items || [];
  const subtotal = items.reduce((sum, item) => sum + (item.subtotal || (item.price || 0) * item.quantity), 0);
  const shipping = subtotal >= 150 || subtotal === 0 ? 0 : 15.0;
  const estimatedTax = subtotal * 0.08;
  const total = subtotal + shipping + estimatedTax;

  return (
    <div className="py-10 pb-20 bg-[#09090b]">
      <PageContainer>
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="primary">Shopping Bag</Badge>
              <span className="text-xs text-zinc-400">Order Summary</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Review Your Cart
            </h1>
            <p className="mt-1 text-sm text-zinc-400">
              Verify your selected hardware and quantities before moving to checkout.
            </p>
          </div>

          {items.length > 0 && (
            <button
              onClick={handleClear}
              disabled={clearing}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-rose-400 transition-colors cursor-pointer self-start sm:self-auto"
            >
              <Trash2 className="h-4 w-4" />
              <span>Clear Entire Bag</span>
            </button>
          )}
        </div>

        {/* Loading state */}
        {isLoading && items.length === 0 ? (
          <div className="space-y-4">
            <Skeleton className="h-28 w-full rounded-2xl bg-zinc-800" />
            <Skeleton className="h-28 w-full rounded-2xl bg-zinc-800" />
          </div>
        ) : items.length > 0 ? (
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
            {/* Cart Items List */}
            <div className="space-y-4 lg:col-span-8">
              <div className="rounded-2xl border border-zinc-800 bg-[#121216] p-6 shadow-sm divide-y divide-zinc-800/80">
                {items.map((item) => {
                  const fallbackImage = getProductFallbackImage(item.name);
                  const displayImage = item.imageUrl || fallbackImage;

                  return (
                    <div
                      key={item.id}
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-5 first:pt-0 last:pb-0"
                    >
                      <div className="flex items-center gap-4">
                        <img
                          src={displayImage}
                          alt={item.name || 'Product'}
                          className="h-20 w-20 rounded-xl object-cover border border-zinc-800 bg-zinc-900"
                        />
                        <div>
                          <h3 className="text-sm font-bold text-white">
                            {item.name || `Hardware Item #${item.product_id.slice(0, 8)}`}
                          </h3>
                          <p className="text-xs text-zinc-400 mt-0.5">
                            Unit price: {formatCurrency(item.price || 0)}
                          </p>
                          <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/30 px-2 py-0.5 rounded mt-2 inline-block">
                            Available for immediate dispatch
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between w-full sm:w-auto gap-6">
                        {/* Quantity Selector */}
                        <div className="flex items-center rounded-xl border border-zinc-800 bg-[#18181f] p-1">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-zinc-800 text-zinc-300 transition-colors cursor-pointer"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-8 text-center text-xs font-bold text-white">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-zinc-800 text-zinc-300 transition-colors cursor-pointer"
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        {/* Subtotal */}
                        <div className="text-right min-w-20">
                          <span className="text-sm font-extrabold text-white">
                            {formatCurrency(item.subtotal || (item.price || 0) * item.quantity)}
                          </span>
                        </div>

                        {/* Remove button */}
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="text-zinc-500 hover:text-rose-400 transition-colors p-1 cursor-pointer"
                          title="Remove item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Free Shipping Progress bar */}
              <div className="rounded-2xl border border-purple-500/30 bg-purple-950/20 p-4">
                <div className="flex items-center justify-between text-xs font-semibold text-purple-300 mb-1.5">
                  <span>
                    {subtotal >= 150
                      ? 'You unlocked Complimentary Express Global Shipping!'
                      : `Add ${formatCurrency(150 - subtotal)} more to unlock Complimentary Shipping`}
                  </span>
                  <span>{Math.min(100, Math.round((subtotal / 150) * 100))}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full bg-purple-600 transition-all duration-500 rounded-full"
                    style={{ width: `${Math.min(100, (subtotal / 150) * 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Order Summary Column */}
            <div className="lg:col-span-4">
              <div className="rounded-2xl border border-zinc-800 bg-[#121216] p-6 shadow-xl space-y-5 sticky top-24">
                <h3 className="text-base font-extrabold text-white">Order Summary</h3>

                <div className="space-y-3 text-sm text-zinc-400">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-semibold text-white">{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span className="font-semibold text-white">
                      {shipping === 0 ? <span className="text-emerald-400">Free</span> : formatCurrency(shipping)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Estimated Tax (8%)</span>
                    <span className="font-semibold text-white">{formatCurrency(estimatedTax)}</span>
                  </div>

                  <div className="border-t border-zinc-800 pt-3 flex justify-between text-base font-bold text-white">
                    <span>Estimated Total</span>
                    <span className="text-xl text-purple-400">{formatCurrency(total)}</span>
                  </div>
                </div>

                <Button
                  size="lg"
                  className="w-full bg-purple-600 hover:bg-purple-500 text-white font-semibold shadow-lg shadow-purple-900/40"
                  onClick={handleProceedToCheckout}
                  rightIcon={<ArrowRight className="h-4 w-4" />}
                >
                  Proceed to Checkout
                </Button>

                <div className="flex items-center justify-center gap-2 text-xs text-zinc-500 pt-1">
                  <ShieldCheck className="h-4 w-4 text-purple-400" />
                  <span>256-bit encrypted checkout security</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="my-16 flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-800 p-12 text-center bg-[#121216]">
            <ShoppingBag className="h-14 w-14 text-zinc-600 mb-4" />
            <h3 className="text-lg font-bold text-white">Your shopping bag is empty</h3>
            <p className="mt-1 text-sm text-zinc-400 max-w-sm">
              Explore our curated selection of acoustic and workspace hardware to find your next essential tool.
            </p>
            <div className="mt-6">
              <Link to="/products">
                <Button size="md" className="bg-purple-600 hover:bg-purple-500 text-white">
                  Browse Catalog
                </Button>
              </Link>
            </div>
          </div>
        )}
      </PageContainer>
    </div>
  );
};
