"use client";

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';

export default function AdminWishlistPage() {
  const [stats, setStats] = useState<any>(null);
  const [mostWishlisted, setMostWishlisted] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const { token } = useAuthStore();

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;
      
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
      
      try {
        const [statsRes, productsRes] = await Promise.all([
          fetch(`${API_URL}/admin_secure/wishlist/stats`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch(`${API_URL}/admin_secure/wishlist/most-wishlisted?limit=10`, {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        ]);

        if (statsRes.ok) setStats(await statsRes.json());
        if (productsRes.ok) setMostWishlisted(await productsRes.json());
      } catch (err: any) {
        setError(err.message || 'Failed to load wishlist statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const getImageUrl = (path: string) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL 
      ? process.env.NEXT_PUBLIC_API_URL.replace('/api/v1', '') 
      : 'http://localhost:8000';
    return `${baseUrl}/storage/${path}`;
  };

  if (loading) return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500"></div></div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Wishlist Statistics</h1>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center">
            <span className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Total Wishlists</span>
            <span className="text-4xl font-extrabold text-orange-500">{stats.total_items_wishlisted}</span>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center">
            <span className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Unique Users</span>
            <span className="text-4xl font-extrabold text-orange-500">{stats.unique_users}</span>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center">
            <span className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Unique Products</span>
            <span className="text-4xl font-extrabold text-orange-500">{stats.unique_products}</span>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mt-8">
        <div className="px-6 py-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Most Wishlisted Products</h2>
        </div>
        
        {mostWishlisted.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No products have been wishlisted yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Wishlist Count</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {mostWishlisted.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 bg-gray-100 rounded-lg border border-gray-200 overflow-hidden p-1 flex items-center justify-center">
                           {/* Simplified since we didn't eager load images, but usually you'd show a thumbnail here */}
                           <span className="text-xs text-gray-400">IMG</span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-bold text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-500">{product.sku}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-medium">${product.discount_price || product.price}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${product.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {product.stock > 0 ? product.stock : 'Out of stock'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="text-lg font-bold text-orange-500 bg-orange-950 px-3 py-1 rounded-full">
                        {product.wishlist_count}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
