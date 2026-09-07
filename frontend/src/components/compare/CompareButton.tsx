"use client";

import { useCompareStore, CompareProduct } from '@/store/compareStore';
import { useEffect, useState } from 'react';

interface CompareButtonProps {
  product: any;
  className?: string;
  iconOnly?: boolean;
}

export default function CompareButton({ product, className = '', iconOnly = false }: CompareButtonProps) {
  const { isInCompare, addToCompare, removeFromCompare } = useCompareStore();
  const [mounted, setMounted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isSaved = isInCompare(product.id);

  const getImageUrl = (path: string) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL 
      ? process.env.NEXT_PUBLIC_API_URL.replace('/api/v1', '') 
      : 'http://localhost:8000';
    return `${baseUrl}/storage/${path}`;
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isSaved) {
      removeFromCompare(product.id);
    } else {
      let imageUrl = '';
      if (product.images && product.images.length > 0) {
        const thumb = product.images.find((img: any) => img.is_thumbnail) || product.images[0];
        imageUrl = getImageUrl(thumb.image_path);
      }

      const compareProduct: CompareProduct = {
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        discount_price: product.discount_price,
        image: imageUrl,
        brand: product.brand?.name || 'Unknown',
        specifications: product.specifications || {},
      };
      addToCompare(compareProduct);
    }
  };

  return (
    <button
      onClick={handleToggle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative inline-flex items-center justify-center p-2 rounded-full transition-all duration-300 ${
        isSaved 
          ? 'bg-orange-950 text-orange-500 hover:bg-orange-900' 
          : 'bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-orange-500'
      } ${className}`}
      aria-label={isSaved ? "Remove from comparison" : "Add to comparison"}
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
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      </svg>
      {!iconOnly && (
        <span className="ml-2 font-medium text-sm">
          {isSaved ? 'Compared' : 'Compare'}
        </span>
      )}
    </button>
  );
}
