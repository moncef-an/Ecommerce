import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  FolderTree,
  PackageCheck,
  Plus,
  Edit2,
  Trash2,
  Search,
  CheckCircle2,
  AlertCircle,
  X,
  RefreshCw,
  Clock,
  Truck,
} from 'lucide-react';
import { PageContainer } from '../components/layout/PageContainer';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { formatCurrency } from '../lib/utils';
import {
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../features/categories/api/categoryApi';
import { getUserOrders, updateAdminOrderStatus } from '../features/orders/api/orderApi';
import type { Category, Order, OrderStatus } from '../types';

export const AdminDashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'categories' | 'orders'>('categories');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Category State
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [categorySearch, setCategorySearch] = useState('');
  const [isCreateCategoryModal, setIsCreateCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  const [categoryNameInput, setCategoryNameInput] = useState('');

  // Order State
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [manualOrderId, setManualOrderId] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>('CONFIRMED');

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load categories
  const loadCategories = async () => {
    setIsLoadingCategories(true);
    try {
      const data = await fetchCategories(100);
      setCategories(data || []);
    } catch {
      setFeedback({ type: 'error', message: 'Failed to fetch categories.' });
    } finally {
      setIsLoadingCategories(false);
    }
  };

  // Load orders
  const loadOrders = async () => {
    setIsLoadingOrders(true);
    try {
      const res = await getUserOrders();
      setOrders(res.data || []);
    } catch {
      // User orders endpoint works for current user; orders might be empty if admin hasn't placed orders
    } finally {
      setIsLoadingOrders(false);
    }
  };

  useEffect(() => {
    loadCategories();
    loadOrders();
  }, []);

  // Category CRUD Handlers
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryNameInput.trim()) {
      setFeedback({ type: 'error', message: 'Category name cannot be empty.' });
      return;
    }
    setIsSubmitting(true);
    try {
      await createCategory(categoryNameInput.trim());
      setFeedback({ type: 'success', message: `Category "${categoryNameInput}" created successfully.` });
      setIsCreateCategoryModal(false);
      setCategoryNameInput('');
      await loadCategories();
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { error?: string } } };
      setFeedback({
        type: 'error',
        message: errorObj.response?.data?.error || 'Failed to create category. Admin authorization required.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory || !categoryNameInput.trim()) return;
    setIsSubmitting(true);
    try {
      await updateCategory(editingCategory.id, categoryNameInput.trim());
      setFeedback({ type: 'success', message: `Category updated to "${categoryNameInput}".` });
      setEditingCategory(null);
      setCategoryNameInput('');
      await loadCategories();
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { error?: string } } };
      setFeedback({
        type: 'error',
        message: errorObj.response?.data?.error || 'Failed to update category.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!deletingCategory) return;
    setIsSubmitting(true);
    try {
      await deleteCategory(deletingCategory.id);
      setFeedback({ type: 'success', message: `Category "${deletingCategory.name}" removed.` });
      setDeletingCategory(null);
      await loadCategories();
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { error?: string } } };
      setFeedback({
        type: 'error',
        message: errorObj.response?.data?.error || 'Failed to delete category.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Order Status Handler
  const handleStatusUpdate = async (orderId: string, status: OrderStatus) => {
    if (!orderId.trim()) {
      setFeedback({ type: 'error', message: 'Order ID is required.' });
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await updateAdminOrderStatus(orderId.trim(), status);
      setFeedback({ type: 'success', message: res.message || `Order status updated to ${status} successfully.` });
      // Update local state if present
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status } : o))
      );
      setManualOrderId('');
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { error?: string } } };
      setFeedback({
        type: 'error',
        message: errorObj.response?.data?.error || 'Failed to update order status. Ensure Order ID exists.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(categorySearch.toLowerCase())
  );

  const statusColors: Record<OrderStatus, string> = {
    PENDING: 'bg-amber-950/80 text-amber-300 border-amber-500/40',
    CONFIRMED: 'bg-blue-950/80 text-blue-300 border-blue-500/40',
    PROCESSING: 'bg-purple-950/80 text-purple-300 border-purple-500/40',
    SHIPPED: 'bg-cyan-950/80 text-cyan-300 border-cyan-500/40',
    DELIVERED: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40',
    CANCELLED: 'bg-rose-950/80 text-rose-300 border-rose-500/40',
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 py-8">
      <PageContainer>
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-xl bg-purple-950/80 border border-purple-500/40 text-purple-400">
              <ShieldCheck className="w-6 h-6" />
            </span>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                Admin Control Center
              </h1>
              <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
                Centralized store management: category hierarchy, permissions, and customer order fulfilment.
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#141418] border border-zinc-800 self-start md:self-auto">
            <button
              onClick={() => setActiveTab('categories')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'categories'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-900/40'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <FolderTree className="w-4 h-4" />
              Categories ({categories.length})
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'orders'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-900/40'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <PackageCheck className="w-4 h-4" />
              Order Management
            </button>
          </div>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`mt-6 flex items-center justify-between p-4 rounded-xl border ${
              feedback.type === 'success'
                ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200'
                : 'bg-rose-950/60 border-rose-500/40 text-rose-200'
            }`}
          >
            <div className="flex items-center gap-3">
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
              )}
              <span className="text-sm font-medium">{feedback.message}</span>
            </div>
            <button
              onClick={() => setFeedback(null)}
              className="p-1 rounded-md text-zinc-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* TAB 1: CATEGORY MANAGEMENT */}
        {activeTab === 'categories' && (
          <div className="mt-8 space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative w-full sm:max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                  placeholder="Filter categories by name..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#141418] border border-zinc-800 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-purple-500"
                />
              </div>
              <Button
                onClick={() => {
                  setCategoryNameInput('');
                  setIsCreateCategoryModal(true);
                }}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-900/40"
              >
                <Plus className="w-4 h-4" />
                Add Category
              </Button>
            </div>

            {/* Categories Grid */}
            {isLoadingCategories ? (
              <div className="p-12 text-center text-zinc-400">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-purple-400" />
                <p className="text-sm">Loading categories...</p>
              </div>
            ) : filteredCategories.length === 0 ? (
              <div className="p-12 rounded-2xl bg-[#121216] border border-zinc-800 text-center text-zinc-400">
                <FolderTree className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
                <p className="text-base font-semibold text-zinc-200">No categories found</p>
                <p className="text-xs text-zinc-500 mt-1">Create a new category to organize store inventory.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCategories.map((cat) => (
                  <Card
                    key={cat.id}
                    className="p-5 bg-[#121216] border-zinc-800 hover:border-purple-500/50 transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-purple-950/80 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:scale-105 transition-transform">
                        <FolderTree className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-base leading-tight">{cat.name}</h3>
                        <p className="text-[11px] font-mono text-zinc-500 mt-0.5 truncate max-w-[150px]">
                          ID: {cat.id}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          setEditingCategory(cat);
                          setCategoryNameInput(cat.name);
                        }}
                        className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                        title="Edit Category Name"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeletingCategory(cat)}
                        className="p-2 rounded-lg bg-zinc-800 hover:bg-rose-950/60 text-zinc-400 hover:text-rose-400 transition-colors cursor-pointer"
                        title="Delete Category"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ORDER MANAGEMENT */}
        {activeTab === 'orders' && (
          <div className="mt-8 space-y-8">
            {/* Quick Status Dispatch Box */}
            <Card className="p-6 bg-[#121216] border-zinc-800">
              <div className="flex items-center gap-3 mb-4">
                <Truck className="w-5 h-5 text-purple-400" />
                <h3 className="text-base font-bold text-white">Direct Order Status Dispatch</h3>
              </div>
              <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
                As an Admin, you can transition any customer order status in real time (<code className="text-purple-300 bg-zinc-850 px-1.5 py-0.5 rounded">PATCH /api/v1/admin/orders/:id/status</code>).
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input
                  type="text"
                  value={manualOrderId}
                  onChange={(e) => setManualOrderId(e.target.value)}
                  placeholder="Enter Order UUID..."
                  className="px-3.5 py-2.5 rounded-xl bg-[#18181f] border border-zinc-700 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-purple-500 font-mono text-xs"
                />
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as OrderStatus)}
                  className="px-3.5 py-2.5 rounded-xl bg-[#18181f] border border-zinc-700 text-sm text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="PENDING">PENDING</option>
                  <option value="CONFIRMED">CONFIRMED</option>
                  <option value="PROCESSING">PROCESSING</option>
                  <option value="SHIPPED">SHIPPED</option>
                  <option value="DELIVERED">DELIVERED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
                <Button
                  onClick={() => handleStatusUpdate(manualOrderId, selectedStatus)}
                  disabled={isSubmitting || !manualOrderId.trim()}
                  className="bg-purple-600 hover:bg-purple-500 text-white flex items-center justify-center gap-2"
                >
                  <RefreshCw className={`w-4 h-4 ${isSubmitting ? 'animate-spin' : ''}`} />
                  Update Status
                </Button>
              </div>
            </Card>

            {/* Recent Orders List */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-purple-400" />
                  Your Active Order Records
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadOrders}
                  disabled={isLoadingOrders}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingOrders ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>

              {isLoadingOrders ? (
                <div className="p-12 text-center text-zinc-400">
                  <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-purple-400" />
                  <p className="text-sm">Loading order records...</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="p-12 rounded-2xl bg-[#121216] border border-zinc-800 text-center text-zinc-400">
                  <PackageCheck className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
                  <p className="text-base font-semibold text-zinc-200">No direct user orders registered yet</p>
                  <p className="text-xs text-zinc-500 mt-1">
                    You can still update any customer order by typing its ID into the Direct Status Dispatch box above.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <Card
                      key={order.id}
                      className="p-5 bg-[#121216] border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono text-xs font-bold text-purple-300">
                            #{order.id.slice(0, 8)}...
                          </span>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold border ${statusColors[order.status] || ''}`}>
                            {order.status}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-400">
                          Placed on: <span className="text-zinc-200">{order.created_at}</span> • Total:{' '}
                          <strong className="text-purple-300">{formatCurrency(order.total_price)}</strong>
                        </p>
                        <p className="text-[11px] font-mono text-zinc-500">
                          Full ID: {order.id}
                        </p>
                      </div>

                      {/* Quick Status Setter for this order */}
                      <div className="flex items-center gap-2 self-start md:self-auto">
                        <select
                          defaultValue={order.status}
                          onChange={(e) => handleStatusUpdate(order.id, e.target.value as OrderStatus)}
                          disabled={isSubmitting}
                          className="px-3 py-1.5 rounded-lg bg-[#18181f] border border-zinc-700 text-xs font-semibold text-white focus:outline-none focus:border-purple-500"
                        >
                          <option value="PENDING">PENDING</option>
                          <option value="CONFIRMED">CONFIRMED</option>
                          <option value="PROCESSING">PROCESSING</option>
                          <option value="SHIPPED">SHIPPED</option>
                          <option value="DELIVERED">DELIVERED</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </select>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </PageContainer>

      {/* CREATE CATEGORY MODAL */}
      {isCreateCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-[#121216] border border-zinc-800 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-purple-400" />
                Add New Category
              </h2>
              <button
                onClick={() => setIsCreateCategoryModal(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCategory} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={categoryNameInput}
                  onChange={(e) => setCategoryNameInput(e.target.value)}
                  placeholder="e.g. Mechanical Keyboards, Studio Audio..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#18181f] border border-zinc-700 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateCategoryModal(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-purple-600 hover:bg-purple-500 text-white"
                >
                  {isSubmitting ? 'Creating...' : 'Create Category'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT CATEGORY MODAL */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-[#121216] border border-zinc-800 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-purple-400" />
                Edit Category
              </h2>
              <button
                onClick={() => setEditingCategory(null)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateCategory} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={categoryNameInput}
                  onChange={(e) => setCategoryNameInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#18181f] border border-zinc-700 text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingCategory(null)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-purple-600 hover:bg-purple-500 text-white"
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-[#121216] border border-zinc-800 p-6 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Delete Category</h3>
            <p className="text-sm text-zinc-400 mt-2 leading-relaxed">
              Are you sure you want to permanently remove category <strong className="text-white">"{deletingCategory.name}"</strong>?
            </p>
            <div className="flex items-center justify-end gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setDeletingCategory(null)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeleteCategory}
                disabled={isSubmitting}
                className="bg-rose-600 hover:bg-rose-500 text-white"
              >
                {isSubmitting ? 'Deleting...' : 'Delete Permanently'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
