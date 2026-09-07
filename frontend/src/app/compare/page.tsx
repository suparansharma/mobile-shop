"use client";

import { useCompareStore } from '@/store/compareStore';
import { useCartStore } from '@/store/cartStore';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ComparePage() {
  const router = useRouter();
  const { items, removeFromCompare, clearCompare } = useCompareStore();
  const { addToCart } = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const handleMoveToCart = (item: any) => {
    addToCart({
      product_id: item.id,
      name: item.name,
      price: item.discount_price || item.price,
      quantity: 1,
      image: item.image
    });
  };

  const attributesToCompare = [
    { key: 'price', label: 'Price' },
    { key: 'brand', label: 'Brand' },
    { key: 'RAM', label: 'RAM' },
    { key: 'Storage', label: 'Storage' },
    { key: 'Display', label: 'Display' },
    { key: 'Camera', label: 'Camera' },
    { key: 'Battery', label: 'Battery' },
    { key: 'Processor', label: 'Processor' },
    { key: 'Warranty', label: 'Warranty' },
  ];

  const getAttributeValue = (item: any, attrKey: string) => {
    if (attrKey === 'price') {
      return item.discount_price ? `$${item.discount_price}` : `$${item.price}`;
    }
    if (attrKey === 'brand') {
      return item.brand;
    }
    // Search in specifications, ignoring case
    if (item.specifications) {
      const specKey = Object.keys(item.specifications).find(k => k.toLowerCase() === attrKey.toLowerCase());
      if (specKey) {
        return item.specifications[specKey];
      }
    }
    return 'N/A';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Compare Products</h1>
          <p className="mt-2 text-gray-500">
            {items.length} {items.length === 1 ? 'product' : 'products'} selected
          </p>
        </div>
        {items.length > 0 && (
          <button 
            onClick={() => clearCompare()}
            className="text-red-600 hover:text-red-700 font-medium text-sm transition-colors px-4 py-2 border border-red-200 rounded-lg bg-red-50 hover:bg-red-100"
          >
            Clear All
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="text-center py-24 bg-gray-50 rounded-2xl border border-gray-100">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Your comparison list is empty</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">Add some products to compare their features and specifications side by side.</p>
          <Link href="/shop" className="inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-orange-500 hover:bg-orange-600 shadow-md hover:shadow-lg transition-all">
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 table-fixed">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="w-48 px-6 py-6 text-left text-sm font-bold text-gray-500 uppercase tracking-wider bg-gray-50 sticky left-0 z-10 border-r border-gray-100">
                  Product
                </th>
                {items.map((item) => (
                  <th key={item.id} scope="col" className="w-64 px-6 py-6 text-center align-top relative">
                    <button
                      onClick={() => removeFromCompare(item.id)}
                      className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors p-1"
                      title="Remove"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    
                    <Link href={`/products/${item.slug}`} className="block group">
                      <div className="h-32 w-full flex items-center justify-center mb-4 bg-white rounded-lg p-2 border border-gray-100 group-hover:border-orange-700 transition-colors">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="max-h-full max-w-full object-contain" />
                        ) : (
                          <span className="text-gray-300">No Image</span>
                        )}
                      </div>
                      <h3 className="text-sm font-bold text-gray-900 group-hover:text-orange-500 line-clamp-2 min-h-[40px]">{item.name}</h3>
                    </Link>
                    
                    <button 
                      onClick={() => handleMoveToCart(item)}
                      className="mt-4 w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 rounded-lg transition-colors text-sm"
                    >
                      Add to Cart
                    </button>
                  </th>
                ))}
                {/* Empty columns to fill the space up to 4 */}
                {Array.from({ length: 4 - items.length }).map((_, index) => (
                  <th key={`empty-${index}`} scope="col" className="w-64 px-6 py-6 text-center align-middle bg-gray-50/50 border-l border-dashed border-gray-200">
                    <div className="flex flex-col items-center justify-center text-gray-400 opacity-50">
                      <svg className="w-10 h-10 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4v16m8-8H4" />
                      </svg>
                      <span className="text-sm font-medium">Add Product</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {attributesToCompare.map((attr, index) => (
                <tr key={attr.key} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-700 bg-white sticky left-0 z-10 border-r border-gray-100 shadow-[1px_0_0_0_#f3f4f6]">
                    {attr.label}
                  </td>
                  {items.map((item) => (
                    <td key={`${item.id}-${attr.key}`} className="px-6 py-4 text-sm text-gray-600 text-center font-medium border-r border-gray-50 last:border-r-0">
                      {getAttributeValue(item, attr.key)}
                    </td>
                  ))}
                  {Array.from({ length: 4 - items.length }).map((_, i) => (
                    <td key={`empty-cell-${i}`} className="px-6 py-4 bg-gray-50/30 border-l border-dashed border-gray-200"></td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
