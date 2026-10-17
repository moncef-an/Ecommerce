import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  SlidersHorizontal,
  Search,
  ChevronLeft,
  ChevronRight,
  PackageOpen,
  CheckCircle2,
} from 'lucide-react';
import { PageContainer } from '../components/layout/PageContainer';
import { ProductCard } from '../features/products/components/ProductCard';
import { ProductCardSkeleton } from '../components/ui/LoadingSkeleton';
import { ErrorState } from '../components/ui/ErrorState';
import { Badge } from '../components/ui/Badge';
import { fetchProducts } from '../features/products/api/productApi';
import { fetchCategories } from '../features/categories/api/categoryApi';
import { getErrorMessage } from '../lib/apiClient';
import type { Product, Category, ProductsMeta } from '../types';

const PAGE_SIZE = 12;

export const ProductsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedCategoryId = searchParams.get('category') || 'all';

  // API State
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [meta, setMeta] = useState<ProductsMeta>({ total: 0, limit: PAGE_SIZE, offset: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Client-side interactions
  const urlSearch = searchParams.get('search') || '';
  const [searchFilter, setSearchFilter] = useState(urlSearch);
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc' | 'name-asc'>('default');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    setSearchFilter(urlSearch);
  }, [urlSearch]);

  const currentPage = Math.floor(meta.offset / PAGE_SIZE) + 1;
  const totalPages = Math.max(1, Math.ceil(meta.total / PAGE_SIZE));

  // Load real categories once for filter tabs
  useEffect(() => {
    let isMounted = true;
    async function loadCategories() {
      try {
        setIsCategoriesLoading(true);
        const data = await fetchCategories(50);
        if (isMounted) {
          setCategories(data);
        }
      } catch (err) {
        console.error('Failed to load categories:', err);
      } finally {
        if (isMounted) setIsCategoriesLoading(false);
      }
    }
    loadCategories();
    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch real products when category or offset changes
  const loadProducts = useCallback(
    async (offset = 0) => {
      try {
        setIsLoading(true);
        setError(null);

        const categoryParam = selectedCategoryId === 'all' ? undefined : selectedCategoryId;
        const res = await fetchProducts({
          limit: PAGE_SIZE,
          offset,
          category_id: categoryParam,
        });

        setProducts(res.data || []);
        setMeta(res.meta || { total: 0, limit: PAGE_SIZE, offset });
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setIsLoading(false);
      }
    },
    [selectedCategoryId]
  );

  useEffect(() => {
    loadProducts(0);
  }, [loadProducts]);

  const handleCategorySelect = (catId: string) => {
    if (catId === 'all') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', catId);
    }
    setSearchParams(searchParams);
  };

  const handlePageChange = (newOffset: number) => {
    loadProducts(newOffset);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddToCartSuccess = (product: Product) => {
    setToastMessage(`Added "${product.name}" to bag`);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Client-side search and sorting on currently loaded page
  const processedProducts = useMemo(() => {
    let result = [...products];

    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q)
      );
    }

    if (sortBy === 'price-asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'name-asc') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [products, searchFilter, sortBy]);

  return (
    <div className="py-10 pb-20 bg-[#09090b]">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl border border-emerald-500/40 bg-emerald-950/80 px-4 py-3 text-sm font-semibold text-emerald-200 shadow-2xl backdrop-blur-md animate-bounce">
          <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      <PageContainer>
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="primary">Product Catalog</Badge>
            <span className="text-xs text-zinc-400">Curated Inventory</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            All Products & Equipment
          </h1>
          <p className="mt-1 text-sm text-zinc-400 max-w-2xl">
            Browse our full lineup of studio acoustics, ergonomic desk items, and precision timepieces.
            {meta.total > 0 && ` Showing available items from ${meta.total.toLocaleString()} total pieces.`}
          </p>
        </div>

        {/* Category Filter Tabs */}
        <div className="mb-6 flex flex-wrap items-center gap-2 border-b border-zinc-800 pb-4">
          <button
            onClick={() => handleCategorySelect('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              selectedCategoryId === 'all'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-950/60'
                : 'bg-[#141418] text-zinc-300 hover:bg-zinc-800 hover:text-white border border-zinc-800'
            }`}
          >
            All Categories
          </button>

          {!isCategoriesLoading &&
            categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategorySelect(cat.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  selectedCategoryId === cat.id
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-950/60'
                    : 'bg-[#141418] text-zinc-300 hover:bg-zinc-800 hover:text-white border border-zinc-800'
                }`}
              >
                {cat.name}
              </button>
            ))}
        </div>

        {/* Toolbar: Search inside loaded items + Sort dropdown + Item Count */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-[#121216] p-4 rounded-2xl border border-zinc-800 shadow-sm">
          {/* Client search */}
          <div className="relative flex-1 max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search current page by name..."
              className="w-full rounded-xl border border-zinc-800 bg-[#18181f] pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-zinc-500 focus:bg-[#1a1a24] focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs">
            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 text-zinc-400">
              <SlidersHorizontal className="h-4 w-4 text-purple-400" />
              <span>Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                aria-label="Sort products by"
                className="rounded-lg border border-zinc-800 bg-[#18181f] px-2.5 py-1 text-xs text-zinc-200 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
              >
                <option value="default">Newest First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name-asc">Name: A to Z</option>
              </select>
            </div>

            {/* Total Results */}
            <span className="text-zinc-400 font-medium">
              Showing {processedProducts.length} of {meta.total} items
            </span>
          </div>
        </div>

        {/* Content Area: Loading, Error, Empty, or Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <ErrorState
            title="Failed to load products"
            message={error}
            onRetry={() => loadProducts(meta.offset)}
          />
        ) : processedProducts.length === 0 ? (
          <div className="my-16 flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-800 p-12 text-center bg-[#121216]">
            <PackageOpen className="h-12 w-12 text-zinc-600 mb-3" />
            <h3 className="text-base font-bold text-white">No products found</h3>
            <p className="mt-1 text-xs text-zinc-400 max-w-sm">
              {searchFilter
                ? `No products match "${searchFilter}". Try clearing your search filter.`
                : 'No products are currently available in this category.'}
            </p>
            {searchFilter && (
              <button
                onClick={() => setSearchFilter('')}
                className="mt-4 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                Clear Search Filter
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {processedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCartSuccess={handleAddToCartSuccess}
              />
            ))}
          </div>
        )}

        {/* Real Backend Pagination */}
        {!isLoading && !error && meta.total > PAGE_SIZE && (
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-zinc-800 pt-6">
            <div className="text-xs text-zinc-400">
              Showing page <strong className="text-white">{currentPage}</strong> of{' '}
              <strong className="text-white">{totalPages}</strong> ({meta.total} total items)
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={meta.offset <= 0}
                onClick={() => handlePageChange(Math.max(0, meta.offset - PAGE_SIZE))}
                className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl border border-zinc-800 bg-[#121216] text-xs font-semibold text-zinc-300 hover:text-white hover:border-purple-500/40 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Previous</span>
              </button>

              <button
                type="button"
                disabled={meta.offset + PAGE_SIZE >= meta.total}
                onClick={() => handlePageChange(meta.offset + PAGE_SIZE)}
                className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl border border-zinc-800 bg-[#121216] text-xs font-semibold text-zinc-300 hover:text-white hover:border-purple-500/40 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <span>Next</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </PageContainer>
    </div>
  );
};
