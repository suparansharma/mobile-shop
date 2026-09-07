"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchInventory, adjustStock } from '@/lib/api/inventory';
import { toast } from 'react-hot-toast';

export default function InventoryDashboard() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{ product_id: number; variant_id?: number; name: string; current_stock: number } | null>(null);
  const [adjustForm, setAdjustForm] = useState({ type: 'in', quantity: 1, notes: '' });
  const [adjusting, setAdjusting] = useState(false);

  useEffect(() => {
    loadData();
  }, [page]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchInventory(page, 15, search);
      setProducts(res.data);
      setPagination({
        current_page: res.current_page,
        last_page: res.last_page,
        total: res.total
      });
    } catch (error) {
      toast.error('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadData();
  };

  const openAdjustModal = (product: any, variant?: any) => {
    let name = product.name;
    if (variant) {
      const attrs = typeof variant.attributes === 'string' ? JSON.parse(variant.attributes) : variant.attributes;
      const attrString = attrs ? Object.values(attrs).join(', ') : variant.sku;
      name = `${product.name} - ${attrString}`;
    }
    setSelectedItem({
      product_id: product.id,
      variant_id: variant?.id,
      name,
      current_stock: variant ? variant.stock : product.stock
    });
    setAdjustForm({ type: 'in', quantity: 1, notes: '' });
    setIsModalOpen(true);
  };

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;
    
    setAdjusting(true);
    try {
      await adjustStock({
        product_id: selectedItem.product_id,
        product_variant_id: selectedItem.variant_id,
        type: adjustForm.type as any,
        quantity: Number(adjustForm.quantity),
        notes: adjustForm.notes
      });
      toast.success('Stock adjusted successfully');
      setIsModalOpen(false);
      loadData(); // Reload table
    } catch (error: any) {
      toast.error(error.message || 'Failed to adjust stock');
    } finally {
      setAdjusting(false);
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage stock levels and view low stock alerts.</p>
        </div>
        <Link href="/admin/inventory/history" className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition text-sm font-medium">
          View History Log
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              placeholder="Search by name or SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-orange-9500 focus:border-orange-9500 w-64 outline-none"
            />
            <button type="submit" className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-orange-600 transition">
              Search
            </button>
          </form>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product / Variant</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Alert Threshold</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex justify-center items-center space-x-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-500"></div>
                      <span>Loading inventory...</span>
                    </div>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No products found.
                  </td>
                </tr>
              ) : (
                products.map((product) => {
                  const hasVariants = product.variants && product.variants.length > 0;
                  const threshold = product.low_stock_threshold || 5;

                  return (
                    <React.Fragment key={product.id}>
                      {/* Parent Product Row (Only show stock info if no variants) */}
                      <tr className={hasVariants ? "bg-gray-50/50" : "hover:bg-gray-50 transition-colors"}>
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">{product.name}</div>
                          <div className="text-xs text-gray-500 capitalize">{product.type} Phone</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">{product.sku}</td>
                        
                        {!hasVariants ? (
                          <>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-lg font-semibold text-gray-900">{product.stock}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{threshold}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {product.stock <= 0 ? (
                                <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Out of Stock</span>
                              ) : product.stock <= threshold ? (
                                <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-amber-100 text-amber-800">Low Stock Alert</span>
                              ) : (
                                <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">In Stock</span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button 
                                onClick={() => openAdjustModal(product)}
                                className="text-orange-500 hover:text-orange-800 bg-orange-950 px-3 py-1.5 rounded-lg transition"
                              >
                                Adjust Stock
                              </button>
                            </td>
                          </>
                        ) : (
                          <td colSpan={4} className="px-6 py-4 text-sm text-gray-400 italic">
                            Stock managed by variants below
                          </td>
                        )}
                      </tr>

                      {/* Variant Rows */}
                      {hasVariants && product.variants.map((variant: any) => {
                        const attrs = typeof variant.attributes === 'string' ? JSON.parse(variant.attributes) : variant.attributes;
                        const attrString = attrs ? Object.entries(attrs).map(([k, v]) => `${k}: ${v}`).join(', ') : 'Variant';
                        
                        return (
                          <tr key={`var-${variant.id}`} className="hover:bg-gray-50 transition-colors border-l-4 border-l-orange-800">
                            <td className="px-6 py-3 pl-10 text-sm text-gray-700">
                              <div className="flex items-center text-xs text-gray-500 mb-0.5">└─ Variant</div>
                              {attrString}
                            </td>
                            <td className="px-6 py-3 text-sm text-gray-500">{variant.sku}</td>
                            <td className="px-6 py-3 whitespace-nowrap">
                              <span className="text-lg font-semibold text-gray-900">{variant.stock}</span>
                            </td>
                            <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">{threshold}</td>
                            <td className="px-6 py-3 whitespace-nowrap">
                              {variant.stock <= 0 ? (
                                <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Out of Stock</span>
                              ) : variant.stock <= threshold ? (
                                <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-amber-100 text-amber-800">Low Stock Alert</span>
                              ) : (
                                <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">In Stock</span>
                              )}
                            </td>
                            <td className="px-6 py-3 whitespace-nowrap text-right text-sm font-medium">
                              <button 
                                onClick={() => openAdjustModal(product, variant)}
                                className="text-orange-500 hover:text-orange-800 bg-orange-950 px-3 py-1.5 rounded-lg transition"
                              >
                                Adjust Stock
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.last_page > 1 && (
          <div className="px-6 py-4 bg-white border-t border-gray-200 flex items-center justify-between">
            <span className="text-sm text-gray-700">
              Showing page <span className="font-medium">{pagination.current_page}</span> of <span className="font-medium">{pagination.last_page}</span>
            </span>
            <div className="flex space-x-2">
              <button 
                disabled={page === 1} 
                onClick={() => setPage(page - 1)}
                className="px-3 py-1 border rounded text-sm disabled:opacity-50"
              >
                Previous
              </button>
              <button 
                disabled={page === pagination.last_page} 
                onClick={() => setPage(page + 1)}
                className="px-3 py-1 border rounded text-sm disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Adjust Modal */}
      {isModalOpen && selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="text-lg font-bold text-gray-900">Adjust Stock</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            
            <form onSubmit={handleAdjustSubmit} className="p-6 space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Item</p>
                <p className="font-medium text-gray-900">{selectedItem.name}</p>
                <p className="text-sm text-gray-500 mt-1">Current Stock: <span className="font-bold text-orange-500">{selectedItem.current_stock}</span></p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Operation Type</label>
                <select 
                  value={adjustForm.type}
                  onChange={e => setAdjustForm({...adjustForm, type: e.target.value})}
                  className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-orange-9500 focus:border-orange-9500 p-2 border"
                  required
                >
                  <option value="in">Stock In (Add)</option>
                  <option value="out">Stock Out (Deduct)</option>
                  <option value="adjustment">Absolute Adjustment (Set Exact Stock)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {adjustForm.type === 'adjustment' ? 'New Stock Level' : 'Quantity'}
                </label>
                <input 
                  type="number" 
                  min="0"
                  step="1"
                  value={adjustForm.quantity}
                  onChange={e => setAdjustForm({...adjustForm, quantity: Number(e.target.value)})}
                  className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-orange-9500 focus:border-orange-9500 p-2 border"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                <textarea 
                  value={adjustForm.notes}
                  onChange={e => setAdjustForm({...adjustForm, notes: e.target.value})}
                  className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-orange-9500 focus:border-orange-9500 p-2 border"
                  rows={2}
                  placeholder="Reason for adjustment..."
                ></textarea>
              </div>

              <div className="pt-4 flex justify-end space-x-3">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={adjusting}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 disabled:opacity-50"
                >
                  {adjusting ? 'Saving...' : 'Confirm Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
