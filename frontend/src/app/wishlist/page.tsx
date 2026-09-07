"use client";

import { useWishlistStore } from '@/store/wishlistStore';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function WishlistPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { items, isLoading, fetchWishlist, removeFromWishlist, clearWishlist } = useWishlistStore();
  const { addToCart } = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!isAuthenticated()) {
      router.push('/login?redirect=/wishlist');
    } else {
      fetchWishlist();
    }
  }, [isAuthenticated, fetchWishlist, router]);

  if (!mounted) return null;

  const getImageUrl = (path: string) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL 
      ? process.env.NEXT_PUBLIC_API_URL.replace('/api/v1', '') 
      : 'http://localhost:8000';
    return `${baseUrl}/storage/${path}`;
  };

  const handleMoveToCart = async (item: any) => {
    if (!item.product) return;
    
    // Default to the base product price if no variant is specified
    addToCart({
      product_id: item.product.id,
      name: item.product.name,
      price: item.product.discount_price || item.product.price,
      quantity: 1,
      image: item.product.images?.find((img: any) => img.is_thumbnail)?.image_path || item.product.images?.[0]?.image_path || ''
    });

    await removeFromWishlist(item.product.id);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Your Wishlist</h1>
          <p className="mt-2 text-gray-500">
            {items.length} {items.length === 1 ? 'item' : 'items'} saved
          </p>
        </div>
        {items.length > 0 && (
          <button 
            onClick={() => clearWishlist()}
            className="text-red-600 hover:text-red-700 font-medium text-sm transition-colors px-4 py-2 border border-red-200 rounded-lg bg-red-50 hover:bg-red-100"
          >
            Clear Wishlist
          </button>
        )}
      </div>

      {isLoading && items.length === 0 ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-24 bg-gray-50 rounded-2xl border border-gray-100">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Your wishlist is empty</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">Explore our collection and save your favorite products to buy later.</p>
          <Link href="/shop" className="inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-orange-500 hover:bg-orange-600 shadow-md hover:shadow-lg transition-all">
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((item) => {
            const product = item.product;
            if (!product) return null;
            
            let imageUrl = '';
            if (product.images && product.images.length > 0) {
              const thumb = product.images.find((img: any) => img.is_thumbnail) || product.images[0];
              imageUrl = getImageUrl(thumb.image_path);
            }
            
            const price = product.discount_price || product.price;

            return (
              <div key={item.id} className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col">
                <Link href={`/products/${product.slug}`} className="relative aspect-square block bg-gray-50 overflow-hidden">
                  {imageUrl ? (
                    <img 
                      src={imageUrl} 
                      alt={product.name}
                      className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500 p-4"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                  )}
                  {product.discount_price && (
                    <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm">
                      Sale
                    </div>
                  )}
                </Link>
                
                <div className="p-5 flex flex-col flex-1">
                  <Link href={`/products/${product.slug}`} className="block mb-2 group-hover:text-orange-500 transition-colors">
                    <h3 className="font-bold text-gray-900 line-clamp-2">{product.name}</h3>
                  </Link>
                  
                  <div className="mt-auto pt-4 flex items-center justify-between">
                    <div>
                      {product.discount_price ? (
                         <div className="flex flex-col">
                            <span className="text-lg font-bold text-gray-900">${product.discount_price}</span>
                            <span className="text-xs text-gray-400 line-through">${product.price}</span>
                         </div>
                      ) : (
                         <span className="text-lg font-bold text-gray-900">${product.price}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="px-4 pb-4 pt-0 grid grid-cols-2 gap-2">
                   <button 
                     onClick={() => removeFromWishlist(product.id)}
                     className="py-2 text-sm font-medium text-gray-600 hover:text-red-600 bg-gray-50 hover:bg-red-50 rounded-lg transition-colors border border-gray-100 hover:border-red-200"
                   >
                     Remove
                   </button>
                   <button 
                     disabled={product.stock <= 0}
                     onClick={() => handleMoveToCart(item)}
                     className="py-2 text-sm font-bold text-white bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                   >
                     {product.stock > 0 ? 'Move to Cart' : 'Out of Stock'}
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
