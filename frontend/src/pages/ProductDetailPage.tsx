import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ShoppingBag,
  ShieldCheck,
  Truck,
  RotateCcw,
  Check,
  Tag,
  AlertCircle,
} from 'lucide-react';
import { PageContainer } from '../components/layout/PageContainer';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/LoadingSkeleton';
import { formatCurrency } from '../lib/utils';
import { getProductFallbackImage } from '../lib/imageFallback';
import { fetchProducts } from '../features/products/api/productApi';
import { useCart } from '../features/cart/context/CartContext';
import type { Product } from '../types';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const stateProduct = (location.state as { product?: Product } | null)?.product;

  const [product, setProduct] = useState<Product | null>(
    stateProduct && stateProduct.id === id ? stateProduct : null
  );
  const [isLoading, setIsLoading] = useState(!product);
  const [added, setAdded] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    if (product && product.id === id) {
      setIsLoading(false);
      return;
    }

    async function lookupProduct() {
      if (!id) return;
      try {
        setIsLoading(true);
        const res = await fetchProducts({ limit: 50 });
        if (isMounted) {
          const match = res.data?.find((p) => p.id === id);
          setProduct(match || null);
        }
      } catch (err) {
        console.error('Failed to lookup product:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    lookupProduct();

    return () => {
      isMounted = false;
    };
  }, [id, product]);

  const handleAddToCart = async () => {
    if (!product || product.stock <= 0) return;
    try {
      const success = await addToCart(product.id, 1);
      if (success) {
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
      }
    } catch {
      // Error handled in UI
    }
  };

  if (isLoading) {
    return (
      <div className="py-12 bg-[#09090b]">
        <PageContainer>
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
            <Skeleton className="aspect-4/3 w-full rounded-3xl bg-zinc-800" />
            <div className="space-y-4">
              <Skeleton className="h-6 w-1/4 bg-zinc-800" />
              <Skeleton className="h-10 w-3/4 bg-zinc-800" />
              <Skeleton className="h-8 w-1/3 bg-zinc-800" />
              <Skeleton className="h-24 w-full bg-zinc-800" />
              <Skeleton className="h-12 w-1/2 bg-zinc-800" />
            </div>
          </div>
        </PageContainer>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="py-16 text-center bg-[#09090b]">
        <PageContainer size="narrow">
          <div className="rounded-3xl border border-zinc-800 bg-[#121216] p-10 shadow-sm space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-950/70 border border-purple-500/30 text-purple-400">
              <AlertCircle className="h-7 w-7" />
            </div>
            <h1 className="text-2xl font-bold text-white">Product Not Available</h1>
            <p className="text-sm text-zinc-400 max-w-md mx-auto">
              This product may be temporarily out of stock or unavailable for direct view.
            </p>
            <div className="pt-2">
              <Link to="/products">
                <Button
                  variant="primary"
                  className="bg-purple-600 hover:bg-purple-500 text-white font-semibold"
                  leftIcon={<ArrowLeft className="h-4 w-4" />}
                >
                  Return to Products Catalog
                </Button>
              </Link>
            </div>
          </div>
        </PageContainer>
      </div>
    );
  }

  const fallbackUrl = getProductFallbackImage(product.category?.name);
  const displayImage = imgError ? fallbackUrl : product.imageUrl || fallbackUrl;
  const isOutOfStock = product.stock <= 0;

  return (
    <div className="py-10 pb-20 bg-[#09090b]">
      <PageContainer>
        {/* Breadcrumb / Back button */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </button>
        </div>

        {/* Product Details Grid */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          {/* Product Media Column */}
          <div className="space-y-4">
            <div className="aspect-4/3 w-full overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900 shadow-2xl shadow-purple-950/20 relative">
              <img
                src={displayImage}
                alt={product.name}
                onError={() => setImgError(true)}
                className="h-full w-full object-cover object-center"
              />
              {product.category?.name && (
                <div className="absolute top-4 left-4">
                  <Badge variant="primary" className="backdrop-blur-md font-semibold">
                    <Tag className="h-3 w-3 mr-1" />
                    {product.category.name}
                  </Badge>
                </div>
              )}
            </div>
          </div>

          {/* Product Info Column */}
          <div className="flex flex-col space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                {product.category?.name && (
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
                    {product.category.name}
                  </span>
                )}
                {product.seller?.name && (
                  <span className="text-xs text-zinc-500">
                    • Sold by <strong className="text-zinc-300">{product.seller.name}</strong>
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                {product.name}
              </h1>

              <div className="mt-4 flex items-baseline gap-4">
                <span className="text-3xl font-black text-white">
                  {formatCurrency(product.price)}
                </span>
                {isOutOfStock ? (
                  <Badge variant="default" className="bg-rose-950/80 text-rose-300 border-rose-800/40">
                    Out of stock
                  </Badge>
                ) : (
                  <Badge variant="success">
                    In Stock ({product.stock} units)
                  </Badge>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="border-t border-zinc-800 pt-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400 mb-2">
                Description
              </h3>
              <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-line">
                {product.description || 'No description provided for this product.'}
              </p>
            </div>

            {/* Actions */}
            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <Button
                size="lg"
                disabled={isOutOfStock}
                onClick={handleAddToCart}
                className="flex-1 bg-purple-600 hover:bg-purple-500 text-white font-semibold shadow-lg shadow-purple-900/50"
                leftIcon={added ? <Check className="h-5 w-5" /> : <ShoppingBag className="h-5 w-5" />}
              >
                {added ? 'Added to Bag' : isOutOfStock ? 'Currently Unavailable' : 'Add to Bag'}
              </Button>
            </div>

            {/* Trust Highlights */}
            <div className="border-t border-zinc-800 pt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-zinc-400">
              <div className="flex items-center gap-2.5">
                <Truck className="h-4 w-4 text-purple-400 shrink-0" />
                <span>Complimentary Shipping</span>
              </div>
              <div className="flex items-center gap-2.5">
                <RotateCcw className="h-4 w-4 text-purple-400 shrink-0" />
                <span>30-Day Hassle Returns</span>
              </div>
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="h-4 w-4 text-purple-400 shrink-0" />
                <span>2-Year Direct Warranty</span>
              </div>
            </div>
          </div>
        </div>
      </PageContainer>
    </div>
  );
};
