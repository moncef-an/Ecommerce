import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Search,
  User as UserIcon,
  Menu,
  X,
  Compass,
  ArrowRight,
  LogOut,
  Package,
} from 'lucide-react';
import { PageContainer } from './PageContainer';
import { APP_CONFIG } from '../../lib/config';
import { useAuth } from '../../features/auth/context/AuthContext';
import { useCart } from '../../features/cart/context/CartContext';

export const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const { user, isAuthenticated, logout } = useAuth();
  const { itemCount } = useCart();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  const isElevatedSeller = isAuthenticated && (user?.role === 'SELLER' || user?.role === 'ADMIN');
  const isAdmin = isAuthenticated && user?.role === 'ADMIN';

  const navLinks = [
    { name: 'Home', path: '/home' },
    { name: 'Products', path: '/products' },
    { name: 'Categories', path: '/categories' },
    ...(isAuthenticated ? [{ name: 'My Orders', path: '/orders' }] : []),
    ...(isElevatedSeller ? [{ name: 'Seller Hub', path: '/seller' }] : []),
    ...(isAdmin ? [{ name: 'Admin Panel', path: '/admin' }] : []),
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-[#09090b]/90 backdrop-blur-md transition-all">
      {/* Top micro-announcement bar */}
      <div className="bg-[#121216] border-b border-zinc-850 px-4 py-2 text-center text-xs font-medium text-zinc-400 sm:px-6">
        <span className="inline-flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-purple-400 animate-pulse"></span>
          Complimentary worldwide shipping on curated hardware orders over $150
        </span>
      </div>

      <PageContainer>
        <div className="flex h-18 items-center justify-between gap-4 sm:gap-8">
          {/* Brand Logo */}
          <Link
            to="/home"
            className="flex items-center gap-2.5 text-white group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 rounded-lg"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-600 text-white shadow-lg shadow-purple-900/40 transition-transform duration-200 group-hover:scale-105">
              <Compass className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-tight text-white group-hover:text-purple-300 transition-colors">
                {APP_CONFIG.appName}
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-purple-400/90 -mt-1">
                Studio & Hardware
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-purple-950/60 text-purple-300 border border-purple-500/40 font-semibold'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-850'
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
          </nav>

          {/* Search Bar - Desktop */}
          <div className="hidden lg:flex flex-1 max-w-md items-center">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products by name..."
                className="w-full rounded-xl border border-zinc-800 bg-[#141418] pl-10 pr-4 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 transition-all focus:border-purple-500 focus:bg-[#18181f] focus:outline-none focus:ring-2 focus:ring-purple-500/30"
              />
            </form>
          </div>

          {/* Right Action Icons (User, Orders, Cart, Mobile Menu) */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Account / User Menu */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/orders"
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
                  title="View your orders"
                >
                  <Package className="h-4 w-4 text-purple-400" />
                  <span>Orders</span>
                </Link>

                <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-zinc-800">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-950/80 border border-purple-500/30 text-purple-300 text-xs font-bold">
                    {user?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-zinc-200 max-w-[110px] truncate leading-tight">
                      {user?.name}
                    </span>
                    {user?.role && user.role !== 'USER' && (
                      <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider leading-none">
                        {user.role}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => logout()}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-zinc-850 transition-colors cursor-pointer"
                    title="Log out"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : (
              <Link
                to="/"
                className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-purple-300 bg-purple-950/40 border border-purple-500/40 hover:bg-purple-900/50 hover:text-white transition-all shadow-sm"
              >
                <UserIcon className="h-4 w-4 text-purple-400" />
                <span>Sign In</span>
              </Link>
            )}

            {/* Cart Icon & Item-count badge */}
            <Link
              to="/cart"
              className="relative flex items-center justify-center p-2.5 rounded-xl text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
              aria-label={`Shopping Cart with ${itemCount} items`}
            >
              <ShoppingBag className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-purple-600 px-1 text-[11px] font-bold text-white shadow-md shadow-purple-950/80 animate-pulse">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* Mobile Menu Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex md:hidden items-center justify-center p-2.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 cursor-pointer"
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </PageContainer>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-zinc-800 bg-[#121216] px-4 pt-4 pb-6 space-y-4">
          {/* Mobile Search */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full rounded-xl border border-zinc-800 bg-[#18181f] pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </form>

          {/* Mobile Navigation Links */}
          <div className="flex flex-col space-y-1.5">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-purple-950/70 text-purple-300 border border-purple-500/40 font-semibold'
                      : 'text-zinc-300 hover:bg-zinc-800/80 hover:text-white'
                  }`
                }
              >
                <span>{link.name}</span>
                <ArrowRight className="h-4 w-4 text-zinc-500" />
              </NavLink>
            ))}
          </div>

          <div className="pt-4 border-t border-zinc-800">
            {isAuthenticated ? (
              <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-900 text-purple-200 text-sm font-bold">
                    {user?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-white">{user?.name}</p>
                      {user?.role && user.role !== 'USER' && (
                        <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-purple-950/80 border border-purple-500/40 text-purple-300">
                          {user.role}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-400">{user?.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="p-2 rounded-lg text-rose-400 hover:bg-rose-950/40"
                  title="Log out"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold transition-colors"
              >
                <UserIcon className="h-4 w-4" />
                Sign In to Account
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
