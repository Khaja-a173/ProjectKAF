import { create } from 'zustand';
import { Category, MenuItem } from '../types';

interface MenuState {
  categories: Category[];
  menuItems: MenuItem[];
  loading: boolean;
  error: string | null;
  fetchMenu: () => Promise<void>;
}

export const useMenuStore = create<MenuState>((set, get) => ({
  categories: [],
  menuItems: [],
  loading: false,
  error: null,

  fetchMenu: async () => {
    set({ loading: true, error: null });
    
    try {
      const [categoriesRes, itemsRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/menu/categories`),
        fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/menu/items`)
      ]);

      if (!categoriesRes.ok || !itemsRes.ok) {
        throw new Error('Failed to fetch menu data');
      }

      const [categoriesData, itemsData] = await Promise.all([
        categoriesRes.json(),
        itemsRes.json()
      ]);

      set({
        categories: categoriesData.categories || [],
        menuItems: itemsData.items || [],
        loading: false
      });
    } catch (error) {
      // Fallback to mock data for demo
      set({
        categories: [
          {
            id: '1',
            name: 'Appetizers',
            description: 'Start your meal with our delicious appetizers',
            sortOrder: 0,
            tenantId: 'demo'
          },
          {
            id: '2',
            name: 'Main Courses',
            description: 'Hearty and satisfying main dishes',
            sortOrder: 1,
            tenantId: 'demo'
          },
          {
            id: '3',
            name: 'Desserts',
            description: 'Sweet treats to end your meal',
            sortOrder: 2,
            tenantId: 'demo'
          }
        ],
        menuItems: [
          {
            id: '1',
            name: 'Caesar Salad',
            description: 'Fresh romaine lettuce with parmesan cheese and croutons',
            price: 12.99,
            categoryId: '1',
            available: true,
            image: 'https://images.pexels.com/photos/1059905/pexels-photo-1059905.jpeg?auto=compress&cs=tinysrgb&w=400',
            tenantId: 'demo'
          },
          {
            id: '2',
            name: 'Grilled Salmon',
            description: 'Fresh Atlantic salmon with seasonal vegetables',
            price: 24.99,
            categoryId: '2',
            available: true,
            image: 'https://images.pexels.com/photos/1516415/pexels-photo-1516415.jpeg?auto=compress&cs=tinysrgb&w=400',
            tenantId: 'demo'
          },
          {
            id: '3',
            name: 'Chocolate Cake',
            description: 'Rich chocolate cake with vanilla ice cream',
            price: 8.99,
            categoryId: '3',
            available: true,
            image: 'https://images.pexels.com/photos/291528/pexels-photo-291528.jpeg?auto=compress&cs=tinysrgb&w=400',
            tenantId: 'demo'
          }
        ],
        loading: false,
        error: null
      });
    }
  }
}));