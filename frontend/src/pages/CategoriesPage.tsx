import React, { useState, useEffect } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { CategoryCard } from '../features/categories/components/CategoryCard';
import { CategoryCardSkeleton } from '../components/ui/LoadingSkeleton';
import { ErrorState } from '../components/ui/ErrorState';
import { Badge } from '../components/ui/Badge';
import { fetchCategories } from '../features/categories/api/categoryApi';
import { getErrorMessage } from '../lib/apiClient';
import type { Category } from '../types';

export const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCategories = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchCategories(50);
      setCategories(data || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  return (
    <div className="py-10 pb-20 bg-[#09090b]">
      <PageContainer>
        <div className="mb-10 max-w-2xl">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="primary">Departments</Badge>
            <span className="text-xs text-zinc-400">Curated Collections</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Browse Categories
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            Explore premium gear arranged by creative discipline. Select any collection to view
            all available hardware in stock.
          </p>
        </div>

        {/* Loading Skeletons */}
        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <CategoryCardSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <ErrorState
            title="Failed to load categories"
            message={error}
            onRetry={loadCategories}
          />
        ) : categories.length === 0 ? (
          <div className="my-16 rounded-2xl border border-dashed border-zinc-800 p-12 text-center bg-[#121216]">
            <h3 className="text-base font-bold text-white">No categories available</h3>
            <p className="mt-1 text-xs text-zinc-400">
              Please check back soon as our catalog is updated regularly.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        )}
      </PageContainer>
    </div>
  );
};
