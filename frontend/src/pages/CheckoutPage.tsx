import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  CheckCircle2,
  Package,
  ArrowRight,
  CreditCard,
  Truck,
  MapPin,
  Lock,
} from 'lucide-react';
import { PageContainer } from '../components/layout/PageContainer';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { useCart } from '../features/cart/context/CartContext';
import { checkoutCart } from '../features/orders/api/orderApi';
import { formatCurrency } from '../lib/utils';
import { getErrorMessage } from '../lib/apiClient';
import type { Order } from '../types';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { cart, refreshCart } = useCart();

  const [address, setAddress] = useState('142 Modern Studio Way, Suite 400');
  const [city, setCity] = useState('San Francisco, CA');
  const [postalCode, setPostalCode] = useState('94107');
  const [cardNumber, setCardNumber] = useState('•••• •••• •••• 4242');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  const items = cart?.items || [];
  const subtotal = items.reduce((sum, item) => sum + (item.subtotal || (item.price || 0) * item.quantity), 0);
  const shipping = subtotal >= 150 || subtotal === 0 ? 0 : 15.0;
  const estimatedTax = subtotal * 0.08;
  const total = subtotal + shipping + estimatedTax;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      setErrorMessage('Your cart is empty. Please add items before placing an order.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await checkoutCart();
      setCompletedOrder(response.data);
      // Refresh cart state so cart badge resets to 0
      await refreshCart();
    } catch (err) {
      setErrorMessage(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  if (completedOrder) {
    return (
      <div className="py-16 bg-[#09090b]">
        <PageContainer size="narrow">
          <div className="rounded-3xl border border-purple-500/30 bg-[#121216] p-8 sm:p-12 text-center space-y-6 shadow-2xl shadow-purple-950/40">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-400">
              <CheckCircle2 className="h-8 w-8" />
            </div>

            <div className="space-y-2">
              <Badge variant="success">Order Placed Successfully</Badge>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                Thank You for Your Order!
              </h1>
              <p className="text-sm text-zinc-400 max-w-md mx-auto">
                Your hardware order has been registered and is now scheduled for preparation and dispatch.
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-[#18181f] p-5 text-left text-xs space-y-3">
              <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
                <span className="text-zinc-400 font-semibold">Order Reference</span>
                <span className="font-mono text-purple-300 font-bold">{completedOrder.id}</span>
              </div>
              <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
                <span className="text-zinc-400 font-semibold">Order Status</span>
                <span className="text-amber-400 font-bold">{completedOrder.status}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-400 font-semibold">Total Amount</span>
                <span className="text-white font-bold text-sm">
                  {formatCurrency(completedOrder.total_price)}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                size="lg"
                onClick={() => navigate('/orders')}
                className="flex-1 bg-purple-600 hover:bg-purple-500 text-white font-semibold shadow-lg shadow-purple-900/40"
                leftIcon={<Package className="h-4 w-4" />}
              >
                View My Orders
              </Button>

              <Link to="/products" className="flex-1">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full border-zinc-700 bg-zinc-800 text-zinc-200 hover:text-white"
                >
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </div>
        </PageContainer>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="py-20 text-center bg-[#09090b]">
        <PageContainer size="narrow">
          <div className="rounded-3xl border border-zinc-800 bg-[#121216] p-10 space-y-4">
            <h2 className="text-xl font-bold text-white">Your Cart is Empty</h2>
            <p className="text-sm text-zinc-400">
              There are no items to check out. Add products to your shopping bag first.
            </p>
            <div className="pt-2">
              <Link to="/products">
                <Button className="bg-purple-600 hover:bg-purple-500 text-white">
                  Browse Catalog
                </Button>
              </Link>
            </div>
          </div>
        </PageContainer>
      </div>
    );
  }

  return (
    <div className="py-10 pb-20 bg-[#09090b]">
      <PageContainer>
        <div className="mb-8">
          <Badge variant="primary" className="mb-2">Secure Checkout</Badge>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Complete Your Order
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Confirm your delivery details and place your order.
          </p>
        </div>

        {errorMessage && (
          <div className="mb-6 rounded-2xl border border-rose-800/40 bg-rose-950/30 p-4 text-xs text-rose-300">
            {errorMessage}
          </div>
        )}

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          {/* Shipping and Payment form */}
          <div className="space-y-6 lg:col-span-7">
            {/* Delivery address */}
            <div className="rounded-2xl border border-zinc-800 bg-[#121216] p-6 space-y-4">
              <div className="flex items-center gap-2 text-sm font-bold text-white border-b border-zinc-800 pb-3">
                <MapPin className="h-4 w-4 text-purple-400" />
                <span>Shipping Destination</span>
              </div>

              <div className="space-y-3">
                <Input
                  label="Street Address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="City / Region"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                  />
                  <Input
                    label="Postal Code"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Payment method */}
            <div className="rounded-2xl border border-zinc-800 bg-[#121216] p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2 text-sm font-bold text-white">
                  <CreditCard className="h-4 w-4 text-purple-400" />
                  <span>Payment Method</span>
                </div>
                <span className="text-[11px] text-zinc-500 flex items-center gap-1">
                  <Lock className="h-3 w-3 text-emerald-400" /> 256-Bit Encrypted
                </span>
              </div>

              <div className="space-y-3">
                <Input
                  label="Card Number"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  required
                  leftIcon={<CreditCard className="h-4 w-4" />}
                />
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Expiration" defaultValue="12/28" />
                  <Input label="CVV" defaultValue="888" type="password" />
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary Column */}
          <div className="lg:col-span-5">
            <div className="rounded-2xl border border-zinc-800 bg-[#121216] p-6 space-y-5 sticky top-24 shadow-xl">
              <h3 className="text-base font-extrabold text-white border-b border-zinc-800 pb-3">
                Items in Order ({items.length})
              </h3>

              <div className="space-y-3 max-h-60 overflow-y-auto pr-1 divide-y divide-zinc-800/60">
                {items.map((item) => (
                  <div key={item.id} className="pt-2 first:pt-0 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-white">{item.name || `Product #${item.product_id.slice(0, 6)}`}</p>
                      <p className="text-zinc-500">Qty: {item.quantity}</p>
                    </div>
                    <span className="font-semibold text-zinc-200">
                      {formatCurrency(item.subtotal || (item.price || 0) * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-zinc-800 pt-3 space-y-2 text-xs text-zinc-400">
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
                  <span>Estimated Tax</span>
                  <span className="font-semibold text-white">{formatCurrency(estimatedTax)}</span>
                </div>
                <div className="border-t border-zinc-800 pt-2 flex justify-between text-sm font-bold text-white">
                  <span>Grand Total</span>
                  <span className="text-base text-purple-400">{formatCurrency(total)}</span>
                </div>
              </div>

              <Button
                size="lg"
                isLoading={isLoading}
                onClick={handlePlaceOrder}
                className="w-full bg-purple-600 hover:bg-purple-500 text-white font-semibold shadow-lg shadow-purple-900/50"
                rightIcon={<ArrowRight className="h-4 w-4" />}
              >
                Place Order Now
              </Button>

              <div className="flex items-center justify-center gap-2 text-xs text-zinc-500 pt-1">
                <Truck className="h-4 w-4 text-purple-400" />
                <span>Express courier dispatch within 24 hours</span>
              </div>
            </div>
          </div>
        </div>
      </PageContainer>
    </div>
  );
};
