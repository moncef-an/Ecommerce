import { createBrowserRouter } from 'react-router-dom';
import { RootLayout } from '../components/layout/RootLayout';
import { AuthPage } from '../pages/AuthPage';
import { HomePage } from '../pages/HomePage';
import { ProductsPage } from '../pages/ProductsPage';
import { ProductDetailPage } from '../pages/ProductDetailPage';
import { CategoriesPage } from '../pages/CategoriesPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { OrdersPage } from '../pages/OrdersPage';
import { SellerDashboardPage } from '../pages/SellerDashboardPage';
import { AdminDashboardPage } from '../pages/AdminDashboardPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { ProtectedRoute } from '../components/layout/ProtectedRoute';
import { RoleProtectedRoute } from '../components/layout/RoleProtectedRoute';

export const router = createBrowserRouter([
  // Initial Landing Page: Login / Register with "Browse the Products" Guest button
  {
    path: '/',
    element: <AuthPage />,
  },
  {
    path: '/login',
    element: <AuthPage />,
  },
  // Storefront Layout Routes
  {
    element: <RootLayout />,
    errorElement: <NotFoundPage />,
    children: [
      {
        path: 'home',
        element: <HomePage />,
      },
      {
        path: 'products',
        element: <ProductsPage />,
      },
      {
        path: 'products/:id',
        element: <ProductDetailPage />,
      },
      {
        path: 'categories',
        element: <CategoriesPage />,
      },
      {
        path: 'cart',
        element: <CartPage />,
      },
      // Protected Routes (Require Authentication)
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: 'checkout',
            element: <CheckoutPage />,
          },
          {
            path: 'orders',
            element: <OrdersPage />,
          },
        ],
      },
      // Seller Dashboard (Protected: SELLER or ADMIN role required)
      {
        element: <RoleProtectedRoute allowedRoles={['SELLER', 'ADMIN']} />,
        children: [
          {
            path: 'seller',
            element: <SellerDashboardPage />,
          },
        ],
      },
      // Admin Dashboard (Protected: ADMIN role required)
      {
        element: <RoleProtectedRoute allowedRoles={['ADMIN']} />,
        children: [
          {
            path: 'admin',
            element: <AdminDashboardPage />,
          },
        ],
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
]);
