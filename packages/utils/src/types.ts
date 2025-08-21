// Common types used across the application

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T = any> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  tenantId: string;
  roles: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  description?: string;
  settings?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  sortOrder: number;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  categoryId: string;
  available: boolean;
  image?: string;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
  category?: Category;
}

export interface OrderItem {
  id: string;
  orderId: string;
  menuItemId: string;
  quantity: number;
  price: number;
  notes?: string;
  menuItem: MenuItem;
}

export interface Order {
  id: string;
  tenantId: string;
  customerName?: string;
  tableNumber?: string;
  notes?: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'served' | 'cancelled';
  total: number;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
}

export interface AuditLog {
  id: string;
  tenantId: string;
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, any>;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  tenantId?: string;
  permissions: Permission[];
}

export interface Permission {
  id: string;
  name: string;
  description?: string;
}

// Request/Response types
export interface LoginRequest {
  email: string;
  password: string;
  tenantId?: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface CreateTenantRequest {
  name: string;
  slug: string;
  description?: string;
  settings?: Record<string, any>;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  name: string;
  roles?: string[];
}

export interface CreateMenuItemRequest {
  name: string;
  description?: string;
  price: number;
  categoryId: string;
  available?: boolean;
  image?: string;
}

export interface CreateOrderRequest {
  customerName?: string;
  tableNumber?: string;
  notes?: string;
  items: {
    menuItemId: string;
    quantity: number;
    notes?: string;
  }[];
}

export interface UpdateOrderStatusRequest {
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'served' | 'cancelled';
}

// Store types (for state management)
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
}

export interface MenuState {
  categories: Category[];
  menuItems: MenuItem[];
  loading: boolean;
  error: string | null;
}

export interface CartItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
}

export interface CartState {
  items: CartItem[];
  total: number;
}

export interface OrderState {
  orders: Order[];
  loading: boolean;
  error: string | null;
}

// Utility types
export type OrderStatus = Order['status'];
export type UserRole = string;
export type PermissionName = string;

// Generic utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;