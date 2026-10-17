import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Check, Tag } from 'lucide-react';
import type { Product } from '../../../types';
import { formatCurrency } from '../../../lib/utils';
import { Badge } from '../../../components/ui/Badge';
import { getProductFallbackImage } from '../../../lib/imageFallback';
import { useCart } from '../../cart/context/CartContext';

interface ProductCardProps {
  product: Product;
  onAddToCartSuccess?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCartSuccess }) => {
  const [added, setAdded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const { addToCart } = useCart();

  const fallbackUrl = getProductFallbackImage(product.category?.name);
  const displayImage = imgError ? fallbackUrl : product.imageUrl || fallbackUrl;

  const handleAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock <= 0) return;

    try {
      const success = await addToCart(product.id, 1);
      if (success) {
        setAdded(true);
        if (onAddToCartSuccess) {
          onAddToCartSuccess(product);
        }
        setTimeout(() => setAdded(false), 1800);
      }
    } catch {
      // Errors handled gracefully in UI
    }
  };

  const isOutOfStock = product.stock <= 0;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-zinc-800/80 bg-[#121216] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-950/20 hover:border-purple-500/40">
      <Link
        to={`/products/${product.id}`}
        state={{ product }}
        className="block aspect-4/3 w-full overflow-hidden bg-zinc-900 relative"
      >
        <img
          src={displayImage}
          alt={product.name}
          loading="lazy"
          onError={() => setImgError(true)}
          className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
        />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
          {product.category?.name && (
            <Badge variant="primary" className="font-semibold backdrop-blur-md">
              <Tag className="h-3 w-3 mr-1" />
              {product.category.name}
            </Badge>
          )}

          {isOutOfStock ? (
            <Badge variant="default" className="bg-rose-950/80 text-rose-300 border-rose-800/40">
              Out of stock
            </Badge>
          ) : product.stock <= 10 ? (
            <Badge variant="warning">
              Only {product.stock} left
            </Badge>
          ) : null}
        </div>

        {/* Quick Add Overlay on Hover (desktop) */}
        {!isOutOfStock && (
          <div className="absolute inset-x-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
            <button
              type="button"
              onClick={handleAdd}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer ${
                added
                  ? 'bg-emerald-600 text-white'
                  : 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-950/60'
              }`}
            >
              {added ? (
                <>
                  <Check className="h-4 w-4" />
                  <span>Added to bag</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="h-4 w-4" />
                  <span>Add to Bag</span>
                </>
              )}
            </button>
          </div>
        )}
      </Link>

      {/* Product Details */}
      <div className="flex flex-1 flex-col p-5">
        <Link
          to={`/products/${product.id}`}
          state={{ product }}
          className="group/title focus:outline-none"
        >
          <h3 className="text-sm font-semibold text-white group-hover/title:text-purple-300 transition-colors line-clamp-1">
            {product.name}
          </h3>
        </Link>

        {product.description && (
          <p className="mt-1 text-xs text-zinc-400 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        )}

        {/* Seller Info if available */}
        {product.seller?.name && (
          <div className="mt-2 text-[11px] text-zinc-500">
            By <span className="font-medium text-zinc-300">{product.seller.name}</span>
          </div>
        )}

        {/* Price and Stock Status Footer */}
        <div className="mt-auto pt-4 flex items-center justify-between border-t border-zinc-800/80">
          <div className="flex flex-col">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Price</span>
            <span className="text-base font-extrabold text-white">
              {formatCurrency(product.price)}
            </span>
          </div>

          <div>
            {isOutOfStock ? (
              <span className="text-xs font-medium text-rose-400 bg-rose-950/40 px-2 py-0.5 rounded-md border border-rose-800/30">
                Unavailable
              </span>
            ) : (
              <span className="text-xs font-medium text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-800/30">
                In stock ({product.stock})
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
