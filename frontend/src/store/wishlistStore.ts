import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useAuthStore } from './authStore';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export interface WishlistItem {
  id: number;
  user_id: number;
  product_id: number;
  product?: any;
}

interface WishlistState {
  items: WishlistItem[];
  isLoading: boolean;
  fetchWishlist: () => Promise<void>;
  addToWishlist: (productId: number, productData?: any) => Promise<boolean>;
  removeFromWishlist: (productId: number) => Promise<void>;
  clearWishlist: () => Promise<void>;
  isInWishlist: (productId: number) => boolean;
  totalItems: () => number;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,
      
      fetchWishlist: async () => {
        const token = useAuthStore.getState().token;
        if (!token) {
            set({ items: [] });
            return;
        }
        
        set({ isLoading: true });
        try {
          const res = await fetch(`${API_URL}/wishlist`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json'
            }
          });
          if (res.ok) {
            const data = await res.json();
            set({ items: data });
          }
        } catch (error) {
          console.error('Failed to fetch wishlist', error);
        } finally {
          set({ isLoading: false });
        }
      },

      addToWishlist: async (productId: number, productData?: any) => {
        const token = useAuthStore.getState().token;
        if (!token) return false;

        // Optimistic UI update
        const tempId = Date.now();
        const currentItems = get().items;
        if (!currentItems.find(i => i.product_id === productId)) {
            set({ items: [...currentItems, { id: tempId, user_id: 0, product_id: productId, product: productData }] });
        }

        try {
          const res = await fetch(`${API_URL}/wishlist`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify({ product_id: productId })
          });
          
          if (res.ok) {
            const data = await res.json();
            // Replace optimistic item with actual from server
            set({ items: get().items.map(i => i.product_id === productId ? data.wishlist : i) });
            return true;
          } else {
             // Revert on failure
             set({ items: get().items.filter(i => i.id !== tempId) });
             return false;
          }
        } catch (error) {
          console.error('Failed to add to wishlist', error);
          set({ items: get().items.filter(i => i.id !== tempId) });
          return false;
        }
      },

      removeFromWishlist: async (productId: number) => {
        const token = useAuthStore.getState().token;
        if (!token) return;

        // Get the actual wishlist item ID first
        const item = get().items.find(i => i.product_id === productId);
        if (!item) return;

        // Optimistic update
        const previousItems = get().items;
        set({ items: previousItems.filter(i => i.product_id !== productId) });

        try {
          const res = await fetch(`${API_URL}/wishlist/${item.id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json'
            }
          });
          
          if (!res.ok) {
            // Revert on failure
            set({ items: previousItems });
          }
        } catch (error) {
          console.error('Failed to remove from wishlist', error);
          set({ items: previousItems });
        }
      },
      
      clearWishlist: async () => {
          const token = useAuthStore.getState().token;
          if (!token) return;
          
          const previousItems = get().items;
          set({ items: [] });
          
          try {
              const res = await fetch(`${API_URL}/wishlist/clear`, {
                  method: 'DELETE',
                  headers: {
                      'Authorization': `Bearer ${token}`,
                      'Accept': 'application/json'
                  }
              });
              
              if (!res.ok) {
                  set({ items: previousItems });
              }
          } catch(e) {
              set({ items: previousItems });
          }
      },

      isInWishlist: (productId: number) => {
        return get().items.some(i => i.product_id === productId);
      },
      
      totalItems: () => get().items.length,
    }),
    {
      name: 'mobileshop-wishlist',
    }
  )
);
