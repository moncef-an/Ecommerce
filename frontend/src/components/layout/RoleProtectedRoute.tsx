import React from 'react';
import { Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, LogIn } from 'lucide-react';
import { useAuth } from '../../features/auth/context/AuthContext';
import type { UserRole } from '../../types';
import { PageContainer } from './PageContainer';

interface RoleProtectedRouteProps {
  allowedRoles: UserRole[];
}

export const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({ allowedRoles }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-purple-500 border-t-transparent" />
          <p className="text-sm font-medium text-zinc-400">Verifying authorization permissions...</p>
        </div>
      </div>
    );
  }

  // Not logged in -> redirect to login/auth page
  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // User does not have one of the required roles -> render sleek 403 Access Denied
  if (!user || !allowedRoles.includes(user.role)) {
    return (
      <PageContainer className="py-20">
        <div className="max-w-md mx-auto text-center p-8 rounded-2xl bg-[#121216] border border-zinc-800 shadow-2xl">
          <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Restricted Access</h2>
          <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
            This dashboard requires an elevated role (<span className="text-purple-400 font-semibold">{allowedRoles.join(' or ')}</span>). 
            Your current account role is <span className="text-zinc-200 font-semibold uppercase">{user?.role || 'USER'}</span>.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/home"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-sm font-semibold transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Store
            </Link>
            <Link
              to="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold transition-colors shadow-lg shadow-purple-900/30"
            >
              <LogIn className="w-4 h-4" />
              Switch Account
            </Link>
          </div>
        </div>
      </PageContainer>
    );
  }

  return <Outlet />;
};

