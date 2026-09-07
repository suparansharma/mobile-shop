"use client";

import { useWishlistStore } from '@/store/wishlistStore';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface WishlistButtonProps {
  product: any;
  className?: string;
  iconOnly?: boolean;
}

export default function WishlistButton({ product, className = '', iconOnly = false }: WishlistButtonProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlistStore();
  const [mounted, setMounted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isSaved = isInWishlist(product.id);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated()) {
      // Add a redirect param or just push to login
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    if (isSaved) {
      await removeFromWishlist(product.id);
    } else {
      await addToWishlist(product.id, product);
    }
  };

  return (
    <button
      onClick={handleToggle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative inline-flex items-center justify-center p-2 rounded-full transition-all duration-300 ${
        isSaved 
          ? 'bg-red-50 text-red-500 hover:bg-red-100' 
          : 'bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-red-500'
      } ${className}`}
      aria-label={isSaved ? "Remove from wishlist" : "Add to wishlist"}
    >
      <svg 
        className={`w-6 h-6 transition-transform duration-300 ${isHovered && !isSaved ? 'scale-110' : ''}`} 
        fill={isSaved ? "currentColor" : "none"} 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={isSaved ? 1.5 : 2} 
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
        />
      </svg>
      {!iconOnly && (
        <span className="ml-2 font-medium text-sm">
          {isSaved ? 'Saved' : 'Wishlist'}
        </span>
      )}
    </button>
  );
}
