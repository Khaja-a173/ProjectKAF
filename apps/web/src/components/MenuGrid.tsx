import { MenuItem } from './MenuItem';
import { Category, MenuItem as MenuItemType } from '../types';

interface MenuGridProps {
  categories: Category[];
  menuItems: MenuItemType[];
  loading: boolean;
}

export function MenuGrid({ categories, menuItems, loading }: MenuGridProps) {
  if (loading) {
    return (
      <div className="space-y-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((j) => (
                <div key={j} className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="h-32 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {categories.map((category) => {
        const categoryItems = menuItems.filter(item => item.categoryId === category.id);
        
        if (categoryItems.length === 0) return null;

        return (
          <div key={category.id}>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{category.name}</h2>
            {category.description && (
              <p className="text-gray-600 mb-6">{category.description}</p>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {categoryItems.map((item) => (
                <MenuItem key={item.id} item={item} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}