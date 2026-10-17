import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Folder } from 'lucide-react';
import type { Category } from '../../../types';
import { getCategoryFallbackImage } from '../../../lib/imageFallback';

interface CategoryCardProps {
  category: Category;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ category }) => {
  const [imgError, setImgError] = useState(false);

  const fallbackUrl = getCategoryFallbackImage(category.name);
  const displayImage = imgError ? fallbackUrl : category.imageUrl || fallbackUrl;

  return (
    <Link
      to={`/products?category=${encodeURIComponent(category.id)}`}
      className="group relative flex h-72 flex-col justify-end overflow-hidden rounded-2xl border border-zinc-800/80 bg-[#121216] p-6 text-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-950/30 hover:border-purple-500/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
    >
      {/* Background Image with Gradient Overlay */}
      <img
        src={displayImage}
        alt={category.name}
        loading="lazy"
        onError={() => setImgError(true)}
        className="absolute inset-0 h-full w-full object-cover object-center opacity-40 transition-transform duration-700 ease-out group-hover:scale-110 group-hover:opacity-30"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-[#09090b]/60 to-transparent" />

      {/* Content */}
      <div className="relative z-10 flex flex-col">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-purple-400">
            <Folder className="h-3.5 w-3.5" />
            Collection
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-950/70 border border-purple-500/30 text-purple-300 backdrop-blur-md transition-all duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:bg-purple-600 group-hover:text-white group-hover:border-purple-400">
            <ArrowUpRight className="h-4 w-4" />
          </div>
        </div>

        <h3 className="mt-2 text-xl font-extrabold tracking-tight text-white group-hover:text-purple-300 transition-colors">
          {category.name}
        </h3>

        <p className="mt-1 text-xs text-zinc-400">
          Explore products in this collection
        </p>
      </div>
    </Link>
  );
};
