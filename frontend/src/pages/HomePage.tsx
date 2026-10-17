import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Zap,
  Award,
  Clock,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';
import { PageContainer } from '../components/layout/PageContainer';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ProductCard } from '../features/products/components/ProductCard';
import { CategoryCard } from '../features/categories/components/CategoryCard';
import { ProductCardSkeleton, CategoryCardSkeleton } from '../components/ui/LoadingSkeleton';
import { fetchProducts } from '../features/products/api/productApi';
import { fetchCategories } from '../features/categories/api/categoryApi';
import type { Product, Category } from '../types';

export const HomePage: React.FC = () => {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Backend state
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadInitialData() {
      try {
        setIsLoading(true);
        const [prodRes, catRes] = await Promise.allSettled([
          fetchProducts({ limit: 6 }),
          fetchCategories(4),
        ]);

        if (isMounted) {
          if (prodRes.status === 'fulfilled') {
            setProducts(prodRes.value.data || []);
          }
          if (catRes.status === 'fulfilled') {
            setCategories(catRes.value || []);
          }
        }
      } catch (err) {
        console.error('Failed to load homepage data:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadInitialData();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleAddToCartSuccess = (product: Product) => {
    setToastMessage(`Added "${product.name}" to bag`);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  return (
    <div className="space-y-16 sm:space-y-24 pb-16 bg-[#09090b]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl border border-emerald-500/40 bg-emerald-950/80 px-4 py-3 text-sm font-semibold text-emerald-200 shadow-2xl backdrop-blur-md animate-bounce">
          <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-[#0c0c0e] border-b border-zinc-800 text-white pt-12 pb-20 lg:pt-20 lg:pb-28">
        <div className="pointer-events-none absolute -top-40 right-0 h-96 w-96 rounded-full bg-purple-600/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-10 h-80 w-80 rounded-full bg-purple-900/15 blur-3xl" />

        <PageContainer>
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-8">
            <div className="space-y-6 lg:col-span-7">
              <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/40 bg-purple-950/60 px-3.5 py-1 text-xs font-semibold text-purple-300 backdrop-blur-md">
                <Sparkles className="h-3.5 w-3.5 text-purple-400" />
                <span>Modern Acoustics & Precision Workspace Lineup</span>
              </div>

              <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl leading-[1.1]">
                Precision Hardware. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-fuchsia-300 to-white">
                  Crafted for Daily Flow.
                </span>
              </h1>

              <p className="max-w-2xl text-base text-zinc-300 sm:text-lg leading-relaxed">
                Elevate your focus with studio-grade acoustics, ergonomic mechanical tools, and
                architectural desk accessories made for creators and engineering professionals.
              </p>

              <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-2">
                <Link to="/products">
                  <Button
                    size="lg"
                    className="bg-purple-600 hover:bg-purple-500 text-white font-semibold shadow-lg shadow-purple-900/40"
                    rightIcon={<ArrowRight className="h-4 w-4" />}
                  >
                    Shop Collection
                  </Button>
                </Link>

                <Link to="/categories">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-zinc-700 bg-zinc-900/80 text-zinc-200 hover:bg-zinc-800 hover:text-white"
                  >
                    Explore Categories
                  </Button>
                </Link>
              </div>

              {/* Trust micro metrics */}
              <div className="grid grid-cols-3 gap-6 pt-6 border-t border-zinc-800 max-w-lg">
                <div>
                  <div className="text-2xl font-extrabold text-white">4.9 / 5</div>
                  <div className="text-xs text-zinc-400">Verified Rating</div>
                </div>
                <div>
                  <div className="text-2xl font-extrabold text-white">100%</div>
                  <div className="text-xs text-zinc-400">Quality Checked</div>
                </div>
                <div>
                  <div className="text-2xl font-extrabold text-white">2-Year</div>
                  <div className="text-xs text-zinc-400">Direct Warranty</div>
                </div>
              </div>
            </div>

            {/* Hero Image Showcase */}
            <div className="relative lg:col-span-5">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                <div className="aspect-4/3 sm:aspect-square overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900 shadow-2xl shadow-purple-950/30">
                  <img
                    src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=80"
                    alt="Hardware showcase"
                    className="h-full w-full object-cover object-center transition-transform duration-700 hover:scale-105"
                  />
                </div>

                <div className="absolute -bottom-6 -left-4 sm:-left-6 rounded-2xl border border-zinc-700/80 bg-[#121216]/95 p-4 backdrop-blur-md shadow-2xl max-w-xs">
                  <div className="flex items-center gap-3">
                    <span className="flex h-3 w-3 rounded-full bg-emerald-400 animate-ping" />
                    <div>
                      <p className="text-xs font-bold text-white">Curated Selection</p>
                      <p className="text-[11px] text-zinc-400">In stock & ready to ship</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </PageContainer>
      </section>

      {/* 2. FEATURED CATEGORIES SECTION */}
      <section>
        <PageContainer>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <Badge variant="primary" className="mb-2">
                Categories
              </Badge>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                Curated Collections
              </h2>
              <p className="mt-1 text-sm text-zinc-400">
                Explore specialized gear engineered for different creative disciplines.
              </p>
            </div>

            <Link
              to="/categories"
              className="inline-flex items-center gap-1 text-sm font-semibold text-purple-400 hover:text-purple-300"
            >
              <span>View all categories</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <CategoryCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {categories.map((category) => (
                <CategoryCard key={category.id} category={category} />
              ))}
            </div>
          )}
        </PageContainer>
      </section>

      {/* 3. FEATURED PRODUCTS SECTION */}
      <section>
        <PageContainer>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <Badge variant="neutral" className="mb-2">
                Top Picks
              </Badge>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                Featured Hardware
              </h2>
              <p className="mt-1 text-sm text-zinc-400">
                Popular items in our current inventory.
              </p>
            </div>

            <Link
              to="/products"
              className="inline-flex items-center gap-1 text-sm font-semibold text-purple-400 hover:text-purple-300"
            >
              <span>Browse catalog</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCartSuccess={handleAddToCartSuccess}
                />
              ))}
            </div>
          )}
        </PageContainer>
      </section>

      {/* 4. PROMOTIONAL SPOTLIGHT BANNER */}
      <section>
        <PageContainer>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-950 via-[#181824] to-[#0c0c10] border border-purple-500/30 p-8 sm:p-12 lg:p-16 text-white shadow-2xl shadow-purple-950/40">
            <div className="relative z-10 max-w-xl space-y-4">
              <Badge variant="primary">
                Special Series
              </Badge>
              <h2 className="text-3xl font-black tracking-tight sm:text-4xl text-white">
                The Obsidian Studio Hardware Series
              </h2>
              <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
                Milled from solid aerospace-grade aluminum blocks with hand-lubricated silent linear
                switches and bespoke PBT keycaps. Limited production units available.
              </p>
              <div className="pt-2">
                <Link to="/products">
                  <Button
                    size="lg"
                    className="bg-purple-600 hover:bg-purple-500 text-white font-semibold shadow-lg shadow-purple-900/50"
                    rightIcon={<ArrowRight className="h-4 w-4" />}
                  >
                    Explore The Lineup
                  </Button>
                </Link>
              </div>
            </div>

            <div className="pointer-events-none absolute right-0 bottom-0 top-0 hidden lg:block w-1/2 overflow-hidden opacity-25">
              <img
                src="https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1000&q=80"
                alt="Hardware Preview"
                className="h-full w-full object-cover object-left"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#121216] via-transparent to-transparent" />
            </div>
          </div>
        </PageContainer>
      </section>

      {/* 5. BENEFITS / TRUST SECTION */}
      <section className="border-y border-zinc-800 bg-[#0c0c0e] py-16">
        <PageContainer>
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Why Choose NovaStore
            </h2>
            <p className="mt-2 text-sm text-zinc-400">
              Every detail of our catalog and delivery pipeline is designed around clarity and endurance.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col items-start rounded-2xl border border-zinc-800 bg-[#121216] p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-600 text-white shadow-lg shadow-purple-900/40">
                <Award className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-white">Uncompromising QA</h3>
              <p className="mt-2 text-xs text-zinc-400 leading-relaxed">
                Hand-inspected before dispatch. Every switch, driver, and chassis passes acoustic and stress tests.
              </p>
            </div>

            <div className="flex flex-col items-start rounded-2xl border border-zinc-800 bg-[#121216] p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-600 text-white shadow-lg shadow-purple-900/40">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-white">Express Global Transit</h3>
              <p className="mt-2 text-xs text-zinc-400 leading-relaxed">
                Dispatched within 24 business hours from climate-controlled fulfillment centers.
              </p>
            </div>

            <div className="flex flex-col items-start rounded-2xl border border-zinc-800 bg-[#121216] p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-600 text-white shadow-lg shadow-purple-900/40">
                <Clock className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-white">30-Day Risk-Free Trial</h3>
              <p className="mt-2 text-xs text-zinc-400 leading-relaxed">
                Test hardware in your own workspace environment with hassle-free prepaid returns.
              </p>
            </div>

            <div className="flex flex-col items-start rounded-2xl border border-zinc-800 bg-[#121216] p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-600 text-white shadow-lg shadow-purple-900/40">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-white">Direct 2-Year Warranty</h3>
              <p className="mt-2 text-xs text-zinc-400 leading-relaxed">
                Comprehensive hardware replacement guarantee backed by direct technical assistance.
              </p>
            </div>
          </div>
        </PageContainer>
      </section>
    </div>
  );
};
