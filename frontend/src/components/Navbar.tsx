"use client";

import Link from 'next/link';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { useCompareStore } from '@/store/compareStore';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const totalItems = useCartStore((state) => state.items.reduce((total, item) => total + item.quantity, 0));
  const wishlistTotal = useWishlistStore((state) => state.items.length);
  const compareTotal = useCompareStore((state) => state.items.length);
  const fetchWishlist = useWishlistStore((state) => state.fetchWishlist);
  const { isAuthenticated, user, logout } = useAuthStore();
  // Hydration fix for zustand persist
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    if (isAuthenticated()) {
      fetchWishlist();
    }
  }, [isAuthenticated, fetchWishlist]);
  return (
    <nav className="bg-[#0a0a0a]/90 backdrop-blur-md sticky top-0 z-50 border-b border-gray-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-24">
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center">
              <img src="/logo.png" alt="MobileShop Logo" className="h-20 w-auto object-contain" />
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-300 hover:text-orange-500 font-medium transition-colors">Home</Link>
            <Link href="/shop" className="text-gray-300 hover:text-orange-500 font-medium transition-colors">Shop</Link>
            <Link href="/categories" className="text-gray-300 hover:text-orange-500 font-medium transition-colors">Categories</Link>
            <Link href="/contact" className="text-gray-300 hover:text-orange-500 font-medium transition-colors">Contact</Link>
            {mounted && user && (user.role === 'admin' || user.role === 'super_admin') && (
              <Link href="/admin" className="text-orange-500 font-bold hover:text-orange-400 transition-colors">Admin Panel</Link>
            )}
          </div>

          <div className="flex items-center space-x-4">
            <Link href="/wishlist" className="p-2 text-gray-400 hover:text-red-500 transition-colors relative">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {mounted && wishlistTotal > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full">
                  {wishlistTotal}
                </span>
              )}
            </Link>
            <Link href="/cart" className="p-2 text-gray-400 hover:text-orange-500 transition-colors relative">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {mounted && totalItems > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-orange-500 rounded-full">
                  {totalItems}
                </span>
              )}
            </Link>
            <Link href="/compare" className="p-2 text-gray-400 hover:text-orange-500 transition-colors relative">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              {mounted && compareTotal > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-orange-500 rounded-full">
                  {compareTotal}
                </span>
              )}
            </Link>
            {mounted && isAuthenticated() ? (
              <Link href="/profile" className="flex items-center justify-center w-10 h-10 bg-orange-500/20 text-orange-500 rounded-full font-bold uppercase hover:bg-orange-500/30 transition-colors">
                {user?.name.charAt(0) || 'U'}
              </Link>
            ) : (
              <Link href="/login" className="bg-orange-500 text-white px-5 py-2 rounded-full font-medium hover:bg-orange-600 transition-all shadow-md hover:shadow-lg hover:shadow-orange-500/20">
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
