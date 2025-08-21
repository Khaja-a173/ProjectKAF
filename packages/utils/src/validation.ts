import { z } from 'zod';

// Common validation schemas
export const emailSchema = z.string().email('Invalid email address');
export const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');
export const slugSchema = z.string().regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens');

// User validation
export const createUserSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: z.string().min(1, 'Name is required'),
  tenantId: z.string().optional()
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
  tenantId: z.string().optional()
});

// Tenant validation
export const createTenantSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: slugSchema,
  description: z.string().optional(),
  settings: z.record(z.any()).optional()
});

// Menu validation
export const createMenuItemSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  price: z.number().positive('Price must be positive'),
  categoryId: z.string().min(1, 'Category is required'),
  available: z.boolean().default(true),
  image: z.string().url().optional()
});

export const createCategorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  sortOrder: z.number().default(0)
});

// Order validation
export const createOrderSchema = z.object({
  customerName: z.string().optional(),
  tableNumber: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(z.object({
    menuItemId: z.string().min(1, 'Menu item is required'),
    quantity: z.number().positive('Quantity must be positive'),
    notes: z.string().optional()
  })).min(1, 'At least one item is required')
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'preparing', 'ready', 'served', 'cancelled'])
});

// Validation helper functions
export function validateEmail(email: string): boolean {
  return emailSchema.safeParse(email).success;
}

export function validatePassword(password: string): boolean {
  return passwordSchema.safeParse(password).success;
}

export function validateSlug(slug: string): boolean {
  return slugSchema.safeParse(slug).success;
}