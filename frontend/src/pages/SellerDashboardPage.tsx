import React, { useState, useEffect } from 'react';
import {
  PackagePlus,
  Edit2,
  Trash2,
  Search,
  AlertCircle,
  CheckCircle2,
  X,
  Package,
  Layers,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react';
import { PageContainer } from '../components/layout/PageContainer';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { formatCurrency } from '../lib/utils';
import { getProductFallbackImage } from '../lib/imageFallback';
import {
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  type CreateProductPayload,
  type UpdateProductPayload,
} from '../features/products/api/productApi';
import { fetchCategories } from '../features/categories/api/categoryApi';
import type { Product, Category } from '../types';

export const SellerDashboardPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form States for Create
  const [createForm, setCreateForm] = useState<CreateProductPayload>({
    name: '',
    description: '',
    price: 0,
    stock: 0,
    category: '',
  });

  // Form States for Edit
  const [editForm, setEditForm] = useState<UpdateProductPayload>({
    name: '',
    description: '',
    price: 0,
    stock: 0,
  });

  // Load products & categories
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        fetchProducts({ limit: 100 }),
        fetchCategories(100),
      ]);
      setProducts(productsRes.data || []);
      setCategories(categoriesRes || []);
      if (categoriesRes && categoriesRes.length > 0 && !createForm.category) {
        setCreateForm((prev) => ({ ...prev, category: categoriesRes[0].name }));
      }
    } catch {
      setFeedback({ type: 'error', message: 'Failed to load catalog data from server.' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCreateModal = () => {
    setCreateForm({
      name: '',
      description: '',
      price: 0,
      stock: 10,
      category: categories[0]?.name || '',
    });
    setIsCreateModalOpen(true);
  };

  const handleOpenEditModal = (product: Product) => {
    setEditingProduct(product);
    setEditForm({
      name: product.name,
      description: product.description || '',
      price: product.price,
      stock: product.stock,
    });
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.name.trim()) {
      setFeedback({ type: 'error', message: 'Product name cannot be empty.' });
      return;
    }
    if (!createForm.category) {
      setFeedback({ type: 'error', message: 'Please select a product category.' });
      return;
    }
    if (createForm.price <= 0) {
      setFeedback({ type: 'error', message: 'Price must be greater than 0.' });
      return;
    }

    setIsSubmitting(true);
    try {
      await createProduct({
        ...createForm,
        name: createForm.name.trim(),
        price: Number(createForm.price),
        stock: Number(createForm.stock),
      });
      setFeedback({ type: 'success', message: `Product "${createForm.name}" created successfully!` });
      setIsCreateModalOpen(false);
      await loadData();
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { error?: string } } };
      setFeedback({
        type: 'error',
        message: errorObj.response?.data?.error || 'Failed to create product. Check backend permissions.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    if (!editForm.name.trim()) {
      setFeedback({ type: 'error', message: 'Product name cannot be empty.' });
      return;
    }
    if (editForm.price <= 0) {
      setFeedback({ type: 'error', message: 'Price must be greater than 0.' });
      return;
    }

    setIsSubmitting(true);
    try {
      await updateProduct(editingProduct.id, {
        ...editForm,
        name: editForm.name.trim(),
        price: Number(editForm.price),
        stock: Number(editForm.stock),
      });
      setFeedback({ type: 'success', message: `Product "${editForm.name}" updated successfully!` });
      setEditingProduct(null);
      await loadData();
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { error?: string } } };
      setFeedback({
        type: 'error',
        message: errorObj.response?.data?.error || 'Failed to update product.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingProduct) return;
    setIsSubmitting(true);
    try {
      await deleteProduct(deletingProduct.id);
      setFeedback({ type: 'success', message: `Product "${deletingProduct.name}" deleted.` });
      setDeletingProduct(null);
      await loadData();
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { error?: string } } };
      setFeedback({
        type: 'error',
        message: errorObj.response?.data?.error || 'Failed to delete product.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.category?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Quick stats
  const totalProducts = products.length;
  const inStockCount = products.filter((p) => p.stock > 0).length;
  const lowStockCount = products.filter((p) => p.stock > 0 && p.stock <= 5).length;
  const avgPrice = totalProducts > 0
    ? products.reduce((acc, p) => acc + p.price, 0) / totalProducts
    : 0;

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 py-8">
      <PageContainer>
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
          <div>
            <div className="flex items-center gap-3">
              <span className="p-2.5 rounded-xl bg-purple-950/80 border border-purple-500/40 text-purple-400">
                <Package className="w-6 h-6" />
              </span>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                  Seller Studio & Inventory
                </h1>
                <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
                  Manage your store catalog, edit pricing, adjust stocks, and publish new hardware items.
                </p>
              </div>
            </div>
          </div>
          <Button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-900/40"
          >
            <PackagePlus className="w-4 h-4" />
            Add New Product
          </Button>
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

        {/* Metrics Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          <Card className="p-4 bg-[#121216] border-zinc-800">
            <div className="flex items-center justify-between text-zinc-400 text-xs font-medium mb-1">
              <span>Total Catalog</span>
              <Layers className="w-4 h-4 text-purple-400" />
            </div>
            <p className="text-2xl font-bold text-white">{totalProducts}</p>
            <span className="text-[11px] text-zinc-500">Live products in store</span>
          </Card>
          <Card className="p-4 bg-[#121216] border-zinc-800">
            <div className="flex items-center justify-between text-zinc-400 text-xs font-medium mb-1">
              <span>In Stock</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-bold text-emerald-400">{inStockCount}</p>
            <span className="text-[11px] text-zinc-500">Ready to ship</span>
          </Card>
          <Card className="p-4 bg-[#121216] border-zinc-800">
            <div className="flex items-center justify-between text-zinc-400 text-xs font-medium mb-1">
              <span>Low Stock Alerts</span>
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-2xl font-bold text-amber-400">{lowStockCount}</p>
            <span className="text-[11px] text-zinc-500">5 items or less left</span>
          </Card>
          <Card className="p-4 bg-[#121216] border-zinc-800">
            <div className="flex items-center justify-between text-zinc-400 text-xs font-medium mb-1">
              <span>Avg Catalog Price</span>
              <TrendingUp className="w-4 h-4 text-purple-400" />
            </div>
            <p className="text-2xl font-bold text-purple-300">{formatCurrency(avgPrice)}</p>
            <span className="text-[11px] text-zinc-500">Across active items</span>
          </Card>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by product name or category..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#141418] border border-zinc-800 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
            />
          </div>
          <span className="text-xs font-medium text-zinc-400 self-end sm:self-center">
            Showing <strong className="text-white">{filteredProducts.length}</strong> products
          </span>
        </div>

        {/* Product List Table / Card View */}
        <div className="mt-4 rounded-2xl border border-zinc-800/80 bg-[#121216] overflow-hidden shadow-xl">
          {isLoading ? (
            <div className="p-12 text-center text-zinc-400">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-purple-500 border-t-transparent mx-auto mb-3" />
              <p className="text-sm">Loading product catalog...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="p-12 text-center text-zinc-400">
              <Package className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
              <p className="text-base font-semibold text-zinc-200">No products found</p>
              <p className="text-xs text-zinc-500 mt-1">
                {searchTerm ? 'Try adjusting your search criteria.' : 'Create your first product using the button above.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 bg-[#18181f]/70 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    <th className="py-3.5 px-4">Product</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Price</th>
                    <th className="py-3.5 px-4">Stock</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {filteredProducts.map((p) => {
                    const fallbackImg = getProductFallbackImage(p.category?.name);
                    return (
                      <tr key={p.id} className="hover:bg-zinc-800/30 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={fallbackImg}
                              alt={p.name}
                              className="w-10 h-10 rounded-lg object-cover bg-zinc-800 border border-zinc-700/60 shrink-0"
                            />
                            <div>
                              <p className="font-semibold text-white leading-tight">{p.name}</p>
                              <p className="text-xs text-zinc-400 line-clamp-1 max-w-xs mt-0.5">
                                {p.description || 'No description provided.'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="primary">
                            {p.category?.name || 'General'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 font-semibold text-purple-300">
                          {formatCurrency(p.price)}
                        </td>
                        <td className="py-3 px-4">
                          {p.stock === 0 ? (
                            <Badge variant="neutral" className="text-rose-400 border-rose-500/30">
                              Out of Stock (0)
                            </Badge>
                          ) : p.stock <= 5 ? (
                            <Badge variant="warning">
                              Low Stock ({p.stock})
                            </Badge>
                          ) : (
                            <Badge variant="success">
                              In Stock ({p.stock})
                            </Badge>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="inline-flex items-center gap-2">
                            <button
                              onClick={() => handleOpenEditModal(p)}
                              className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                              title="Edit Product"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeletingProduct(p)}
                              className="p-1.5 rounded-lg bg-zinc-800 hover:bg-rose-950/60 text-zinc-400 hover:text-rose-400 transition-colors cursor-pointer"
                              title="Delete Product"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </PageContainer>

      {/* CREATE PRODUCT MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-[#121216] border border-zinc-800 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <PackagePlus className="w-5 h-5 text-purple-400" />
                Add New Product
              </h2>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  placeholder="e.g. Mechanical Studio Keyboard"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#18181f] border border-zinc-700 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Category *
                </label>
                <select
                  required
                  value={createForm.category}
                  onChange={(e) => setCreateForm({ ...createForm, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#18181f] border border-zinc-700 text-sm text-white focus:outline-none focus:border-purple-500"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.name} className="bg-[#18181f] text-white">
                      {c.name}
                    </option>
                  ))}
                </select>
                <span className="text-[11px] text-zinc-500 mt-1 block">
                  Category name as registered in store catalog.
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Price ($ USD) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={createForm.price || ''}
                    onChange={(e) => setCreateForm({ ...createForm, price: parseFloat(e.target.value) || 0 })}
                    placeholder="129.99"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#18181f] border border-zinc-700 text-sm text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Initial Stock *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={createForm.stock}
                    onChange={(e) => setCreateForm({ ...createForm, stock: parseInt(e.target.value, 10) || 0 })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#18181f] border border-zinc-700 text-sm text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  placeholder="Detail high-grade specs, chassis materials, key features..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#18181f] border border-zinc-700 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateModalOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-purple-600 hover:bg-purple-500 text-white"
                >
                  {isSubmitting ? 'Creating...' : 'Create Product'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT PRODUCT MODAL */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-[#121216] border border-zinc-800 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-purple-400" />
                Edit Product: {editingProduct.name}
              </h2>
              <button
                onClick={() => setEditingProduct(null)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#18181f] border border-zinc-700 text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Price ($ USD) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={editForm.price || ''}
                    onChange={(e) => setEditForm({ ...editForm, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#18181f] border border-zinc-700 text-sm text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={editForm.stock}
                    onChange={(e) => setEditForm({ ...editForm, stock: parseInt(e.target.value, 10) || 0 })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#18181f] border border-zinc-700 text-sm text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#18181f] border border-zinc-700 text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingProduct(null)}
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
      {deletingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-[#121216] border border-zinc-800 p-6 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Delete Product</h3>
            <p className="text-sm text-zinc-400 mt-2 leading-relaxed">
              Are you sure you want to permanently delete <strong className="text-white">"{deletingProduct.name}"</strong>? This item will be removed from customer view.
            </p>
            <div className="flex items-center justify-end gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setDeletingProduct(null)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeleteConfirm}
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
