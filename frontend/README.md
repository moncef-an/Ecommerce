# NovaStore E-Commerce Frontend Documentation

Welcome to **NovaStore** — a modern, responsive, high-performance e-commerce frontend built with **React 19**, **TypeScript**, **Tailwind CSS v4**, and **Vite**, integrated with a real **Go Fiber v3** backend with MySQL and Redis.

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js**: v18+ (Node.js 20+ recommended)
- **Go**: v1.22+
- **MySQL Server** (running on port `3306`)
- **Redis Server** (running on port `6379`)

---

### 2. Starting the Go Backend API
From the project root:
```powershell
cd Backend
go run cmd/main.go
```
The Go API will listen on `http://localhost:3030`. All API routes are located under `/api/v1`.

---

### 3. Starting the React Frontend
In a separate terminal:
```powershell
cd frontend
npm run dev
```
The Vite development server will start at:
👉 **`http://localhost:5173`**

*(Note: The frontend development server automatically proxies all `/api` requests to `http://localhost:3030` to prevent CORS issues).*

---

## 🔑 Test Accounts & Role-Based Permissions

NovaStore provides role-based authorization matching the Go Fiber backend's `RequireRole` middleware:

| Role | Email Address | Password | Privileges & Accessible Routes |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@novastore.com` | `admin12345` | Access to **Admin Control Center** (`/admin`), Category CRUD (`POST`, `PATCH`, `DELETE` `/categories`), and Order status updates (`PATCH /admin/orders/:id/status`). |
| **Seller** | `seller@novastore.com` | `seller12345` | Access to **Seller Studio & Inventory** (`/seller`), Product CRUD (`POST`, `PATCH`, `DELETE` `/products`), stock tracking, and catalog price management. |
| **Customer** | *(Register any account)* | *(Your choice)* | Browse catalog, add to cart, checkout, view personal orders, and cancel orders. |
| **Guest** | *(Click "Browse the Products")* | N/A | Explore products & categories; adding to cart opens an authentication prompt modal. |

> **Tip:** The sign-in page (`/`) features convenient **1-click autofill buttons** for both the **Seller** and **Admin** test accounts.

---

## 🛠️ Architecture & Project Structure

The frontend is organized cleanly using feature-based architecture:

```
frontend/src/
├── app/
│   └── router.tsx             # React Router v7 routes with RoleProtectedRoute guards
├── assets/                    # Static assets & brand graphics
├── components/
│   ├── layout/
│   │   ├── Header.tsx         # Role-aware navigation bar & profile badges
│   │   ├── Footer.tsx         # Responsive site footer
│   │   ├── PageContainer.tsx   # Consistent layout boundary
│   │   ├── ProtectedRoute.tsx # Route guard for logged-in users
│   │   ├── RoleProtectedRoute.tsx # Route guard for specific roles (SELLER, ADMIN)
│   │   └── RootLayout.tsx     # Shell layout containing Header, Footer, and Modals
│   └── ui/
│       ├── Badge.tsx          # Status and category badges
│       ├── Button.tsx         # Primary, outline, and ghost buttons with loading states
│       ├── Card.tsx           # Elevated dark-charcoal cards
│       ├── Input.tsx          # Styled input fields
│       └── LoadingSkeleton.tsx # Loading placeholders
├── features/
│   ├── auth/                  # AuthContext, JWT parser, login/register API calls
│   ├── cart/                  # CartContext, persistent server cart synchronization
│   ├── categories/            # Category listing, creation, editing, and deletion API
│   ├── orders/                # Checkout, customer orders, and admin status dispatch API
│   └── products/              # Product catalog, create, edit, delete API
├── lib/
│   ├── apiClient.ts           # Axios instance with JWT interceptor & 401 handler
│   ├── config.ts              # Global environment configuration
│   ├── imageFallback.ts       # Category-based hardware fallback images
│   └── utils.ts               # cn() and formatCurrency() utilities
├── pages/
│   ├── AdminDashboardPage.tsx # Category management & direct order status dispatch
│   ├── AuthPage.tsx           # Sign In / Register landing page with quick-fill
│   ├── CartPage.tsx           # Cart review & quantity adjustments
│   ├── CategoriesPage.tsx     # Visual category exploration
│   ├── CheckoutPage.tsx       # Checkout summary and order placement
│   ├── HomePage.tsx           # Hero section, featured hardware, and value props
│   ├── OrdersPage.tsx         # Order history & cancellation
│   ├── ProductDetailPage.tsx  # Product specs and add to bag
│   ├── ProductsPage.tsx       # Paginated catalog with category and search filters
│   └── SellerDashboardPage.tsx # Inventory management table with create/edit/delete modals
└── types/
    └── index.ts               # Strict TypeScript models matching Go backend DTOs
```

---

## 🎨 Theme & Styling

- **Theme Palette**: Deep Black (`#09090b`), Dark Charcoal (`#121216`, `#18181f`), and Vibrant Purple (`#8b5cf6`, `#9333ea`, `#a855f7`).
- **Typography**: Inter / system UI font stack with high-contrast text for accessibility.
- **Safety**: Modals and navigation hooks are strictly bound within the React Router context to ensure 0 runtime errors.
