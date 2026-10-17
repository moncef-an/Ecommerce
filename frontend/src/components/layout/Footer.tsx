import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ShieldCheck, Truck, RefreshCw, Headphones } from 'lucide-react';
import { PageContainer } from './PageContainer';
import { APP_CONFIG } from '../../lib/config';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto border-t border-zinc-800 bg-[#0c0c0e] text-zinc-400">
      {/* Trust & Guarantee Strip */}
      <div className="border-b border-zinc-850 bg-[#101014] py-8">
        <PageContainer>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-950/60 border border-purple-500/30 text-purple-400">
                <Truck className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Complimentary Shipping</h4>
                <p className="text-xs text-zinc-400">Free global delivery on orders over $150</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-950/60 border border-purple-500/30 text-purple-400">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Secure Checkout</h4>
                <p className="text-xs text-zinc-400">Protected payments & encrypted data</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-950/60 border border-purple-500/30 text-purple-400">
                <RefreshCw className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">30-Day Hassle Returns</h4>
                <p className="text-xs text-zinc-400">Prepaid shipping labels included</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-950/60 border border-purple-500/30 text-purple-400">
                <Headphones className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Dedicated Support</h4>
                <p className="text-xs text-zinc-400">24/7 expert audio & hardware assistance</p>
              </div>
            </div>
          </div>
        </PageContainer>
      </div>

      {/* Main Footer Links */}
      <div className="py-12 sm:py-16">
        <PageContainer>
          <div className="grid grid-cols-1 gap-10 md:grid-cols-5">
            {/* Brand column */}
            <div className="space-y-4 md:col-span-2">
              <Link to="/home" className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-600 text-white shadow-md shadow-purple-950/50">
                  <Compass className="h-5 w-5" />
                </div>
                <span className="text-xl font-bold tracking-tight text-white">
                  {APP_CONFIG.appName}
                </span>
              </Link>
              <p className="text-sm text-zinc-400 leading-relaxed max-w-sm">
                Curated high-performance electronics, precision workspace essentials, and acoustic
                masterpieces crafted for engineers, designers, and modern professionals.
              </p>
            </div>

            {/* Shop Column */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400">Shop</h4>
              <ul className="space-y-2 text-sm text-zinc-400">
                <li><Link to="/products" className="hover:text-white transition-colors">All Products</Link></li>
                <li><Link to="/categories" className="hover:text-white transition-colors">Categories</Link></li>
                <li><Link to="/cart" className="hover:text-white transition-colors">Shopping Bag</Link></li>
              </ul>
            </div>

            {/* Customer Column */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400">Account</h4>
              <ul className="space-y-2 text-sm text-zinc-400">
                <li><Link to="/" className="hover:text-white transition-colors">Sign In / Register</Link></li>
                <li><Link to="/orders" className="hover:text-white transition-colors">Order History</Link></li>
                <li><Link to="/home" className="hover:text-white transition-colors">Storefront Home</Link></li>
              </ul>
            </div>

            {/* Support Column */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400">Customer Care</h4>
              <p className="text-xs text-zinc-400 leading-normal">
                Our support team is available around the clock to assist you with order status, tracking, and warranty inquiries.
              </p>
              <div className="text-xs text-purple-300/80 font-medium pt-1">
                support@novastore.com
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-zinc-850 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
            <p>© {new Date().getFullYear()} {APP_CONFIG.appName}. All rights reserved.</p>
            <div className="flex gap-6">
              <span className="hover:text-zinc-300 cursor-pointer">Privacy Policy</span>
              <span className="hover:text-zinc-300 cursor-pointer">Terms of Service</span>
              <span className="hover:text-zinc-300 cursor-pointer">Warranty Details</span>
            </div>
          </div>
        </PageContainer>
      </div>
    </footer>
  );
};
