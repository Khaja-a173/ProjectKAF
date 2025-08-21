import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
}

interface CartState {
  items: CartItem[];
  total: number;
  addItem: (item: CartItem) => void;
  removeItem: (menuItemId: string, notes?: string) => void;
  updateQuantity: (menuItemId: string, notes: string | undefined, quantity: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      total: 0,

      addItem: (newItem: CartItem) => {
        const { items } = get();
        const existingItemIndex = items.findIndex(
          item => item.menuItemId === newItem.menuItemId && item.notes === newItem.notes
        );

        let updatedItems;
        if (existingItemIndex >= 0) {
          updatedItems = items.map((item, index) =>
            index === existingItemIndex
              ? { ...item, quantity: item.quantity + newItem.quantity }
              : item
          );
        } else {
          updatedItems = [...items, newItem];
        }

        const total = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        set({ items: updatedItems, total });
      },

      removeItem: (menuItemId: string, notes?: string) => {
        const { items } = get();
        const updatedItems = items.filter(
          item => !(item.menuItemId === menuItemId && item.notes === notes)
        );
        const total = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        set({ items: updatedItems, total });
      },

      updateQuantity: (menuItemId: string, notes: string | undefined, quantity: number) => {
        const { items } = get();
        const updatedItems = items.map(item =>
          item.menuItemId === menuItemId && item.notes === notes
            ? { ...item, quantity }
            : item
        );
        const total = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        set({ items: updatedItems, total });
      },

      clearCart: () => {
        set({ items: [], total: 0 });
      }
    }),
    {
      name: 'cart-storage',
    }
  )
);