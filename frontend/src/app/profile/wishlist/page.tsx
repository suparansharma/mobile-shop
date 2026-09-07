"use client";

import { useState, useEffect } from "react";
import { API_URL } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function WishlistPage() {
  const { token, isAuthenticated } = useAuthStore();
  const { addItem } = useCartStore();
  const router = useRouter();
  
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }
    fetchWishlist();
  }, [isAuthenticated, router]);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/wishlist`, {
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setWishlist(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/wishlist/${id}`, {
        method: 'DELETE',
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      
      if (res.ok) {
        setWishlist(wishlist.filter(item => item.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddToCart = (product: any) => {
    addItem({
      product_id: product.id,
      name: product.name,
      price: product.discount_price || product.price,
      quantity: 1,
      image: product.image || ''
    });
    // Optional: could automatically remove from wishlist after adding to cart
  };

  if (loading) {
    return <div className="p-8 flex justify-center"><svg className="animate-spin h-8 w-8 text-orange-500" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg></div>;
  }

  return (
    <div className="p-6 sm:p-10">
      <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Wishlist</h2>
          <p className="text-gray-500 mt-1">Products you have saved for later.</p>
        </div>
      </div>

      {wishlist.length === 0 ? (
        <div className="bg-gray-50 p-12 text-center rounded-2xl border border-gray-100 border-dashed">
          <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Your wishlist is empty</h3>
          <p className="text-gray-500 mb-6">Browse our products and save your favorites here.</p>
          <Link href="/shop" className="bg-orange-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-600 transition-colors inline-block">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlist.map(item => {
            const product = item.product;
            if (!product) return null;
            
            return (
              <div key={item.id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-md transition-shadow group relative flex flex-col">
                <button 
                  onClick={() => handleRemove(item.id)}
                  className="absolute top-3 right-3 bg-white p-2 rounded-full shadow-sm text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all z-10"
                  title="Remove from wishlist"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
                
                <Link href={`/product/${product.slug}`} className="block h-48 bg-gray-100 relative">
                  {/* Image Placeholder */}
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  </div>
                </Link>
                
                <div className="p-5 flex-1 flex flex-col">
                  <Link href={`/product/${product.slug}`} className="block flex-1">
                    <h3 className="font-bold text-gray-900 line-clamp-2 hover:text-orange-500 transition-colors">{product.name}</h3>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-lg font-black text-gray-900">${product.discount_price || product.price}</span>
                      {product.discount_price && (
                        <span className="text-sm text-gray-400 line-through">${product.price}</span>
                      )}
                    </div>
                  </Link>
                  
                  <button 
                    onClick={() => handleAddToCart(product)}
                    className="w-full mt-4 bg-orange-950 hover:bg-orange-500 text-orange-600 hover:text-white font-bold py-2.5 px-4 rounded-xl transition-colors flex justify-center items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                    Add to Cart
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
