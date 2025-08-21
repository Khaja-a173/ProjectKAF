export interface User {
  id: string;
  email: string;
  name: string;
  tenantId: string;
  roles: string[];
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