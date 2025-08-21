// Order statuses
export const ORDER_STATUSES = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PREPARING: 'preparing',
  READY: 'ready',
  SERVED: 'served',
  CANCELLED: 'cancelled'
} as const;

export const ORDER_STATUS_LABELS = {
  [ORDER_STATUSES.PENDING]: 'Order Received',
  [ORDER_STATUSES.CONFIRMED]: 'Confirmed',
  [ORDER_STATUSES.PREPARING]: 'Being Prepared',
  [ORDER_STATUSES.READY]: 'Ready for Pickup',
  [ORDER_STATUSES.SERVED]: 'Completed',
  [ORDER_STATUSES.CANCELLED]: 'Cancelled'
} as const;

export const ORDER_STATUS_COLORS = {
  [ORDER_STATUSES.PENDING]: 'bg-yellow-100 text-yellow-800',
  [ORDER_STATUSES.CONFIRMED]: 'bg-blue-100 text-blue-800',
  [ORDER_STATUSES.PREPARING]: 'bg-orange-100 text-orange-800',
  [ORDER_STATUSES.READY]: 'bg-green-100 text-green-800',
  [ORDER_STATUSES.SERVED]: 'bg-gray-100 text-gray-800',
  [ORDER_STATUSES.CANCELLED]: 'bg-red-100 text-red-800'
} as const;

// User roles
export const USER_ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MANAGER: 'manager',
  STAFF: 'staff',
  CUSTOMER: 'customer'
} as const;

export const USER_ROLE_LABELS = {
  [USER_ROLES.SUPER_ADMIN]: 'Super Admin',
  [USER_ROLES.ADMIN]: 'Admin',
  [USER_ROLES.MANAGER]: 'Manager',
  [USER_ROLES.STAFF]: 'Staff',
  [USER_ROLES.CUSTOMER]: 'Customer'
} as const;

// Permissions
export const PERMISSIONS = {
  // Tenant management
  CREATE_TENANT: 'create_tenant',
  READ_TENANT: 'read_tenant',
  UPDATE_TENANT: 'update_tenant',
  DELETE_TENANT: 'delete_tenant',
  
  // User management
  CREATE_USER: 'create_user',
  READ_USER: 'read_user',
  UPDATE_USER: 'update_user',
  DELETE_USER: 'delete_user',
  
  // Menu management
  CREATE_MENU_ITEM: 'create_menu_item',
  READ_MENU_ITEM: 'read_menu_item',
  UPDATE_MENU_ITEM: 'update_menu_item',
  DELETE_MENU_ITEM: 'delete_menu_item',
  
  // Order management
  CREATE_ORDER: 'create_order',
  READ_ORDER: 'read_order',
  UPDATE_ORDER: 'update_order',
  DELETE_ORDER: 'delete_order',
  
  // Audit logs
  READ_AUDIT_LOG: 'read_audit_log'
} as const;

// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    VERIFY: '/api/auth/verify'
  },
  TENANTS: {
    LIST: '/api/tenants',
    CREATE: '/api/tenants',
    GET: (id: string) => `/api/tenants/${id}`,
    UPDATE: (id: string) => `/api/tenants/${id}`,
    DELETE: (id: string) => `/api/tenants/${id}`
  },
  USERS: {
    LIST: '/api/users',
    CREATE: '/api/users',
    GET: (id: string) => `/api/users/${id}`,
    UPDATE: (id: string) => `/api/users/${id}`,
    DELETE: (id: string) => `/api/users/${id}`
  },
  MENU: {
    CATEGORIES: '/api/menu/categories',
    ITEMS: '/api/menu/items',
    CREATE_ITEM: '/api/menu/items',
    UPDATE_ITEM: (id: string) => `/api/menu/items/${id}`,
    DELETE_ITEM: (id: string) => `/api/menu/items/${id}`
  },
  ORDERS: {
    LIST: '/api/orders',
    CREATE: '/api/orders',
    GET: (id: string) => `/api/orders/${id}`,
    UPDATE_STATUS: (id: string) => `/api/orders/${id}/status`
  },
  AUDIT: {
    LIST: '/api/audit',
    GET: (id: string) => `/api/audit/${id}`
  }
} as const;

// Default pagination
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// File upload limits
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// Cache durations (in seconds)
export const CACHE_DURATIONS = {
  SHORT: 300,    // 5 minutes
  MEDIUM: 1800,  // 30 minutes
  LONG: 3600,    // 1 hour
  VERY_LONG: 86400 // 24 hours
} as const;