import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  Calendar,
  ShoppingBag,
} from 'lucide-react';
import { PageContainer } from '../components/layout/PageContainer';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/LoadingSkeleton';
import { ErrorState } from '../components/ui/ErrorState';
import { getUserOrders, cancelUserOrder } from '../features/orders/api/orderApi';
import { formatCurrency } from '../lib/utils';
import { getErrorMessage } from '../lib/apiClient';
import type { Order, OrderStatus } from '../types';

export const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await getUserOrders();
      setOrders(res.data || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleCancelOrder = async (orderId: string) => {
    setCancellingId(orderId);
    try {
      await cancelUserOrder(orderId);
      // Update UI state immediately
      setOrders((prev) =>
        prev.map((ord) => (ord.id === orderId ? { ...ord, status: 'CANCELLED' } : ord))
      );
      setToastMessage('Order has been cancelled successfully.');
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err) {
      alert(`Could not cancel order: ${getErrorMessage(err)}`);
    } finally {
      setCancellingId(null);
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING':
        return (
          <Badge variant="warning" className="flex items-center gap-1 font-semibold">
            <Clock className="h-3 w-3" />
            Pending Processing
          </Badge>
        );
      case 'CONFIRMED':
      case 'PROCESSING':
        return (
          <Badge variant="primary" className="flex items-center gap-1 font-semibold">
            <Clock className="h-3 w-3" />
            {status}
          </Badge>
        );
      case 'SHIPPED':
      case 'DELIVERED':
        return (
          <Badge variant="success" className="flex items-center gap-1 font-semibold">
            <CheckCircle2 className="h-3 w-3" />
            {status}
          </Badge>
        );
      case 'CANCELLED':
        return (
          <Badge variant="default" className="bg-rose-950/70 text-rose-300 border-rose-800/40 font-semibold">
            <XCircle className="h-3 w-3" />
            Cancelled
          </Badge>
        );
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  return (
    <div className="py-10 pb-20 bg-[#09090b]">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl border border-purple-500/40 bg-purple-950/90 px-4 py-3 text-sm font-semibold text-purple-200 shadow-2xl backdrop-blur-md animate-bounce">
          <CheckCircle2 className="h-5 w-5 text-purple-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      <PageContainer>
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="primary">Account Orders</Badge>
            <span className="text-xs text-zinc-400">Order History</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            My Orders
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Track current deliveries, review purchase history, and manage order cancellations.
          </p>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-44 w-full rounded-2xl bg-zinc-800" />
            <Skeleton className="h-44 w-full rounded-2xl bg-zinc-800" />
          </div>
        ) : error ? (
          <ErrorState
            title="Failed to load orders"
            message={error}
            onRetry={loadOrders}
          />
        ) : orders.length === 0 ? (
          <div className="my-16 rounded-3xl border border-dashed border-zinc-800 p-12 text-center bg-[#121216] max-w-lg mx-auto space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-950/60 border border-purple-500/30 text-purple-400">
              <Package className="h-7 w-7" />
            </div>
            <h3 className="text-lg font-bold text-white">No Orders Placed Yet</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              When you purchase hardware from our catalog, your order status, receipts, and tracking details will appear here.
            </p>
            <div className="pt-2">
              <Link to="/products">
                <Button className="bg-purple-600 hover:bg-purple-500 text-white font-semibold">
                  Start Shopping
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const isCancellable = order.status === 'PENDING';

              return (
                <div
                  key={order.id}
                  className="rounded-3xl border border-zinc-800 bg-[#121216] p-6 sm:p-7 shadow-xl space-y-5"
                >
                  {/* Order header row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs font-bold text-purple-300">
                          Order #{order.id.slice(0, 8)}
                        </span>
                        {getStatusBadge(order.status)}
                      </div>
                      <p className="text-xs text-zinc-500 flex items-center gap-1.5 pt-0.5">
                        <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                        <span>Placed on {order.created_at || 'Recent date'}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-4 self-start sm:self-auto">
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-zinc-500">Total</span>
                        <p className="text-base font-extrabold text-white">
                          {formatCurrency(order.total_price)}
                        </p>
                      </div>

                      {isCancellable && (
                        <Button
                          size="sm"
                          variant="outline"
                          isLoading={cancellingId === order.id}
                          onClick={() => handleCancelOrder(order.id)}
                          className="border-rose-800/60 bg-rose-950/30 text-rose-300 hover:bg-rose-900/50 hover:text-white hover:border-rose-600 text-xs"
                        >
                          Cancel Order
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Items list */}
                  {order.items && order.items.length > 0 ? (
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                        Order Items
                      </h4>
                      <div className="divide-y divide-zinc-850 rounded-2xl bg-[#18181f] p-4 border border-zinc-800/80">
                        {order.items.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0 text-xs"
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-800 text-purple-400">
                                <ShoppingBag className="h-3.5 w-3.5" />
                              </div>
                              <div>
                                <p className="font-semibold text-white">
                                  {item.product?.name || `Product ID: ${item.product_id.slice(0, 10)}...`}
                                </p>
                                <span className="text-zinc-500">Quantity: {item.quantity}</span>
                              </div>
                            </div>
                            <span className="font-bold text-zinc-200">
                              {formatCurrency(item.price * item.quantity)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-zinc-500 italic">
                      Hardware details packaged and queued for fulfillment.
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </PageContainer>
    </div>
  );
};
