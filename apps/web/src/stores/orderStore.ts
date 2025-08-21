import { create } from 'zustand';
import { Order } from '../types';

interface CreateOrderData {
  customerName?: string;
  tableNumber?: string;
  notes?: string;
  items: {
    menuItemId: string;
    quantity: number;
    notes?: string;
  }[];
}

interface OrderState {
  orders: Order[];
  loading: boolean;
  error: string | null;
  fetchOrders: () => Promise<void>;
  createOrder: (orderData: CreateOrderData) => Promise<void>;
  updateOrderStatus: (orderId: string, status: string) => Promise<void>;
}

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: [],
  loading: false,
  error: null,

  fetchOrders: async () => {
    set({ loading: true, error: null });
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/orders`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      const data = await response.json();
      set({ orders: data.orders || [], loading: false });
    } catch (error) {
      // Fallback to mock data for demo
      set({
        orders: [],
        loading: false,
        error: null
      });
    }
  },

  createOrder: async (orderData: CreateOrderData) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        throw new Error('Failed to create order');
      }

      const data = await response.json();
      
      // Add the new order to the list
      const { orders } = get();
      set({ orders: [data.order, ...orders] });
    } catch (error) {
      // For demo purposes, create a mock order
      const mockOrder: Order = {
        id: Math.random().toString(36).substr(2, 9),
        tenantId: 'demo',
        customerName: orderData.customerName,
        tableNumber: orderData.tableNumber,
        notes: orderData.notes,
        status: 'pending',
        total: orderData.items.reduce((sum, item) => sum + (15.99 * item.quantity), 0), // Mock price
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        items: orderData.items.map(item => ({
          id: Math.random().toString(36).substr(2, 9),
          orderId: '',
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          price: 15.99, // Mock price
          notes: item.notes,
          menuItem: {
            id: item.menuItemId,
            name: 'Demo Item',
            description: 'Demo description',
            price: 15.99,
            categoryId: '1',
            available: true,
            tenantId: 'demo'
          }
        }))
      };

      const { orders } = get();
      set({ orders: [mockOrder, ...orders] });
    }
  },

  updateOrderStatus: async (orderId: string, status: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error('Failed to update order status');
      }

      // Update the order in the local state
      const { orders } = get();
      const updatedOrders = orders.map(order =>
        order.id === orderId ? { ...order, status: status as any } : order
      );
      set({ orders: updatedOrders });
    } catch (error) {
      // For demo purposes, update locally
      const { orders } = get();
      const updatedOrders = orders.map(order =>
        order.id === orderId ? { ...order, status: status as any } : order
      );
      set({ orders: updatedOrders });
    }
  }
}));