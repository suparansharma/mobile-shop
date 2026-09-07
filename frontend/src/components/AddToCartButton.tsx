"use client";

import { useState } from 'react';
import { useCartStore } from '@/store/cartStore';
import WishlistButton from '@/components/wishlist/WishlistButton';
import CompareButton from '@/components/compare/CompareButton';

interface AddToCartButtonProps {
  product: any;
}

export default function AddToCartButton({ product }: AddToCartButtonProps) {
  const [quantity, setQuantity] = useState(1);
  const addToCart = useCartStore((state) => state.addToCart);
  const [added, setAdded] = useState(false);

  const priceToUse = product.discount_price || product.price;

  const handleAddToCart = () => {
    addToCart({
      product_id: product.id,
      name: product.name,
      price: Number(priceToUse),
      quantity,
      slug: product.slug,
      image: product.images?.[0]?.image_path || ''
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (product.stock === 0) {
    return (
      <button className="w-full bg-gray-300 text-gray-500 font-bold py-3 px-8 rounded-lg shadow-sm cursor-not-allowed text-center" disabled>
        Out of Stock
      </button>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-10 w-full">
      <div className="flex border border-gray-300 rounded-lg overflow-hidden w-full sm:w-32 flex-shrink-0">
        <button 
          onClick={() => setQuantity(q => Math.max(1, q - 1))}
          className="px-4 py-3 bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors font-bold"
        >-</button>
        <input 
          type="text" 
          className="w-full text-center border-x border-gray-300 focus:outline-none font-semibold text-gray-900" 
          value={quantity} 
          readOnly 
        />
        <button 
          onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
          className="px-4 py-3 bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors font-bold"
        >+</button>
      </div>
      
      <button 
        onClick={handleAddToCart}
        className={`flex-1 font-bold py-3 px-8 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 ${
          added ? 'bg-green-500 hover:bg-green-600 text-white' : 'bg-orange-500 hover:bg-orange-600 text-white'
        }`}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {added ? (
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          ) : (
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          )}
        </svg>
        {added ? 'Added to Cart!' : 'Add to Cart'}
      </button>
      
      <WishlistButton 
        product={product} 
        iconOnly={true} 
        className="w-12 flex items-center justify-center border border-gray-300 hover:border-red-500" 
      />
      <CompareButton 
        product={product} 
        iconOnly={true} 
        className="w-12 flex items-center justify-center border border-gray-300 hover:border-orange-9500" 
      />
    </div>
  );
}
