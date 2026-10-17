export type UserRole = 'USER' | 'SELLER' | 'ADMIN';

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface AuthTokens {
  accesstoken: string;
  refreshtoken: string;
  refreshId: string;
}

export interface Category {
  id: string;
  name: string;
  created_at?: string;
  updated_at?: string;
  description?: string;
  imageUrl?: string;
  itemCount?: number;
  iconName?: string;
}

export interface Seller {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at?: string;
  updated_at?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category_id: string;
  seller_id?: string;
  created_at?: string;
  updated_at?: string;
  category?: Category;
  seller?: Seller;
  imageUrl?: string;
  rating?: number;
  reviewsCount?: number;
  badge?: string;
  isFeatured?: boolean;
}

export interface ProductsMeta {
  total: number;
  limit: number;
  offset: number;
}

export interface ProductsApiResponse {
  data: Product[];
  meta: ProductsMeta;
}

export interface CartItem {
  id: string;
  product_id: string;
  name?: string;
  price?: number;
  quantity: number;
  subtotal: number;
  imageUrl?: string;
}

export interface Cart {
  id?: string;
  user_id: string;
  items: CartItem[];
  total_price: number;
}

export interface OrderItem {
  id: string;
  order_id?: string;
  product_id: string;
  quantity: number;
  price: number;
  product?: Product;
}

export interface Order {
  id: string;
  user_id: string;
  status: OrderStatus;
  total_price: number;
  created_at: string;
  items?: OrderItem[];
}
