import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import toast from 'react-hot-toast';

export interface CompareProduct {
  id: number;
  name: string;
  slug: string;
  price: number;
  discount_price?: number;
  image: string;
  brand: string;
  specifications: Record<string, any>;
}

interface CompareState {
  items: CompareProduct[];
  addToCompare: (product: CompareProduct) => void;
  removeFromCompare: (productId: number) => void;
  clearCompare: () => void;
  isInCompare: (productId: number) => boolean;
  totalItems: () => number;
}

export const useCompareStore = create<CompareState>()(
  persist(
    (set, get) => ({
      items: [],
      
      addToCompare: (product) => {
        const currentItems = get().items;
        
        if (currentItems.find((i) => i.id === product.id)) {
          toast('Product is already in comparison', { icon: 'ℹ️' });
          return;
        }
        
        if (currentItems.length >= 4) {
          toast.error('You can only compare up to 4 products at a time.');
          return;
        }
        
        set({ items: [...currentItems, product] });
        toast.success('Added to comparison');
      },
      
      removeFromCompare: (productId) => {
        set({ items: get().items.filter((i) => i.id !== productId) });
      },
      
      clearCompare: () => set({ items: [] }),
      
      isInCompare: (productId) => get().items.some((i) => i.id === productId),
      
      totalItems: () => get().items.length,
    }),
    {
      name: 'mobileshop-compare',
    }
  )
);
