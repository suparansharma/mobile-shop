import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { API_URL } from '@/lib/api';
import { useAuthStore } from './authStore';

export interface CartItem {
  product_id: number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  slug?: string;
}

interface CartState {
  items: CartItem[];
  subtotal: number;
  discount: number;
  deliveryCharge: number;
  total: number;
  couponCode: string | null;
  addToCart: (item: CartItem) => Promise<void>;
  removeFromCart: (productId: number) => Promise<void>;
  updateQuantity: (productId: number, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  applyCoupon: (code: string) => Promise<void>;
  fetchCart: () => Promise<void>;
  syncCart: () => Promise<void>;
  totalItems: () => number;
}

const calculateLocalTotals = (items: CartItem[]) => {
  const subtotal = items.reduce((sum, item) => sum + (Number(item.price) * Number(item.quantity)), 0);
  const deliveryCharge = items.length > 0 ? 10.00 : 0;
  const total = subtotal + deliveryCharge;
  return { subtotal, deliveryCharge, total, discount: 0 };
};

const getHeaders = () => {
  const token = useAuthStore.getState().token;
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      subtotal: 0,
      discount: 0,
      deliveryCharge: 0,
      total: 0,
      couponCode: null,

      addToCart: async (item) => {
        const { isAuthenticated } = useAuthStore.getState();
        
        if (isAuthenticated()) {
          try {
            const res = await fetch(`${API_URL}/cart/add`, {
              method: 'POST',
              headers: getHeaders(),
              body: JSON.stringify({
                product_id: item.product_id,
                quantity: item.quantity
              })
            });
            if (res.ok) {
              const data = await res.json();
              set({
                items: data.items,
                subtotal: data.subtotal,
                discount: data.discount,
                deliveryCharge: data.delivery_charge,
                total: data.total,
                couponCode: data.coupon_code
              });
            }
          } catch (error) {
            console.error('Failed to add to cart', error);
          }
        } else {
          // Local logic
          const currentItems = get().items;
          const existingItem = currentItems.find((i) => i.product_id === item.product_id);
          
          let newItems;
          if (existingItem) {
            newItems = currentItems.map((i) =>
              i.product_id === item.product_id
                ? { ...i, quantity: i.quantity + item.quantity }
                : i
            );
          } else {
            newItems = [...currentItems, item];
          }
          
          set({ items: newItems, ...calculateLocalTotals(newItems) });
        }
      },

      removeFromCart: async (productId) => {
        const { isAuthenticated } = useAuthStore.getState();

        if (isAuthenticated()) {
          try {
            const res = await fetch(`${API_URL}/cart/remove/${productId}`, {
              method: 'DELETE',
              headers: getHeaders()
            });
            if (res.ok) {
              const data = await res.json();
              set({
                items: data.items,
                subtotal: data.subtotal,
                discount: data.discount,
                deliveryCharge: data.delivery_charge,
                total: data.total,
                couponCode: data.coupon_code
              });
            }
          } catch (error) {
             console.error('Failed to remove from cart', error);
          }
        } else {
          const newItems = get().items.filter((i) => i.product_id !== productId);
          set({ items: newItems, ...calculateLocalTotals(newItems) });
        }
      },

      updateQuantity: async (productId, quantity) => {
        if (quantity <= 0) return;
        const { isAuthenticated } = useAuthStore.getState();

        if (isAuthenticated()) {
          try {
            const res = await fetch(`${API_URL}/cart/update/${productId}`, {
              method: 'PUT',
              headers: getHeaders(),
              body: JSON.stringify({ quantity })
            });
            if (res.ok) {
              const data = await res.json();
              set({
                items: data.items,
                subtotal: data.subtotal,
                discount: data.discount,
                deliveryCharge: data.delivery_charge,
                total: data.total,
                couponCode: data.coupon_code
              });
            }
          } catch (error) {
            console.error('Failed to update quantity', error);
          }
        } else {
          const newItems = get().items.map((i) =>
            i.product_id === productId ? { ...i, quantity } : i
          );
          set({ items: newItems, ...calculateLocalTotals(newItems) });
        }
      },

      clearCart: async () => {
        const { isAuthenticated } = useAuthStore.getState();

        if (isAuthenticated()) {
          try {
            const res = await fetch(`${API_URL}/cart/clear`, {
              method: 'DELETE',
              headers: getHeaders()
            });
            if (res.ok) {
              set({ items: [], subtotal: 0, discount: 0, deliveryCharge: 0, total: 0, couponCode: null });
            }
          } catch (error) {
            console.error('Failed to clear cart', error);
          }
        } else {
          set({ items: [], subtotal: 0, discount: 0, deliveryCharge: 0, total: 0, couponCode: null });
        }
      },

      applyCoupon: async (code) => {
        const { isAuthenticated } = useAuthStore.getState();
        if (isAuthenticated()) {
          try {
            const res = await fetch(`${API_URL}/cart/apply-coupon`, {
              method: 'POST',
              headers: getHeaders(),
              body: JSON.stringify({ coupon_code: code })
            });
            if (res.ok) {
              const data = await res.json();
              set({
                items: data.items,
                subtotal: data.subtotal,
                discount: data.discount,
                deliveryCharge: data.delivery_charge,
                total: data.total,
                couponCode: data.coupon_code
              });
            }
          } catch (error) {
            console.error('Failed to apply coupon', error);
          }
        } else {
           console.warn('Coupons require login.');
        }
      },

      fetchCart: async () => {
        const { isAuthenticated } = useAuthStore.getState();
        if (isAuthenticated()) {
          try {
            const res = await fetch(`${API_URL}/cart`, {
              headers: getHeaders()
            });
            if (res.ok) {
              const data = await res.json();
              set({
                items: data.items,
                subtotal: data.subtotal,
                discount: data.discount,
                deliveryCharge: data.delivery_charge,
                total: data.total,
                couponCode: data.coupon_code
              });
            }
          } catch (error) {
            console.error('Failed to fetch cart', error);
          }
        } else {
          // ensure totals are correct for local items
          set({ ...calculateLocalTotals(get().items) });
        }
      },

      syncCart: async () => {
        const localItems = get().items;
        if (localItems.length === 0) {
           return get().fetchCart();
        }

        try {
          const itemsPayload = localItems.map(i => ({ product_id: i.product_id, quantity: i.quantity }));
          const res = await fetch(`${API_URL}/cart/sync`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ items: itemsPayload })
          });
          if (res.ok) {
            const data = await res.json();
            set({
              items: data.items,
              subtotal: data.subtotal,
              discount: data.discount,
              deliveryCharge: data.delivery_charge,
              total: data.total,
              couponCode: data.coupon_code
            });
          }
        } catch (error) {
          console.error('Failed to sync cart', error);
        }
      },

      totalItems: () => get().items.reduce((total, item) => total + item.quantity, 0),
    }),
    {
      name: 'mobileshop-cart', // localStorage key
    }
  )
);
